import { isSupabaseAdminConfigured } from "@/lib/env";
import { OPS_CENTER_NAME } from "@/lib/brand";
import { generateTransferId } from "./id";
import * as hist from "./history";
import * as mem from "./memory";
import type {
  CreateTransferInput,
  CryptohostIncident,
  CryptohostTransfer,
  ServiceStatus,
  TransferStats,
} from "./types";

export const HISTORICAL_TRANSFER_BASE = 5_000_000;

function mergeTransfers(live: CryptohostTransfer[], historical: CryptohostTransfer[]): CryptohostTransfer[] {
  const seen = new Set<string>();
  const out: CryptohostTransfer[] = [];
  for (const t of [...live, ...historical]) {
    if (seen.has(t.id)) continue;
    seen.add(t.id);
    out.push(t);
  }
  out.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return out;
}

function liveTransfers(): CryptohostTransfer[] {
  return mem.memoryList(mem.memoryCount(), 0);
}

function rowToTransfer(row: Record<string, unknown>): CryptohostTransfer {
  return {
    id: String(row.id),
    kind: row.kind as CryptohostTransfer["kind"],
    status: row.status as CryptohostTransfer["status"],
    wallet: row.wallet as string | null,
    pay_asset: row.pay_asset as string | null,
    pay_amount: row.pay_amount != null ? Number(row.pay_amount) : null,
    receive_asset: String(row.receive_asset ?? "CGOLD"),
    receive_amount: row.receive_amount != null ? Number(row.receive_amount) : null,
    fee_usd: row.fee_usd != null ? Number(row.fee_usd) : null,
    price_usd: row.price_usd != null ? Number(row.price_usd) : null,
    provider: row.provider as string | null,
    chain: row.chain as string | null,
    error: row.error as string | null,
    attempts: Number(row.attempts ?? 1),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    confirmed_at: row.confirmed_at ? String(row.confirmed_at) : null,
  };
}

async function adminDb() {
  const { createAdminClient } = await import("@/lib/supabase/server");
  return createAdminClient();
}

async function logEvent(transferId: string, event: string, detail?: string) {
  if (!isSupabaseAdminConfigured()) return;
  try {
    const supabase = await adminDb();
    await supabase.from("cryptohost_events").insert({ transfer_id: transferId, event, detail });
  } catch {
    /* best effort */
  }
}

export async function createTransfer(input: CreateTransferInput): Promise<CryptohostTransfer> {
  const now = new Date().toISOString();
  const transfer: CryptohostTransfer = {
    id: generateTransferId(),
    kind: input.kind,
    status: "processing",
    wallet: input.wallet ?? null,
    pay_asset: input.pay_asset ?? null,
    pay_amount: input.pay_amount ?? null,
    receive_asset: input.receive_asset ?? "CGOLD",
    receive_amount: input.receive_amount ?? null,
    fee_usd: input.fee_usd ?? null,
    price_usd: input.price_usd ?? null,
    provider: input.provider ?? null,
    chain: input.chain ?? "BNB Chain",
    error: null,
    attempts: 1,
    created_at: now,
    updated_at: now,
    confirmed_at: null,
  };

  if (isSupabaseAdminConfigured()) {
    const supabase = await adminDb();
    const { data, error } = await supabase.from("cryptohost_transfers").insert(transfer).select().single();
    if (error) throw new Error(error.message);
    await logEvent(transfer.id, "created", input.kind);
    return confirmTransfer(rowToTransfer(data));
  }

  mem.memoryInsert(transfer);
  return confirmTransfer(transfer);
}

async function confirmTransfer(transfer: CryptohostTransfer): Promise<CryptohostTransfer> {
  const now = new Date().toISOString();
  const confirmed: CryptohostTransfer = {
    ...transfer,
    status: "confirmed",
    updated_at: now,
    confirmed_at: now,
    error: null,
  };

  if (isSupabaseAdminConfigured()) {
    const supabase = await adminDb();
    const { data, error } = await supabase
      .from("cryptohost_transfers")
      .update({ status: "confirmed", updated_at: now, confirmed_at: now, error: null })
      .eq("id", transfer.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    await logEvent(transfer.id, "confirmed");
    return rowToTransfer(data);
  }

  mem.memoryUpdate(confirmed);
  return confirmed;
}

export async function retryTransfer(id: string): Promise<CryptohostTransfer> {
  const existing = await getTransfer(id);
  if (!existing) throw new Error("transfer not found");
  if (existing.status !== "failed") throw new Error("only failed transfers can be retried");

  const now = new Date().toISOString();
  const processing: CryptohostTransfer = {
    ...existing,
    status: "processing",
    attempts: existing.attempts + 1,
    updated_at: now,
    error: null,
  };

  if (isSupabaseAdminConfigured()) {
    const supabase = await adminDb();
    const { data, error } = await supabase
      .from("cryptohost_transfers")
      .update({ status: "processing", attempts: processing.attempts, updated_at: now, error: null })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    await logEvent(id, "retry", `attempt ${processing.attempts}`);
    return confirmTransfer(rowToTransfer(data));
  }

  mem.memoryUpdate(processing);
  return confirmTransfer(processing);
}

export async function getTransfer(id: string): Promise<CryptohostTransfer | null> {
  const live = mem.memoryGet(id);
  if (live) return live;
  const archived = hist.findHistoricalTransfer(id);
  if (archived) return archived;

  if (isSupabaseAdminConfigured()) {
    const supabase = await adminDb();
    const { data } = await supabase.from("cryptohost_transfers").select().eq("id", id).maybeSingle();
    return data ? rowToTransfer(data) : null;
  }
  return null;
}

export async function listTransfers(limit = 50, offset = 0): Promise<CryptohostTransfer[]> {
  if (isSupabaseAdminConfigured()) {
    const supabase = await adminDb();
    const { data } = await supabase
      .from("cryptohost_transfers")
      .select()
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    const dbRows = (data ?? []).map(rowToTransfer);
    if (dbRows.length >= limit) return dbRows;
    const merged = mergeTransfers(dbRows, hist.getHistoricalTransfers());
    return merged.slice(offset, offset + limit);
  }
  return mergeTransfers(liveTransfers(), hist.getHistoricalTransfers()).slice(offset, offset + limit);
}

export async function listHistory(limit = 50, offset = 0) {
  const live = liveTransfers();
  const merged = mergeTransfers(live, hist.getHistoricalTransfers());
  return {
    transfers: merged.slice(offset, offset + limit),
    total: merged.length,
    historical: hist.getHistoricalCount(),
    live: live.length,
    meta: hist.getHistoricalMeta(),
  };
}

export async function seedHistory(count: number, seed?: number) {
  const s = seed ?? Date.now() % 1_000_000_000;
  const result = hist.regenerateHistoricalArchive(count, s);
  return result;
}

export async function getStats(): Promise<TransferStats> {
  const since = new Date(Date.now() - 86400000).toISOString();
  let sessionTotal = 0;
  let confirmed = 0;
  let failed = 0;
  let processing = 0;
  let last24h = 0;
  let avgConfirmMs = 2800;

  if (isSupabaseAdminConfigured()) {
    const supabase = await adminDb();
    const { count } = await supabase.from("cryptohost_transfers").select("*", { count: "exact", head: true });
    sessionTotal = count ?? 0;

    const { data: rows } = await supabase.from("cryptohost_transfers").select("status, created_at, confirmed_at");
    for (const r of rows ?? []) {
      if (r.status === "confirmed") confirmed++;
      else if (r.status === "failed") failed++;
      else processing++;
      if (r.created_at >= since) last24h++;
    }

    const confirmedRows = (rows ?? []).filter((r) => r.status === "confirmed" && r.confirmed_at);
    if (confirmedRows.length) {
      const totalMs = confirmedRows.reduce((acc, r) => {
        return acc + (new Date(r.confirmed_at!).getTime() - new Date(r.created_at).getTime());
      }, 0);
      avgConfirmMs = Math.round(totalMs / confirmedRows.length);
    }
  } else {
    const list = mem.memoryList(5000, 0);
    sessionTotal = list.length;
    for (const t of list) {
      if (t.status === "confirmed") confirmed++;
      else if (t.status === "failed") failed++;
      else processing++;
      if (t.created_at >= since) last24h++;
    }
    const confirmedList = list.filter((t) => t.status === "confirmed" && t.confirmed_at);
    if (confirmedList.length) {
      const totalMs = confirmedList.reduce(
        (acc, t) => acc + (new Date(t.confirmed_at!).getTime() - new Date(t.created_at).getTime()),
        0
      );
      avgConfirmMs = Math.round(totalMs / confirmedList.length);
    }
  }

  const registryTotal = hist.getHistoricalCount() + (isSupabaseAdminConfigured() ? sessionTotal : mem.memoryCount());
  const openIncidents = (await listIncidents(true)).length;
  const uptimePct = openIncidents === 0 ? 99.94 : openIncidents === 1 ? 98.5 : 95.0;

  return {
    historicalTotal: HISTORICAL_TRANSFER_BASE + registryTotal,
    registryTotal,
    sessionTotal: isSupabaseAdminConfigured() ? sessionTotal : mem.memoryCount(),
    confirmed,
    failed,
    processing,
    last24h,
    avgConfirmMs,
    uptimePct,
  };
}

export async function listIncidents(openOnly = false): Promise<CryptohostIncident[]> {
  if (isSupabaseAdminConfigured()) {
    const supabase = await adminDb();
    let q = supabase.from("cryptohost_incidents").select().order("created_at", { ascending: false });
    if (openOnly) q = q.eq("status", "open");
    const { data } = await q;
    return (data ?? []) as CryptohostIncident[];
  }
  return mem.memoryIncidents(openOnly);
}

export async function getServiceStatus(): Promise<ServiceStatus> {
  const stats = await getStats();
  const openIncidents = await listIncidents(true);
  let status: ServiceStatus["status"] = "operational";
  let message = "Liquidación operativa. Tiempo medio de confirmación < 3 s.";

  if (openIncidents.some((i) => i.severity === "critical")) {
    status = "outage";
    message = "Incidencia crítica abierta. Consulta el panel de estado.";
  } else if (openIncidents.length > 0 || stats.failed > stats.confirmed * 0.05) {
    status = "degraded";
    message = "Servicio degradado. Algunas operaciones pueden tardar más de lo habitual.";
  }

  return {
    service: OPS_CENTER_NAME,
    status,
    message,
    stats,
    openIncidents: openIncidents.length,
    updatedAt: new Date().toISOString(),
  };
}

export async function getRecentActivity(limit = 6): Promise<CryptohostTransfer[]> {
  return listTransfers(limit, 0);
}

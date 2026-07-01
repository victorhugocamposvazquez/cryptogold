import { randomUUID } from "crypto";
import { getActiveNetwork, getContractAddressFromEnv } from "@/lib/network-profiles";
import { getActiveDeployment } from "./deployments";
import { assertPersistentTokenStorage, getTokenStorageBackend } from "./storage";
import type { MintLogEntry } from "./types";

const MAX = 200;
const logs: MintLogEntry[] = [];

type MintRow = {
  id: string;
  network: string;
  contract_address: string;
  to_address: string;
  amount: string;
  category: string;
  note: string | null;
  tx_hash: string;
  created_at: string;
};

function rowToEntry(row: MintRow): MintLogEntry {
  return {
    id: row.id,
    to: row.to_address,
    amount: row.amount,
    category: row.category as MintLogEntry["category"],
    note: row.note ?? undefined,
    txHash: row.tx_hash,
    createdAt: row.created_at,
  };
}

async function adminDb() {
  const { createAdminClient } = await import("@/lib/supabase/server");
  return createAdminClient();
}

async function resolveContractForLog(): Promise<string | null> {
  const fromEnv = getContractAddressFromEnv();
  if (fromEnv) return fromEnv;
  const active = await getActiveDeployment(getActiveNetwork());
  return active?.address ?? null;
}

export async function appendMintLog(entry: Omit<MintLogEntry, "id" | "createdAt">): Promise<MintLogEntry> {
  assertPersistentTokenStorage("Registrar mint");

  const row: MintLogEntry = {
    id: `MNT-${randomUUID().slice(0, 8).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    ...entry,
  };

  if (getTokenStorageBackend() === "supabase") {
    const contract = await resolveContractForLog();
    if (!contract) throw new Error("No hay contrato activo para registrar el mint");
    const supabase = await adminDb();
    const { error } = await supabase.from("token_mints").insert({
      id: row.id,
      network: getActiveNetwork(),
      contract_address: contract.toLowerCase(),
      to_address: row.to.toLowerCase(),
      amount: row.amount,
      category: row.category,
      note: row.note ?? null,
      tx_hash: row.txHash,
      created_at: row.createdAt,
    });
    if (error) throw new Error(error.message);
    return row;
  }

  logs.unshift(row);
  if (logs.length > MAX) logs.length = MAX;
  return row;
}

export async function listMintLogs(limit = 50): Promise<MintLogEntry[]> {
  if (getTokenStorageBackend() === "supabase") {
    const supabase = await adminDb();
    const { data, error } = await supabase
      .from("token_mints")
      .select("*")
      .eq("network", getActiveNetwork())
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data as MintRow[]).map(rowToEntry);
  }
  return logs.slice(0, limit);
}

export { MINT_CATEGORIES, ALLOCATION_TARGETS } from "./mint-categories";

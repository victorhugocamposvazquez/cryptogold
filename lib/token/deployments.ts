import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
import type { BnbNetwork } from "@/lib/bnb";
import { isSupabaseAdminConfigured } from "@/lib/env";
import type { DeployRecord } from "./types";

const DATA_DIR = process.env.VERCEL ? join("/tmp", "cryptogold") : join(process.cwd(), "data");
const FILE = join(DATA_DIR, "token-deployments.json");

type Store = { deployments: DeployRecord[] };

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function loadFile(): Store {
  ensureDir();
  if (!existsSync(FILE)) return { deployments: [] };
  try {
    return JSON.parse(readFileSync(FILE, "utf8")) as Store;
  } catch {
    return { deployments: [] };
  }
}

function saveFile(store: Store) {
  ensureDir();
  writeFileSync(FILE, JSON.stringify(store, null, 2));
}

async function adminDb() {
  const { createAdminClient } = await import("@/lib/supabase/server");
  return createAdminClient();
}

type DeployRow = {
  id: string;
  network: BnbNetwork;
  chain_id: number;
  address: string;
  name: string;
  symbol: string;
  max_supply: string;
  initial_mint: string;
  treasury: string;
  deployer: string;
  tx_hash: string;
  contract_template: string | null;
  explorer: string | null;
  active: boolean;
  created_at: string;
};

function rowToRecord(row: DeployRow): DeployRecord {
  return {
    id: row.id,
    network: row.network,
    chainId: row.chain_id,
    address: row.address,
    name: row.name,
    symbol: row.symbol,
    maxSupply: row.max_supply,
    initialMint: row.initial_mint,
    treasury: row.treasury,
    deployer: row.deployer,
    txHash: row.tx_hash,
    contractTemplate: row.contract_template ?? undefined,
    explorer: row.explorer ?? undefined,
    active: row.active,
    createdAt: row.created_at,
  };
}

function recordToRow(entry: Omit<DeployRecord, "id" | "createdAt" | "active"> & { id: string; createdAt: string; active: boolean }): DeployRow {
  return {
    id: entry.id,
    network: entry.network,
    chain_id: entry.chainId,
    address: entry.address.toLowerCase(),
    name: entry.name,
    symbol: entry.symbol,
    max_supply: entry.maxSupply,
    initial_mint: entry.initialMint,
    treasury: entry.treasury.toLowerCase(),
    deployer: entry.deployer.toLowerCase(),
    tx_hash: entry.txHash,
    contract_template: entry.contractTemplate ?? null,
    explorer: entry.explorer ?? null,
    active: entry.active,
    created_at: entry.createdAt,
  };
}

async function listFromSupabase(network?: BnbNetwork): Promise<DeployRecord[]> {
  const supabase = await adminDb();
  let q = supabase.from("token_deployments").select("*").order("created_at", { ascending: false }).limit(50);
  if (network) q = q.eq("network", network);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data as DeployRow[]).map(rowToRecord);
}

function useSupabaseStorage(): boolean {
  return isSupabaseAdminConfigured();
}

async function appendToSupabase(entry: Omit<DeployRecord, "id" | "createdAt" | "active">): Promise<DeployRecord> {
  const supabase = await adminDb();
  const { error: offErr } = await supabase
    .from("token_deployments")
    .update({ active: false })
    .eq("network", entry.network)
    .eq("active", true);
  if (offErr) throw new Error(offErr.message);

  const row: DeployRecord = {
    id: `DEP-${randomUUID().slice(0, 8).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    active: true,
    ...entry,
  };

  const { error } = await supabase.from("token_deployments").insert(recordToRow(row));
  if (error) throw new Error(error.message);
  return row;
}

async function setActiveInSupabase(id: string, network: BnbNetwork): Promise<DeployRecord | null> {
  const supabase = await adminDb();
  const { data: target, error: findErr } = await supabase
    .from("token_deployments")
    .select("*")
    .eq("id", id)
    .eq("network", network)
    .maybeSingle();
  if (findErr) throw new Error(findErr.message);
  if (!target) return null;

  const { error: offErr } = await supabase
    .from("token_deployments")
    .update({ active: false })
    .eq("network", network)
    .eq("active", true);
  if (offErr) throw new Error(offErr.message);

  const { error: onErr } = await supabase.from("token_deployments").update({ active: true }).eq("id", id);
  if (onErr) throw new Error(onErr.message);

  return rowToRecord({ ...(target as DeployRow), active: true });
}

export async function listDeployments(network?: BnbNetwork): Promise<DeployRecord[]> {
  if (useSupabaseStorage()) {
    return listFromSupabase(network);
  }
  const all = loadFile().deployments;
  if (!network) return all;
  return all.filter((d) => d.network === network);
}

export async function getActiveDeployment(network: BnbNetwork): Promise<DeployRecord | null> {
  const rows = await listDeployments(network);
  return rows.find((d) => d.active) ?? null;
}

export async function appendDeployment(
  entry: Omit<DeployRecord, "id" | "createdAt" | "active">
): Promise<DeployRecord> {
  if (useSupabaseStorage()) {
    return appendToSupabase(entry);
  }

  const store = loadFile();
  store.deployments.forEach((d) => {
    if (d.network === entry.network) d.active = false;
  });
  const row: DeployRecord = {
    id: `DEP-${randomUUID().slice(0, 8).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    active: true,
    ...entry,
  };
  store.deployments.unshift(row);
  if (store.deployments.length > 50) store.deployments.length = 50;
  saveFile(store);
  return row;
}

export async function setActiveDeployment(id: string, network: BnbNetwork): Promise<DeployRecord | null> {
  if (useSupabaseStorage()) {
    return setActiveInSupabase(id, network);
  }

  const store = loadFile();
  let found: DeployRecord | null = null;
  store.deployments.forEach((d) => {
    if (d.network === network) d.active = d.id === id;
    if (d.id === id) found = d;
  });
  if (!found) return null;
  saveFile(store);
  return found;
}

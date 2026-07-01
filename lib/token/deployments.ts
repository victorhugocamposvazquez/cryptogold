import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
import type { BnbNetwork } from "@/lib/bnb";
import type { DeployRecord } from "./types";

const DATA_DIR = process.env.VERCEL ? join("/tmp", "cryptogold") : join(process.cwd(), "data");
const FILE = join(DATA_DIR, "token-deployments.json");

type Store = { deployments: DeployRecord[] };

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function load(): Store {
  ensureDir();
  if (!existsSync(FILE)) return { deployments: [] };
  try {
    return JSON.parse(readFileSync(FILE, "utf8")) as Store;
  } catch {
    return { deployments: [] };
  }
}

function save(store: Store) {
  ensureDir();
  writeFileSync(FILE, JSON.stringify(store, null, 2));
}

export function listDeployments(network?: BnbNetwork): DeployRecord[] {
  const all = load().deployments;
  if (!network) return all;
  return all.filter((d) => d.network === network);
}

export function getActiveDeployment(network: BnbNetwork): DeployRecord | null {
  return listDeployments(network).find((d) => d.active) ?? null;
}

export function appendDeployment(
  entry: Omit<DeployRecord, "id" | "createdAt" | "active">
): DeployRecord {
  const store = load();
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
  save(store);
  return row;
}

export function setActiveDeployment(id: string, network: BnbNetwork): DeployRecord | null {
  const store = load();
  let found: DeployRecord | null = null;
  store.deployments.forEach((d) => {
    if (d.network === network) d.active = d.id === id;
    if (d.id === id) found = d;
  });
  if (!found) return null;
  save(store);
  return found;
}

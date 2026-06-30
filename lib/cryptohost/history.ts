import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import "server-only";
import type { CryptohostTransfer } from "./types";
import {
  DEFAULT_HISTORY_COUNT,
  DEFAULT_HISTORY_SEED,
  generateHistoricalTransfers,
  summarizeHistory,
} from "./seed";

declare global {
  // eslint-disable-next-line no-var
  var __cryptohostHistoricalCache: CryptohostTransfer[] | undefined;
  // eslint-disable-next-line no-var
  var __cryptohostHistoricalMeta: { seed: number; count: number; source: "file" | "generated" } | undefined;
}

const DATA_DIR = process.env.VERCEL ? join("/tmp", "cryptogold") : join(process.cwd(), "data");
const DATA_FILE = join(DATA_DIR, "cryptohost-history.json");

type ArchiveFile = {
  version: 1;
  generatedAt: string;
  seed: number;
  count: number;
  transfers: CryptohostTransfer[];
};

function loadFromFile(): CryptohostTransfer[] | null {
  try {
    if (!existsSync(DATA_FILE)) return null;
    const raw = readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as ArchiveFile;
    if (!parsed?.transfers?.length) return null;
    globalThis.__cryptohostHistoricalMeta = { seed: parsed.seed, count: parsed.count, source: "file" };
    return parsed.transfers;
  } catch {
    return null;
  }
}

function ensureCache(): CryptohostTransfer[] {
  if (globalThis.__cryptohostHistoricalCache?.length) return globalThis.__cryptohostHistoricalCache;

  const fromFile = loadFromFile();
  if (fromFile) {
    globalThis.__cryptohostHistoricalCache = fromFile;
    return fromFile;
  }

  const generated = generateHistoricalTransfers(DEFAULT_HISTORY_COUNT, DEFAULT_HISTORY_SEED);
  globalThis.__cryptohostHistoricalCache = generated;
  globalThis.__cryptohostHistoricalMeta = {
    seed: DEFAULT_HISTORY_SEED,
    count: DEFAULT_HISTORY_COUNT,
    source: "generated",
  };
  return generated;
}

export function getHistoricalTransfers(): CryptohostTransfer[] {
  return ensureCache();
}

export function getHistoricalCount(): number {
  return ensureCache().length;
}

export function getHistoricalMeta() {
  ensureCache();
  return globalThis.__cryptohostHistoricalMeta ?? { seed: DEFAULT_HISTORY_SEED, count: DEFAULT_HISTORY_COUNT, source: "generated" as const };
}

export function listHistoricalTransfers(limit = 50, offset = 0): CryptohostTransfer[] {
  return ensureCache().slice(offset, offset + limit);
}

export function findHistoricalTransfer(id: string): CryptohostTransfer | null {
  return ensureCache().find((t) => t.id === id) ?? null;
}

export function saveHistoricalArchive(transfers: CryptohostTransfer[], seed: number, count: number) {
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    const payload: ArchiveFile = {
      version: 1,
      generatedAt: new Date().toISOString(),
      seed,
      count,
      transfers,
    };
    writeFileSync(DATA_FILE, JSON.stringify(payload), "utf8");
  } catch {
    /* Vercel: memoria caliente basta si no hay disco escribible */
  }
  globalThis.__cryptohostHistoricalCache = transfers;
  globalThis.__cryptohostHistoricalMeta = { seed, count, source: "file" };
}

export function regenerateHistoricalArchive(count = DEFAULT_HISTORY_COUNT, seed = Date.now() % 1_000_000_000) {
  const transfers = generateHistoricalTransfers(count, seed);
  saveHistoricalArchive(transfers, seed, count);
  return { transfers, summary: summarizeHistory(transfers), seed, count };
}

export function clearHistoricalCache() {
  globalThis.__cryptohostHistoricalCache = undefined;
  globalThis.__cryptohostHistoricalMeta = undefined;
}

export { summarizeHistory, DEFAULT_HISTORY_COUNT, DEFAULT_HISTORY_SEED };

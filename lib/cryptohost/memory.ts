import type { CryptohostIncident, CryptohostTransfer } from "./types";

declare global {
  // eslint-disable-next-line no-var
  var __cryptohostTransfers: CryptohostTransfer[] | undefined;
  // eslint-disable-next-line no-var
  var __cryptohostIncidents: CryptohostIncident[] | undefined;
}

function transfers(): CryptohostTransfer[] {
  if (!globalThis.__cryptohostTransfers) globalThis.__cryptohostTransfers = [];
  return globalThis.__cryptohostTransfers;
}

function incidents(): CryptohostIncident[] {
  if (!globalThis.__cryptohostIncidents) globalThis.__cryptohostIncidents = [];
  return globalThis.__cryptohostIncidents;
}

export function memoryInsert(t: CryptohostTransfer) {
  transfers().unshift(t);
  if (transfers().length > 500) transfers().length = 500;
}

export function memoryUpdate(t: CryptohostTransfer) {
  const list = transfers();
  const i = list.findIndex((x) => x.id === t.id);
  if (i >= 0) list[i] = t;
  else memoryInsert(t);
}

export function memoryGet(id: string) {
  return transfers().find((x) => x.id === id) ?? null;
}

export function memoryList(limit = 50, offset = 0) {
  return transfers().slice(offset, offset + limit);
}

export function memoryCount() {
  return transfers().length;
}

export function memoryIncidents(openOnly = false) {
  const list = incidents();
  return openOnly ? list.filter((x) => x.status === "open") : list;
}

export function memoryAddIncident(inc: CryptohostIncident) {
  incidents().unshift(inc);
}

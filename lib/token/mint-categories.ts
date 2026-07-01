import type { MintCategory } from "./types";

export const MINT_CATEGORIES: { value: MintCategory; label: string; hint: string }[] = [
  { value: "marketing", label: "Marketing", hint: "Campañas, KOLs, promos pre-LP" },
  { value: "liquidity", label: "Liquidez", hint: "Reserva antes de crear pool USDT/CGOLD" },
  { value: "presale", label: "Preventa", hint: "Asignación a compradores early" },
  { value: "team", label: "Equipo / stake", hint: "Stake estratégico emisor (20%)" },
  { value: "treasury", label: "Tesorería", hint: "Multisig / reservas operativas" },
  { value: "other", label: "Otro", hint: "Uso documentado en nota" },
];

export const ALLOCATION_TARGETS = [
  { label: "Adquirentes / preventa", pct: 70, tokens: "8.400M" },
  { label: "Stake estratégico emisor", pct: 20, tokens: "2.400M" },
  { label: "Liquidez y reservas", pct: 10, tokens: "1.200M" },
];

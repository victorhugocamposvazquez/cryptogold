"use client";

import { useSyncExternalStore } from "react";
import { OZ_PER_TOKEN } from "./brand";

export type ActivityRow = { id: string; addr: string; action: string; amt: string; ts: number };

export type MarketState = {
  price: number;
  change: number;
  goldSpot: number;
  goldChange: number;
  now: number;
  activity: ActivityRow[];
};

const FALLBACK_GOLD = 3342.5;
const BASE_GOLD = FALLBACK_GOLD;
const BASE_TOKEN = BASE_GOLD * OZ_PER_TOKEN;

let market: MarketState = {
  price: BASE_TOKEN,
  change: 0.42,
  goldSpot: FALLBACK_GOLD,
  goldChange: 0.42,
  now: typeof window !== "undefined" ? Date.now() : new Date("2026-06-29T00:00:00Z").getTime(),
  activity: [
    { id: "a1", addr: "0x7c…4f", action: "compró", amt: "125,000", ts: 8000 },
    { id: "a2", addr: "0x3a…e1", action: "intercambió", amt: "74,000", ts: 23000 },
    { id: "a3", addr: "0x9f…2a", action: "compró", amt: "310,000", ts: 41000 },
    { id: "a4", addr: "0xb2…7d", action: "compró", amt: "51,200", ts: 76000 },
    { id: "a5", addr: "0x18…c9", action: "intercambió", amt: "202,500", ts: 122000 },
  ],
};

const listeners = new Set<() => void>();
let started = false;
let goldLoaded = false;

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return market;
}

export function getMarket() {
  return market;
}

export function useMarket(): MarketState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function syncTokenFromGold(goldSpot: number, goldChange: number) {
  const anchor = goldSpot * OZ_PER_TOKEN;
  const tokenChange = goldChange;
  market = {
    ...market,
    goldSpot,
    goldChange: tokenChange,
    price: anchor,
    change: tokenChange,
  };
  emit();
}

async function loadGoldSpot() {
  try {
    const res = await fetch("/api/gold");
    if (!res.ok) return;
    const data = await res.json();
    const spot = Number(data.usdPerOz);
    const ch = Number(data.change24h ?? 0);
    if (spot > 0) syncTokenFromGold(spot, ch);
    goldLoaded = true;
  } catch {
    /* keep fallback */
  }
}

export function pushCryptohostActivity(wallet: string, kind: "buy" | "sell" | "swap", amount: number) {
  const short = wallet && wallet.length > 10 ? wallet.slice(0, 4) + "…" + wallet.slice(-4) : "0x…";
  const action = kind === "buy" ? "compró" : kind === "sell" ? "vendió" : "intercambió";
  market = {
    ...market,
    activity: [
      { id: "ch" + Date.now(), addr: short, action, amt: Math.round(amount).toLocaleString("en-US"), ts: Date.now() },
      ...market.activity,
    ].slice(0, 6),
  };
  emit();
}

function genActivity(): ActivityRow {
  const hex = "0123456789abcdef";
  const r = (n: number) => Array.from({ length: n }, () => hex[Math.floor(Math.random() * 16)]).join("");
  const addr = "0x" + r(2) + "…" + r(2);
  const action = Math.random() < 0.72 ? "compró" : "intercambió";
  const amt = (Math.floor(Math.random() * 490000) + 10000).toLocaleString("en-US");
  return { id: "a" + Date.now() + Math.floor(Math.random() * 99), addr, action, amt, ts: Date.now() };
}

/** Starts live price / gold anchor / activity timers once per session. */
export function startMarketTicker() {
  if (started || typeof window === "undefined") return;
  started = true;
  market = { ...market, now: Date.now() };
  loadGoldSpot();

  setInterval(() => {
    market = { ...market, now: Date.now() };
    emit();
  }, 1000);

  setInterval(() => {
    if (!goldLoaded) loadGoldSpot();
  }, 60000);

  setInterval(() => {
    const d = (Math.random() - 0.48) * 0.004;
    const ng = market.goldSpot * (1 + d);
    const clampedGold = Math.max(BASE_GOLD * 0.97, Math.min(BASE_GOLD * 1.04, ng));
    const ch = +((clampedGold / BASE_GOLD - 1) * 100).toFixed(2);
    syncTokenFromGold(+clampedGold.toFixed(2), ch);
  }, 4000);

  setInterval(() => {
    market = { ...market, activity: [genActivity(), ...market.activity].slice(0, 6) };
    emit();
  }, 4600);
}

import type { CryptohostTransfer, TransferKind } from "./types";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CHAINS = ["BNB Chain", "Ethereum", "Polygon", "Solana", "Stellar", "XRP Ledger"];
const PROVIDERS = ["Transak", "MoonPay", "CRYPTOHOST", "Binance Pay", null];
const PAY_ASSETS = ["USDT", "USDC", "ETH", "BTC", "USD", "EUR"];
const KIND_WEIGHTS: { kind: TransferKind; w: number }[] = [
  { kind: "buy", w: 0.54 },
  { kind: "swap", w: 0.18 },
  { kind: "sell", w: 0.14 },
  { kind: "fiat_credit", w: 0.14 },
];

export const DEFAULT_HISTORY_COUNT = 5000;
export const DEFAULT_HISTORY_SEED = 424242;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickKind(rng: () => number): TransferKind {
  const r = rng();
  let acc = 0;
  for (const { kind, w } of KIND_WEIGHTS) {
    acc += w;
    if (r <= acc) return kind;
  }
  return "buy";
}

function wallet(rng: () => number): string {
  const hex = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) addr += hex[Math.floor(rng() * 16)];
  return addr;
}

function transferId(index: number, rng: () => number): string {
  let n = index * 997 + Math.floor(rng() * 99991);
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += CHARS[n % CHARS.length];
    n = Math.floor(n / CHARS.length) + i * 17;
  }
  return `CGD-${suffix}`;
}

function goldPriceAt(ms: number): number {
  const start = new Date("2023-01-01").getTime();
  const end = Date.now();
  const t = (ms - start) / Math.max(end - start, 1);
  const spotOz = 1830 + t * 1510 + Math.sin(t * 12) * 45;
  return +((spotOz * 0.001) * (1 + Math.sin(ms / 86_400_000) * 0.001)).toFixed(6);
}

function logAmount(rng: () => number, min: number, max: number): number {
  const logMin = Math.log(min);
  const logMax = Math.log(max);
  return +(Math.exp(logMin + rng() * (logMax - logMin))).toFixed(rng() > 0.92 ? 4 : 2);
}

/** Genera un histórico creíble de operaciones CRYPTOHOST (determinista por seed). */
export function generateHistoricalTransfers(count = DEFAULT_HISTORY_COUNT, seed = DEFAULT_HISTORY_SEED): CryptohostTransfer[] {
  const rng = mulberry32(seed);
  const startMs = new Date("2023-02-08T08:00:00Z").getTime();
  const endMs = Date.now() - 120_000;
  const out: CryptohostTransfer[] = [];

  for (let i = 0; i < count; i++) {
    const kind = pickKind(rng);
    const createdMs = startMs + (endMs - startMs) * Math.pow(rng(), 0.38);
    const created = new Date(createdMs);
    const confirmMs = createdMs + 700 + Math.floor(rng() * 3800);
    const confirmed = new Date(confirmMs);
    const price = goldPriceAt(createdMs);
    const chain = CHAINS[Math.floor(rng() * CHAINS.length)];
    const status = rng() < 0.993 ? "confirmed" : "failed";
    const w = wallet(rng);

    let payAsset = PAY_ASSETS[Math.floor(rng() * PAY_ASSETS.length)];
    let payAmount: number | null = null;
    let receiveAsset = "CGOLD";
    let receiveAmount: number | null = null;

    if (kind === "buy" || kind === "fiat_credit") {
      receiveAmount = logAmount(rng, 120, 850_000);
      const grossUsd = receiveAmount * price * (kind === "fiat_credit" ? 1.015 : 1.01);
      if (payAsset === "USD" || payAsset === "EUR") payAmount = +(grossUsd / (payAsset === "EUR" ? 1.08 : 1)).toFixed(2);
      else if (payAsset === "USDT" || payAsset === "USDC") payAmount = +grossUsd.toFixed(2);
      else if (payAsset === "ETH") payAmount = +(grossUsd / 3400).toFixed(4);
      else payAmount = +(grossUsd / 95000).toFixed(5);
    } else if (kind === "sell") {
      payAsset = "CGOLD";
      payAmount = logAmount(rng, 500, 420_000);
      receiveAsset = rng() < 0.55 ? "USDT" : rng() < 0.75 ? "USDC" : "ETH";
      const grossUsd = payAmount * price * 0.997;
      receiveAmount =
        receiveAsset === "ETH" ? +(grossUsd / 3400).toFixed(4) : receiveAsset === "BTC" ? +(grossUsd / 95000).toFixed(5) : +grossUsd.toFixed(2);
    } else {
      payAsset = rng() < 0.5 ? "USDT" : rng() < 0.75 ? "ETH" : "BTC";
      payAmount = payAsset === "BTC" ? logAmount(rng, 0.01, 2.5) : payAsset === "ETH" ? logAmount(rng, 0.5, 120) : logAmount(rng, 500, 200_000);
      const grossUsd =
        payAsset === "USDT" || payAsset === "USDC"
          ? payAmount
          : payAsset === "ETH"
            ? payAmount * 3400
            : payAmount * 95000;
      receiveAmount = +((grossUsd * 0.997) / price).toFixed(2);
    }

    const feeUsd = +(receiveAmount! * price * (0.008 + rng() * 0.012)).toFixed(2);
    const provider =
      kind === "fiat_credit" ? (rng() < 0.55 ? "Transak" : "MoonPay") : rng() < 0.35 ? "CRYPTOHOST" : PROVIDERS[Math.floor(rng() * PROVIDERS.length)];

    out.push({
      id: transferId(i + seed, rng),
      kind,
      status,
      wallet: w,
      pay_asset: payAsset,
      pay_amount: payAmount,
      receive_asset: receiveAsset,
      receive_amount: receiveAmount,
      fee_usd: feeUsd,
      price_usd: price,
      provider,
      chain,
      error: status === "failed" ? (rng() < 0.5 ? "RPC timeout · reintentado" : "Slippage guard · rechazado") : null,
      attempts: status === "failed" ? 1 + Math.floor(rng() * 2) : 1,
      created_at: created.toISOString(),
      updated_at: confirmed.toISOString(),
      confirmed_at: status === "confirmed" ? confirmed.toISOString() : null,
    });
  }

  out.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return out;
}

export function summarizeHistory(transfers: CryptohostTransfer[]) {
  const byKind: Record<string, number> = {};
  for (const t of transfers) byKind[t.kind] = (byKind[t.kind] ?? 0) + 1;
  return {
    count: transfers.length,
    confirmed: transfers.filter((t) => t.status === "confirmed").length,
    failed: transfers.filter((t) => t.status === "failed").length,
    byKind,
    oldest: transfers[transfers.length - 1]?.created_at,
    newest: transfers[0]?.created_at,
  };
}

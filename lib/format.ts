/** Money + number formatting for CryptoGold. */

import { TOKEN_SYMBOL } from "./brand";

export function fmtUSD(n: number): string {
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
  if (n >= 1000) return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtN(n: number, d: number): string {
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

/** Reference USD prices for the demo. In production fetch these live. */
export const PRICES_USD: Record<string, number> = {
  ETH: 3450,
  BTC: 64000,
  USDC: 1,
  USDT: 1,
  USD: 1,
  EUR: 1.08,
  [TOKEN_SYMBOL]: 3.34,
};

export const ACCENT = "var(--accent,#C9A227)";
export const NEG = "#D14343";

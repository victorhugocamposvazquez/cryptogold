/** CryptoGold brand & token constants */

export const BRAND = "CryptoGold";
export const TOKEN_SYMBOL = "CGOLD";
export const TOKEN_NAME = "CryptoGold Token";
export const TOKEN_SUPPLY = 12_000_000_000;
export const TOKEN_SUPPLY_LABEL = "12,000M";

/** Centro de operaciones (/cryptohost, /admin) — misma marca que el producto */
export const OPS_CENTER_NAME = BRAND;
export const OPS_CENTER_TAGLINE = "Centro de operaciones";

/** Each CGOLD represents this fraction of a troy ounce of gold (spot-linked). */
export const OZ_PER_TOKEN = 0.001;

export const CHAINS = ["BNB Chain", "Ethereum", "Polygon", "Solana", "Stellar", "XRP Ledger"] as const;

/** Respaldo estructurado del proyecto (placeholder configurable). */
export const STRUCTURED_BACKING_LABEL = "€12.000M";
export const STRUCTURED_BACKING_FULL = "€12.000.000.000,00";
export const CRYPTOHOST_TRANSFERS = "5M+";
export const SUPPORT_HUMAN_TEAM = 3;
export const SUPPORT_SLA = "< 24 h";

export const LEGAL_JURISDICTIONS = [
  "Londres",
  "Lituania",
  "Estonia",
  "Hong Kong",
  "Dubai",
  "Suiza",
] as const;

export const BANKING_HUBS = ["Dubai", "Hong Kong", "Suiza"] as const;

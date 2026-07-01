export type TransferStatus = "pending" | "processing" | "confirmed" | "failed";
export type TransferKind = "buy" | "sell" | "swap" | "fiat_credit";

export type CryptohostTransfer = {
  id: string;
  kind: TransferKind;
  status: TransferStatus;
  wallet?: string | null;
  pay_asset?: string | null;
  pay_amount?: number | null;
  receive_asset: string;
  receive_amount?: number | null;
  fee_usd?: number | null;
  price_usd?: number | null;
  provider?: string | null;
  chain?: string | null;
  error?: string | null;
  attempts: number;
  created_at: string;
  updated_at: string;
  confirmed_at?: string | null;
};

export type CreateTransferInput = {
  kind: TransferKind;
  wallet?: string;
  pay_asset?: string;
  pay_amount?: number;
  receive_asset?: string;
  receive_amount?: number;
  fee_usd?: number;
  price_usd?: number;
  provider?: string;
  chain?: string;
};

export type TransferStats = {
  historicalTotal: number;
  sessionTotal: number;
  confirmed: number;
  failed: number;
  processing: number;
  last24h: number;
  avgConfirmMs: number;
  uptimePct: number;
  registryTotal?: number;
};

export type ServiceStatus = {
  service: "CryptoGold";
  status: "operational" | "degraded" | "outage";
  message: string;
  stats: TransferStats;
  openIncidents: number;
  updatedAt: string;
};

export type CryptohostIncident = {
  id: string;
  title: string;
  status: "open" | "resolved";
  severity: "minor" | "major" | "critical";
  description?: string | null;
  eta?: string | null;
  created_at: string;
  resolved_at?: string | null;
};

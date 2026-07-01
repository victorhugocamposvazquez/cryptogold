export type MintCategory = "marketing" | "liquidity" | "presale" | "team" | "treasury" | "other";

export type MintLogEntry = {
  id: string;
  to: string;
  amount: string;
  category: MintCategory;
  note?: string;
  txHash: string;
  createdAt: string;
};

export type TokenStats = {
  configured: boolean;
  contractAddress: string | null;
  network: "testnet" | "mainnet";
  chainId: number;
  explorer: string;
  owner: string | null;
  operatorConfigured: boolean;
  operatorAddress: string | null;
  operatorIsOwner: boolean;
  treasuryAddress: string | null;
  treasuryBalance: string | null;
  totalMinted: string;
  maxSupply: string;
  remainingMintable: string;
  mintPercentUsed: number;
};

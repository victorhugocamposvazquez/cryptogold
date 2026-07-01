export type MintCategory = "marketing" | "liquidity" | "presale" | "team" | "treasury" | "other";

export type MintInput = {
  to: string;
  amount: string;
  category: MintCategory;
  note?: string;
};

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
  addressSource: "env" | "registry" | null;
  tokenName: string;
  tokenSymbol: string;
  network: "testnet" | "mainnet";
  chainId: number;
  explorer: string;
  owner: string | null;
  deployerConfigured: boolean;
  deployerAddress: string | null;
  operatorConfigured: boolean;
  operatorAddress: string | null;
  operatorIsOwner: boolean;
  treasuryAddress: string | null;
  treasuryBalance: string | null;
  totalMinted: string;
  maxSupply: string;
  remainingMintable: string;
  mintPercentUsed: number;
  registry?: {
    supabaseConfigured: boolean;
    supabaseAdminConfigured: boolean;
    storageBackend: "supabase" | "file";
    envContractPinned: boolean;
    deploymentCount: number;
    activeDeploymentId: string | null;
    registryError: string | null;
    setupHint: string | null;
  };
};

export type DeployRecord = {
  id: string;
  network: "testnet" | "mainnet";
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  maxSupply: string;
  initialMint: string;
  treasury: string;
  deployer: string;
  txHash: string;
  /** Foundry contract template used for bytecode deploy */
  contractTemplate?: string;
  /** Explorer base URL at deploy time (e.g. https://testnet.bscscan.com) */
  explorer?: string;
  active: boolean;
  createdAt: string;
};

export type DeployInput = {
  name: string;
  symbol: string;
  maxSupply: string;
  treasury?: string;
  initialMint?: string;
  /** When treasury empty — wallet address used as genesis treasury */
  deployerFallback?: string;
};

/**
 * Perfiles testnet / mainnet — una sola fuente de verdad para red, contrato, RPC y claves.
 * Activa la red con NEXT_PUBLIC_BNB_NETWORK=testnet|mainnet
 */

export type BnbNetwork = "testnet" | "mainnet";

export type NetworkProfile = {
  id: BnbNetwork;
  label: string;
  chainId: number;
  explorer: string;
  rpcDefault: string;
  faucet: string | null;
  /** Env var for pinned contract address (client-safe NEXT_PUBLIC_*) */
  contractEnv: string;
  rpcEnv: string;
  treasuryEnv: string;
  treasuryEnvScoped: string;
  ownerKeyEnv: string;
  ownerKeyEnvScoped: string;
  deployerKeyEnv: string;
  deployerKeyEnvScoped: string;
};

export const NETWORK_PROFILES: Record<BnbNetwork, NetworkProfile> = {
  testnet: {
    id: "testnet",
    label: "BNB Smart Chain Testnet",
    chainId: 97,
    explorer: "https://testnet.bscscan.com",
    rpcDefault: "https://data-seed-prebsc-1-s1.binance.org:8545",
    faucet: "https://www.bnbchain.org/en/testnet-faucet",
    contractEnv: "NEXT_PUBLIC_CGOLD_BNB_TESTNET",
    rpcEnv: "BSC_TESTNET_RPC_URL",
    treasuryEnv: "CGOLD_TREASURY_ADDRESS",
    treasuryEnvScoped: "CGOLD_TREASURY_ADDRESS_TESTNET",
    ownerKeyEnv: "TOKEN_OWNER_PRIVATE_KEY",
    ownerKeyEnvScoped: "TOKEN_OWNER_PRIVATE_KEY_TESTNET",
    deployerKeyEnv: "TOKEN_DEPLOYER_PRIVATE_KEY",
    deployerKeyEnvScoped: "TOKEN_DEPLOYER_PRIVATE_KEY_TESTNET",
  },
  mainnet: {
    id: "mainnet",
    label: "BNB Smart Chain Mainnet",
    chainId: 56,
    explorer: "https://bscscan.com",
    rpcDefault: "https://bsc-dataseed.binance.org",
    faucet: null,
    contractEnv: "NEXT_PUBLIC_CGOLD_BNB",
    rpcEnv: "BSC_MAINNET_RPC_URL",
    treasuryEnv: "CGOLD_TREASURY_ADDRESS",
    treasuryEnvScoped: "CGOLD_TREASURY_ADDRESS_MAINNET",
    ownerKeyEnv: "TOKEN_OWNER_PRIVATE_KEY",
    ownerKeyEnvScoped: "TOKEN_OWNER_PRIVATE_KEY_MAINNET",
    deployerKeyEnv: "TOKEN_DEPLOYER_PRIVATE_KEY",
    deployerKeyEnvScoped: "TOKEN_DEPLOYER_PRIVATE_KEY_MAINNET",
  },
};

export const BNB_NETWORKS: BnbNetwork[] = ["testnet", "mainnet"];

export function getActiveNetwork(): BnbNetwork {
  return process.env.NEXT_PUBLIC_BNB_NETWORK === "mainnet" ? "mainnet" : "testnet";
}

function readEnv(key: string): string | undefined {
  const v = process.env[key];
  if (!v || !v.trim() || v === "0x0000000000000000000000000000000000000000") return undefined;
  return v.trim();
}

function readScopedEnv(scopedKey: string, fallbackKey: string): string | undefined {
  return readEnv(scopedKey) ?? readEnv(fallbackKey);
}

export function getProfile(network: BnbNetwork = getActiveNetwork()): NetworkProfile {
  return NETWORK_PROFILES[network];
}

export function getContractAddressFromEnv(network: BnbNetwork = getActiveNetwork()): string | null {
  const p = getProfile(network);
  return readEnv(p.contractEnv) ?? null;
}

export function getRpcUrl(network: BnbNetwork = getActiveNetwork()): string {
  const p = getProfile(network);
  return readEnv(p.rpcEnv) ?? p.rpcDefault;
}

export function getTreasuryAddress(network: BnbNetwork = getActiveNetwork()): string | null {
  const p = getProfile(network);
  return readScopedEnv(p.treasuryEnvScoped, p.treasuryEnv) ?? null;
}

export function getOwnerPrivateKey(network: BnbNetwork = getActiveNetwork()): string | undefined {
  const p = getProfile(network);
  return readScopedEnv(p.ownerKeyEnvScoped, p.ownerKeyEnv);
}

export function getDeployerPrivateKey(network: BnbNetwork = getActiveNetwork()): string | undefined {
  const p = getProfile(network);
  return (
    readScopedEnv(p.deployerKeyEnvScoped, p.deployerKeyEnv) ??
    getOwnerPrivateKey(network) ??
    readEnv("DEPLOYER_PRIVATE_KEY")
  );
}

export type NetworkConfigView = {
  id: BnbNetwork;
  label: string;
  active: boolean;
  chainId: number;
  explorer: string;
  faucet: string | null;
  rpcUrl: string;
  rpcConfigured: boolean;
  contractAddress: string | null;
  contractSource: "env" | "registry" | null;
  treasuryAddress: string | null;
  ownerKeyConfigured: boolean;
  deployerKeyConfigured: boolean;
  envKeys: {
    switch: "NEXT_PUBLIC_BNB_NETWORK";
    contract: string;
    rpc: string;
    treasury: string;
    treasuryScoped: string;
    ownerKey: string;
    ownerKeyScoped: string;
    deployerKey: string;
    deployerKeyScoped: string;
  };
};

export function resolveNetworkConfigView(network: BnbNetwork): NetworkConfigView {
  const p = getProfile(network);
  const active = getActiveNetwork() === network;
  const contractFromEnv = getContractAddressFromEnv(network);

  return {
    id: network,
    label: p.label,
    active,
    chainId: p.chainId,
    explorer: p.explorer,
    faucet: p.faucet,
    rpcUrl: getRpcUrl(network),
    rpcConfigured: !!readEnv(p.rpcEnv),
    contractAddress: contractFromEnv,
    contractSource: contractFromEnv ? "env" : null,
    treasuryAddress: getTreasuryAddress(network),
    ownerKeyConfigured: !!getOwnerPrivateKey(network),
    deployerKeyConfigured: !!getDeployerPrivateKey(network),
    envKeys: {
      switch: "NEXT_PUBLIC_BNB_NETWORK",
      contract: p.contractEnv,
      rpc: p.rpcEnv,
      treasury: p.treasuryEnv,
      treasuryScoped: p.treasuryEnvScoped,
      ownerKey: p.ownerKeyEnv,
      ownerKeyScoped: p.ownerKeyEnvScoped,
      deployerKey: p.deployerKeyEnv,
      deployerKeyScoped: p.deployerKeyEnvScoped,
    },
  };
}

/** Bloque .env listo para copiar (sin valores secretos). */
export function buildEnvTemplate(active: BnbNetwork = getActiveNetwork()): string {
  const t = NETWORK_PROFILES.testnet;
  const m = NETWORK_PROFILES.mainnet;
  return `# ── Red activa: testnet | mainnet ──
NEXT_PUBLIC_BNB_NETWORK=${active}

# ── TESTNET (chainId ${t.chainId}) ──
${t.contractEnv}=0x...
${t.rpcEnv}=${t.rpcDefault}
${t.treasuryEnvScoped}=0x...
${t.ownerKeyEnvScoped}=...
${t.deployerKeyEnvScoped}=...

# ── MAINNET (chainId ${m.chainId}) ──
${m.contractEnv}=0x...
${m.rpcEnv}=${m.rpcDefault}
${m.treasuryEnvScoped}=0x...
${m.ownerKeyEnvScoped}=...
${m.deployerKeyEnvScoped}=...

# Fallbacks globales (opcional — aplican si no hay *_TESTNET / *_MAINNET)
# ${t.treasuryEnv}=0x...
# ${t.ownerKeyEnv}=...
# ${t.deployerKeyEnv}=...
`;
}

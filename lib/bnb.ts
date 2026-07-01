/** BNB Chain — re-exporta perfiles y helpers de explorador. */

import {
  getActiveNetwork,
  getContractAddressFromEnv,
  getProfile,
  NETWORK_PROFILES,
  type BnbNetwork,
} from "./network-profiles";

export type { BnbNetwork };
export { getActiveNetwork, NETWORK_PROFILES };

/** @deprecated use getActiveNetwork() */
export const BNB_NETWORK: BnbNetwork = getActiveNetwork();

export const BNB_CHAIN = {
  testnet: {
    chainId: NETWORK_PROFILES.testnet.chainId,
    shortName: "BNB Testnet",
    explorer: NETWORK_PROFILES.testnet.explorer,
    rpc: NETWORK_PROFILES.testnet.rpcDefault,
    faucet: NETWORK_PROFILES.testnet.faucet,
  },
  mainnet: {
    chainId: NETWORK_PROFILES.mainnet.chainId,
    shortName: "BNB Chain",
    explorer: NETWORK_PROFILES.mainnet.explorer,
    rpc: NETWORK_PROFILES.mainnet.rpcDefault,
    faucet: NETWORK_PROFILES.mainnet.faucet,
  },
} as const;

export function getBnbChainConfig(network: BnbNetwork = getActiveNetwork()) {
  const p = getProfile(network);
  return {
    chainId: p.chainId,
    shortName: network === "mainnet" ? "BNB Chain" : "BNB Testnet",
    explorer: p.explorer,
    rpc: p.rpcDefault,
    faucet: p.faucet,
  };
}

export function getCgoldBnbAddress(network: BnbNetwork = getActiveNetwork()): string | null {
  return getContractAddressFromEnv(network);
}

export function getCgoldBnbAddressWithRegistry(registryAddress: string | null): string | null {
  return getCgoldBnbAddress() ?? registryAddress;
}

export function isCgoldDeployedOnBnb(): boolean {
  return getCgoldBnbAddress() !== null;
}

export function bnbExplorerAddress(address: string): string {
  return `${getBnbChainConfig().explorer}/address/${address}`;
}

export function bnbExplorerToken(address: string): string {
  return `${getBnbChainConfig().explorer}/token/${address}`;
}

export function getBnbChainConfigForNetwork(network: BnbNetwork) {
  return getBnbChainConfig(network);
}

export function bnbExplorerTx(txHash: string, network?: BnbNetwork): string {
  const cfg = getBnbChainConfig(network ?? getActiveNetwork());
  return `${cfg.explorer}/tx/${txHash}`;
}

export function bnbExplorerAddressOnNetwork(address: string, network: BnbNetwork): string {
  return `${NETWORK_PROFILES[network].explorer}/address/${address}`;
}

export function bnbExplorerTokenOnNetwork(address: string, network: BnbNetwork): string {
  return `${NETWORK_PROFILES[network].explorer}/token/${address}`;
}

export function bnbNetworkLabel(network: BnbNetwork): string {
  return network === "mainnet" ? "BNB Chain" : "BNB Testnet";
}

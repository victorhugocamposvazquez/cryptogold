/** BNB Chain network config and CGOLD contract address resolution. */

export type BnbNetwork = "testnet" | "mainnet";

export const BNB_NETWORK: BnbNetwork =
  process.env.NEXT_PUBLIC_BNB_NETWORK === "mainnet" ? "mainnet" : "testnet";

export const BNB_CHAIN = {
  testnet: {
    chainId: 97,
    shortName: "BNB Testnet",
    explorer: "https://testnet.bscscan.com",
    rpc: "https://data-seed-prebsc-1-s1.binance.org:8545",
    faucet: "https://www.bnbchain.org/en/testnet-faucet",
  },
  mainnet: {
    chainId: 56,
    shortName: "BNB Chain",
    explorer: "https://bscscan.com",
    rpc: "https://bsc-dataseed.binance.org",
    faucet: null,
  },
} as const;

export function getBnbChainConfig() {
  return BNB_CHAIN[BNB_NETWORK];
}

/** Resolved CGOLD contract: env var first, then active deployment from backoffice registry. */
export function getCgoldBnbAddress(): string | null {
  const envAddr =
    BNB_NETWORK === "testnet"
      ? process.env.NEXT_PUBLIC_CGOLD_BNB_TESTNET
      : process.env.NEXT_PUBLIC_CGOLD_BNB;
  if (envAddr && envAddr !== "0x0000000000000000000000000000000000000000") {
    return envAddr;
  }
  return null;
}

/** Server-side: includes deployment registry when env is unset. */
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
  return BNB_CHAIN[network];
}

export function bnbExplorerTx(txHash: string, network?: BnbNetwork): string {
  const cfg = network ? BNB_CHAIN[network] : getBnbChainConfig();
  return `${cfg.explorer}/tx/${txHash}`;
}

export function bnbExplorerAddressOnNetwork(address: string, network: BnbNetwork): string {
  return `${BNB_CHAIN[network].explorer}/address/${address}`;
}

export function bnbExplorerTokenOnNetwork(address: string, network: BnbNetwork): string {
  return `${BNB_CHAIN[network].explorer}/token/${address}`;
}

export function bnbNetworkLabel(network: BnbNetwork): string {
  return BNB_CHAIN[network].shortName;
}

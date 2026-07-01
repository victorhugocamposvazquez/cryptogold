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

/** Resolved CGOLD contract on the active BNB network, or null if not deployed yet. */
export function getCgoldBnbAddress(): string | null {
  const addr =
    BNB_NETWORK === "testnet"
      ? process.env.NEXT_PUBLIC_CGOLD_BNB_TESTNET
      : process.env.NEXT_PUBLIC_CGOLD_BNB;
  if (!addr || addr === "0x0000000000000000000000000000000000000000") return null;
  return addr;
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

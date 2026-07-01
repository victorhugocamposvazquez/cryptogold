import { TOKEN_SYMBOL, TOKEN_SUPPLY, CHAINS } from "./brand";
import {
  getActiveNetwork,
  getBnbChainConfig,
  getCgoldBnbAddress,
  bnbExplorerAddress,
  type BnbNetwork,
} from "./bnb";

export type { BnbNetwork };
export { getActiveNetwork, getBnbChainConfig, getCgoldBnbAddress, bnbExplorerAddress, bnbExplorerToken } from "./bnb";

export type ChainKey = "bnb" | "eth" | "polygon" | "solana" | "stellar" | "xrp";

export type ContractEntry = {
  chain: string;
  chainId?: number;
  address: string;
  explorer?: string;
  status: "live" | "testnet" | "pending" | "planned";
  network?: BnbNetwork;
};

function bnbEntry(): ContractEntry {
  const network = getActiveNetwork();
  const cfg = getBnbChainConfig(network);
  const address = getCgoldBnbAddress(network);
  const isTestnet = network === "testnet";

  return {
    chain: isTestnet ? "BNB Smart Chain Testnet" : "BNB Chain",
    chainId: cfg.chainId,
    address: address ?? "0x0000000000000000000000000000000000000000",
    explorer: address ? bnbExplorerAddress(address) : `${cfg.explorer}/address/`,
    status: address ? (isTestnet ? "testnet" : "live") : "pending",
    network,
  };
}

/** Public contract registry — update addresses after deploy. */
export const CGOLD_CONTRACTS: ContractEntry[] = [
  bnbEntry(),
  {
    chain: "Ethereum",
    chainId: 1,
    address: process.env.NEXT_PUBLIC_CGOLD_ETH || "0x0000000000000000000000000000000000000000",
    explorer: "https://etherscan.io/address/",
    status: process.env.NEXT_PUBLIC_CGOLD_ETH ? "live" : "planned",
  },
  {
    chain: "Polygon",
    chainId: 137,
    address: process.env.NEXT_PUBLIC_CGOLD_POLYGON || "0x0000000000000000000000000000000000000000",
    explorer: "https://polygonscan.com/address/",
    status: "planned",
  },
  {
    chain: CHAINS[3],
    address: "—",
    status: "planned",
  },
  {
    chain: CHAINS[4],
    address: "—",
    status: "planned",
  },
  {
    chain: CHAINS[5],
    address: "—",
    status: "planned",
  },
];

export const CONTRACT_SPEC = {
  name: "CryptoGold",
  symbol: TOKEN_SYMBOL,
  decimals: 18,
  totalSupply: TOKEN_SUPPLY,
  mintable: true,
  mintCap: TOKEN_SUPPLY,
  burnable: false,
  standard: "ERC-20 / BEP-20",
} as const;

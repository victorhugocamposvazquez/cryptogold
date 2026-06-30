import { TOKEN_SYMBOL, TOKEN_SUPPLY, CHAINS } from "./brand";

export type ChainKey = "bnb" | "eth" | "polygon" | "solana" | "stellar" | "xrp";

export type ContractEntry = {
  chain: string;
  chainId?: number;
  address: string;
  explorer?: string;
  status: "live" | "pending" | "planned";
};

/** Public contract registry — update addresses after deploy. */
export const CGOLD_CONTRACTS: ContractEntry[] = [
  {
    chain: "BNB Chain",
    chainId: 56,
    address: process.env.NEXT_PUBLIC_CGOLD_BNB || "0x0000000000000000000000000000000000000000",
    explorer: "https://bscscan.com/address/",
    status: process.env.NEXT_PUBLIC_CGOLD_BNB ? "live" : "pending",
  },
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
  mintable: false,
  burnable: false,
  standard: "ERC-20 / BEP-20",
} as const;

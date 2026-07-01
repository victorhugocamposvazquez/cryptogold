import { bsc, bscTestnet } from "wagmi/chains";

export const TARGET_CHAIN = {
  testnet: bscTestnet,
  mainnet: bsc,
} as const;

export function getTargetChainId(): number {
  return process.env.NEXT_PUBLIC_BNB_NETWORK === "mainnet" ? bsc.id : bscTestnet.id;
}

export function getTargetChainLabel(): string {
  return process.env.NEXT_PUBLIC_BNB_NETWORK === "mainnet" ? "BNB Mainnet" : "BNB Testnet";
}

export function getTargetChain() {
  return process.env.NEXT_PUBLIC_BNB_NETWORK === "mainnet" ? bsc : bscTestnet;
}

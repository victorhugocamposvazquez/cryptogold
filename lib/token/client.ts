import { createPublicClient, createWalletClient, http, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bsc, bscTestnet } from "viem/chains";
import { BNB_NETWORK, getBnbChainConfig, getCgoldBnbAddress } from "@/lib/bnb";
import { CGOLD_ABI } from "./abi";

function rpcUrl(): string {
  if (BNB_NETWORK === "testnet") {
    return process.env.BSC_TESTNET_RPC_URL || bscTestnet.rpcUrls.default.http[0];
  }
  return process.env.BSC_MAINNET_RPC_URL || bsc.rpcUrls.default.http[0];
}

export function getViemChain() {
  return BNB_NETWORK === "mainnet" ? bsc : bscTestnet;
}

export function getContractAddress(): Address | null {
  const addr = getCgoldBnbAddress();
  if (!addr) return null;
  return addr as Address;
}

export function getPublicClient() {
  return createPublicClient({
    chain: getViemChain(),
    transport: http(rpcUrl()),
  });
}

export function getOperatorAccount() {
  const raw = process.env.TOKEN_OWNER_PRIVATE_KEY;
  if (!raw) return null;
  const pk = (raw.startsWith("0x") ? raw : `0x${raw}`) as Hex;
  return privateKeyToAccount(pk);
}

export function getWalletClient() {
  const account = getOperatorAccount();
  if (!account) return null;
  return createWalletClient({
    account,
    chain: getViemChain(),
    transport: http(rpcUrl()),
  });
}

export function isTokenOperatorConfigured(): boolean {
  return !!getOperatorAccount();
}

export function getTreasuryAddress(): Address | null {
  const addr = process.env.CGOLD_TREASURY_ADDRESS;
  if (!addr) return null;
  return addr as Address;
}

export async function readContractStats() {
  const address = getContractAddress();
  if (!address) return null;

  const client = getPublicClient();
  const treasury = getTreasuryAddress();

  const [maxSupply, totalSupply, remainingMintable, owner, treasuryBal] = await Promise.all([
    client.readContract({ address, abi: CGOLD_ABI, functionName: "MAX_SUPPLY" }),
    client.readContract({ address, abi: CGOLD_ABI, functionName: "totalSupply" }),
    client.readContract({ address, abi: CGOLD_ABI, functionName: "remainingMintable" }),
    client.readContract({ address, abi: CGOLD_ABI, functionName: "owner" }),
    treasury
      ? client.readContract({ address, abi: CGOLD_ABI, functionName: "balanceOf", args: [treasury] })
      : Promise.resolve(null),
  ]);

  return { address, maxSupply, totalSupply, remainingMintable, owner, treasuryBal };
}

export { getBnbChainConfig };

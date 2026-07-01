import { createPublicClient, createWalletClient, http, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bsc, bscTestnet } from "viem/chains";
import {
  getActiveNetwork,
  getContractAddressFromEnv,
  getDeployerPrivateKey,
  getOwnerPrivateKey,
  getRpcUrl,
  getTreasuryAddress as getTreasuryFromProfile,
} from "@/lib/network-profiles";
import { getActiveDeployment } from "./deployments";
import { CGOLD_ABI } from "./abi";

function pkAccount(raw: string | undefined) {
  if (!raw) return null;
  const pk = (raw.startsWith("0x") ? raw : `0x${raw}`) as Hex;
  return privateKeyToAccount(pk);
}

export function getViemChain() {
  return getActiveNetwork() === "mainnet" ? bsc : bscTestnet;
}

function resolveAddress(): { address: Address | null; source: "env" | "registry" | null } {
  const fromEnv = getContractAddressFromEnv();
  if (fromEnv) return { address: fromEnv as Address, source: "env" };
  const active = getActiveDeployment(getActiveNetwork());
  if (active?.address) return { address: active.address as Address, source: "registry" };
  return { address: null, source: null };
}

export function getContractAddress(): Address | null {
  return resolveAddress().address;
}

export function getContractAddressSource(): "env" | "registry" | null {
  return resolveAddress().source;
}

export function getPublicClient() {
  return createPublicClient({
    chain: getViemChain(),
    transport: http(getRpcUrl()),
  });
}

export function getOperatorAccount() {
  return pkAccount(getOwnerPrivateKey());
}

export function getDeployerAccount() {
  return pkAccount(getDeployerPrivateKey());
}

export function getWalletClient() {
  const account = getOperatorAccount();
  if (!account) return null;
  return createWalletClient({ account, chain: getViemChain(), transport: http(getRpcUrl()) });
}

export function getDeployerWalletClient() {
  const account = getDeployerAccount();
  if (!account) return null;
  return createWalletClient({ account, chain: getViemChain(), transport: http(getRpcUrl()) });
}

export function isTokenOperatorConfigured(): boolean {
  return !!getOperatorAccount();
}

export function isTokenDeployerConfigured(): boolean {
  return !!getDeployerAccount();
}

export function getTreasuryAddress(): Address | null {
  const addr = getTreasuryFromProfile();
  if (!addr) return null;
  return addr as Address;
}

export async function readContractStats() {
  const { address } = resolveAddress();
  if (!address) return null;

  const client = getPublicClient();
  const treasury = getTreasuryAddress();

  const [maxSupply, totalSupply, remainingMintable, owner, tokenName, tokenSymbol, treasuryBal] =
    await Promise.all([
      client.readContract({ address, abi: CGOLD_ABI, functionName: "maxSupply" }),
      client.readContract({ address, abi: CGOLD_ABI, functionName: "totalSupply" }),
      client.readContract({ address, abi: CGOLD_ABI, functionName: "remainingMintable" }),
      client.readContract({ address, abi: CGOLD_ABI, functionName: "owner" }),
      client.readContract({ address, abi: CGOLD_ABI, functionName: "name" }),
      client.readContract({ address, abi: CGOLD_ABI, functionName: "symbol" }),
      treasury
        ? client.readContract({ address, abi: CGOLD_ABI, functionName: "balanceOf", args: [treasury] })
        : Promise.resolve(null),
    ]);

  return {
    address,
    maxSupply,
    totalSupply,
    remainingMintable,
    owner,
    tokenName,
    tokenSymbol,
    treasuryBal,
  };
}

export { getActiveNetwork, getContractAddressFromEnv as getCgoldBnbAddress };

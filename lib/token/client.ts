import { createPublicClient, createWalletClient, http, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bsc, bscTestnet } from "viem/chains";
import { BNB_NETWORK, getBnbChainConfig, getCgoldBnbAddress, getCgoldBnbAddressWithRegistry } from "@/lib/bnb";
import { getActiveDeployment } from "./deployments";
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

function resolveAddress(): { address: Address | null; source: "env" | "registry" | null } {
  const fromEnv = getCgoldBnbAddress();
  if (fromEnv) return { address: fromEnv as Address, source: "env" };
  const active = getActiveDeployment(BNB_NETWORK);
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
    transport: http(rpcUrl()),
  });
}

function pkAccount(raw: string | undefined) {
  if (!raw) return null;
  const pk = (raw.startsWith("0x") ? raw : `0x${raw}`) as Hex;
  return privateKeyToAccount(pk);
}

export function getOperatorAccount() {
  return pkAccount(process.env.TOKEN_OWNER_PRIVATE_KEY);
}

export function getDeployerAccount() {
  return (
    pkAccount(process.env.TOKEN_DEPLOYER_PRIVATE_KEY) ??
    pkAccount(process.env.TOKEN_OWNER_PRIVATE_KEY) ??
    pkAccount(process.env.DEPLOYER_PRIVATE_KEY)
  );
}

export function getWalletClient() {
  const account = getOperatorAccount();
  if (!account) return null;
  return createWalletClient({ account, chain: getViemChain(), transport: http(rpcUrl()) });
}

export function getDeployerWalletClient() {
  const account = getDeployerAccount();
  if (!account) return null;
  return createWalletClient({ account, chain: getViemChain(), transport: http(rpcUrl()) });
}

export function isTokenOperatorConfigured(): boolean {
  return !!getOperatorAccount();
}

export function isTokenDeployerConfigured(): boolean {
  return !!getDeployerAccount();
}

export function getTreasuryAddress(): Address | null {
  const addr = process.env.CGOLD_TREASURY_ADDRESS;
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

export { getBnbChainConfig, getCgoldBnbAddressWithRegistry };

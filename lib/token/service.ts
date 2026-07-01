import { formatUnits, parseUnits, isAddress, type Address } from "viem";
import { TOKEN_SUPPLY } from "@/lib/brand";
import { BNB_NETWORK, bnbExplorerAddress, bnbExplorerToken } from "@/lib/bnb";
import {
  getContractAddress,
  getOperatorAccount,
  getPublicClient,
  getTreasuryAddress,
  getWalletClient,
  isTokenOperatorConfigured,
  readContractStats,
} from "./client";
import { CGOLD_ABI } from "./abi";
import { appendMintLog, listMintLogs } from "./mint-log";
import type { MintCategory, MintLogEntry, TokenStats } from "./types";

const DECIMALS = 18;

function fmtTokens(wei: bigint): string {
  return formatUnits(wei, DECIMALS);
}

export async function getTokenStats(): Promise<TokenStats> {
  const cfg = { chainId: BNB_NETWORK === "mainnet" ? 56 : 97, explorer: BNB_NETWORK === "mainnet" ? "https://bscscan.com" : "https://testnet.bscscan.com" };
  const contractAddress = getContractAddress();
  const operator = getOperatorAccount();
  const treasuryAddress = getTreasuryAddress();

  if (!contractAddress) {
    return {
      configured: false,
      contractAddress: null,
      network: BNB_NETWORK,
      chainId: cfg.chainId,
      explorer: cfg.explorer,
      owner: null,
      operatorConfigured: isTokenOperatorConfigured(),
      operatorAddress: operator?.address ?? null,
      operatorIsOwner: false,
      treasuryAddress: treasuryAddress ?? null,
      treasuryBalance: null,
      totalMinted: "0",
      maxSupply: String(TOKEN_SUPPLY),
      remainingMintable: String(TOKEN_SUPPLY),
      mintPercentUsed: 0,
    };
  }

  const onChain = await readContractStats();
  if (!onChain) {
    throw new Error("No se pudo leer el contrato on-chain");
  }

  const totalMinted = fmtTokens(onChain.totalSupply);
  const maxSupply = fmtTokens(onChain.maxSupply);
  const remaining = fmtTokens(onChain.remainingMintable);
  const usedPct = Number(onChain.totalSupply) / Number(onChain.maxSupply) * 100;

  return {
    configured: true,
    contractAddress,
    network: BNB_NETWORK,
    chainId: cfg.chainId,
    explorer: cfg.explorer,
    owner: onChain.owner,
    operatorConfigured: isTokenOperatorConfigured(),
    operatorAddress: operator?.address ?? null,
    operatorIsOwner: operator ? operator.address.toLowerCase() === onChain.owner.toLowerCase() : false,
    treasuryAddress: treasuryAddress ?? null,
    treasuryBalance: onChain.treasuryBal != null ? fmtTokens(onChain.treasuryBal) : null,
    totalMinted,
    maxSupply,
    remainingMintable: remaining,
    mintPercentUsed: +usedPct.toFixed(4),
  };
}

export type MintInput = {
  to: string;
  amount: string;
  category: MintCategory;
  note?: string;
};

export async function mintCgold(input: MintInput): Promise<MintLogEntry> {
  const address = getContractAddress();
  if (!address) throw new Error("Contrato CGOLD no configurado (NEXT_PUBLIC_CGOLD_BNB_TESTNET)");

  if (!isAddress(input.to)) throw new Error("Dirección destino inválida");

  const amountNum = Number(input.amount.replace(/,/g, ""));
  if (!Number.isFinite(amountNum) || amountNum <= 0) throw new Error("Importe inválido");

  const wallet = getWalletClient();
  const operator = getOperatorAccount();
  if (!wallet || !operator) throw new Error("TOKEN_OWNER_PRIVATE_KEY no configurada en el servidor");

  const onChain = await readContractStats();
  if (!onChain) throw new Error("Contrato no accesible");
  if (operator.address.toLowerCase() !== onChain.owner.toLowerCase()) {
    throw new Error("La clave del operador no coincide con owner() del contrato");
  }

  const amountWei = parseUnits(input.amount.replace(/,/g, ""), DECIMALS);
  if (amountWei > onChain.remainingMintable) {
    throw new Error(`Supera el cupo restante (${fmtTokens(onChain.remainingMintable)} CGOLD)`);
  }

  const hash = await wallet.writeContract({
    address,
    abi: CGOLD_ABI,
    functionName: "mint",
    args: [input.to as Address, amountWei],
  });

  const client = getPublicClient();
  await client.waitForTransactionReceipt({ hash });

  return appendMintLog({
    to: input.to,
    amount: input.amount.replace(/,/g, ""),
    category: input.category,
    note: input.note,
    txHash: hash,
  });
}

export function getMintHistory(limit = 50): MintLogEntry[] {
  return listMintLogs(limit);
}

export function explorerLinks(address: string) {
  return {
    address: bnbExplorerAddress(address),
    token: bnbExplorerToken(address),
  };
}

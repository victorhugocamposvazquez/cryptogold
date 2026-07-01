import { formatUnits, parseUnits, isAddress, type Address } from "viem";
import { TOKEN_NAME, TOKEN_SUPPLY, TOKEN_SYMBOL } from "@/lib/brand";
import { BNB_NETWORK, bnbExplorerAddress, bnbExplorerToken, getBnbChainConfig } from "@/lib/bnb";
import {
  getContractAddress,
  getContractAddressSource,
  getDeployerAccount,
  getDeployerWalletClient,
  getOperatorAccount,
  getPublicClient,
  getTreasuryAddress,
  getWalletClient,
  isTokenDeployerConfigured,
  isTokenOperatorConfigured,
  readContractStats,
} from "./client";
import { CGOLD_ABI, CGOLD_BYTECODE } from "./abi";
import { appendMintLog, listMintLogs } from "./mint-log";
import { TOKEN_CONTRACT_TEMPLATE } from "./contract";
import { appendDeployment, getActiveDeployment, listDeployments, setActiveDeployment } from "./deployments";
import type { DeployInput, DeployRecord, MintCategory, MintLogEntry, TokenStats } from "./types";

const DECIMALS = 18;

function fmtTokens(wei: bigint): string {
  return formatUnits(wei, DECIMALS);
}

export async function getTokenStats(): Promise<TokenStats> {
  const cfg = getBnbChainConfig();
  const contractAddress = getContractAddress();
  const addressSource = getContractAddressSource();
  const operator = getOperatorAccount();
  const deployer = getDeployerAccount();
  const treasuryAddress = getTreasuryAddress();

  if (!contractAddress) {
    return {
      configured: false,
      contractAddress: null,
      addressSource: null,
      tokenName: TOKEN_NAME,
      tokenSymbol: TOKEN_SYMBOL,
      network: BNB_NETWORK,
      chainId: cfg.chainId,
      explorer: cfg.explorer,
      owner: null,
      deployerConfigured: isTokenDeployerConfigured(),
      deployerAddress: deployer?.address ?? null,
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
  if (!onChain) throw new Error("No se pudo leer el contrato on-chain");

  const totalMinted = fmtTokens(onChain.totalSupply);
  const maxSupply = fmtTokens(onChain.maxSupply);
  const remaining = fmtTokens(onChain.remainingMintable);
  const usedPct = Number(onChain.totalSupply) / Number(onChain.maxSupply) * 100;

  return {
    configured: true,
    contractAddress,
    addressSource,
    tokenName: onChain.tokenName,
    tokenSymbol: onChain.tokenSymbol,
    network: BNB_NETWORK,
    chainId: cfg.chainId,
    explorer: cfg.explorer,
    owner: onChain.owner,
    deployerConfigured: isTokenDeployerConfigured(),
    deployerAddress: deployer?.address ?? null,
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
  if (!address) throw new Error("No hay contrato activo. Despliega uno o configura NEXT_PUBLIC_CGOLD_BNB_TESTNET");

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
    throw new Error(`Supera el cupo restante (${fmtTokens(onChain.remainingMintable)} tokens)`);
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

function validateDeployInput(input: DeployInput) {
  const name = input.name?.trim();
  const symbol = input.symbol?.trim().toUpperCase();
  if (!name || name.length > 48) throw new Error("Nombre inválido (máx. 48 caracteres)");
  if (!symbol || symbol.length > 12 || !/^[A-Z0-9]+$/.test(symbol)) {
    throw new Error("Símbolo inválido (máx. 12, solo A-Z y 0-9)");
  }

  const maxNum = Number(String(input.maxSupply).replace(/,/g, ""));
  if (!Number.isFinite(maxNum) || maxNum <= 0 || maxNum > 1e15) {
    throw new Error("Cantidad máxima inválida");
  }

  let treasury: Address;
  if (input.treasury?.trim()) {
    if (!isAddress(input.treasury.trim())) throw new Error("Treasury inválida");
    treasury = input.treasury.trim() as Address;
  } else {
    const deployer = getDeployerAccount();
    if (!deployer) throw new Error("Configura TOKEN_DEPLOYER_PRIVATE_KEY o indica treasury");
    treasury = deployer.address;
  }

  const initialNum = input.initialMint ? Number(String(input.initialMint).replace(/,/g, "")) : 0;
  if (!Number.isFinite(initialNum) || initialNum < 0 || initialNum > maxNum) {
    throw new Error("Mint inicial inválido");
  }

  return { name, symbol, maxNum, treasury, initialNum };
}

export async function deployToken(input: DeployInput): Promise<DeployRecord> {
  const wallet = getDeployerWalletClient();
  const deployer = getDeployerAccount();
  if (!wallet || !deployer) {
    throw new Error("TOKEN_DEPLOYER_PRIVATE_KEY (o TOKEN_OWNER_PRIVATE_KEY) no configurada");
  }

  const { name, symbol, maxNum, treasury, initialNum } = validateDeployInput(input);
  const maxSupplyWei = parseUnits(String(maxNum), DECIMALS);
  const initialMintWei = initialNum > 0 ? parseUnits(String(initialNum), DECIMALS) : 0n;

  const hash = await wallet.deployContract({
    abi: CGOLD_ABI,
    bytecode: CGOLD_BYTECODE,
    args: [name, symbol, maxSupplyWei, treasury, initialMintWei],
  });

  const client = getPublicClient();
  const receipt = await client.waitForTransactionReceipt({ hash });
  if (!receipt.contractAddress) throw new Error("Deploy sin dirección de contrato");

  const cfg = getBnbChainConfig();

  return appendDeployment({
    network: BNB_NETWORK,
    chainId: cfg.chainId,
    address: receipt.contractAddress,
    name,
    symbol,
    maxSupply: String(maxNum),
    initialMint: String(initialNum),
    treasury,
    deployer: deployer.address,
    txHash: hash,
    contractTemplate: TOKEN_CONTRACT_TEMPLATE,
    explorer: cfg.explorer,
  });
}

export function getMintHistory(limit = 50): MintLogEntry[] {
  return listMintLogs(limit);
}

export function getDeploymentHistory(): DeployRecord[] {
  return listDeployments(BNB_NETWORK);
}

export function activateDeployment(id: string): DeployRecord | null {
  if (getContractAddressSource() === "env") {
    throw new Error("Hay dirección en variables de entorno; la registry queda en segundo plano");
  }
  return setActiveDeployment(id, BNB_NETWORK);
}

export function getActiveContractFromRegistry(): DeployRecord | null {
  return getActiveDeployment(BNB_NETWORK);
}

export function explorerLinks(address: string) {
  return {
    address: bnbExplorerAddress(address),
    token: bnbExplorerToken(address),
  };
}

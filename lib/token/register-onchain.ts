import {
  decodeFunctionData,
  isAddress,
  parseUnits,
  type Address,
  type Hash,
} from "viem";
import { getBnbChainConfig } from "@/lib/bnb";
import { getActiveNetwork } from "@/lib/network-profiles";
import { CGOLD_ABI } from "./abi";
import { appendDeployment } from "./deployments";
import { appendMintLog } from "./mint-log";
import { getPublicClient } from "./client";
import { TOKEN_CONTRACT_TEMPLATE } from "./contract";
import { validateDeployInput, parseTokenAmount } from "./validate";
import type { DeployRecord, MintCategory, MintInput, MintLogEntry } from "./types";

function assertTxSender(txFrom: string, expected: string) {
  if (txFrom.toLowerCase() !== expected.toLowerCase()) {
    throw new Error("La transacción no fue firmada por la wallet indicada");
  }
}

export async function registerDeploymentFromTx(input: {
  txHash: string;
  deployer: string;
  name: string;
  symbol: string;
  maxSupply: string;
  initialMint?: string;
  treasury?: string;
}): Promise<DeployRecord> {
  if (!isAddress(input.deployer)) throw new Error("Deployer inválido");
  if (!/^0x[a-fA-F0-9]{64}$/.test(input.txHash)) throw new Error("Hash de transacción inválido");

  const { name, symbol, maxNum, treasury, initialNum } = validateDeployInput({
    name: input.name,
    symbol: input.symbol,
    maxSupply: input.maxSupply,
    initialMint: input.initialMint,
    treasury: input.treasury,
    deployerFallback: input.deployer,
  });

  const client = getPublicClient();
  const hash = input.txHash as Hash;
  const [tx, receipt] = await Promise.all([
    client.getTransaction({ hash }),
    client.getTransactionReceipt({ hash }),
  ]);

  if (receipt.status !== "success") throw new Error("Transacción fallida on-chain");
  if (!receipt.contractAddress) throw new Error("No es un deploy de contrato");
  assertTxSender(tx.from, input.deployer);

  const address = receipt.contractAddress;
  const [onName, onSymbol, onMax, onOwner, onTotal] = await Promise.all([
    client.readContract({ address, abi: CGOLD_ABI, functionName: "name" }),
    client.readContract({ address, abi: CGOLD_ABI, functionName: "symbol" }),
    client.readContract({ address, abi: CGOLD_ABI, functionName: "maxSupply" }),
    client.readContract({ address, abi: CGOLD_ABI, functionName: "owner" }),
    client.readContract({ address, abi: CGOLD_ABI, functionName: "totalSupply" }),
  ]);

  if (onName !== name) throw new Error("Nombre on-chain no coincide");
  if (onSymbol !== symbol) throw new Error("Símbolo on-chain no coincide");
  if (onMax !== parseUnits(String(maxNum), 18)) throw new Error("Max supply on-chain no coincide");
  if ((onOwner as string).toLowerCase() !== input.deployer.toLowerCase()) {
    throw new Error("Owner on-chain no coincide con deployer");
  }

  const expectedInitial = initialNum > 0 ? parseUnits(String(initialNum), 18) : 0n;
  if (onTotal !== expectedInitial) throw new Error("Mint inicial on-chain no coincide");

  const cfg = getBnbChainConfig();

  return await appendDeployment({
    network: getActiveNetwork(),
    chainId: cfg.chainId,
    address,
    name,
    symbol,
    maxSupply: String(maxNum),
    initialMint: String(initialNum),
    treasury,
    deployer: input.deployer as Address,
    txHash: hash,
    contractTemplate: TOKEN_CONTRACT_TEMPLATE,
    explorer: cfg.explorer,
  });
}

export async function registerMintFromTx(
  input: MintInput & { txHash: string; signer: string; contractAddress: string }
): Promise<MintLogEntry> {
  if (!isAddress(input.signer)) throw new Error("Signer inválido");
  if (!isAddress(input.to)) throw new Error("Dirección destino inválida");
  if (!isAddress(input.contractAddress)) throw new Error("Contrato inválido");
  if (!/^0x[a-fA-F0-9]{64}$/.test(input.txHash)) throw new Error("Hash inválido");

  const client = getPublicClient();
  const hash = input.txHash as Hash;
  const contractAddress = input.contractAddress as Address;

  const [tx, receipt] = await Promise.all([
    client.getTransaction({ hash }),
    client.getTransactionReceipt({ hash }),
  ]);

  if (receipt.status !== "success") throw new Error("Transacción fallida on-chain");
  if ((receipt.to as string).toLowerCase() !== contractAddress.toLowerCase()) {
    throw new Error("La transacción no apunta al contrato activo");
  }
  assertTxSender(tx.from, input.signer);

  const owner = (await client.readContract({
    address: contractAddress,
    abi: CGOLD_ABI,
    functionName: "owner",
  })) as string;
  if (owner.toLowerCase() !== input.signer.toLowerCase()) {
    throw new Error("Solo el owner puede mintear");
  }

  const decoded = decodeFunctionData({ abi: CGOLD_ABI, data: tx.input });
  if (decoded.functionName !== "mint") throw new Error("La transacción no es un mint");

  const [mintTo, mintAmount] = decoded.args as [Address, bigint];
  if (mintTo.toLowerCase() !== input.to.toLowerCase()) {
    throw new Error("Destino del mint no coincide");
  }

  const expectedWei = parseTokenAmount(input.amount);
  if (mintAmount !== expectedWei) throw new Error("Cantidad del mint no coincide");

  return await appendMintLog({
    to: input.to,
    amount: input.amount.replace(/,/g, ""),
    category: input.category,
    note: input.note,
    txHash: hash,
  });
}

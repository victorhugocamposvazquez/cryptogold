"use client";

import { parseUnits, type Address, type Hash, type PublicClient, type WalletClient } from "viem";
import { CGOLD_ABI, CGOLD_BYTECODE } from "./abi";
import { validateDeployInput } from "./validate";
import type { DeployInput } from "./types";

export async function deployTokenWithWallet(
  walletClient: WalletClient,
  publicClient: PublicClient,
  input: DeployInput & { deployerAddress: Address }
) {
  if (!walletClient.account) throw new Error("Wallet sin cuenta activa");

  const { name, symbol, maxNum, treasury, initialNum } = validateDeployInput({
    ...input,
    deployerFallback: input.treasury?.trim() ? undefined : input.deployerAddress,
  });

  const maxSupplyWei = parseUnits(String(maxNum), 18);
  const initialMintWei = initialNum > 0 ? parseUnits(String(initialNum), 18) : 0n;

  const hash = await walletClient.deployContract({
    abi: CGOLD_ABI,
    bytecode: CGOLD_BYTECODE,
    args: [name, symbol, maxSupplyWei, treasury, initialMintWei],
    account: walletClient.account,
    chain: walletClient.chain,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (!receipt.contractAddress) throw new Error("Deploy sin dirección de contrato");

  return {
    hash: hash as Hash,
    contractAddress: receipt.contractAddress,
    name,
    symbol,
    maxSupply: String(maxNum),
    initialMint: String(initialNum),
    treasury,
    deployer: input.deployerAddress,
  };
}

export async function mintTokenWithWallet(
  walletClient: WalletClient,
  publicClient: PublicClient,
  contractAddress: Address,
  to: Address,
  amount: string
): Promise<Hash> {
  if (!walletClient.account) throw new Error("Wallet sin cuenta activa");

  const amountWei = parseUnits(amount.replace(/,/g, ""), 18);

  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: CGOLD_ABI,
    functionName: "mint",
    args: [to, amountWei],
    account: walletClient.account,
    chain: walletClient.chain,
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

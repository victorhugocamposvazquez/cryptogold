import { isAddress, parseUnits, type Address } from "viem";
import type { DeployInput } from "./types";

const DECIMALS = 18;

export function validateDeployInput(input: DeployInput) {
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
  } else if (input.deployerFallback?.trim()) {
    if (!isAddress(input.deployerFallback.trim())) throw new Error("Deployer inválido");
    treasury = input.deployerFallback.trim() as Address;
  } else {
    throw new Error("Indica treasury o wallet deployer");
  }

  const initialNum = input.initialMint ? Number(String(input.initialMint).replace(/,/g, "")) : 0;
  if (!Number.isFinite(initialNum) || initialNum < 0 || initialNum > maxNum) {
    throw new Error("Mint inicial inválido");
  }

  return { name, symbol, maxNum, treasury, initialNum };
}

export function parseTokenAmount(amount: string): bigint {
  const amountNum = Number(amount.replace(/,/g, ""));
  if (!Number.isFinite(amountNum) || amountNum <= 0) throw new Error("Importe inválido");
  return parseUnits(amount.replace(/,/g, ""), DECIMALS);
}

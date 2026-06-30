import type { CreateTransferInput } from "./types";

export async function submitCryptohostTransfer(input: CreateTransferInput): Promise<string> {
  const res = await fetch("/api/cryptohost/transfers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "CRYPTOHOST no disponible");
  }
  const data = await res.json();
  return data.transfer.id as string;
}

export async function fetchCryptohostStatus() {
  const res = await fetch("/api/cryptohost/status");
  if (!res.ok) return null;
  return res.json();
}

import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/cryptohost/admin-auth";
import { createTransfer, listTransfers } from "@/lib/cryptohost/service";
import type { CreateTransferInput } from "@/lib/cryptohost/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: CreateTransferInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!body.kind) {
    return NextResponse.json({ error: "kind required" }, { status: 400 });
  }

  try {
    const transfer = await createTransfer(body);
    return NextResponse.json({ ok: true, transfer });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "create failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const recent = url.searchParams.get("recent");

  if (recent) {
    const limit = Math.min(Number(recent) || 6, 20);
    const transfers = await listTransfers(limit, 0);
    return NextResponse.json({ transfers });
  }

  if (!verifyAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 100);
  const offset = Number(url.searchParams.get("offset")) || 0;
  const transfers = await listTransfers(limit, offset);
  return NextResponse.json({ transfers });
}

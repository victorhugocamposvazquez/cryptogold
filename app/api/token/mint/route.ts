import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/cryptohost/admin-auth";
import { getMintHistory, mintCgold } from "@/lib/token/service";
import type { MintCategory } from "@/lib/token/types";

export const dynamic = "force-dynamic";

const CATEGORIES: MintCategory[] = ["marketing", "liquidity", "presale", "team", "treasury", "other"];

export async function GET(req: Request) {
  if (!verifyAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json({ mints: getMintHistory(100) });
}

export async function POST(req: Request) {
  if (!verifyAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const category = body.category as MintCategory;
    if (!CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Categoría inválida" }, { status: 400 });
    }

    const entry = await mintCgold({
      to: String(body.to ?? "").trim(),
      amount: String(body.amount ?? "").trim(),
      category,
      note: body.note ? String(body.note).slice(0, 240) : undefined,
    });

    return NextResponse.json({ ok: true, mint: entry });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Mint fallido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

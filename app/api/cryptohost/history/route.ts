import { NextResponse } from "next/server";
import { listHistory } from "@/lib/cryptohost/service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit")) || 30, 100);
  const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);

  const data = await listHistory(limit, offset);
  return NextResponse.json(data);
}

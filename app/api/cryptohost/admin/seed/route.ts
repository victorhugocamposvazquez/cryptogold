import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/cryptohost/admin-auth";
import { seedHistory } from "@/lib/cryptohost/service";
import { DEFAULT_HISTORY_COUNT } from "@/lib/cryptohost/seed";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!verifyAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { count?: number; seed?: number } = {};
  try {
    body = await req.json();
  } catch {
    /* defaults ok */
  }

  const count = Math.min(Math.max(Number(body.count) || DEFAULT_HISTORY_COUNT, 100), 10_000);
  const seed = body.seed != null ? Number(body.seed) : undefined;

  try {
    const result = await seedHistory(count, seed);
    return NextResponse.json({
      ok: true,
      count: result.count,
      seed: result.seed,
      summary: result.summary,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "seed failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  if (!verifyAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { getHistoricalMeta, getHistoricalCount, summarizeHistory, getHistoricalTransfers } = await import("@/lib/cryptohost/history");
  const meta = getHistoricalMeta();
  const transfers = getHistoricalTransfers();
  return NextResponse.json({
    meta,
    count: getHistoricalCount(),
    summary: summarizeHistory(transfers),
  });
}

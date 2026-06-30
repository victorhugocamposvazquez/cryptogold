import { NextResponse } from "next/server";
import { fetchGoldSpot } from "@/lib/gold-server";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET() {
  const spot = await fetchGoldSpot();
  return NextResponse.json(spot, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}

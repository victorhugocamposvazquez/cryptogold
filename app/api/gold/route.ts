import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 60;

const FALLBACK_USD_PER_OZ = 3342.5;

type GoldPayload = {
  usdPerOz: number;
  change24h: number;
  source: string;
  updatedAt: string;
};

async function fetchSpotGold(): Promise<{ usdPerOz: number; change24h: number; source: string } | null> {
  try {
    const res = await fetch("https://api.metals.live/v1/spot/gold", {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const usdPerOz = Number(data?.price ?? data?.spot ?? data?.USD);
    if (!usdPerOz || Number.isNaN(usdPerOz)) return null;
    const change24h = Number(data?.ch ?? data?.change24h ?? 0.42);
    return { usdPerOz, change24h, source: "metals.live" };
  } catch {
    return null;
  }
}

export async function GET() {
  const live = await fetchSpotGold();
  const payload: GoldPayload = {
    usdPerOz: live?.usdPerOz ?? FALLBACK_USD_PER_OZ,
    change24h: live?.change24h ?? 0.42,
    source: live?.source ?? "reference",
    updatedAt: new Date().toISOString(),
  };
  return NextResponse.json(payload, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}

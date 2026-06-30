import { NextResponse } from "next/server";
import { fetchGoldSpot } from "@/lib/gold-server";
import { cgoldPriceFromGold, isSupabaseAdminConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET() {
  const gold = await fetchGoldSpot();
  const cgoldUsd = cgoldPriceFromGold(gold.usdPerOz);

  let persisted = false;
  if (isSupabaseAdminConfigured()) {
    try {
      const { createAdminClient } = await import("@/lib/supabase/server");
      const supabase = createAdminClient();
      await supabase.from("price_ticks").insert({
        price_usd: cgoldUsd,
        gold_usd: gold.usdPerOz,
      });
      persisted = true;
    } catch {
      /* demo mode or schema not migrated */
    }
  }

  return NextResponse.json({
    ok: true,
    cgoldUsd,
    goldUsd: gold.usdPerOz,
    source: gold.source,
    persisted,
  });
}

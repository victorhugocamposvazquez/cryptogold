import { NextResponse } from "next/server";

/**
 * Price-feed cron endpoint (Vercel Cron — see vercel.json, runs every minute).
 *
 * Inserts a new OPEN/USD tick so the chart + ticker have fresh data.
 * Dependency-free by default so the project builds out of the box.
 *
 * To wire it to Supabase:
 *   import { createAdminClient } from "@/lib/supabase/server";
 *   const supabase = createAdminClient();
 *   const price = await fetchOpenPriceFromYourFeed();
 *   await supabase.from("price_ticks").insert({ price_usd: price });
 */
export async function GET() {
  // const price = await fetchOpenPriceFromYourFeed();
  // await createAdminClient().from("price_ticks").insert({ price_usd: price });
  return NextResponse.json({ ok: true, note: "Conecta Supabase para insertar price_ticks reales." });
}

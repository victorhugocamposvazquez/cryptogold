"use client";

import { useMarket } from "@/lib/market";

/**
 * Live OPEN price + 24h change.
 *
 * DEMO: reads the simulated random-walk price from the market store.
 *
 * PRODUCTION (Supabase):
 *   const supabase = createClient();
 *   // initial: select price_usd from price_ticks order by ts desc limit 1
 *   // realtime: supabase.channel('ticks').on('postgres_changes',
 *   //   { event: 'INSERT', schema: 'public', table: 'price_ticks' }, ...).subscribe()
 */
export function useOpenPrice() {
  const { price, change } = useMarket();
  return { price, change };
}

"use client";

import { useApp } from "@/lib/store";

/**
 * The signed-in user's balances per asset.
 *
 * DEMO: reads balances from the store (seeded on wallet connect).
 *
 * PRODUCTION (Supabase, RLS-scoped to auth.uid()):
 *   const supabase = createClient();
 *   const { data } = await supabase.from('balances').select('asset, amount');
 *   // subscribe to realtime UPDATE/INSERT on `balances` for live updates.
 */
export function useBalances() {
  const { balances, connected } = useApp();
  return { balances, connected };
}

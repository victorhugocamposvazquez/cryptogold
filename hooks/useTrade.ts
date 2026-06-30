"use client";

import { useApp } from "@/lib/store";

/**
 * Execute a buy or swap.
 *
 * DEMO: the store mutates balances locally and records the transaction.
 *
 * PRODUCTION (Supabase atomic RPC — see supabase/schema.sql):
 *   const supabase = createClient();
 *   const { data, error } = await supabase.rpc('execute_trade', {
 *     p_kind: 'buy',            // 'buy' | 'swap'
 *     p_pay_asset: 'USDC',      // 'USDC' | 'ETH' | 'BTC' | 'EUR' | 'USD'
 *     p_pay_amount: 500,
 *     p_price_usd: price,       // OPEN/USD from useOpenPrice()
 *   });
 *   // execute_trade validates the balance, debits the pay asset,
 *   // credits OPEN and writes the transaction in a single DB transaction.
 *
 * Card payments: do NOT process cards yourself. Open the Transak/MoonPay
 * widget; on completion their webhook (a Supabase Edge Function / route
 * handler using the service-role key) calls execute_trade with p_kind='buy'.
 */
export function useTrade() {
  const { buy, swap } = useApp();
  return { buy, swap };
}

/** Runtime feature flags from environment variables. */

export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isSupabaseAdminConfigured(): boolean {
  return isSupabaseConfigured() && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function isPaymentWebhookConfigured(): boolean {
  return !!process.env.PAYMENT_WEBHOOK_SECRET;
}

export function cgoldPriceFromGold(usdPerOz: number): number {
  const ozPerToken = 0.001;
  return +(usdPerOz * ozPerToken).toFixed(6);
}

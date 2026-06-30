import { NextResponse } from "next/server";
import { cgoldPriceFromGold, isPaymentWebhookConfigured, isSupabaseAdminConfigured } from "@/lib/env";
import { fetchGoldSpot } from "@/lib/gold-server";

export const dynamic = "force-dynamic";

type PaymentWebhookBody = {
  provider?: "transak" | "moonpay";
  wallet?: string;
  payAsset?: string;
  payAmount?: number;
  externalId?: string;
};

/**
 * Webhook for Transak / MoonPay (or CRYPTOHOST relay).
 * Validates PAYMENT_WEBHOOK_SECRET and credits CGOLD via Supabase when configured.
 */
export async function POST(req: Request) {
  if (!isPaymentWebhookConfigured()) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }

  const secret = req.headers.get("x-webhook-secret") || req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.PAYMENT_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: PaymentWebhookBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { wallet, payAsset = "USD", payAmount = 0, externalId, provider = "transak" } = body;
  if (!wallet || payAmount <= 0) {
    return NextResponse.json({ error: "wallet and payAmount required" }, { status: 400 });
  }

  const gold = await fetchGoldSpot();
  const priceUsd = cgoldPriceFromGold(gold.usdPerOz);

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({
      ok: true,
      mode: "demo",
      message: "Webhook received. Configure Supabase to persist trades.",
      wallet,
      payAmount,
      priceUsd,
      externalId,
      provider,
    });
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("credit_fiat_purchase", {
      p_wallet: wallet,
      p_pay_asset: payAsset,
      p_pay_amount: payAmount,
      p_price_usd: priceUsd,
      p_external_id: externalId ?? null,
      p_provider: provider,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true, mode: "production", tx: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "credit failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

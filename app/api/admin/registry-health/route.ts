import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/cryptohost/admin-auth";
import { isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/env";
import { getActiveNetwork } from "@/lib/network-profiles";
import { getTokenStorageBackend } from "@/lib/token/storage";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!verifyAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
  const network = getActiveNetwork();
  const storageBackend = getTokenStorageBackend();

  const base = {
    vercel: !!process.env.VERCEL,
    network,
    storageBackend,
    supabaseConfigured: isSupabaseConfigured(),
    supabaseAdminConfigured: isSupabaseAdminConfigured(),
    supabaseHost: supabaseUrl ? new URL(supabaseUrl).hostname : null,
    deploymentsTableOk: false,
    mintsTableOk: false,
    deploymentCount: 0,
    activeAddress: null as string | null,
    mintCount: 0,
    error: null as string | null,
    hint: null as string | null,
  };

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({
      ...base,
      hint:
        "Falta SUPABASE_SERVICE_ROLE_KEY (o URL/anon). En Vercel: guarda variables → Redeploy obligatorio.",
    });
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabase = createAdminClient();

    const dep = await supabase
      .from("token_deployments")
      .select("id, address, active, network")
      .eq("network", network)
      .order("created_at", { ascending: false })
      .limit(20);

    if (dep.error) {
      const msg = dep.error.message;
      return NextResponse.json({
        ...base,
        error: msg,
        hint: msg.toLowerCase().includes("token_deployments")
          ? "Ejecuta supabase/migrations/20260701_token_registry.sql en el SQL Editor del proyecto " +
            (base.supabaseHost ?? "Supabase") +
            "."
          : "Revisa que NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY sean del mismo proyecto Supabase.",
      });
    }

    const mints = await supabase.from("token_mints").select("id", { count: "exact", head: true }).eq("network", network);

    const rows = dep.data ?? [];
    const active = rows.find((r) => r.active);

    return NextResponse.json({
      ...base,
      deploymentsTableOk: true,
      mintsTableOk: !mints.error,
      deploymentCount: rows.length,
      activeAddress: active?.address ?? null,
      mintCount: mints.count ?? 0,
      mintsError: mints.error?.message ?? null,
      hint: !active
        ? "Tablas OK pero no hay contrato activo. Usa «Fijar contrato existente»."
        : null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error conectando a Supabase";
    return NextResponse.json({
      ...base,
      error: message,
      hint: "Comprueba SUPABASE_SERVICE_ROLE_KEY y redeploy en Vercel.",
    });
  }
}

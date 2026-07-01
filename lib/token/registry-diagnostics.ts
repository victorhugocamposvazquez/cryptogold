import { isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/env";
import { getActiveNetwork, getContractAddressFromEnv } from "@/lib/network-profiles";
import { listDeployments } from "./deployments";

export type RegistryDiagnostics = {
  supabaseConfigured: boolean;
  supabaseAdminConfigured: boolean;
  storageBackend: "supabase" | "file";
  envContractPinned: boolean;
  deploymentCount: number;
  activeDeploymentId: string | null;
  registryError: string | null;
  setupHint: string | null;
};

function supabaseSetupHint(): string | null {
  if (!isSupabaseConfigured()) {
    return "Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel.";
  }
  if (!isSupabaseAdminConfigured()) {
    return "Añade SUPABASE_SERVICE_ROLE_KEY en Vercel para persistir deploys (sin esto el registro se pierde en cada redeploy).";
  }
  return null;
}

function mapRegistryError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("token_deployments") && (lower.includes("does not exist") || lower.includes("schema cache"))) {
    return "Faltan tablas en Supabase. Ejecuta el bloque token_deployments / token_mints de supabase/schema.sql en el SQL Editor.";
  }
  return message;
}

export async function getRegistryDiagnostics(): Promise<RegistryDiagnostics> {
  const setupHint = supabaseSetupHint();
  const envContractPinned = !!getContractAddressFromEnv();

  if (setupHint && !envContractPinned) {
    return {
      supabaseConfigured: isSupabaseConfigured(),
      supabaseAdminConfigured: isSupabaseAdminConfigured(),
      storageBackend: isSupabaseAdminConfigured() ? "supabase" : "file",
      envContractPinned,
      deploymentCount: 0,
      activeDeploymentId: null,
      registryError: null,
      setupHint,
    };
  }

  try {
    const network = getActiveNetwork();
    const rows = await listDeployments(network);
    const active = rows.find((d) => d.active) ?? null;
    return {
      supabaseConfigured: isSupabaseConfigured(),
      supabaseAdminConfigured: isSupabaseAdminConfigured(),
      storageBackend: isSupabaseAdminConfigured() ? "supabase" : "file",
      envContractPinned,
      deploymentCount: rows.length,
      activeDeploymentId: active?.id ?? null,
      registryError: null,
      setupHint:
        !active && !envContractPinned
          ? "No hay deploy activo en el registro. Despliega uno nuevo o usa «Fijar contrato existente» abajo."
          : setupHint,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error leyendo registro";
    return {
      supabaseConfigured: isSupabaseConfigured(),
      supabaseAdminConfigured: isSupabaseAdminConfigured(),
      storageBackend: isSupabaseAdminConfigured() ? "supabase" : "file",
      envContractPinned,
      deploymentCount: 0,
      activeDeploymentId: null,
      registryError: mapRegistryError(message),
      setupHint: setupHint ?? mapRegistryError(message),
    };
  }
}

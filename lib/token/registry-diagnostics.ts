import { isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/env";
import { getActiveNetwork, getContractAddressFromEnv } from "@/lib/network-profiles";
import { listDeployments } from "./deployments";
import { getTokenStorageBackend, type TokenStorageBackend } from "./storage";

export type RegistryDiagnostics = {
  supabaseConfigured: boolean;
  supabaseAdminConfigured: boolean;
  storageBackend: TokenStorageBackend;
  envContractPinned: boolean;
  deploymentCount: number;
  activeDeploymentId: string | null;
  registryError: string | null;
  setupHint: string | null;
};

function supabaseSetupHint(): string | null {
  const backend = getTokenStorageBackend();
  if (backend === "ephemeral") {
    if (!isSupabaseConfigured()) {
      return "En Vercel necesitas NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY. Sin Supabase, al refrescar desaparece el contrato activo.";
    }
    return "Falta SUPABASE_SERVICE_ROLE_KEY en Vercel. Sin esa clave, el contrato se guarda en memoria temporal y se pierde al actualizar la página.";
  }
  if (!isSupabaseConfigured()) {
    return "Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.";
  }
  if (!isSupabaseAdminConfigured()) {
    return "Añade SUPABASE_SERVICE_ROLE_KEY para persistir deploys y mints.";
  }
  return null;
}

function mapRegistryError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("token_deployments") && (lower.includes("does not exist") || lower.includes("schema cache"))) {
    return "Faltan tablas en Supabase. Ejecuta supabase/migrations/20260701_token_registry.sql en el SQL Editor.";
  }
  return message;
}

export async function getRegistryDiagnostics(): Promise<RegistryDiagnostics> {
  const setupHint = supabaseSetupHint();
  const envContractPinned = !!getContractAddressFromEnv();
  const storageBackend = getTokenStorageBackend();

  if (setupHint && !envContractPinned) {
    return {
      supabaseConfigured: isSupabaseConfigured(),
      supabaseAdminConfigured: isSupabaseAdminConfigured(),
      storageBackend,
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
      storageBackend,
      envContractPinned,
      deploymentCount: rows.length,
      activeDeploymentId: active?.id ?? null,
      registryError: null,
      setupHint:
        !active && !envContractPinned
          ? "No hay deploy activo en el registro. Usa «Fijar contrato existente» (se guardará en Supabase)."
          : setupHint,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error leyendo registro";
    return {
      supabaseConfigured: isSupabaseConfigured(),
      supabaseAdminConfigured: isSupabaseAdminConfigured(),
      storageBackend,
      envContractPinned,
      deploymentCount: 0,
      activeDeploymentId: null,
      registryError: mapRegistryError(message),
      setupHint: setupHint ?? mapRegistryError(message),
    };
  }
}

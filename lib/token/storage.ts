import { isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/env";

export type TokenStorageBackend = "supabase" | "local-file" | "ephemeral";

export function getTokenStorageBackend(): TokenStorageBackend {
  if (isSupabaseAdminConfigured()) return "supabase";
  if (process.env.VERCEL) return "ephemeral";
  return "local-file";
}

export function assertPersistentTokenStorage(action: string): void {
  const backend = getTokenStorageBackend();
  if (backend === "supabase") return;

  if (backend === "ephemeral") {
    if (!isSupabaseConfigured()) {
      throw new Error(
        `${action} requiere Supabase en Vercel (NEXT_PUBLIC_SUPABASE_* + SUPABASE_SERVICE_ROLE_KEY). Sin eso, al refrescar se pierde el contrato activo.`
      );
    }
    throw new Error(
      `${action} requiere SUPABASE_SERVICE_ROLE_KEY en Vercel. Sin esa clave, los datos se guardan en /tmp y desaparecen al actualizar la página.`
    );
  }
}

export function canUseEphemeralTokenStorage(): boolean {
  return getTokenStorageBackend() !== "ephemeral";
}

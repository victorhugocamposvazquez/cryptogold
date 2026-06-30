import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "@/lib/env";

/** Browser Supabase client. Throws if env vars are missing. */
export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured. Copy .env.example to .env.local");
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** Safe check for client components before calling createClient(). */
export { isSupabaseConfigured };

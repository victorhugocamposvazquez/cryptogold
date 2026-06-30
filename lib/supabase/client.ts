// @ts-nocheck
/**
 * Supabase browser client.
 *
 * 1) npm i @supabase/supabase-js @supabase/ssr
 * 2) set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 * 3) import { createClient } from "@/lib/supabase/client" in client components
 *
 * This file is scaffolding — the demo runs on the in-memory store in lib/store.tsx.
 * Once Supabase is wired, swap the store actions for the calls shown in the hooks.
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

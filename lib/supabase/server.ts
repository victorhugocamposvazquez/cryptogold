// @ts-nocheck
/**
 * Supabase server client (Server Components, Route Handlers, Server Actions).
 *
 * 1) npm i @supabase/supabase-js @supabase/ssr
 * 2) set the env vars (see .env.example)
 *
 * Use the service-role key ONLY in trusted server contexts (e.g. the on-ramp
 * webhook handler that credits OPEN after a Transak/MoonPay payment).
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // called from a Server Component — safe to ignore when using middleware refresh
          }
        },
      },
    }
  );
}

/** Admin client for webhooks / cron. Never expose to the browser. */
export function createAdminClient() {
  const { createClient: createSb } = require("@supabase/supabase-js");
  return createSb(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for Client Components (browser).
 *
 * Uses the publishable key only — it is safe to expose because every table is
 * behind RLS (see `supabase/migrations/00004_rls.sql`).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

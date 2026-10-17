import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only service-role client. It bypasses RLS, so it is used only by
 * webhook ingestion, integrations and pollers, never with user input as the
 * authority. Callers that act for a user check `requireWorkspaceAdmin` first.
 */
export function admin(): SupabaseClient {
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) is required on the server");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

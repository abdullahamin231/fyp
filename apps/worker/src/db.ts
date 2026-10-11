import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Config } from "./config.js";

/**
 * Database access for the worker.
 *
 * The worker is a backend service, not a user session: it authenticates with
 * the **service role key**, which bypasses RLS. That is deliberate and is why
 * the queue RPCs (`claim_verification_job`, `finish_verification_job`) are
 * granted to `service_role` only — no API role can drive the queue directly,
 * and every table the worker writes (`context_packets`, `verdicts`,
 * `verifier_passes`, `findings`, `audit_log`) is still append-only by trigger
 * for *everyone*, including this client.
 *
 * The service role key must never reach the browser bundle; it is read from
 * the environment here and nowhere else.
 */
export function createServiceClient(config: Config): SupabaseClient {
  return createClient(config.supabaseUrl, config.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-unify-component": "verification-worker" } },
  });
}

/**
 * Unwrap a Supabase result or throw with the operation named.
 *
 * Only `error` is authoritative. PostgREST legitimately returns `data: null`
 * for an insert or update without a `select()`, and for a void-returning RPC —
 * both of which succeeded. An earlier version also threw on null data, which
 * turned every successful `context_packets` insert and every
 * `finish_verification_job` call into a phantom failure that aborted the job
 * after the write had already committed. Callers that need rows back use
 * `.select()` / `.single()` and inspect the data themselves.
 */
export async function unwrap<T>(
  promise: PromiseLike<{ data: T | null; error: { message: string } | null }>,
  op: string,
): Promise<T | null> {
  const result = await promise;
  if (result.error) throw new Error(`${op}: ${result.error.message}`);
  return result.data;
}

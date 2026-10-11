/**
 * Two ways to call `link_pull_request_event`. The linker does not care which:
 * both send the same arguments and get the same jsonb report back.
 *
 *   viaSupabase  the real database, through supabase-js with the worker's
 *                service-role client (the function is granted to service_role
 *                only, like the queue RPCs).
 *   viaSql       any plain Postgres connection with a `query(sql, params)`
 *                method. Used by the tests and the local demo, which run the
 *                same migrations in an in-process Postgres (PGlite).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Db } from "./db.js";
import type { LinkFunction, LinkResult } from "./link-pull-request.js";

export function viaSupabase(client: SupabaseClient): LinkFunction {
  return async (args) => {
    const { data, error } = await client.rpc("link_pull_request_event", args);
    if (error) throw new Error(`link_pull_request_event: ${error.message}`);
    return data as LinkResult;
  };
}

export function viaSql(db: Db): LinkFunction {
  return async (args) => {
    const result = await db.query<{ result: LinkResult }>(
      `select public.link_pull_request_event($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb) as result`,
      [
        args.p_workspace_id, args.p_delivery_id, args.p_action, args.p_actor,
        args.p_occurred_at, args.p_raw_hash, JSON.stringify(args.p_pr), JSON.stringify(args.p_keys),
      ],
    );
    return result.rows[0]!.result;
  };
}

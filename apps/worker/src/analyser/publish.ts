/**
 * Write one analyser run into the evidence graph through the
 * `publish_analysis` database function (supabase/migrations/00016).
 *
 * Same split as linking: TypeScript prepares the nodes and edges, one database
 * call writes them in one transaction. Two callers, same arguments:
 *   viaSupabase  the hosted project, through the worker's service-role client
 *   viaSql       plain SQL (tests, local runs on PGlite)
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Db } from "../linking/db.js";
import type { AnalyserEdge, AnalyserNode } from "./payloads.js";

export interface PublishResult {
  nodesInserted: number;
  nodesUpdated: number;
  edgesInserted: number;
  edgesExisting: number;
  edgesSkipped: { from: string; to: string; type: string; reason: string }[];
}

export interface PublishArgs {
  p_workspace_id: string;
  p_nodes: AnalyserNode[];
  p_edges: AnalyserEdge[];
}

export type PublishFunction = (args: PublishArgs) => Promise<PublishResult>;

export function publishViaSupabase(client: SupabaseClient): PublishFunction {
  return async (args) => {
    const { data, error } = await client.rpc("publish_analysis", args);
    if (error) throw new Error(`publish_analysis: ${error.message}`);
    return data as PublishResult;
  };
}

export function publishViaSql(db: Db): PublishFunction {
  return async (args) => {
    const r = await db.query<{ result: PublishResult }>(
      "select public.publish_analysis($1, $2::jsonb, $3::jsonb) as result",
      [args.p_workspace_id, JSON.stringify(args.p_nodes), JSON.stringify(args.p_edges)],
    );
    return r.rows[0]!.result;
  };
}

export function publishGraph(
  call: PublishFunction,
  workspaceId: string,
  graph: { nodes: AnalyserNode[]; edges: AnalyserEdge[] },
): Promise<PublishResult> {
  return call({ p_workspace_id: workspaceId, p_nodes: graph.nodes, p_edges: graph.edges });
}

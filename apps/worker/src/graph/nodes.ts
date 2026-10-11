import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Read helpers for the evidence graph (node payloads, incident links, the
 * workspace's link policy and ingestion freshness).
 *
 * All reads are bounded and ordered — the packet must be byte-identical for
 * identical inputs, so `order by` is not optional anywhere in this file.
 */
export interface CriterionInfo {
  id: string;
  workspaceId: string;
  externalId: string;
  text: string;
  requirementRef: string | null;
  ruleApplicable: boolean;
  /** Deterministic rule governing this criterion, when it has one. */
  policyId: string | null;
}

interface NodeRow {
  id: string;
  workspace_id: string;
  type: string;
  external_id: string;
  version: string | null;
  payload: Record<string, unknown> | null;
}

export async function loadCriterion(
  client: SupabaseClient,
  criterionNodeId: string,
): Promise<CriterionInfo> {
  const { data, error } = await client
    .from("nodes")
    .select("id, workspace_id, type, external_id, version, payload")
    .eq("id", criterionNodeId)
    .maybeSingle();
  if (error) throw new Error(`loadCriterion: ${error.message}`);
  if (!data) throw new Error(`loadCriterion: node ${criterionNodeId} not found`);
  const row = data as NodeRow;
  if (row.type !== "Criterion") {
    throw new Error(`loadCriterion: node ${criterionNodeId} is a ${row.type}, not a Criterion`);
  }
  const payload = (row.payload ?? {}) as {
    text?: unknown;
    requirementRef?: unknown;
    ruleApplicable?: unknown;
    policyId?: unknown;
  };
  if (typeof payload.text !== "string" || payload.text.trim() === "") {
    throw new Error(`loadCriterion: criterion ${criterionNodeId} has no payload.text`);
  }
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    externalId: row.external_id,
    text: payload.text,
    requirementRef: typeof payload.requirementRef === "string" ? payload.requirementRef : null,
    ruleApplicable: payload.ruleApplicable !== false,
    policyId: typeof payload.policyId === "string" ? payload.policyId : null,
  };
}

/** Edges touching `nodeId`, active only, deterministically ordered. */
export async function loadIncidentEdges(
  client: SupabaseClient,
  nodeId: string,
): Promise<
  {
    id: string;
    from_id: string;
    to_id: string;
    type: string;
    source_class: string;
    confidence: number;
    resolver: string;
    link_state: string;
  }[]
> {
  const { data, error } = await client
    .from("edges")
    .select("id, from_id, to_id, type, source_class, confidence, resolver, link_state")
    .or(`from_id.eq.${nodeId},to_id.eq.${nodeId}`)
    .eq("link_state", "active")
    .order("from_id")
    .order("type")
    .order("to_id");
  if (error) throw new Error(`loadIncidentEdges: ${error.message}`);
  return (data ?? []) as {
    id: string;
    from_id: string;
    to_id: string;
    type: string;
    source_class: string;
    confidence: number;
    resolver: string;
    link_state: string;
  }[];
}

/** Nodes by id (unordered in → deterministic out by id). */
export async function loadNodes(
  client: SupabaseClient,
  ids: readonly string[],
): Promise<NodeRow[]> {
  if (ids.length === 0) return [];
  const { data, error } = await client
    .from("nodes")
    .select("id, workspace_id, type, external_id, version, payload")
    .in("id", [...ids]);
  if (error) throw new Error(`loadNodes: ${error.message}`);
  return ((data ?? []) as NodeRow[]).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/** Edges within the bounded hop window around a set of node ids. */
export async function loadEdgesWithin(
  client: SupabaseClient,
  ids: readonly string[],
): Promise<
  {
    id: string;
    from_id: string;
    to_id: string;
    type: string;
    source_class: string;
    confidence: number;
    resolver: string;
    link_state: string;
  }[]
> {
  if (ids.length === 0) return [];
  const list = ids.join(",");
  const { data, error } = await client
    .from("edges")
    .select("id, from_id, to_id, type, source_class, confidence, resolver, link_state")
    .or(`from_id.in.(${list}),to_id.in.(${list})`)
    .eq("link_state", "active")
    .order("from_id")
    .order("type")
    .order("to_id");
  if (error) throw new Error(`loadEdgesWithin: ${error.message}`);
  return (data ?? []) as {
    id: string;
    from_id: string;
    to_id: string;
    type: string;
    source_class: string;
    confidence: number;
    resolver: string;
    link_state: string;
  }[];
}

export interface LinkPolicy {
  upper: number;
  lower: number;
}

export const DEFAULT_LINK_POLICY: LinkPolicy = { upper: 0.85, lower: 0.55 };

/** FR-28 two-threshold band, read from the workspace row. */
export async function loadLinkPolicy(
  client: SupabaseClient,
  workspaceId: string,
): Promise<LinkPolicy> {
  const { data, error } = await client
    .from("workspaces")
    .select("link_policy")
    .eq("id", workspaceId)
    .maybeSingle();
  if (error) throw new Error(`loadLinkPolicy: ${error.message}`);
  const raw = (data as { link_policy?: unknown } | null)?.link_policy;
  if (raw && typeof raw === "object") {
    const obj = raw as { upper?: unknown; lower?: unknown };
    const upper = typeof obj.upper === "number" ? obj.upper : DEFAULT_LINK_POLICY.upper;
    const lower = typeof obj.lower === "number" ? obj.lower : DEFAULT_LINK_POLICY.lower;
    if (lower <= upper) return { upper, lower };
  }
  return DEFAULT_LINK_POLICY;
}

/**
 * Freshness of the sources behind this workspace (FR-10, §8.4).
 *
 * `STALE` when any ingestion checkpoint is flagged stale, `UNKNOWN` when the
 * workspace has never been checked (nobody can claim freshness that was never
 * observed), otherwise `CURRENT`.
 */
export async function loadFreshness(
  client: SupabaseClient,
  workspaceId: string,
): Promise<"STALE" | "CURRENT" | "UNKNOWN"> {
  // `checkpoints` has no `id` column (its key is workspace + tool + resource),
  // and PostgREST validates the select even with `head: true` — so count a
  // column that actually exists.
  const { count, error } = await client
    .from("checkpoints")
    .select("workspace_id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);
  if (error) throw new Error(`loadFreshness: ${error.message}`);
  if ((count ?? 0) === 0) return "UNKNOWN";

  const { count: staleCount, error: staleError } = await client
    .from("checkpoints")
    .select("workspace_id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("source_stale", true);
  if (staleError) throw new Error(`loadFreshness: ${staleError.message}`);
  return (staleCount ?? 0) > 0 ? "STALE" : "CURRENT";
}

export interface RuleInfo {
  id: string;
  version: number;
  edgeType: string;
  condition: string;
  produces: string;
  severity: string;
  active: boolean;
  trigger: unknown;
  guards: unknown;
}

/**
 * POLICY_DEFINITION evidence: the versioned deterministic rule record.
 *
 * Rules are global rows keyed by `(id, version)` — not nodes and not scoped to
 * a workspace — so the packet quotes the rule text the verdict will name.
 */
export async function loadRuleById(
  client: SupabaseClient,
  ruleId: string,
): Promise<RuleInfo | null> {
  const { data, error } = await client
    .from("rules")
    .select("id, version, edge_type, condition, produces, severity, active, trigger, guards")
    .eq("id", ruleId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`loadRuleById: ${error.message}`);
  if (!data) return null;
  const row = data as {
    id: string;
    version: number;
    edge_type: string;
    condition: string;
    produces: string;
    severity: string;
    active: boolean;
    trigger: unknown;
    guards: unknown;
  };
  return {
    id: row.id,
    version: row.version,
    edgeType: row.edge_type,
    condition: row.condition,
    produces: row.produces,
    severity: row.severity,
    active: row.active,
    trigger: row.trigger,
    guards: row.guards,
  };
}

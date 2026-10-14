import { NODE_TYPE_META, eligibilityFor, type NodeType } from "@unify/contracts";
import { createClient } from "@/lib/supabase/server";
import type { Finding, RelationLink, ToolKind } from "@/lib/types";
import type { LinkSuggestion } from "@/lib/domain/link-suggestions";
import { findingView } from "./map";
import type {
  DbFindingState,
  DbFindingOrigin,
  DbSeverity,
  EdgeRow,
  FindingRow,
  NodeRow,
  PacketRow,
  PassRow,
  VerdictRow,
} from "./rows";

/**
 * Reviewer-surface queries.
 *
 * Every read goes through the RLS client — the signed-in user's own session,
 * never a service key. That is the security model in one line: a reviewer sees
 * exactly the workspaces they belong to, enforced in Postgres rather than in
 * this file. If a query returns nothing here, the usual cause is "not a
 * member", not "wrong endpoint".
 */

const FINDING_COLUMNS =
  "id, subject_node_id, origin, rule_id, rule_version, verdict_id, kind, idempotency_key, annotation, severity, state, created_at, superseded_by_id";

const VERDICT_COLUMNS =
  "id, packet_id, job_id, status, evidence, reason, missing_evidence, divergence_tag, freshness_state, review_required, reason_code, pass_count, stop_reason, gate_outcome, model_and_run";

const PACKET_COLUMNS =
  "id, criterion_node_id, base_commit, head_commit, token_budget, manifest, prompt_hash, packet_hash";

const NODE_COLUMNS = "id, workspace_id, type, external_id, payload, status, last_modified";

async function loadVerdictContext(
  verdictIds: string[],
): Promise<{
  verdicts: Map<string, VerdictRow>;
  packets: Map<string, PacketRow>;
}> {
  const verdicts = new Map<string, VerdictRow>();
  const packets = new Map<string, PacketRow>();
  if (verdictIds.length === 0) return { verdicts, packets };
  const client = await createClient();

  const verdictRes = await client.from("verdicts").select(VERDICT_COLUMNS).in("id", verdictIds);
  if (verdictRes.error) throw new Error(`verdicts: ${verdictRes.error.message}`);
  for (const row of (verdictRes.data ?? []) as VerdictRow[]) verdicts.set(row.id, row);

  const packetIds = [...new Set([...verdicts.values()].map((v) => v.packet_id))];
  if (packetIds.length > 0) {
    const packetRes = await client
      .from("context_packets")
      .select(PACKET_COLUMNS)
      .in("id", packetIds);
    if (packetRes.error) throw new Error(`context_packets: ${packetRes.error.message}`);
    for (const row of (packetRes.data ?? []) as PacketRow[]) packets.set(row.id, row);
  }
  return { verdicts, packets };
}

async function loadNodes(ids: string[]): Promise<Map<string, NodeRow>> {
  const out = new Map<string, NodeRow>();
  const unique = [...new Set(ids)];
  if (unique.length === 0) return out;
  const client = await createClient();
  const res = await client.from("nodes").select(NODE_COLUMNS).in("id", unique);
  if (res.error) throw new Error(`nodes: ${res.error.message}`);
  for (const row of (res.data ?? []) as NodeRow[]) out.set(row.id, row);
  return out;
}

/**
 * For rule findings: each subject node plus the nodes joined to it by an
 * active TRACKS edge (a ticket and the pull requests that name it, or the
 * reverse), so the row can show the artefacts in both tools.
 */
async function loadLinked(subjectIds: string[]): Promise<Map<string, NodeRow[]>> {
  const out = new Map<string, NodeRow[]>();
  const unique = [...new Set(subjectIds)];
  if (unique.length === 0) return out;
  const client = await createClient();
  const list = `(${unique.join(",")})`;
  const res = await client
    .from("edges")
    .select("from_id, to_id")
    .eq("type", "TRACKS")
    .eq("link_state", "active")
    .or(`from_id.in.${list},to_id.in.${list}`);
  if (res.error) throw new Error(`edges (linked): ${res.error.message}`);
  const edges = (res.data ?? []) as { from_id: string; to_id: string }[];
  const nodes = await loadNodes([...unique, ...edges.flatMap((e) => [e.from_id, e.to_id])]);
  for (const id of unique) {
    const others = edges.flatMap((e) => (e.from_id === id ? [e.to_id] : e.to_id === id ? [e.from_id] : []));
    out.set(id, [id, ...new Set(others)].flatMap((n) => (nodes.has(n) ? [nodes.get(n)!] : [])));
  }
  return out;
}

/** The reviewer's queue: every finding their workspaces can see, newest first. */
export async function listFindings(limit = 50): Promise<Finding[]> {
  const client = await createClient();
  const res = await client
    .from("findings")
    .select(FINDING_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (res.error) throw new Error(`findings: ${res.error.message}`);
  const rows = (res.data ?? []) as FindingRow[];

  const { verdicts, packets } = await loadVerdictContext(
    rows.map((row) => row.verdict_id).filter((id): id is string => id !== null),
  );
  const nodes = await loadNodes(rows.map((row) => row.subject_node_id));
  const linked = await loadLinked(rows.filter((row) => row.origin === "rule").map((row) => row.subject_node_id));

  return rows.map((row) =>
    findingView(row, {
      linked: linked.get(row.subject_node_id),
      verdict: row.verdict_id ? (verdicts.get(row.verdict_id) ?? null) : null,
      packet: row.verdict_id ? (packets.get(verdicts.get(row.verdict_id)?.packet_id ?? "") ?? null) : null,
      criterion: nodes.get(row.subject_node_id) ?? null,
    }),
  );
}

export interface FindingDetail {
  finding: Finding;
  /** The bounded loop's actual pass log, in pass order. */
  passes: PassRow[];
}

/** One finding plus its evidence case and pass log. `null` when unseen. */
export async function getFindingDetail(id: string): Promise<FindingDetail | null> {
  const client = await createClient();
  const res = await client.from("findings").select(FINDING_COLUMNS).eq("id", id).maybeSingle();
  if (res.error) throw new Error(`findings: ${res.error.message}`);
  const row = res.data as FindingRow | null;
  if (!row) return null;

  const { verdicts, packets } = await loadVerdictContext(
    row.verdict_id ? [row.verdict_id] : [],
  );
  const verdict = row.verdict_id ? (verdicts.get(row.verdict_id) ?? null) : null;
  const packet = verdict ? (packets.get(verdict.packet_id) ?? null) : null;
  const nodes = await loadNodes([row.subject_node_id]);
  const linked = row.origin === "rule" ? await loadLinked([row.subject_node_id]) : new Map<string, NodeRow[]>();

  let passes: PassRow[] = [];
  if (verdict?.job_id) {
    const passRes = await client
      .from("verifier_passes")
      .select(
        "id, job_id, pass_no, prompt_hash, parsed_ok, stop_reason, duration_ms, model_and_run",
      )
      .eq("job_id", verdict.job_id)
      .order("pass_no", { ascending: true });
    if (passRes.error) throw new Error(`verifier_passes: ${passRes.error.message}`);
    passes = (passRes.data ?? []) as PassRow[];
  }

  return {
    finding: findingView(row, {
      linked: linked.get(row.subject_node_id),
      verdict,
      packet,
      criterion: nodes.get(row.subject_node_id) ?? null,
    }),
    passes,
  };
}

/* ------------------------------------------------------------------- links */

const EDGE_COLUMNS =
  "id, from_id, to_id, type, source_class, confidence, resolver, link_state, created_at, resolved_at, resolution_reason";

/** Which tool a node type belongs to — the endpoint icon in the relationship view. */
function toolForNodeType(type: string): ToolKind {
  return NODE_TYPE_META[type as NodeType]?.tool ?? "git";
}

function endpointRef(node: NodeRow | undefined, fallbackId: string): {
  tool: ToolKind;
  ref: string;
  label: string;
} {
  if (!node) return { tool: "git", ref: fallbackId.slice(0, 8), label: "unknown artifact" };
  return {
    tool: toolForNodeType(node.type),
    ref: node.external_id,
    label: node.payload?.title ?? node.payload?.text ?? node.type,
  };
}

/**
 * Where a link's eligibility comes from — `eligibilityFor` in `@unify/contracts`
 * is the single source of truth, shared with the gate so the reviewer surface
 * and the verdict gate can never disagree about the same edge.
 */

function provenanceFor(edge: EdgeRow): RelationLink["provenance"] {
  if (edge.resolver.startsWith("user:")) return "manual";
  if (edge.resolver.startsWith("reconcile:")) return "reconciled";
  return edge.source_class === "observed" ? "explicit" : "inferred";
}

const KNOWN_RELATIONS = [
  "SATISFIES",
  "REFERENCES",
  "IMPLEMENTS",
  "VERIFIES",
  "BLOCKS",
] as const;

/**
 * Every active edge in the caller's workspaces, split the way the relationship
 * view shows them: confirmed/system-confirmed links in the directory, and
 * inferred or candidate links in the verification queue.
 */
export async function listLinks(): Promise<{
  links: RelationLink[];
  suggestions: LinkSuggestion[];
}> {
  const client = await createClient();
  const res = await client
    .from("edges")
    .select(EDGE_COLUMNS)
    .eq("link_state", "active")
    .order("created_at", { ascending: false })
    .limit(200);
  if (res.error) throw new Error(`edges: ${res.error.message}`);
  const rows = (res.data ?? []) as EdgeRow[];

  const nodes = await loadNodes(rows.flatMap((row) => [row.from_id, row.to_id]));

  const links: RelationLink[] = [];
  const suggestions: LinkSuggestion[] = [];

  for (const edge of rows) {
    const eligibility = eligibilityFor({ sourceClass: edge.source_class, resolver: edge.resolver });
    const relation = (KNOWN_RELATIONS as readonly string[]).includes(edge.type)
      ? (edge.type as RelationLink["relation"])
      : "REFERENCES";
    const base = {
      id: edge.id,
      source: endpointRef(nodes.get(edge.from_id), edge.from_id),
      target: endpointRef(nodes.get(edge.to_id), edge.to_id),
      relation,
      eligibility,
      confidence: edge.confidence,
      provenance: provenanceFor(edge),
      changedAt: edge.created_at,
    };

    if (eligibility === "unconfirmed" || eligibility === "inferred") {
      suggestions.push({
        ...base,
        detector: edge.resolver,
        evidence: `${edge.resolver} · confidence ${edge.confidence.toFixed(2)}`,
      });
    } else {
      links.push({
        ...base,
        ...(edge.resolved_at ? { confirmedBy: edge.resolver } : {}),
      });
    }
  }

  return { links, suggestions };
}

export type { DbFindingOrigin, DbFindingState, DbSeverity };

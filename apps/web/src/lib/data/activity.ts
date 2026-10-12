import { createClient } from "@/lib/supabase/server";
import type { ActivityEvent, ToolKind } from "@/lib/types";

/**
 * Activity feed, built from what the evidence graph already records: nodes
 * ingested, links established, and findings raised. Each event carries the
 * timestamp it was recorded at, never a made-up one. Runs as the signed-in
 * reviewer, so RLS limits it to their workspaces.
 */

const TOOL_BY_TYPE: Record<string, ToolKind> = {
  Requirement: "jira",
  Ticket: "jira",
  Criterion: "git",
  DesignArtifact: "figma",
  DesignConstraint: "figma",
  PullRequest: "github",
  Commit: "github",
  CodeSymbol: "github",
  TestCase: "test",
};

const LABEL_BY_TYPE: Record<string, string> = {
  Requirement: "Requirement",
  Ticket: "Jira ticket",
  Criterion: "Criterion",
  DesignArtifact: "Figma frame",
  DesignConstraint: "Design constraint",
  PullRequest: "Pull request",
  Commit: "Commit",
  CodeSymbol: "Code symbol",
  TestCase: "Test case",
};

interface NodeLite {
  id: string;
  type: string;
  external_id: string;
  last_modified: string;
}

interface EdgeLite {
  id: string;
  from_id: string;
  to_id: string;
  type: string;
  resolver: string;
  link_state: string;
  created_at: string;
}

interface FindingLite {
  id: string;
  subject_node_id: string;
  annotation: string;
  created_at: string;
}

export async function listActivity(limit = 40): Promise<ActivityEvent[]> {
  const client = await createClient();

  const [nodeRes, edgeRes, findingRes] = await Promise.all([
    client
      .from("nodes")
      .select("id, type, external_id, last_modified")
      .order("last_modified", { ascending: false })
      .limit(limit),
    client
      .from("edges")
      .select("id, from_id, to_id, type, resolver, link_state, created_at")
      .eq("link_state", "active")
      .order("created_at", { ascending: false })
      .limit(limit),
    client
      .from("findings")
      .select("id, subject_node_id, annotation, created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);
  if (nodeRes.error) throw new Error(`nodes: ${nodeRes.error.message}`);
  if (edgeRes.error) throw new Error(`edges: ${edgeRes.error.message}`);
  if (findingRes.error) throw new Error(`findings: ${findingRes.error.message}`);

  const nodes = (nodeRes.data ?? []) as NodeLite[];
  const edges = (edgeRes.data ?? []) as EdgeLite[];
  const findings = (findingRes.data ?? []) as FindingLite[];

  const referenced = [
    ...new Set([
      ...edges.flatMap((edge) => [edge.from_id, edge.to_id]),
      ...findings.map((finding) => finding.subject_node_id),
    ]),
  ];
  const lookup = new Map<string, NodeLite>(nodes.map((node) => [node.id, node]));
  const missing = referenced.filter((id) => !lookup.has(id));
  if (missing.length > 0) {
    const extra = await client.from("nodes").select("id, type, external_id, last_modified").in("id", missing);
    if (extra.error) throw new Error(`nodes: ${extra.error.message}`);
    for (const node of (extra.data ?? []) as NodeLite[]) lookup.set(node.id, node);
  }
  const nameOf = (id: string) => lookup.get(id)?.external_id ?? id;
  const toolOf = (id: string): ToolKind => TOOL_BY_TYPE[lookup.get(id)?.type ?? ""] ?? "git";

  const events: ActivityEvent[] = [
    ...nodes.map((node) => ({
      id: `ingested-${node.id}`,
      kind: "ingested" as const,
      tool: TOOL_BY_TYPE[node.type] ?? "git",
      title: `${LABEL_BY_TYPE[node.type] ?? node.type} ingested`,
      detail: node.external_id,
      actor: "system",
      timestamp: node.last_modified,
      target: node.external_id,
    })),
    ...edges.map((edge) => ({
      id: `linked-${edge.id}`,
      kind: "linked" as const,
      tool: toolOf(edge.from_id),
      title: `${nameOf(edge.from_id)} → ${nameOf(edge.to_id)}`,
      detail: `${edge.type} · ${edge.resolver}`,
      actor: edge.resolver.startsWith("user:") ? "reviewer" : "system",
      timestamp: edge.created_at,
      target: nameOf(edge.to_id),
    })),
    ...findings.map((finding) => ({
      id: `finding-${finding.id}`,
      kind: "finding" as const,
      tool: toolOf(finding.subject_node_id),
      title: `Finding raised on ${nameOf(finding.subject_node_id)}`,
      detail: finding.annotation,
      actor: "system",
      timestamp: finding.created_at,
      target: nameOf(finding.subject_node_id),
      findingId: finding.id,
    })),
  ];

  return events
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);
}

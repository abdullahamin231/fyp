import { eligibilityFor } from "@unify/contracts";
import { createClient } from "@/lib/supabase/server";
import {
  isDecisive,
  type ExplorerEdge,
  type ExplorerGraph,
  type ExplorerNode,
  type EdgeRelation,
} from "@/lib/domain/graph";
import type { GraphNodeKind, ToolKind } from "@/lib/types";
import type { EdgeRow, NodeRow } from "./rows";

/**
 * Graph explorer data: the evidence graph of the demo workspaces, shaped for
 * `/graph` and `/graph/artifacts`.
 *
 * Reads through the signed-in user's session (RLS), like every other query in
 * this folder. Each workspace the user belongs to is one horizontal lane; kinds
 * are columns within it, so nodes never stack on top of each other. Labels
 * carry the workspace name, because external ids (such as a commit hash) repeat
 * across workspaces.
 */

const NODE_COLUMNS = "id, workspace_id, type, external_id, payload, last_modified";
const EDGE_COLUMNS =
  "id, from_id, to_id, type, source_class, confidence, resolver, link_state, created_at, resolved_at, resolution_reason";

const KIND_BY_TYPE: Partial<Record<string, GraphNodeKind>> = {
  Requirement: "requirement",
  Ticket: "requirement",
  Criterion: "requirement",
  DesignArtifact: "design",
  DesignConstraint: "design",
  PullRequest: "pr",
  Commit: "pr",
  CodeSymbol: "code",
  TestCase: "test",
};

const LABEL_BY_TYPE: Record<string, string> = {
  Requirement: "Requirement",
  Ticket: "Jira Ticket",
  Criterion: "Criterion",
  DesignArtifact: "Figma Frame",
  DesignConstraint: "Design Constraint",
  PullRequest: "Pull Request",
  Commit: "Commit",
  CodeSymbol: "Code Symbol",
  TestCase: "Test Case",
};

const TOOL_BY_KIND: Record<GraphNodeKind, ToolKind> = {
  requirement: "jira",
  design: "figma",
  pr: "github",
  code: "github",
  test: "git",
  finding: "git",
};

/** Column centres as fractions of the stage width, left to right. */
const COLUMN_X: Record<GraphNodeKind, number> = {
  requirement: 0.1,
  design: 0.3,
  pr: 0.5,
  code: 0.7,
  test: 0.9,
  finding: 0.5,
};

const RELATION_BY_TYPE: Partial<Record<string, EdgeRelation>> = {
  SATISFIES: "SATISFIES",
  SATISFIES_CANDIDATE: "SATISFIES",
  IMPLEMENTS: "IMPLEMENTS",
  COVERS: "VERIFIES",
  BLOCKS: "BLOCKS",
};

/** Finding states that still need a human (anything else is closed). */
const OPEN_FINDING_STATES = new Set(["open", "acknowledged", "disputed"]);

interface FindingRef {
  id: string;
  subject_node_id: string;
  state: string;
  annotation: string;
}

function provenanceFor(edge: EdgeRow): ExplorerEdge["provenance"] {
  if (edge.resolver.startsWith("user:")) return "manual";
  if (edge.resolver.startsWith("reconcile:")) return "reconciled";
  return edge.source_class === "observed" ? "explicit" : "inferred";
}

function describe(node: NodeRow): string {
  const payload = node.payload ?? {};
  return payload.text ?? payload.title ?? "";
}

export async function loadExplorerGraph(stage: {
  width: number;
  height: number;
  /** Largest vertical gap between stacked nodes in one cell (px). */
  maxGap?: number;
}): Promise<ExplorerGraph> {
  const client = await createClient();

  // Every workspace the signed-in user can see — RLS already scopes this to
  // their memberships, so there is nothing to filter here. (An earlier revision
  // hard-coded `slug like 'demo-%'`, which silently emptied the explorer for any
  // real workspace.)
  const workspaces = await client.from("workspaces").select("id, slug");
  if (workspaces.error) throw new Error(`workspaces: ${workspaces.error.message}`);
  const lanes = ((workspaces.data ?? []) as { id: string; slug: string }[]).sort((a, b) =>
    a.slug.localeCompare(b.slug),
  );
  if (lanes.length === 0) return { nodes: [], edges: [] };
  const workspaceIds = lanes.map((lane) => lane.id);

  const nodeRes = await client
    .from("nodes")
    .select(NODE_COLUMNS)
    .in("workspace_id", workspaceIds)
    .limit(1000);
  if (nodeRes.error) throw new Error(`nodes: ${nodeRes.error.message}`);
  const rows = ((nodeRes.data ?? []) as NodeRow[]).filter((row) => KIND_BY_TYPE[row.type]);
  const nodeIds = rows.map((row) => row.id);
  if (nodeIds.length === 0) return { nodes: [], edges: [] };

  const edgeRes = await client
    .from("edges")
    .select(EDGE_COLUMNS)
    .eq("link_state", "active")
    .in("from_id", nodeIds)
    .in("to_id", nodeIds)
    .limit(2000);
  if (edgeRes.error) throw new Error(`edges: ${edgeRes.error.message}`);
  const edgeRows = (edgeRes.data ?? []) as EdgeRow[];

  const findingRes = await client
    .from("findings")
    .select("id, subject_node_id, state, annotation")
    .in("subject_node_id", nodeIds)
    .limit(1000);
  if (findingRes.error) throw new Error(`findings: ${findingRes.error.message}`);
  const openFindings = new Map<string, FindingRef>();
  for (const finding of (findingRes.data ?? []) as FindingRef[]) {
    if (OPEN_FINDING_STATES.has(finding.state) && !openFindings.has(finding.subject_node_id)) {
      openFindings.set(finding.subject_node_id, finding);
    }
  }

  // Group by lane (workspace), then by kind, keeping the order rows arrived in.
  const laneOf = new Map(lanes.map((lane, index) => [lane.id, index]));
  const cells = new Map<string, NodeRow[]>();
  for (const row of rows) {
    const key = `${row.workspace_id}|${KIND_BY_TYPE[row.type]}`;
    cells.set(key, [...(cells.get(key) ?? []), row]);
  }
  const maxPerCell = Math.max(1, ...[...cells.values()].map((group) => group.length));
  const laneHeight = stage.height / lanes.length;
  const gap = Math.min(stage.maxGap ?? 40, (laneHeight * 0.85) / maxPerCell);

  const nodes: ExplorerNode[] = [];
  for (const [key, group] of cells) {
    const [workspaceId, kindName] = key.split("|");
    const kind = kindName as GraphNodeKind;
    const laneIndex = laneOf.get(workspaceId) ?? 0;
    const lane = lanes[laneIndex];
    const laneCentre = (laneIndex + 0.5) * laneHeight;
    group.forEach((row, index) => {
      const finding = openFindings.get(row.id);
      const caseName = lane.slug.toUpperCase();
      const kindLabel = LABEL_BY_TYPE[row.type] ?? row.type;
      const offset = (index - (group.length - 1) / 2) * gap;
      nodes.push({
        id: row.id,
        label: `${caseName} · ${row.external_id}`,
        kind,
        tool: TOOL_BY_KIND[kind],
        x: Math.round(stage.width * COLUMN_X[kind]),
        y: Math.round(laneCentre + offset),
        kindLabel,
        subtitle: caseName,
        meta: finding ? "CONFLICT" : kindLabel,
        metaTone: finding ? "error" : undefined,
        description: describe(row),
        locator: `${caseName} ${row.type}:${row.external_id}`,
        fields: [
          { label: "Case", value: caseName },
          ...(finding ? [{ label: "Finding", value: finding.annotation, tone: "error" as const }] : []),
        ],
        action: "View",
        ...(finding ? { findingId: finding.id, conflict: true } : {}),
      });
    });
  }

  const placed = new Set(nodes.map((node) => node.id));
  const edges: ExplorerEdge[] = edgeRows
    .filter((edge) => placed.has(edge.from_id) && placed.has(edge.to_id))
    .map((edge) => {
      const eligibility = eligibilityFor({ sourceClass: edge.source_class, resolver: edge.resolver });
      return {
        from: edge.from_id,
        to: edge.to_id,
        eligible: isDecisive(eligibility),
        label: RELATION_BY_TYPE[edge.type] ?? "REFERENCES",
        eligibility,
        confidence: edge.confidence,
        provenance: provenanceFor(edge),
        ...(edge.resolver.startsWith("user:") ? { confirmedBy: edge.resolver } : {}),
      };
    });

  return { nodes, edges };
}

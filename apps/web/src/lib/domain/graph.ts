import { isDecisiveEligibility } from "@unify/contracts";
import type {
  GraphEdge,
  GraphModel,
  GraphNode,
  LinkEligibility,
  ToolKind,
} from "@/lib/types";

/**
 * Richer graph models for the two explorer screens (`/graph` and
 * `/graph/artifacts`).
 *
 * The shapes extend `GraphModel` / `GraphNode` / `GraphEdge` from
 * `@/lib/types` — they are a superset, never a fork, so the screens keep
 * working when the graph API is wired in.
 *
 * Positions are **centres** in stage pixels: both explorers position cards
 * with `translate(-50%, -50%)` and draw edges centre → centre, so opaque
 * cards always cover the line ends.
 */

/** Accent tone for node chrome — always one of the design-token colours. */
export type NodeTone = "primary" | "secondary" | "tertiary" | "error" | "outline";

/** Relation vocabulary (`RelationLink["relation"]`) plus finding triggers. */
export type EdgeRelation =
  | "SATISFIES"
  | "REFERENCES"
  | "IMPLEMENTS"
  | "VERIFIES"
  | "BLOCKS"
  | "TRIGGERS";

export interface NodeField {
  label: string;
  value: string;
  tone?: NodeTone;
}

/** A graph node plus everything the detail / inspector panels render. */
export interface ExplorerNode extends GraphNode {
  /** Type caption, e.g. `Figma Frame`. */
  kindLabel: string;
  /** Sub-title under the node name in detail panels. */
  subtitle: string;
  /** Small right-hand caption drawn on the canvas card. */
  meta: string;
  metaTone?: NodeTone;
  /** Detail panel body. */
  description: string;
  /** Machine locator, e.g. `figma::node::204:8891`. */
  locator: string;
  /** Provenance / metadata rows. */
  fields: NodeField[];
  /** Primary footer action label, e.g. `Open in Figma`. */
  action: string;
  /** Active divergence carried by (or directly attached to) this node. */
  findingId?: string;
  /** Pulsing conflict treatment on the canvas. */
  conflict?: boolean;
}

/**
 * An edge with the eligibility distinction the product is built on:
 * only `confirmed` / `system-confirmed` links may support a decisive finding —
 * `inferred` / `unconfirmed` links are displayed but never decide.
 */
export interface ExplorerEdge extends Omit<GraphEdge, "label"> {
  label: EdgeRelation;
  eligibility: LinkEligibility;
  confidence: number;
  provenance: "explicit" | "inferred" | "manual" | "reconciled";
  confirmedBy?: string;
}

export interface ExplorerGraph extends GraphModel {
  nodes: ExplorerNode[];
  edges: ExplorerEdge[];
}

/** Is a classified eligibility decisive? Delegates to the contracts boundary. */
export const isDecisive = isDecisiveEligibility;

export interface GraphStats {
  nodes: number;
  edges: number;
  orphans: number;
  findings: number;
  decisive: number;
}

export function graphStats(graph: ExplorerGraph): GraphStats {
  const linked = new Set<string>();
  for (const edge of graph.edges) {
    linked.add(edge.from);
    linked.add(edge.to);
  }
  return {
    nodes: graph.nodes.length,
    edges: graph.edges.length,
    orphans: graph.nodes.filter((node) => !linked.has(node.id)).length,
    findings: graph.nodes.filter((node) => node.kind === "finding").length,
    decisive: graph.edges.filter((edge) => isDecisive(edge.eligibility)).length,
  };
}

/** Empty graph handed to the explorers until the graph API returns a payload. */
export const emptyExplorerGraph: ExplorerGraph = { nodes: [], edges: [] };

/** A pending Slack-surfaced link proposal awaiting human confirmation. */
export interface LinkProposal {
  id: string;
  from: string;
  offsetX: number;
  offsetY: number;
  channel: string;
  quote: string;
  confidence: number;
  relation: EdgeRelation;
  tool: ToolKind;
}

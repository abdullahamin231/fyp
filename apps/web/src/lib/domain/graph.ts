import { isDecisiveEligibility } from "@unify/contracts";
import type {
  GraphEdge,
  GraphModel,
  GraphNode,
  LinkEligibility,
} from "@/lib/types";

/**
 * Richer graph models for the two explorer screens (`/graph` and
 * `/graph/artifacts`).
 *
 * The shapes extend `GraphModel` / `GraphNode` / `GraphEdge` from
 * `@/lib/types` — they are a superset, never a fork, so the screens keep
 * working when the graph API is wired in.
 *
 * Positions are **centres** in canvas pixels. The loader leaves them at the
 * origin; the explorers compute them client-side (`components/graph/layout.ts`)
 * because the layout depends on the active filters and layout mode.
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

/** Why a node is in a drift blast radius: the open finding and the node carrying it. */
export interface DriftCause {
  findingId: string;
  sourceId: string;
  sourceLabel: string;
}

/**
 * Every node that carries an open finding, plus every node one link away
 * from one. A node near several findings keeps the first one found; a node
 * carrying its own finding always reports that one.
 */
export function driftBlastRadius(graph: ExplorerGraph): Map<string, DriftCause> {
  const radius = new Map<string, DriftCause>();
  const sources = graph.nodes.filter((node) => node.findingId);
  for (const node of sources) {
    radius.set(node.id, { findingId: node.findingId!, sourceId: node.id, sourceLabel: node.label });
  }
  for (const node of sources) {
    const cause = radius.get(node.id)!;
    for (const edge of graph.edges) {
      const other = edge.from === node.id ? edge.to : edge.to === node.id ? edge.from : null;
      if (other && !radius.has(other)) radius.set(other, cause);
    }
  }
  return radius;
}

import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { RelationshipExplorer } from "@/components/graph/relationship-explorer";
import { emptyExplorerGraph, graphStats } from "@/lib/domain/graph";

export const metadata: Metadata = {
  title: "Graph Explorer",
  description:
    "Relationship graph across Jira, GitHub, Figma and tests — decisive links solid, inferred and unconfirmed links dashed.",
};

/**
 * DATA HOLE — replace with the graph API.
 * Empty until the endpoint exists; the canvas renders no nodes and the stat
 * chips read zero.
 */
const relationshipGraph = emptyExplorerGraph;

const stats = graphStats(relationshipGraph);

export default function GraphExplorerPage() {
  return (
    <AppShell
      action={
        <button className="bg-primary text-on-primary px-4 py-1.5 rounded-lg font-bold text-body-sm hover:opacity-90 active:scale-95 transition-all">
          Export Graph
        </button>
      }
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            Relationship Graph Explorer
          </h2>
          <p className="text-body-md text-on-surface-variant mt-1 max-w-3xl">
            Requirement, design, code, test and finding artefacts wired by their links — solid
            strokes are decisive, dashed and dotted strokes are shown but can never decide a
            finding.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-1 rounded bg-surface-container-high border border-outline-variant text-micro-label font-mono-code">
            {stats.nodes} Nodes
          </span>
          <span className="px-2 py-1 rounded bg-surface-container-high border border-outline-variant text-micro-label font-mono-code">
            {stats.edges} Edges
          </span>
        </div>
      </div>

      <RelationshipExplorer graph={relationshipGraph} />
    </AppShell>
  );
}

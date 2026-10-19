import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { RelationshipExplorer } from "@/components/graph/relationship-explorer";
import { graphStats } from "@/lib/domain/graph";
import { loadExplorerGraph } from "@/lib/data/graph";

export const metadata: Metadata = {
  title: "Graph Explorer",
  description:
    "Relationship graph across Jira, GitHub, Figma and tests — decisive links solid, inferred and unconfirmed links dashed.",
};

export default async function GraphExplorerPage() {
  const relationshipGraph = await loadExplorerGraph();
  const stats = graphStats(relationshipGraph);

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            Relationship Graph Explorer
          </h2>
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

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { GraphCanvas } from "./graph-canvas";
import { layeredLayout } from "./layout";
import type { ExplorerGraph } from "@/lib/domain/graph";

/**
 * Dashboard panel: the whole evidence graph on the same pan-and-zoom canvas as
 * `/graph`. Clicking a node opens it in the full explorer.
 */
export function EvidencePreview({ graph }: { graph: ExplorerGraph }) {
  const router = useRouter();
  const positions = useMemo(() => layeredLayout(graph.nodes, graph.edges), [graph]);
  return (
    <GraphCanvas
      nodes={graph.nodes}
      edges={graph.edges}
      positions={positions}
      selectedId={null}
      onSelect={(id) => {
        if (id) router.push("/graph");
      }}
      minimap={false}
      controlsPosition="bottom-right"
    />
  );
}

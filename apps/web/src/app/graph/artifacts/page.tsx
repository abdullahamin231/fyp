import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { ArtifactGraphExplorer } from "@/components/graph/artifact-explorer";
import { loadExplorerGraph } from "@/lib/data/graph";

export const metadata: Metadata = {
  title: "Artifact Graph",
  description:
    "Three-pane artefact explorer: filters and provenance, topology canvas, node inspector with blast radius.",
};

export default async function ArtifactGraphPage() {
  const artifactGraph = await loadExplorerGraph();

  return (
    <AppShell>
      <ArtifactGraphExplorer graph={artifactGraph} />
    </AppShell>
  );
}

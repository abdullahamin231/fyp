import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { ArtifactGraphExplorer } from "@/components/graph/artifact-explorer";
import type { LinkProposal } from "@/lib/domain/graph";
import { loadExplorerGraph } from "@/lib/data/graph";

/**
 * DATA HOLE — drift blast radius and Slack link proposals are not wired yet,
 * so they stay empty. The graph itself comes from the evidence graph.
 */
const driftAffected: string[] = [];
const slackProposal: LinkProposal | null = null;

export const metadata: Metadata = {
  title: "Artifact Graph",
  description:
    "Three-pane artefact explorer: filters and provenance, topology canvas, node inspector with blast radius.",
};

export default async function ArtifactGraphPage() {
  const artifactGraph = await loadExplorerGraph({ width: 1100, height: 900, maxGap: 64 });

  return (
    <AppShell>
      <ArtifactGraphExplorer
        graph={artifactGraph}
        proposal={slackProposal}
        driftAffected={driftAffected}
      />
    </AppShell>
  );
}

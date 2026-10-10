import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { ArtifactGraphExplorer } from "@/components/graph/artifact-explorer";
import { emptyExplorerGraph, type LinkProposal } from "@/lib/domain/graph";

/**
 * DATA HOLE — replace with the graph API.
 * Empty until the endpoints exist: no nodes render, no drift blast radius and
 * no pending Slack link proposal.
 */
const artifactGraph = emptyExplorerGraph;
const driftAffected: string[] = [];
const slackProposal: LinkProposal | null = null;

export const metadata: Metadata = {
  title: "Artifact Graph",
  description:
    "Three-pane artefact explorer: filters and provenance, topology canvas, node inspector with blast radius.",
};

export default function ArtifactGraphPage() {
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

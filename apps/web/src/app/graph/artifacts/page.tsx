import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { ArtifactGraphExplorer } from "@/components/graph/artifact-explorer";
import { artifactGraph, driftAffected, slackProposal } from "@/lib/mock/graph";

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

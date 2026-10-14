import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { IngestView } from "@/components/ingest/ingest-view";
import { ingestCounts, listIngestedEvents } from "@/lib/data/ingest";

export const metadata: Metadata = {
  title: "Ingestion",
  description:
    "Every provider delivery UNIFY has received, and the normalised events extracted from them.",
};

export default async function IngestPage() {
  const [events, counts] = await Promise.all([listIngestedEvents(), ingestCounts()]);

  return (
    <AppShell>
      <IngestView events={events} counts={counts} />
    </AppShell>
  );
}

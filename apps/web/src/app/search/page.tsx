import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { SearchWorkspace } from "@/components/search/search-workspace";
import { loadSearchIndex } from "@/lib/data/search";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search & Filters",
  description: "Search across findings, evidence-graph artifacts, links and rules in your workspaces.",
};

export default async function SearchPage() {
  const { matches, suggestions, meta } = await loadSearchIndex();
  return (
    <AppShell>
      <SearchWorkspace searchMatches={matches} tokenSuggestions={suggestions} searchMeta={meta} />
    </AppShell>
  );
}

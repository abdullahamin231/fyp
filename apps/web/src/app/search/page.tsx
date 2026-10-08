import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { SearchWorkspace } from "@/components/search/search-workspace";

export const metadata: Metadata = {
  title: "Search & Filters",
  description:
    "Omni-search across artifacts, conflicts, graph links and policies with advanced facet filtering and a hover-linked preview.",
};

export default function SearchPage() {
  return (
    <AppShell action={<span className="font-mono-code text-[11px] text-secondary">index sha 7a9f4c</span>}>
      <SearchWorkspace />
    </AppShell>
  );
}

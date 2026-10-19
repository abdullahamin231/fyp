"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { ConflictFilters } from "@/lib/domain/conflict-filters";

const selectClass =
  "w-full appearance-none px-3 py-1.5 pr-8 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container cursor-pointer transition";

const STATUS_TABS: { id: ConflictFilters["status"]; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "acknowledged", label: "Acknowledged" },
  { id: "resolved", label: "Resolved" },
  { id: "suppressed", label: "Suppressed" },
];

/** Every filter is a URL parameter, so a filtered inbox is a link someone can share. */
export function ConflictFilterBar({
  filters,
  counts,
  rules,
  csv,
}: {
  filters: ConflictFilters;
  counts: Record<string, number>;
  rules: { value: string; label: string }[];
  csv: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(filters.q);

  function set(name: keyof ConflictFilters, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "all") next.delete(name);
    else next.set(name, value);
    router.replace(`/conflicts${next.size ? `?${next}` : ""}`);
  }

  function exportCsv() {
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `unify-conflicts-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section aria-label="Table filters and toolbar" className="rounded-xl bg-surface-container-low p-3.5 shadow-sm flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" className="inline-flex p-1 rounded-lg bg-surface-container-lowest">
          {STATUS_TABS.map((tab) => {
            const active = tab.id === filters.status;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => set("status", tab.id)}
                className={`px-3 py-1 rounded-md font-body-sm text-body-sm font-semibold transition flex items-center gap-1.5 ${
                  active ? "bg-surface-container-high text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tab.label}
                <span className="font-mono-code text-micro-label text-muted">{counts[tab.id] ?? 0}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition"
          title="Export the filtered findings as CSV"
        >
          <Icon name="download" className="text-[18px]" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 pt-1">
        <form
          className="md:col-span-6 relative"
          onSubmit={(event) => {
            event.preventDefault();
            set("q", q.trim());
          }}
        >
          <Icon name="filter_alt" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-[18px]" />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            onBlur={() => q.trim() !== filters.q && set("q", q.trim())}
            className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-mono-code text-mono-code focus:outline-none focus:bg-surface-container transition placeholder:text-muted"
            placeholder="Filter by finding, ticket, PR or artifact... (Enter)"
            type="search"
          />
        </form>
        <div className="md:col-span-2 relative">
          <select aria-label="Severity" value={filters.severity} onChange={(event) => set("severity", event.target.value)} className={selectClass}>
            <option value="all">Severity: All</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
          <Icon name="expand_more" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted text-[18px] pointer-events-none" />
        </div>
        <div className="md:col-span-4 relative">
          <select aria-label="Rule" value={filters.rule} onChange={(event) => set("rule", event.target.value)} className={selectClass}>
            <option value="all">Rule: All</option>
            {rules.map((rule) => (
              <option key={rule.value} value={rule.value}>
                {rule.label}
              </option>
            ))}
          </select>
          <Icon name="expand_more" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted text-[18px] pointer-events-none" />
        </div>
      </div>
    </section>
  );
}

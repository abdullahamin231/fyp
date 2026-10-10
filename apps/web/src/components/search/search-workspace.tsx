"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  FiltersPanel,
  type FacetCounts,
  type SearchFilters,
} from "@/components/search/filters-panel";
import {
  ResultsColumn,
  type ResultGroup,
  type TabDef,
} from "@/components/search/results-column";
import { PreviewPane } from "@/components/search/preview-pane";
import {
  defaultTokens,
  kindLabels,
  searchMatches,
  searchMeta,
  tokenSuggestions,
  type QueryToken,
  type SearchKind,
  type SearchMatch,
} from "@/lib/mock/search";
import type { Severity } from "@/lib/types";

const kinds: SearchKind[] = ["conflict", "artifact", "link", "policy"];
const severities: Severity[] = ["critical", "warning", "info"];
const toolKeys = ["github", "figma", "jira", "slack"];

const defaultFilters: SearchFilters = {
  kinds: { conflict: true, artifact: true, link: true, policy: true },
  tools: { github: true, figma: true, jira: true, slack: true },
  severities: { critical: true, warning: true, info: true },
  states: ["open", "acknowledged"],
  horizon: "7d",
  confidence: 80,
  squads: [],
};

const horizonHours: Record<SearchFilters["horizon"], number> = {
  "24h": 24,
  "7d": 168,
  "30d": 720,
};

const tokenKey = (token: QueryToken) => `${token.key}:${token.value}`;

function applyToken(match: SearchMatch, token: QueryToken): boolean {
  // A token only constrains results that carry the field — artifacts and links
  // have no severity, conflicts have no link confidence, and so on.
  switch (token.key) {
    case "severity":
      return match.severity ? match.severity === token.value : true;
    case "tool":
      return match.tool === token.value || match.chain.some((node) => node.tool === token.value);
    case "status":
      return match.state ? match.state === token.value : true;
    case "policy":
      return match.policyId ? match.policyId === token.value : true;
    default:
      return true;
  }
}

function haystack(match: SearchMatch): string {
  return [
    match.id,
    match.title,
    match.meta,
    ...match.matched,
    ...match.chain.map((node) => node.label),
  ]
    .join(" ")
    .toLowerCase();
}

/** Omni-search workspace: query bar + token pills, facets, results, preview. */
export function SearchWorkspace() {
  const [query, setQuery] = useState("");
  const [tokens, setTokens] = useState<QueryToken[]>(defaultTokens);
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [activeTab, setActiveTab] = useState<SearchKind | "all">("all");
  const [sort, setSort] = useState<"relevance" | "recency">("relevance");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [previewId, setPreviewId] = useState<string>(searchMatches[0]?.id ?? "");

  const patchFilters = (patch: Partial<SearchFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(0);
  };

  const counts: FacetCounts = useMemo(() => {
    const result: FacetCounts = {
      kinds: {},
      severities: {},
      tools: {},
      states: {},
    };
    searchMatches.forEach((match) => {
      result.kinds[match.kind] = (result.kinds[match.kind] ?? 0) + 1;
      if (match.severity) {
        result.severities[match.severity] = (result.severities[match.severity] ?? 0) + 1;
      }
      if (match.tool) {
        result.tools[match.tool] = (result.tools[match.tool] ?? 0) + 1;
      }
      if (match.state) {
        result.states[match.state] = (result.states[match.state] ?? 0) + 1;
      }
    });
    return result;
  }, []);

  const filtered = useMemo(() => {
    const words = query
      .split(/\s+/)
      .map((word) => word.trim().toLowerCase())
      .filter((word) => word.length > 0 && !word.includes(":"));
    const maxAge = horizonHours[filters.horizon];

    const list = searchMatches.filter((match) => {
      if (!filters.kinds[match.kind]) return false;
      if (match.tool && filters.tools[match.tool] === false) return false;
      if (match.severity && filters.severities[match.severity] === false) return false;
      if (match.state && filters.states.length > 0 && !filters.states.includes(match.state))
        return false;
      if (typeof match.ageHours === "number" && match.ageHours > maxAge) return false;
      if (
        typeof match.confidence === "number" &&
        match.confidence * 100 < filters.confidence
      )
        return false;
      if (match.team && filters.squads.length > 0 && !filters.squads.includes(match.team))
        return false;
      if (!tokens.every((token) => applyToken(match, token))) return false;
      if (words.length > 0) {
        const text = haystack(match);
        if (!words.every((word) => text.includes(word))) return false;
      }
      return true;
    });

    if (sort === "recency") {
      return [...list].sort(
        (a, b) => (a.ageHours ?? Number.MAX_SAFE_INTEGER) - (b.ageHours ?? Number.MAX_SAFE_INTEGER),
      );
    }
    return list;
  }, [filters, query, tokens, sort]);

  const tabCounts = useMemo(() => {
    const map: Record<string, number> = { all: filtered.length };
    kinds.forEach((kind) => {
      map[kind] = filtered.filter((match) => match.kind === kind).length;
    });
    return map;
  }, [filtered]);

  const tabScope = activeTab === "all" ? filtered : filtered.filter((m) => m.kind === activeTab);
  const pageCount = Math.max(1, Math.ceil(tabScope.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageSlice = tabScope.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const groups: ResultGroup[] = kinds
    .map((kind) => ({
      kind,
      items: pageSlice.filter((match) => match.kind === kind),
      total: tabCounts[kind] ?? 0,
    }))
    .filter((group) => group.items.length > 0);

  const tabs: TabDef[] = [
    { id: "all", label: "All Results", count: tabCounts.all ?? 0 },
    ...kinds.map((kind) => ({
      id: kind,
      label: kindLabels[kind],
      count: tabCounts[kind] ?? 0,
      critical: kind === "conflict",
    })),
  ];

  const activeTokens = tokens;
  const suggestions = tokenSuggestions.filter(
    (suggestion) => !tokens.some((token) => tokenKey(token) === tokenKey(suggestion)),
  );

  const addToken = (token: QueryToken) => {
    setTokens((current) => [...current, token]);
    setPage(0);
  };
  const removeToken = (token: QueryToken) => {
    setTokens((current) => current.filter((entry) => tokenKey(entry) !== tokenKey(token)));
    setPage(0);
  };

  const statesDiffer =
    filters.states.length !== defaultFilters.states.length ||
    !defaultFilters.states.every((state) => filters.states.includes(state));

  const activeCount =
    tokens.length +
    (statesDiffer ? 1 : 0) +
    filters.squads.length +
    (filters.confidence === defaultFilters.confidence ? 0 : 1) +
    (filters.horizon === defaultFilters.horizon ? 0 : 1) +
    kinds.filter((kind) => !filters.kinds[kind]).length +
    toolKeys.filter((tool) => filters.tools[tool] === false).length +
    severities.filter((severity) => filters.severities[severity] === false).length;

  const resetAll = () => {
    setFilters(defaultFilters);
    setTokens(defaultTokens);
    setQuery("");
    setPage(0);
    setActiveTab("all");
  };

  const selected =
    filtered.find((match) => match.id === previewId) ??
    filtered[0] ??
    null;

  const distinctCategories = new Set(filtered.map((match) => match.kind)).size;
  const rangeStart = tabScope.length === 0 ? 0 : safePage * pageSize + 1;
  const rangeEnd = Math.min(tabScope.length, (safePage + 1) * pageSize);

  return (
    <div className="relative py-gutter flex flex-col gap-stack-comfortable">
      {/* Search bar section */}
      <div className="bg-surface-container-low rounded-xl p-margin-page shadow-xl flex flex-col gap-stack-comfortable">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-stack-compact">
            <span className="font-mono-code text-eyebrow uppercase tracking-wider text-secondary font-semibold">
              Workspace Query Engine
            </span>
            <span className="text-outline font-mono-code text-micro-label">/</span>
            <span className="font-mono-code text-micro-label text-on-surface-variant">
              {searchMeta.engine}
            </span>
          </div>
          <div className="flex items-center gap-stack-compact text-muted font-mono-code text-micro-label flex-wrap">
            <span className="flex items-center gap-1 bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant">
              <Icon name="keyboard" className="text-[13px]" /> ↑↓ Navigate
            </span>
            <span className="flex items-center gap-1 bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant">
              <Icon name="keyboard_return" className="text-[13px]" /> Select
            </span>
            <span className="flex items-center gap-1 bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant">
              Esc Reset
            </span>
          </div>
        </div>

        {/* Main search input */}
        <div className="relative flex items-center">
          <Icon
            name="manage_search"
            className="absolute left-4 text-primary text-[26px]"
          />
          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
            placeholder="Search artifacts, conflicts, links, policies or type-syntax e.g. type:pr tool:figma..."
            className="w-full pl-14 pr-32 py-3.5 bg-surface-container-lowest text-on-surface font-headline-sm text-headline-sm rounded-lg focus:outline-none focus:bg-surface-container shadow-inner transition-colors placeholder:text-muted placeholder:text-body-sm"
          />
          <div className="absolute right-3 flex items-center gap-stack-compact">
            <button
              type="button"
              title="Clear search"
              onClick={() => setQuery("")}
              className="p-1 rounded bg-surface-container-highest text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-colors"
            >
              <Icon name="backspace" className="text-[18px]" />
            </button>
            <kbd className="px-2 py-1 rounded bg-surface-container-highest font-mono-code text-label-caps text-on-surface-variant shadow-sm">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Query token pills */}
        <div className="flex items-center gap-stack-compact flex-wrap text-body-sm">
          <span className="text-muted font-mono-code text-eyebrow uppercase tracking-wider mr-1">
            Query tokens:
          </span>
          {activeTokens.map((token) => (
            <button
              key={tokenKey(token)}
              type="button"
              onClick={() => removeToken(token)}
              className={`flex items-center gap-1 px-2 py-1 rounded font-mono-code text-body-sm transition-colors ${
                token.key === "severity"
                  ? "bg-error-container text-on-error-container hover:brightness-110"
                  : "bg-surface-container-highest text-on-surface hover:bg-surface-bright"
              }`}
            >
              <span className={token.key === "severity" ? "text-error font-medium" : "text-primary"}>
                {token.key}:
              </span>
              {token.value}
              <Icon name="close" className="text-[14px] text-muted hover:text-error" />
            </button>
          ))}
          {suggestions.map((token) => (
            <button
              key={tokenKey(token)}
              type="button"
              onClick={() => addToken(token)}
              className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container hover:bg-surface-container-highest text-on-surface-variant font-mono-code text-body-sm transition-colors"
            >
              <span className="text-primary">{token.key}:</span>
              {token.value}
              <Icon name="add" className="text-[14px]" />
            </button>
          ))}
        </div>

        {/* Meta stats bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-stack-comfortable bg-surface-container-lowest/60 px-stack-comfortable py-2 rounded-lg">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex h-2 w-2 rounded-full bg-secondary" />
            <span className="font-body-sm text-body-sm text-on-surface">
              Found <strong className="font-semibold text-primary">{filtered.length} results</strong>{" "}
              across {distinctCategories} categories in{" "}
              <span className="font-mono-code text-secondary font-medium">
                {searchMeta.latencyMs}ms
              </span>
            </span>
            <span className="text-outline font-mono-code text-micro-label">•</span>
            <span className="font-mono-code text-micro-label text-muted">
              Deterministic graph index SHA:{" "}
              <span className="text-on-surface-variant">{searchMeta.indexSha}</span>
            </span>
          </div>
          <div className="flex items-center gap-stack-compact">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-surface-container hover:bg-surface-bright text-on-surface font-body-sm text-body-sm transition-colors"
            >
              <Icon name="bookmark" className="text-[16px] text-tertiary" />
              Save View
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-surface-container hover:bg-surface-bright text-on-surface font-body-sm text-body-sm transition-colors"
            >
              <Icon name="ios_share" className="text-[16px] text-primary" />
              Export JSON/CSV
            </button>
          </div>
        </div>
      </div>

      {/* 3-pane layout */}
      <div className="grid grid-cols-12 gap-gutter items-start">
        <FiltersPanel
          filters={filters}
          onChange={patchFilters}
          counts={counts}
          activeCount={activeCount}
          onReset={resetAll}
        />

        <ResultsColumn
          groups={groups}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => {
            setActiveTab(id);
            setPage(0);
          }}
          sort={sort}
          onSortToggle={() => setSort(sort === "relevance" ? "recency" : "relevance")}
          page={safePage}
          pageCount={pageCount}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(0);
          }}
          total={tabScope.length}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onHover={(match) => setPreviewId(match.id)}
          activeId={selected?.id ?? ""}
        />

        <PreviewPane match={selected} />
      </div>
    </div>
  );
}

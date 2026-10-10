import type { Tone } from "@/components/ui/badge";
import type { FindingStatus, PolicyId, Severity, ToolKind } from "@/lib/types";

/**
 * Advanced search view-model types.
 *
 * The API flattens findings / links / policies into one typed result set with
 * the facet fields the search workspace filters on.
 */

export type SearchKind = "conflict" | "artifact" | "link" | "policy";

export interface SearchChainNode {
  tool: ToolKind;
  label: string;
}

export interface SearchMatch {
  id: string;
  kind: SearchKind;
  badge: string;
  badgeTone: Tone;
  title: string;
  meta: string;
  /** Lexical signals highlighted in the preview pane. */
  matched: string[];
  /** Provenance chain rendered in the preview pane. */
  chain: SearchChainNode[];
  findingId?: string;
  tool?: ToolKind;
  severity?: Severity;
  state?: FindingStatus;
  policyId?: PolicyId;
  ageHours?: number;
  team?: string;
  confidence?: number;
  provenance?: string;
  /** Only for graph-link results: the relation verb, e.g. `SATISFIES`. */
  relation?: string;
}

/** Badge classes per tone — literal strings so Tailwind can see them. */
export const badgeToneClass: Record<Tone, string> = {
  critical: "bg-error-container text-error",
  warning: "bg-tertiary-container text-on-tertiary-container",
  info: "bg-primary-container text-on-primary-container",
  success: "bg-secondary/15 text-secondary",
  neutral: "bg-surface-container-highest text-on-surface-variant",
  accent: "bg-primary/15 text-primary",
};

/* ---------------------------------------------------------------- query UI */

export interface QueryToken {
  key: string;
  value: string;
}

export const kindLabels: Record<SearchKind, string> = {
  conflict: "Conflicts",
  artifact: "Artifacts",
  link: "Graph Links",
  policy: "Policies",
};

/** Tool facet chips for the filters panel. */
export const toolFilters: { tool: ToolKind; label: string; dot: string }[] = [
  { tool: "github", label: "GitHub", dot: "bg-secondary" },
  { tool: "figma", label: "Figma", dot: "bg-tertiary" },
  { tool: "jira", label: "Jira", dot: "bg-primary" },
  { tool: "slack", label: "Slack", dot: "bg-surface-bright" },
];

/** Index metadata echoed under the search bar — supplied by the search API. */
export interface SearchMeta {
  engine: string;
  indexSha: string;
  latencyMs: number;
}

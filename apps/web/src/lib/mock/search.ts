/**
 * Advanced search & filtering mock index.
 *
 * Flattens the shared findings / links / policies mocks into one typed result
 * set with the facet fields the search workspace filters on.
 */
import type { Tone } from "@/components/ui/badge";
import { findings } from "@/lib/mock/findings";
import { links } from "@/lib/mock/links";
import { policies } from "@/lib/mock/policies";
import type { FindingStatus, PolicyId, Severity, ToolKind } from "@/lib/types";

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

const signals: Record<string, string[]> = {
  "CONF-1048": ["checkout modal", "design drift", "SEV-1"],
  "CONF-1047": ["ghost ticket", "mute thread", "anchor"],
  "CONF-1046": ["token divergence", "button", "palette"],
  "CONF-1045": ["schema signature", "priority field", "SEV-1"],
  "CONF-1044": ["cart copy", "empty state"],
  "CONF-1043": ["ghost ticket", "sprint"],
  "CONF-1042": ["watcher prefs", "re-anchored"],
  "CONF-1041": ["icon set", "generated"],
};

const severityBadge: Record<Severity, { label: string; tone: Tone }> = {
  critical: { label: "CRITICAL SEV-1", tone: "critical" },
  warning: { label: "WARNING SEV-2", tone: "warning" },
  info: { label: "INFO SEV-3", tone: "info" },
};

const toolBadgeTone: Record<ToolKind, Tone> = {
  figma: "warning",
  github: "success",
  jira: "info",
  slack: "critical",
  git: "accent",
  test: "warning",
};

function ageHours(label: string): number {
  const value = Number.parseInt(label, 10);
  if (Number.isNaN(value)) return 0;
  return label.includes("d") ? value * 24 : value;
}

/* ------------------------------------------------------------- result groups */

const conflictMatches: SearchMatch[] = findings.map((finding) => ({
  id: `#${finding.id}`,
  kind: "conflict",
  badge: severityBadge[finding.severity].label,
  badgeTone: severityBadge[finding.severity].tone,
  title: finding.summary,
  meta: `Modified: ${finding.ageLabel} ago • ${finding.team}`,
  matched: signals[finding.id] ?? [finding.policyTitle.toLowerCase()],
  chain: finding.artifacts.map((artifact) => ({ tool: artifact.tool, label: artifact.ref })),
  findingId: finding.id,
  severity: finding.severity,
  state: finding.status,
  policyId: finding.policy,
  ageHours: ageHours(finding.ageLabel),
  team: finding.team,
}));

const artifactMatches: SearchMatch[] = (() => {
  const seen = new Set<string>();
  const out: SearchMatch[] = [];
  findings.forEach((finding) => {
    finding.artifacts.forEach((artifact) => {
      const key = `${artifact.tool}-${artifact.ref}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({
        id: `${artifact.tool.toUpperCase()}:${artifact.ref}`,
        kind: "artifact",
        badge: artifact.label.toUpperCase(),
        badgeTone: toolBadgeTone[artifact.tool],
        title: artifact.ref,
        meta: `${finding.ageLabel} ago by ${finding.assignedTo[0] ?? "unify-rules"} • ${finding.team}`,
        matched: [artifact.ref.toLowerCase(), ...(signals[finding.id] ?? [])],
        chain: [{ tool: artifact.tool, label: artifact.ref }],
        findingId: finding.id,
        tool: artifact.tool,
        ageHours: ageHours(finding.ageLabel),
        team: finding.team,
      });
    });
  });
  return out;
})();

/** Deterministic "now": the newest timestamp present in the packet store. */
const newestTimestamp = Math.max(
  ...findings.map((f) => +new Date(f.createdAt)),
  ...links.map((l) => +new Date(l.changedAt)),
);

const linkMatches: SearchMatch[] = links.map((link) => ({
  id: link.id,
  kind: "link",
  badge: `${link.eligibility.toUpperCase()} LINK`,
  badgeTone: link.eligibility === "confirmed" || link.eligibility === "system-confirmed" ? "success" : "warning",
  title: `${link.source.ref} [${link.relation}] ${link.target.ref}`,
  meta: `Provenance: ${link.provenance} • Confidence: ${Math.round(link.confidence * 100)}% • ${link.eligibility}`,
  matched: [link.relation.toLowerCase(), link.source.ref.toLowerCase(), link.target.ref.toLowerCase()],
  chain: [
    { tool: link.source.tool, label: link.source.ref },
    { tool: link.target.tool, label: link.target.ref },
  ],
  tool: link.source.tool,
  confidence: link.confidence,
  provenance: link.provenance,
  relation: link.relation,
  ageHours: Math.max(0, Math.round((newestTimestamp - +new Date(link.changedAt)) / 3_600_000)),
}));

const policyMatches: SearchMatch[] = policies.map((policy) => ({
  id: policy.id,
  kind: "policy",
  badge: policy.enabled ? "POLICY ACTIVE" : "POLICY PAUSED",
  badgeTone: policy.enabled ? "accent" : "neutral",
  title: `${policy.id}: ${policy.name}`,
  meta: `Severity: ${policy.severity} • Grace: ${policy.graceMinutes}m • Fired ${policy.firedLast7d} in 7d`,
  matched: [policy.trigger, policy.name.toLowerCase()],
  chain: [],
  severity: policy.severity,
  policyId: policy.id,
}));

export const searchMatches: SearchMatch[] = [
  ...conflictMatches,
  ...artifactMatches,
  ...linkMatches,
  ...policyMatches,
];

/* ---------------------------------------------------------------- query UI */

export interface QueryToken {
  key: string;
  value: string;
}

export const defaultTokens: QueryToken[] = [{ key: "severity", value: "critical" }];

export const tokenSuggestions: QueryToken[] = [
  { key: "tool", value: "figma" },
  { key: "status", value: "open" },
  { key: "policy", value: "P1" },
];

export const squads: string[] = [
  "Core Checkout",
  "Frontend Infrastructure",
  "Design Systems Core",
  "Growth & Experiments",
];

export const searchMeta = {
  engine: "Omni-Search v2.4",
  indexSha: "7a9f4c",
  latencyMs: 18,
};

export const toolFilters: { tool: ToolKind; label: string; dot: string }[] = [
  { tool: "github", label: "GitHub", dot: "bg-secondary" },
  { tool: "figma", label: "Figma", dot: "bg-tertiary" },
  { tool: "jira", label: "Jira", dot: "bg-primary" },
  { tool: "slack", label: "Slack", dot: "bg-surface-bright" },
];

export const kindLabels: Record<SearchKind, string> = {
  conflict: "Conflicts",
  artifact: "Artifacts",
  link: "Graph Links",
  policy: "Policies",
};

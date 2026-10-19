import type { RuleView } from "@/lib/data/rules";
import type { Finding, Severity } from "@/lib/types";
import type { ExplorerGraph } from "./graph";
import type { QueryToken, SearchMatch } from "./search";

/**
 * The search index, built on the server from what the caller can already
 * read: findings, the evidence graph (artifacts and links) and the rules.
 */

const severityTone = { critical: "critical", warning: "warning", info: "info" } as const;
const ruleSeverity: Record<RuleView["severity"], Severity> = { critical: "critical", high: "critical", medium: "warning", low: "info" };

function hoursSince(iso: string, now: Date): number {
  return Math.max(0, (now.getTime() - new Date(iso).getTime()) / 3_600_000);
}

export function buildSearchIndex(input: {
  findings: Finding[];
  graph: ExplorerGraph;
  rules: RuleView[];
  now: Date;
}): SearchMatch[] {
  const { findings, graph, rules, now } = input;
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));

  const conflicts: SearchMatch[] = findings.map((f) => ({
    id: `finding:${f.id}`,
    kind: "conflict",
    badge: f.severity.toUpperCase(),
    badgeTone: severityTone[f.severity],
    title: f.title,
    meta: `${f.policy ?? "verdict"} · ${f.status}`,
    matched: [f.policyTitle, ...f.artifacts.map((a) => a.ref)],
    chain: f.artifacts.map((a) => ({ tool: a.tool, label: a.ref })),
    findingId: f.id,
    tool: f.artifacts[0]?.tool,
    severity: f.severity,
    state: f.status,
    policyId: f.policy ?? "verdict",
    ageHours: hoursSince(f.createdAt, now),
  }));

  const artifacts: SearchMatch[] = graph.nodes.map((n) => ({
    id: `node:${n.id}`,
    kind: "artifact",
    badge: n.kindLabel,
    badgeTone: n.conflict ? "critical" : "neutral",
    title: n.label,
    meta: n.subtitle,
    matched: [n.locator, ...n.fields.map((field) => field.value)],
    chain: [{ tool: n.tool ?? "git", label: n.label }],
    findingId: n.findingId,
    tool: n.tool,
  }));

  const links: SearchMatch[] = graph.edges.flatMap((e) => {
    const from = nodeById.get(e.from);
    const to = nodeById.get(e.to);
    if (!from || !to) return [];
    return [
      {
        id: `edge:${e.from}:${e.to}:${e.label}`,
        kind: "link" as const,
        badge: e.eligibility,
        badgeTone: e.eligibility === "confirmed" || e.eligibility === "system-confirmed" ? ("success" as const) : ("neutral" as const),
        title: `${from.label} ${e.label} ${to.label}`,
        meta: `${e.provenance} · confidence ${Math.round(e.confidence * 100)}%`,
        matched: [from.label, to.label],
        chain: [
          { tool: from.tool ?? "git", label: from.label },
          { tool: to.tool ?? "git", label: to.label },
        ],
        tool: from.tool,
        confidence: e.confidence,
        provenance: e.provenance,
        relation: e.label,
      },
    ];
  });

  const policies: SearchMatch[] = rules.map((r) => ({
    id: `rule:${r.id}`,
    kind: "policy",
    badge: `v${r.version}`,
    badgeTone: r.active ? "accent" : "neutral",
    title: `${r.id}: ${r.title}`,
    meta: `${r.active ? "active" : "paused"} · ${r.fired7d} fired / 7d`,
    matched: [r.condition, r.description],
    chain: [],
    severity: ruleSeverity[r.severity],
    policyId: r.id,
  }));

  return [...conflicts, ...artifacts, ...links, ...policies];
}

/** Query-token suggestions for the values that actually occur in the index. */
export function tokenSuggestionsFor(matches: SearchMatch[]): QueryToken[] {
  const seen = new Set<string>();
  const tokens: QueryToken[] = [];
  const add = (key: string, value: string | undefined) => {
    if (!value || seen.has(`${key}:${value}`)) return;
    seen.add(`${key}:${value}`);
    tokens.push({ key, value });
  };
  for (const m of matches) {
    add("severity", m.severity);
    add("tool", m.tool);
    add("status", m.state);
    add("policy", m.policyId);
  }
  return tokens;
}

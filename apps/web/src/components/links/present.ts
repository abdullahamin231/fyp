import { isDecisiveEligibility } from "@unify/contracts";
import type { LinkEligibility, RelationLink, ToolKind } from "@/lib/types";
import type { Tone } from "@/components/ui/badge";
import type { LinkSuggestion } from "@/lib/domain/link-suggestions";

export type Relation = RelationLink["relation"];
export type Provenance = RelationLink["provenance"];

/* --------------------------------------------------------------- relations */

export const RELATIONS: Relation[] = [
  "SATISFIES",
  "REFERENCES",
  "IMPLEMENTS",
  "VERIFIES",
  "BLOCKS",
];

export const relationMeta: Record<
  Relation,
  { description: string; icon: string; chipClass: string }
> = {
  SATISFIES: {
    description:
      "Downstream artifact meets the requirement or acceptance criterion recorded against it.",
    icon: "fact_check",
    chipClass: "bg-primary-container text-on-primary-container",
  },
  REFERENCES: {
    description:
      "Soft, directional mention — commits, tickets or threads that point at this artifact without owning it.",
    icon: "visibility",
    chipClass: "bg-primary/15 text-primary",
  },
  IMPLEMENTS: {
    description:
      "Downstream code or implementation directly executes the UI specification or logic contract.",
    icon: "code",
    chipClass: "bg-secondary/15 text-secondary",
  },
  VERIFIES: {
    description:
      "Test, spec or evaluation run that proves the target artifact behaves as specified.",
    icon: "verified",
    chipClass: "bg-tertiary-container text-on-tertiary-container",
  },
  BLOCKS: {
    description:
      "Delivery gate — the target cannot ship while this artifact is unresolved or failing.",
    icon: "block",
    chipClass: "bg-error-container text-error",
  },
};

/* ------------------------------------------------------------ eligibility */

export const eligibilityMeta: Record<
  LinkEligibility,
  { label: string; tone: Tone; icon: string; hint: string }
> = {
  confirmed: {
    label: "Confirmed",
    tone: "success",
    icon: "check_circle",
    hint: "Human-asserted edge — eligible for decisive findings and notifications.",
  },
  "system-confirmed": {
    label: "System-confirmed",
    tone: "info",
    icon: "verified",
    hint: "Reconciled from adapter evidence — eligible for decisive findings and notifications.",
  },
  inferred: {
    label: "Inferred",
    tone: "warning",
    icon: "auto_awesome",
    hint: "Advisory only — cannot raise a decisive finding or notification until confirmed.",
  },
  unconfirmed: {
    label: "Unconfirmed",
    tone: "neutral",
    icon: "help",
    hint: "Advisory only — cannot raise a decisive finding or notification until confirmed.",
  },
};

export const ELIGIBILITIES: LinkEligibility[] = [
  "confirmed",
  "system-confirmed",
  "inferred",
  "unconfirmed",
];

/** Is a classified eligibility decisive? Delegates to the contracts boundary. */
export const isDecisive = isDecisiveEligibility;

/** The product rule, surfaced verbatim wherever advisory links appear. */
export const ADVISORY_RULE =
  "Inferred and unconfirmed links can be listed, confirmed or rejected — but never produce a decisive finding or notification.";

/* ------------------------------------------------------------- provenance */

export const provenanceMeta: Record<Provenance, { label: string; icon: string; note: string }> = {
  explicit: {
    label: "Explicit",
    icon: "format_quote",
    note: "Declared directly in the graph by an adapter contract",
  },
  manual: {
    label: "Manual Entry",
    icon: "edit_square",
    note: "Asserted by a person through the relationship builder",
  },
  inferred: {
    label: "Inferred",
    icon: "auto_awesome",
    note: "Detected by the link engine from commit, PR and comment evidence",
  },
  reconciled: {
    label: "Reconciled",
    icon: "sync",
    note: "Webhook evidence reconciled against the artifact snapshot",
  },
};

export const PROVENANCES: Provenance[] = ["explicit", "manual", "inferred", "reconciled"];

/* ------------------------------------------------------------------ tools */

export const toolIcon: Record<ToolKind, string> = {
  figma: "draw",
  github: "merge_type",
  jira: "confirmation_number",
  slack: "chat",
  git: "hub",
  test: "experiment",
};

export const toolLabel: Record<ToolKind, string> = {
  figma: "Figma",
  github: "GitHub",
  jira: "Jira",
  slack: "Slack",
  git: "Git",
  test: "Test",
};

/* -------------------------------------------------------------- formatting */

export function confidenceLabel(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

/**
 * Cheap prefix/keyword sniff used by the builder previews and by rows created
 * from a manual draft, so the tool pill matches whatever was typed.
 */
export function guessArtifact(value: string): { tool: ToolKind; kind: string } {
  const v = value.trim().toLowerCase();
  if (!v) return { tool: "github", kind: "Artifact" };
  if (v.includes("figma")) return { tool: "figma", kind: "Figma frame" };
  if (v.includes("slack") || v.startsWith("#dev")) return { tool: "slack", kind: "Slack thread" };
  if (v.includes("jira") || /^[a-z][a-z0-9]*-\d+$/.test(v.replace(/^(jira|gh|figma):\s*/i, ""))) {
    return { tool: "jira", kind: "Jira ticket" };
  }
  if (v.startsWith("gh") || v.includes("#")) return { tool: "github", kind: "GitHub pull request" };
  return { tool: "github", kind: "Repository artifact" };
}

/** Deterministic pseudo digest so every row shows a stable SHA-style value. */
export function pseudoDigest(seed: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  const head = hash.toString(16).padStart(8, "0");
  const tail = (hash ^ 0x9e3779b9).toString(16).padStart(8, "0");
  return `SHA256: ${head}…${tail.slice(0, 4)}`;
}

/** Relative "2 days ago" label derived from an ISO timestamp. */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "unknown";
  const minutes = Math.max(0, Math.floor((Date.now() - then) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

/** Confidence shown with the eligibility state, e.g. "94% · advisory". */
export function confidenceSuffix(eligibility: LinkEligibility): string {
  return isDecisive(eligibility) ? "authoritative" : "advisory";
}

/* ------------------------------------------------------- provenance modal */

export interface ProvenanceRecord {
  source: string;
  sourceMeta: string;
  target: string;
  targetMeta: string;
  relation: string;
  evidence: string;
  confidence: string;
  eligibility: LinkEligibility;
  provenance: Provenance;
  digest: string;
}

export function linkToRecord(link: RelationLink): ProvenanceRecord {
  const evidence = [
    provenanceMeta[link.provenance].note,
    link.confirmedBy ? `Confirmed by ${link.confirmedBy}` : "Awaiting human confirmation",
    `Edge ${link.id} recorded ${relativeTime(link.changedAt)}`,
  ].join(" · ");

  return {
    source: link.source.ref,
    sourceMeta: `${toolLabel[link.source.tool]} · ${link.source.label}`,
    target: link.target.ref,
    targetMeta: `${toolLabel[link.target.tool]} · ${link.target.label}`,
    relation: link.relation,
    evidence,
    confidence: `${confidenceLabel(link.confidence)} · ${confidenceSuffix(link.eligibility)}`,
    eligibility: link.eligibility,
    provenance: link.provenance,
    digest: pseudoDigest(link.id + link.source.ref + link.target.ref),
  };
}

export function suggestionToRecord(suggestion: LinkSuggestion): ProvenanceRecord {
  return {
    source: suggestion.source.ref,
    sourceMeta: `${toolLabel[suggestion.source.tool]} · ${suggestion.source.label}`,
    target: suggestion.target.ref,
    targetMeta: `${toolLabel[suggestion.target.tool]} · ${suggestion.target.label}`,
    relation: suggestion.relation,
    evidence: `${suggestion.detector} — ${suggestion.evidence}`,
    confidence: `${confidenceLabel(suggestion.confidence)} · ${confidenceSuffix(suggestion.eligibility)}`,
    eligibility: suggestion.eligibility,
    provenance: suggestion.provenance,
    digest: pseudoDigest(suggestion.id + suggestion.evidence),
  };
}

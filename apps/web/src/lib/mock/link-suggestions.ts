import type { RelationLink } from "@/lib/types";

/**
 * Heuristic link suggestions produced by the UNIFY link engine from commit
 * messages, pull request descriptions and Figma dev-mode comments.
 *
 * They are always `inferred` / `unconfirmed`: listable, confirmable and
 * rejectable by a human, but never eligible for a decisive finding or a
 * notification until confirmed.
 */
export interface LinkSuggestion extends RelationLink {
  /** Human-readable detector that produced the suggestion. */
  detector: string;
  /** Evidence string surfaced in the provenance inspector. */
  evidence: string;
}

export const linkSuggestions: LinkSuggestion[] = [
  {
    id: "SGT-411",
    source: {
      tool: "figma",
      label: "Figma frame",
      ref: "PaymentMethods_v2",
      title: "Payment methods — checkout flow",
    },
    target: {
      tool: "github",
      label: "GitHub pull request",
      ref: "#145 payment-gateway-stripe",
      title: "feat(checkout): stripe intent multi-provider",
    },
    relation: "IMPLEMENTS",
    eligibility: "inferred",
    confidence: 0.94,
    provenance: "inferred",
    changedAt: "2026-10-08T12:30:00Z",
    detector: "Deterministic PR keyword match",
    evidence: "PR description carries the marker string [Figma-Link: #891:2019].",
  },
  {
    id: "SGT-412",
    source: {
      tool: "jira",
      label: "Jira ticket",
      ref: "PROJ-94",
      title: "Webhook retry backoff",
    },
    target: {
      tool: "github",
      label: "GitHub branch",
      ref: "feature/proj-94-webhook-retry",
      title: "Branch for PROJ-94 delivery",
    },
    relation: "REFERENCES",
    eligibility: "inferred",
    confidence: 0.88,
    provenance: "inferred",
    changedAt: "2026-10-08T11:05:00Z",
    detector: "Branch slug pattern match",
    evidence: "Git branch matches the Jira issue key schema PROJ-[0-9]+.",
  },
  {
    id: "SGT-413",
    source: {
      tool: "figma",
      label: "Figma token",
      ref: "ButtonPrimary",
      title: "Master component · Foundations",
    },
    target: {
      tool: "github",
      label: "GitHub file",
      ref: "packages/tokens/globals.css",
      title: "var(--color-primary) declaration",
    },
    relation: "REFERENCES",
    eligibility: "unconfirmed",
    confidence: 0.78,
    provenance: "inferred",
    changedAt: "2026-10-08T09:40:00Z",
    detector: "AST lexical name & value parity",
    evidence: "Lexical similarity match with hex value #c3c0ff found in the stylesheet parser.",
  },
];

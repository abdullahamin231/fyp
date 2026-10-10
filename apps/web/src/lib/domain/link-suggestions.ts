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

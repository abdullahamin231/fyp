import type { NodeTone } from "@/lib/mock/graph";
import type { GraphNodeKind, LinkEligibility, ToolKind } from "@/lib/types";

/**
 * Shared visual vocabulary for the two graph explorers. Every class string is
 * literal (so the Tailwind scanner sees it) and built only from design tokens.
 */

export interface ToneClasses {
  text: string;
  border: string;
  bg: string;
  shadow: string;
}

export const toneClasses: Record<NodeTone, ToneClasses> = {
  primary: {
    text: "text-primary",
    border: "border-primary",
    bg: "bg-primary/10",
    shadow: "shadow-primary/10",
  },
  secondary: {
    text: "text-secondary",
    border: "border-secondary",
    bg: "bg-secondary/10",
    shadow: "shadow-secondary/10",
  },
  tertiary: {
    text: "text-tertiary",
    border: "border-tertiary",
    bg: "bg-tertiary/10",
    shadow: "shadow-tertiary/10",
  },
  error: {
    text: "text-error",
    border: "border-error",
    bg: "bg-error-container/20",
    shadow: "shadow-error/10",
  },
  outline: {
    text: "text-outline",
    border: "border-outline-variant",
    bg: "bg-surface-container-high",
    shadow: "shadow-none",
  },
};

/** Node kind → accent tone (grouped by source tool, matching `ToolPill`). */
export const kindTone: Record<GraphNodeKind, NodeTone> = {
  requirement: "primary", // Jira
  design: "tertiary", // Figma
  pr: "secondary", // GitHub
  code: "secondary", // GitHub
  test: "secondary", // GitHub
  finding: "error",
};

export const kindIcon: Record<GraphNodeKind, string> = {
  requirement: "task_alt",
  design: "crop_free",
  pr: "commit",
  code: "code",
  test: "experiment",
  finding: "crisis_alert",
};

export interface EligibilityStyle {
  /** Tailwind stroke utility (token colour) for SVG paths. */
  strokeClass: string;
  /** Matching checkbox accent utility for filter lists. */
  accentClass: string;
  /** Dash pattern — absent means a solid, decisive link. */
  dash?: string;
  round?: boolean;
  label: string;
  hint: string;
}

/**
 * The product-critical distinction: solid strokes are decisive
 * (confirmed / system-confirmed), dashed and dotted strokes may be displayed
 * and confirmed but can never produce a decisive finding on their own.
 */
export const eligibilityStyle: Record<LinkEligibility, EligibilityStyle> = {
  confirmed: {
    strokeClass: "stroke-secondary",
    accentClass: "accent-secondary",
    label: "Confirmed",
    hint: "Human-confirmed · decisive",
  },
  "system-confirmed": {
    strokeClass: "stroke-primary",
    accentClass: "accent-primary",
    label: "System-confirmed",
    hint: "Auto above threshold · reversible",
  },
  inferred: {
    strokeClass: "stroke-tertiary",
    accentClass: "accent-tertiary",
    dash: "8 6",
    label: "Inferred",
    hint: "Heuristic · never decisive",
  },
  unconfirmed: {
    strokeClass: "stroke-outline",
    accentClass: "accent-outline",
    dash: "2 7",
    round: true,
    label: "Unconfirmed",
    hint: "Below threshold · never decisive",
  },
};

/** Human-readable tool name for card captions and inspector rows. */
export function toolName(tool: ToolKind | undefined): string {
  switch (tool) {
    case "figma":
      return "Figma";
    case "jira":
      return "Jira";
    case "slack":
      return "Slack";
    case "git":
      return "Git";
    case "test":
      return "Tests";
    default:
      return "GitHub";
  }
}

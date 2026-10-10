import type { PolicyId, ToolKind } from "@/lib/types";

/**
 * Policy Test Lab view-model types.
 *
 * The lab replays historical event classes against a candidate grace window.
 * The event classes and horizons come from the API; the grace-window step
 * tables below are product configuration, not data.
 */

export interface SimHorizon {
  id: string;
  label: string;
  days: number;
  events: number;
  range: string;
}

/** Candidate grace windows offered per policy (index from `defaultStep` is the configured value). */
export const graceSteps: Record<PolicyId, number[]> = {
  P1: [5, 15, 30, 60, 120, 240],
  P2: [60, 120, 240, 480, 720, 1440],
  P3: [120, 360, 720, 1440, 2880, 4320],
  P4: [15, 30, 60, 120, 240, 480],
};

/** Step that equals `Policy.graceMinutes` (the value deployed in production). */
export const defaultStep: Record<PolicyId, number> = { P1: 2, P2: 2, P3: 3, P4: 2 };

export interface SimScenario {
  id: string;
  label: string;
  description: string;
  /** "default" = configured value, "last" = widest window, otherwise a step index. */
  step: number | "default" | "last";
  guards: boolean;
}

export interface SimArtifact {
  tool: ToolKind;
  text: string;
}

export interface SimEventClass {
  id: string;
  title: string;
  detail: string;
  /** Minutes since the trigger event; compared against the grace window. */
  elapsedMinutes: number;
  /** Occurrences of this pattern in the 30-day production window. */
  occurrences30d: number;
  /** Historical false-positive rate for this pattern (0..1). */
  fpRate: number;
  icon: string;
  /** ISO timestamp — sorted on, formatted for display. */
  iso: string;
  uuid: string;
  artifacts: SimArtifact[];
  /** Only present on classes a guard clause blocks. */
  guard?: { clause: string; text: string };
}

/** Expected delivery targets per policy — delivery-only, never a reasoning input. */
export interface NotifyMeta {
  channel: string;
  recipients: string[];
  escalation: string;
}

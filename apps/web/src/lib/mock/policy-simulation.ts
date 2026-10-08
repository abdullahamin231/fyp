import type { PolicyId, ToolKind } from "@/lib/types";

/**
 * Client-side "what-if" dataset for the Policy Test Lab.
 *
 * Every class of historical event carries an elapsed time, a 30-day occurrence
 * count and a historical false-positive rate, so the KPI strip, the sensitivity
 * curve and the event stream are all derived from one internally consistent
 * source: move the grace slider, re-run, and every number follows.
 */

export interface SimHorizon {
  id: string;
  label: string;
  days: number;
  events: number;
  range: string;
}

export const simHorizons: SimHorizon[] = [
  { id: "30d", label: "Last 30 Days", days: 30, events: 1420, range: "Sep 09, 2026 – Oct 08, 2026" },
  { id: "14d", label: "Sprint 24 Replay", days: 14, events: 672, range: "Sep 24, 2026 – Oct 08, 2026" },
  { id: "7d", label: "Last 7 Days", days: 7, events: 336, range: "Oct 01, 2026 – Oct 08, 2026" },
];

/** Candidate grace windows offered per policy (index 2/3 is the configured value). */
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

export const simScenarios: SimScenario[] = [
  {
    id: "baseline",
    label: "Production baseline",
    description: "Configured grace window with every guard clause armed.",
    step: "default",
    guards: true,
  },
  {
    id: "strict",
    label: "Strict review window",
    description: "Tightest grace — surface drift as early as the contract allows.",
    step: 0,
    guards: true,
  },
  {
    id: "noise-audit",
    label: "Guards bypassed (noise audit)",
    description: "Disable guard clauses to see exactly what they suppress today.",
    step: "default",
    guards: false,
  },
  {
    id: "freeze",
    label: "Holiday freeze (permissive)",
    description: "Widest grace — quiet-period posture for release weeks.",
    step: "last",
    guards: true,
  },
];

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

export const simEvents: Record<PolicyId, SimEventClass[]> = {
  P1: [
    {
      id: "p1-a",
      title: "CheckoutModal_v3 design frame updated after PR #142 merged",
      detail:
        "Anchored symbol `steps` no longer matches the approved frame — both artifacts CURRENT, link eligibility confirmed.",
      elapsedMinutes: 52,
      occurrences30d: 7,
      fpRate: 0.05,
      icon: "gpp_maybe",
      iso: "2026-10-07T18:45:00Z",
      uuid: "9f84a1e-84b2-4cd8-89fa",
      artifacts: [
        { tool: "figma", text: "CheckoutModal_v3" },
        { tool: "github", text: "PR #142 (unify-core)" },
        { tool: "jira", text: "PROJ-88" },
      ],
    },
    {
      id: "p1-b",
      title: "Design frame re-published with no matching requirement update",
      detail:
        "Frame content hash moved beyond formatting tolerance while the requirement anchor stayed unchanged.",
      elapsedMinutes: 65,
      occurrences30d: 5,
      fpRate: 0.04,
      icon: "difference",
      iso: "2026-10-05T11:20:00Z",
      uuid: "7e31b8c-55d1-4be3-b09e",
      artifacts: [
        { tool: "figma", text: "Profile/WatcherPrefs" },
        { tool: "github", text: "PR #131 (unify-web)" },
        { tool: "jira", text: "PROJ-74" },
      ],
    },
    {
      id: "p1-c",
      title: "Component variant diverged from code after hotfix merge",
      detail: "AST check confirms the `variant` prop is now inlined in CheckoutButton.tsx.",
      elapsedMinutes: 130,
      occurrences30d: 3,
      fpRate: 0.06,
      icon: "code",
      iso: "2026-10-02T09:05:00Z",
      uuid: "c4d09af-2b71-4e18-9a55",
      artifacts: [
        { tool: "figma", text: "Button/secondary" },
        { tool: "github", text: "PR #138 (unify-ui)" },
      ],
    },
    {
      id: "p1-d",
      title: "Spacing tokens drifted after the v2.0.1 release merge",
      detail: "Release merge pinned spacing-6 while the frame now reads spacing-8.",
      elapsedMinutes: 260,
      occurrences30d: 3,
      fpRate: 0,
      icon: "commit",
      iso: "2026-09-24T16:30:00Z",
      uuid: "2ab77f5-9c30-4d77-b114",
      artifacts: [
        { tool: "figma", text: "System Tokens / Spacing" },
        { tool: "git", text: "tag v2.0.1" },
        { tool: "github", text: "PR #145 (unify-web)" },
      ],
    },
    {
      id: "p1-e",
      title: "Cart/EmptyState copy updated after PR #139 merged",
      detail: "Update landed inside the grace window; design state reconciled.",
      elapsedMinutes: 25,
      occurrences30d: 12,
      fpRate: 0.03,
      icon: "done_all",
      iso: "2026-10-06T14:10:00Z",
      uuid: "4c11aa0-128a-4933-91ee",
      artifacts: [
        { tool: "figma", text: "Cart/EmptyState" },
        { tool: "github", text: "PR #139 (unify-web)" },
      ],
    },
    {
      id: "p1-f",
      title: "ProfileCard_v1.1 frame updated after PR #135 merged",
      detail: "Both artifacts reconciled well before the grace window closed.",
      elapsedMinutes: 12,
      occurrences30d: 10,
      fpRate: 0.02,
      icon: "done_all",
      iso: "2026-10-08T09:40:00Z",
      uuid: "b30e6d2-51af-40c9-88d3",
      artifacts: [
        { tool: "figma", text: "ProfileCard_v1.1" },
        { tool: "github", text: "PR #135 (unify-core)" },
      ],
    },
    {
      id: "p1-g",
      title: "NavHeader frame updated on an experimental branch",
      detail: "Guard clause matched before the evaluation engine ran.",
      elapsedMinutes: 200,
      occurrences30d: 5,
      fpRate: 0,
      icon: "filter_alt_off",
      iso: "2026-10-04T21:15:00Z",
      uuid: "1d99ff2-334c-4721-a0bc",
      artifacts: [
        { tool: "figma", text: "NavHeader" },
        { tool: "github", text: "branch spike/nav-rewrite" },
      ],
      guard: {
        clause: 'commit label = "wip-experimental"',
        text: 'ignored: commit labeled "wip-experimental"',
      },
    },
  ],
  P2: [
    {
      id: "p2-a",
      title: "PROJ-114 in review for 26h with no anchored code unit",
      detail:
        "No confirmed SATISFIES edge after the grace window; the reconciliation pass completed cleanly.",
      elapsedMinutes: 1600,
      occurrences30d: 4,
      fpRate: 0.04,
      icon: "gpp_maybe",
      iso: "2026-10-07T08:12:00Z",
      uuid: "5a72e18-0f44-4c2b-9e61",
      artifacts: [
        { tool: "jira", text: "PROJ-114" },
        { tool: "github", text: "feat/mute-thread" },
      ],
    },
    {
      id: "p2-b",
      title: "PROJ-91 moved to In Progress with no linked branch anchor",
      detail: "Graph traversal at depth 1 found no SATISFIES or IMPLEMENTS edge.",
      elapsedMinutes: 800,
      occurrences30d: 6,
      fpRate: 0.05,
      icon: "confirmation_number",
      iso: "2026-10-05T17:40:00Z",
      uuid: "e81c4b9-73aa-4d05-bf27",
      artifacts: [{ tool: "jira", text: "PROJ-91" }],
    },
    {
      id: "p2-c",
      title: "PROJ-108 accepted while its pull request is still draft",
      detail: "A draft PR cannot publish an anchor — the ticket enters grace with an empty edge set.",
      elapsedMinutes: 600,
      occurrences30d: 5,
      fpRate: 0.06,
      icon: "task_alt",
      iso: "2026-10-04T10:05:00Z",
      uuid: "3b95f0d-6e12-4a83-90c4",
      artifacts: [
        { tool: "jira", text: "PROJ-108" },
        { tool: "github", text: "PR #151 (draft)" },
      ],
    },
    {
      id: "p2-d",
      title: "PROJ-102 reference-only link does not qualify as an anchor",
      detail: "A REFERENCES edge exists but its eligibility is inferred — below the confirmed threshold.",
      elapsedMinutes: 400,
      occurrences30d: 9,
      fpRate: 0.04,
      icon: "hub",
      iso: "2026-10-08T07:55:00Z",
      uuid: "d6a2c71-9b48-4f60-a3e9",
      artifacts: [
        { tool: "jira", text: "PROJ-102" },
        { tool: "github", text: "contracts/events.ts" },
      ],
    },
    {
      id: "p2-e",
      title: "PROJ-97 anchored to src/shortcuts within 3h",
      detail: "Confirmed SATISFIES edge published before the grace window closed.",
      elapsedMinutes: 200,
      occurrences30d: 7,
      fpRate: 0.03,
      icon: "done_all",
      iso: "2026-10-06T12:30:00Z",
      uuid: "0f38be4-1d55-42aa-8b70",
      artifacts: [
        { tool: "jira", text: "PROJ-97" },
        { tool: "github", text: "PR #147 (unify-core)" },
      ],
    },
    {
      id: "p2-f",
      title: "PROJ-121 anchored minutes after sprint acceptance",
      detail: "Normal intake flow — the anchor attached ahead of schedule.",
      elapsedMinutes: 90,
      occurrences30d: 14,
      fpRate: 0.02,
      icon: "done_all",
      iso: "2026-10-08T11:05:00Z",
      uuid: "84c1d6a-7f23-4b95-9c18",
      artifacts: [{ tool: "jira", text: "PROJ-121" }],
    },
    {
      id: "p2-g",
      title: "PROJ-99 carries the exempt-sync label",
      detail: "Guard clause matched before the evaluation engine ran.",
      elapsedMinutes: 300,
      occurrences30d: 3,
      fpRate: 0,
      icon: "filter_alt_off",
      iso: "2026-10-03T15:20:00Z",
      uuid: "fa70213-48cd-4e16-b5d2",
      artifacts: [{ tool: "jira", text: "PROJ-99" }],
      guard: {
        clause: 'label = "exempt-sync"',
        text: 'ignored: ticket labeled "exempt-sync"',
      },
    },
  ],
  P3: [
    {
      id: "p3-a",
      title: "Button/tokens fill changed while tokens.css kept the old value",
      detail: "Content hash differs beyond formatting tolerance; anchored code untouched for 3.4 days.",
      elapsedMinutes: 5000,
      occurrences30d: 3,
      fpRate: 0,
      icon: "gpp_maybe",
      iso: "2026-09-28T13:00:00Z",
      uuid: "6c0b9e5-3a71-4d84-a2ff",
      artifacts: [
        { tool: "figma", text: "Button/tokens" },
        { tool: "github", text: "src/styles/tokens.css" },
      ],
    },
    {
      id: "p3-b",
      title: "Approved radius-lg token changed to 0.75rem in Figma",
      detail: "AST check confirms the implementation still resolves 0.5rem.",
      elapsedMinutes: 3000,
      occurrences30d: 4,
      fpRate: 0.03,
      icon: "palette",
      iso: "2026-10-02T06:45:00Z",
      uuid: "ba45d19-70c2-43ae-b673",
      artifacts: [
        { tool: "figma", text: "System Tokens / Radius" },
        { tool: "github", text: "tailwind.config.ts" },
      ],
    },
    {
      id: "p3-c",
      title: "Icon/24px grid re-drawn; anchored component unchanged",
      detail: "Design artifact re-published while the anchor resolved the previous geometry.",
      elapsedMinutes: 1300,
      occurrences30d: 6,
      fpRate: 0.04,
      icon: "difference",
      iso: "2026-10-05T22:10:00Z",
      uuid: "07fe83c-5b96-4d21-8a04",
      artifacts: [
        { tool: "figma", text: "Icon/24px" },
        { tool: "github", text: "src/components/Icon.tsx" },
      ],
    },
    {
      id: "p3-d",
      title: "CheckoutModal spacing spec updated ahead of code",
      detail: "Anchored frame moved; generated and vendor files excluded from the comparison set.",
      elapsedMinutes: 1700,
      occurrences30d: 8,
      fpRate: 0.05,
      icon: "draw",
      iso: "2026-10-04T19:30:00Z",
      uuid: "2297af6-1e40-4c88-95bd",
      artifacts: [
        { tool: "figma", text: "CheckoutModal_v3" },
        { tool: "github", text: "src/checkout/CheckoutModal.tsx" },
      ],
    },
    {
      id: "p3-e",
      title: "Typography scale update followed by a same-day code sync",
      detail: "Anchored implementation caught up inside the grace window.",
      elapsedMinutes: 600,
      occurrences30d: 12,
      fpRate: 0.03,
      icon: "done_all",
      iso: "2026-10-06T20:00:00Z",
      uuid: "91d3c08-4f77-4a0e-b28c",
      artifacts: [
        { tool: "figma", text: "Typography/Scale" },
        { tool: "github", text: "src/styles/type.css" },
      ],
    },
    {
      id: "p3-f",
      title: "Focus ring token re-published, code mirrored within 5h",
      detail: "No divergence persisted past the grace window.",
      elapsedMinutes: 300,
      occurrences30d: 9,
      fpRate: 0.02,
      icon: "done_all",
      iso: "2026-10-08T08:20:00Z",
      uuid: "58a4fe2-6d19-4b37-8015",
      artifacts: [
        { tool: "figma", text: "Tokens/Focus" },
        { tool: "github", text: "src/styles/tokens.css" },
      ],
    },
    {
      id: "p3-g",
      title: "Generated icon sprite re-exported from the design library",
      detail: "Guard clause matched before the evaluation engine ran.",
      elapsedMinutes: 2000,
      occurrences30d: 4,
      fpRate: 0,
      icon: "filter_alt_off",
      iso: "2026-10-03T11:45:00Z",
      uuid: "c9e6107-82b5-4f0d-a94e",
      artifacts: [
        { tool: "figma", text: "Icon/24px (generated)" },
        { tool: "github", text: "src/generated/sprite.svg" },
      ],
      guard: {
        clause: "path matches /generated/",
        text: "ignored: generated artifact (/generated/)",
      },
    },
  ],
  P4: [
    {
      id: "p4-a",
      title: "PROJ-88 acceptance criteria rewritten; CheckoutModal untouched",
      detail: "Requirement delta exceeds threshold while the anchored symbol stayed frozen.",
      elapsedMinutes: 500,
      occurrences30d: 2,
      fpRate: 0.05,
      icon: "gpp_maybe",
      iso: "2026-10-01T14:00:00Z",
      uuid: "e4b8091-5c26-4f73-88ea",
      artifacts: [
        { tool: "jira", text: "PROJ-88" },
        { tool: "github", text: "src/checkout/CheckoutModal.tsx" },
      ],
    },
    {
      id: "p4-b",
      title: "PROJ-74 scope narrowed after the implementation shipped",
      detail: "Anchor survived re-anchoring: symbol → content hash → diff hunk.",
      elapsedMinutes: 280,
      occurrences30d: 3,
      fpRate: 0.06,
      icon: "difference",
      iso: "2026-10-06T09:30:00Z",
      uuid: "1fc7a3d-9052-4e6b-9b37",
      artifacts: [
        { tool: "jira", text: "PROJ-74" },
        { tool: "github", text: "PR #139 (unify-web)" },
      ],
    },
    {
      id: "p4-c",
      title: "events/publish.ts changed with no requirement update",
      detail: "Anchored code moved; the linked requirement has no corresponding delta.",
      elapsedMinutes: 150,
      occurrences30d: 4,
      fpRate: 0.04,
      icon: "sync_problem",
      iso: "2026-10-07T20:15:00Z",
      uuid: "73d2ef0-4a81-4b59-8c62",
      artifacts: [
        { tool: "github", text: "services/events/publish.ts" },
        { tool: "jira", text: "PROJ-102" },
      ],
    },
    {
      id: "p4-d",
      title: "Checkout failure copy changed without PROJ-88 review",
      detail: "The diff hunk touches the anchored requirement region; formatting-only edits excluded.",
      elapsedMinutes: 90,
      occurrences30d: 6,
      fpRate: 0.05,
      icon: "hub",
      iso: "2026-10-08T06:40:00Z",
      uuid: "0a91b6c-3d47-4c92-a71f",
      artifacts: [
        { tool: "github", text: "src/checkout/PaymentFailure.tsx" },
        { tool: "jira", text: "PROJ-88" },
      ],
    },
    {
      id: "p4-e",
      title: "PROJ-91 criteria tightened; branch updated 45m later",
      detail: "Requirement and implementation converged inside the grace window.",
      elapsedMinutes: 45,
      occurrences30d: 8,
      fpRate: 0.03,
      icon: "done_all",
      iso: "2026-10-07T11:05:00Z",
      uuid: "bb3407f-8e12-4d6a-9f48",
      artifacts: [
        { tool: "jira", text: "PROJ-91" },
        { tool: "github", text: "feat/mute-thread" },
      ],
    },
    {
      id: "p4-f",
      title: "Watcher preference spec updated alongside its code change",
      detail: "Both sides moved together — no divergence recorded.",
      elapsedMinutes: 20,
      occurrences30d: 7,
      fpRate: 0.02,
      icon: "done_all",
      iso: "2026-10-08T10:50:00Z",
      uuid: "6e5d82a-1b93-4f07-84d5",
      artifacts: [
        { tool: "jira", text: "PROJ-93" },
        { tool: "github", text: "PR #144 (unify-web)" },
      ],
    },
    {
      id: "p4-g",
      title: "Prettier-only reformat of anchored files",
      detail: "Guard clause matched before the evaluation engine ran.",
      elapsedMinutes: 120,
      occurrences30d: 3,
      fpRate: 0,
      icon: "filter_alt_off",
      iso: "2026-10-05T16:10:00Z",
      uuid: "37c0f5b-6a28-4d91-8e03",
      artifacts: [{ tool: "github", text: "src/styles/tokens.css" }],
      guard: {
        clause: "AST-equal (formatting only)",
        text: "ignored: formatting-only edit (AST-equal)",
      },
    },
  ],
};

/** Expected delivery targets per policy — delivery-only, never a reasoning input. */
export const notifyMeta: Record<
  PolicyId,
  { channel: string; recipients: string[]; escalation: string }
> = {
  P1: {
    channel: "#change-assurance",
    recipients: ["@alex.r", "@sam.o"],
    escalation: "escalation lead after 2× grace",
  },
  P2: {
    channel: "#change-assurance",
    recipients: ["@haaniah.i"],
    escalation: "watcher digest after 24h",
  },
  P3: {
    channel: "#design-systems",
    recipients: ["@mishal.f"],
    escalation: "design review after 2× grace",
  },
  P4: {
    channel: "#change-assurance",
    recipients: ["@alex.r", "@sam.o"],
    escalation: "human approval required — no auto-resolve",
  },
};

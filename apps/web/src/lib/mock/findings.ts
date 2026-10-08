import type { CriterionResult, Finding } from "@/lib/types";

const criteriaCheckout: CriterionResult[] = [
  {
    criterionId: "AC-1",
    requirementRef: "PROJ-88",
    text: "Checkout modal must keep the three-step progress indicator when the payment form is collapsed.",
    verdict: "CONTRADICTED",
    freshness: "CURRENT",
    reviewRequired: true,
    evidence: [
      {
        locator: "src/checkout/CheckoutModal.tsx:118-141",
        excerpt:
          "const steps = collapsed ? ['cart'] : ['cart', 'payment', 'confirm']; // progress hidden while collapsed",
        tool: "github",
        resolved: true,
      },
      {
        locator: "figma://CheckoutModal_v3#step-indicator",
        excerpt: "Step indicator visible in both collapsed and expanded variants.",
        tool: "figma",
        resolved: true,
      },
    ],
    divergenceTag: "DESIGN_VS_CODE",
  },
  {
    criterionId: "AC-2",
    requirementRef: "PROJ-88",
    text: "Failure state must surface the retry action within the modal, not a toast.",
    verdict: "PARTIAL",
    freshness: "CURRENT",
    reviewRequired: false,
    evidence: [
      {
        locator: "src/checkout/PaymentFailure.tsx:44-67",
        excerpt: "showToast('Payment failed'); // retry lives on the parent page",
        tool: "github",
        resolved: true,
      },
    ],
    missingEvidence: ["No approved design frame covers the retry affordance."],
  },
  {
    criterionId: "AC-3",
    requirementRef: "PROJ-88",
    text: "Tokenised card fields are covered by the checkout regression suite.",
    verdict: "INSUFFICIENT_EVIDENCE",
    freshness: "STALE",
    reviewRequired: true,
    reasonCode: "SOURCE_STALE",
    evidence: [],
    missingEvidence: ["Latest coverage report predates the merge by 9 days."],
  },
];

const criteriaGhost: CriterionResult[] = [
  {
    criterionId: "AC-1",
    requirementRef: "PROJ-91",
    text: "Watchers can mute a single conflict thread without leaving the inbox.",
    verdict: "PARTIAL",
    freshness: "CURRENT",
    reviewRequired: true,
    evidence: [
      {
        locator: "src/notifications/muteThread.ts:12-38",
        excerpt: "export function muteThread(threadId: string) { /* local only */ }",
        tool: "github",
        resolved: true,
      },
    ],
    missingEvidence: ["No linked design frame for the mute affordance."],
  },
];

const criteriaSpec: CriterionResult[] = [
  {
    criterionId: "AC-1",
    requirementRef: "PROJ-74",
    text: "Design tokens referenced by the button component match the approved palette.",
    verdict: "CONTRADICTED",
    freshness: "CURRENT",
    reviewRequired: true,
    evidence: [
      {
        locator: "figma://Button/slots/fill → color/primary-40",
        excerpt: "Approved: primary-40 (#4f46e5). Code resolves: primary-30 (#6366f1).",
        tool: "figma",
        resolved: true,
      },
      {
        locator: "src/styles/tokens.css:18",
        excerpt: "--color-primary-30: #6366f1; /* referenced by Button root */",
        tool: "github",
        resolved: true,
      },
    ],
    divergenceTag: "TOKEN_DIVERGENCE",
  },
];

const criteriaSchema: CriterionResult[] = [
  {
    criterionId: "AC-1",
    requirementRef: "PROJ-102",
    text: "Emitting service and consuming contract agree on the `priority` field type.",
    verdict: "CONTRADICTED",
    freshness: "CURRENT",
    reviewRequired: true,
    evidence: [
      {
        locator: "services/events/publish.ts:61",
        excerpt: "priority: number; // 1..4",
        tool: "github",
        resolved: true,
      },
      {
        locator: "packages/contracts/events.ts:27",
        excerpt: "priority: 'P0' | 'P1' | 'P2';",
        tool: "github",
        resolved: true,
      },
    ],
    divergenceTag: "SCHEMA_SIGNATURE",
  },
];

export const findings: Finding[] = [
  {
    id: "CONF-1048",
    policy: "P1",
    policyTitle: "P1: Design Drift after PR Merge",
    title: "P1: Design Drift after PR Merge",
    severity: "critical",
    status: "open",
    artifacts: [
      { tool: "figma", label: "Figma component", ref: "CheckoutModal_v3" },
      { tool: "github", label: "GitHub pull request", ref: "#142 feat(chk): refactor" },
      { tool: "jira", label: "Jira ticket", ref: "PROJ-88" },
    ],
    ageLabel: "2h",
    createdAt: "2026-10-08T14:20:00Z",
    assignedTo: ["Alex Rivera", "Sam Okafor"],
    team: "Core Checkout",
    summary:
      "PR #142 merged the collapsed-state refactor while the approved Figma frame still shows the three-step indicator; the anchored criterion set now contradicts the design intent.",
    verdict: "CONTRADICTED",
    freshness: "CURRENT",
    reviewRequired: true,
    criteria: criteriaCheckout,
  },
  {
    id: "CONF-1047",
    policy: "P2",
    policyTitle: "P2: Ghost Ticket (No Code Attached)",
    title: "P2: Ghost Ticket (No Code Attached)",
    severity: "warning",
    status: "open",
    artifacts: [
      { tool: "jira", label: "Jira ticket", ref: "PROJ-91" },
      { tool: "github", label: "GitHub branch", ref: "feat/mute-thread" },
    ],
    ageLabel: "6h",
    createdAt: "2026-10-08T10:05:00Z",
    assignedTo: ["Haaniah Ismail"],
    team: "Frontend Infrastructure",
    summary:
      "Branch feat/mute-thread shipped with no linked ticket anchor, so the acceptance criteria cannot be traced to a code unit.",
    verdict: "PARTIAL",
    freshness: "CURRENT",
    reviewRequired: true,
    criteria: criteriaGhost,
  },
  {
    id: "CONF-1046",
    policy: "P3",
    policyTitle: "P3: Spec Outdated (Tokens Diverged)",
    title: "P3: Spec Outdated (Tokens Diverged)",
    severity: "warning",
    status: "open",
    artifacts: [
      { tool: "figma", label: "Figma library", ref: "Button/tokens" },
      { tool: "github", label: "GitHub file", ref: "tokens.css" },
    ],
    ageLabel: "1d",
    createdAt: "2026-10-07T16:40:00Z",
    assignedTo: ["Mishal Fatima"],
    team: "Design Systems Core",
    summary:
      "Approved palette was updated in the Figma library while code keeps resolving the previous primary-30 token.",
    verdict: "CONTRADICTED",
    freshness: "CURRENT",
    reviewRequired: true,
    criteria: criteriaSpec,
  },
  {
    id: "CONF-1045",
    policy: "P4",
    policyTitle: "P4: Schema Signature Mismatch",
    title: "P4: Schema Signature Mismatch",
    severity: "critical",
    status: "acknowledged",
    artifacts: [
      { tool: "github", label: "GitHub service", ref: "events/publish.ts" },
      { tool: "github", label: "GitHub contract", ref: "contracts/events.ts" },
    ],
    ageLabel: "1d",
    createdAt: "2026-10-07T11:12:00Z",
    assignedTo: ["Sam Okafor"],
    team: "Core Checkout",
    summary:
      "Producer emits a numeric priority while the shared contract declares a string union — both sides anchored and cited.",
    verdict: "CONTRADICTED",
    freshness: "CURRENT",
    reviewRequired: true,
    criteria: criteriaSchema,
  },
  {
    id: "CONF-1044",
    policy: "P1",
    policyTitle: "P1: Design Drift after PR Merge",
    title: "P1: Design Drift after PR Merge",
    severity: "info",
    status: "open",
    artifacts: [
      { tool: "figma", label: "Figma frame", ref: "Cart/EmptyState" },
      { tool: "github", label: "GitHub pull request", ref: "#139 fix(cart): copy" },
    ],
    ageLabel: "2d",
    createdAt: "2026-10-06T09:30:00Z",
    assignedTo: ["Haaniah Ismail"],
    team: "Growth & Experiments",
    summary:
      "Copy-only change diverges from the approved frame text; cosmetic rule check passed but the requirement anchor is stale.",
    verdict: "PARTIAL",
    freshness: "STALE",
    reviewRequired: true,
    criteria: [],
  },
  {
    id: "CONF-1043",
    policy: "P2",
    policyTitle: "P2: Ghost Ticket (No Code Attached)",
    title: "P2: Ghost Ticket (No Code Attached)",
    severity: "warning",
    status: "acknowledged",
    artifacts: [{ tool: "jira", label: "Jira ticket", ref: "PROJ-102" }],
    ageLabel: "3d",
    createdAt: "2026-10-05T13:00:00Z",
    assignedTo: ["Mishal Fatima"],
    team: "Frontend Infrastructure",
    summary: "Ticket accepted into the sprint with no anchored implementation yet.",
    verdict: "INSUFFICIENT_EVIDENCE",
    freshness: "UNKNOWN",
    reviewRequired: true,
    reasonCode: undefined,
    criteria: [],
  },
  {
    id: "CONF-1042",
    policy: "P1",
    policyTitle: "P1: Design Drift after PR Merge",
    title: "P1: Design Drift after PR Merge",
    severity: "info",
    status: "resolved",
    artifacts: [
      { tool: "figma", label: "Figma frame", ref: "Profile/WatcherPrefs" },
      { tool: "github", label: "GitHub pull request", ref: "#131 fix(profile)" },
    ],
    ageLabel: "4d",
    createdAt: "2026-10-04T08:15:00Z",
    assignedTo: ["Alex Rivera"],
    team: "Design Systems Core",
    summary: "Design frame re-published and re-anchored; finding resolved with a cited re-anchor.",
    verdict: "SUPPORTED",
    freshness: "CURRENT",
    reviewRequired: false,
    criteria: [],
  },
  {
    id: "CONF-1041",
    policy: "P3",
    policyTitle: "P3: Spec Outdated (Tokens Diverged)",
    title: "P3: Spec Outdated (Tokens Diverged)",
    severity: "info",
    status: "suppressed",
    artifacts: [{ tool: "figma", label: "Figma library", ref: "Icon/24px" }],
    ageLabel: "5d",
    createdAt: "2026-10-03T15:45:00Z",
    assignedTo: ["Mishal Fatima"],
    team: "Design Systems Core",
    summary: "Generated icon set — suppressed with reason `GENERATED_ARTIFACT`.",
    verdict: "INSUFFICIENT_EVIDENCE",
    freshness: "CURRENT",
    reviewRequired: false,
    criteria: [],
  },
];

export function getFinding(id: string): Finding | undefined {
  return findings.find((f) => f.id === id);
}

export const findingsByStatus = {
  all: findings.length,
  open: findings.filter((f) => f.status === "open").length,
  acknowledged: findings.filter((f) => f.status === "acknowledged").length,
  resolved: findings.filter((f) => f.status === "resolved").length,
  suppressed: findings.filter((f) => f.status === "suppressed").length,
};

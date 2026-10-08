import type { EvalMetric, GraphModel, Policy } from "@/lib/types";

export const policies: Policy[] = [
  {
    id: "P1",
    name: "Design Drift after PR Merge",
    description:
      "A merged code change moves an anchored symbol away from the approved design intent while the linked requirement is unchanged.",
    trigger: "github.pull_request.merged",
    guards: [
      "both artifacts CURRENT (not STALE)",
      "link eligibility ≥ confirmed",
      "diff touches an anchored symbol, not formatting only",
      "grace period elapsed since merge",
    ],
    graceMinutes: 30,
    severity: "critical",
    notifyTemplate: "drift_after_merge.v1",
    enabled: true,
    firedLast7d: 14,
  },
  {
    id: "P2",
    name: "Ghost Ticket (No Code Attached)",
    description:
      "Accepted work enters the workflow with no eligible anchor to a code unit or test.",
    trigger: "jira.issue.updated",
    guards: [
      "canonical state ∈ {IN_PROGRESS, IN_REVIEW}",
      "no confirmed SATISFIES edge after grace period",
      "reconciliation pass completed",
    ],
    graceMinutes: 240,
    severity: "warning",
    notifyTemplate: "ghost_ticket.v1",
    enabled: true,
    firedLast7d: 6,
  },
  {
    id: "P3",
    name: "Spec Outdated (Tokens Diverged)",
    description:
      "Approved design artifact changes materially while the anchored implementation keeps resolving the previous value.",
    trigger: "figma.asset.updated",
    guards: [
      "content hash differs beyond formatting tolerance",
      "anchored code unchanged past grace",
      "generated/vendor files excluded",
    ],
    graceMinutes: 1440,
    severity: "warning",
    notifyTemplate: "spec_outdated.v1",
    enabled: true,
    firedLast7d: 3,
  },
  {
    id: "P4",
    name: "Requirement / Implementation Divergence",
    description:
      "Requirement text changes materially while anchored code is untouched, or anchored code changes with no linked requirement update.",
    trigger: "jira.issue.updated | github.pull_request.merged",
    guards: [
      "anchor survives re-anchoring (symbol → content hash → diff hunk)",
      "formatting-only edits ignored",
      "generated files excluded",
    ],
    graceMinutes: 60,
    severity: "critical",
    notifyTemplate: "requirement_divergence.v1",
    enabled: false,
    firedLast7d: 2,
  },
];

export const evalMetrics: EvalMetric[] = [
  { id: "em-1", label: "Verdict F1 (dev split)", value: "0.83", target: "≥ 0.80", status: "pass" },
  { id: "em-2", label: "Citation resolution", value: "100%", target: "100%", status: "pass" },
  { id: "em-3", label: "Temp-0 run agreement", value: "96.4%", target: "≥ 95%", status: "pass" },
  { id: "em-4", label: "p95 verdict latency", value: "8.2s", target: "≤ 10s", status: "pass" },
  { id: "em-5", label: "Abstention rate", value: "11%", target: "≤ 15%", status: "pass" },
  { id: "em-6", label: "Anchor survival (7 commits)", value: "0.91", target: "≥ 0.95", status: "watch" },
  { id: "em-7", label: "Schema violation rate", value: "0.4%", target: "≤ 1%", status: "pass" },
  { id: "em-8", label: "Recall@k (symbol retrieval)", value: "0.78", target: "≥ 0.85", status: "fail" },
];

export const graph: GraphModel = {
  nodes: [
    { id: "REQ-88", label: "PROJ-88", kind: "requirement", tool: "jira", x: 120, y: 90 },
    { id: "FIG-1", label: "CheckoutModal_v3", kind: "design", tool: "figma", x: 120, y: 240 },
    { id: "PR-142", label: "PR #142", kind: "pr", tool: "github", x: 350, y: 90 },
    { id: "CODE-1", label: "CheckoutModal.tsx", kind: "code", tool: "github", x: 350, y: 230 },
    { id: "TEST-1", label: "checkout.spec.ts", kind: "test", tool: "github", x: 350, y: 370 },
    { id: "CONF-1048", label: "CONF-1048", kind: "finding", x: 590, y: 230 },
    { id: "REQ-74", label: "PROJ-74", kind: "requirement", tool: "jira", x: 120, y: 400 },
    { id: "FIG-2", label: "Button/tokens", kind: "design", tool: "figma", x: 590, y: 400 },
  ],
  edges: [
    { from: "REQ-88", to: "PR-142", label: "REFERENCES", eligible: true },
    { from: "REQ-88", to: "CODE-1", label: "SATISFIES", eligible: true },
    { from: "FIG-1", to: "CODE-1", label: "IMPLEMENTS", eligible: true },
    { from: "TEST-1", to: "CODE-1", label: "VERIFIES", eligible: false },
    { from: "CODE-1", to: "CONF-1048", label: "TRIGGERS", eligible: true },
    { from: "REQ-74", to: "FIG-2", label: "SATISFIES", eligible: true },
  ],
};

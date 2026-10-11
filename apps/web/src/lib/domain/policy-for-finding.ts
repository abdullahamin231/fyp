import type { Finding, Policy } from "@/lib/types";

/**
 * The policy behind a finding, as the detail screen renders it.
 *
 * Findings have two origins and the UI was drawn around the four proposal
 * policies, so this maps each onto the closest policy *without pretending* a
 * verifier run was a policy rule: the description says what actually produced
 * the finding. `policyId` on the finding is the map key; everything else here
 * is presentation for the sections that expect a `Policy`.
 */
export function policyForFinding(finding: Finding): Policy {
  const base = {
    severity: finding.severity,
    enabled: true,
    firedLast7d: 0,
  };

  switch (finding.policy) {
    case "P1":
      return {
        ...base,
        id: "P1",
        name: "Design drift after PR merge",
        description:
          "A merged change left the linked design artefact behind past the grace window.",
        trigger: "rule · edge.updated (RULE_1)",
        guards: [
          "sources are CURRENT",
          "change is design-relevant",
          "merged change observable for 24h",
        ],
        graceMinutes: 1440,
        notifyTemplate: "rule_1_design_version_drift",
      };
    case "P2":
      return {
        ...base,
        id: "P2",
        name: "Ghost ticket / workflow inconsistency",
        description: "Ticket and change disagree about whether the work exists.",
        trigger: "rule · node.updated (RULE_2)",
        guards: ["ticket state is not terminal", "code has moved"],
        graceMinutes: 240,
        notifyTemplate: "rule_2_workflow_state",
      };
    case "P3":
      return {
        ...base,
        id: "P3",
        name: "Overlapping change scope",
        description: "Two changes touch the same components without a shared ticket.",
        trigger: "rule · edge.updated (RULE_3)",
        guards: ["components overlap", "no shared parent ticket"],
        graceMinutes: 60,
        notifyTemplate: "rule_3_scope_overlap",
      };
    default:
      return {
        ...base,
        id: "P4",
        name: "Criterion verification",
        description:
          "A verification job judged one atomic criterion against an immutable evidence " +
          "packet; the deterministic gate decides what the verdict is allowed to claim.",
        trigger: "verification job finished",
        guards: [
          "every citation resolves against the packet (FR-10)",
          "sources are CURRENT, else freshness is recorded separately",
          "a decisive verdict cites at least one span",
          "the gate may only lower a status",
        ],
        graceMinutes: 0,
        notifyTemplate: "verdict_case_opened",
      };
  }
}

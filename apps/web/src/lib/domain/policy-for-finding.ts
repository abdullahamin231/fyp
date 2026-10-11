import { RULE_META } from "@unify/contracts";
import type { Finding, Policy } from "@/lib/types";

/**
 * The policy behind a finding, as the detail screen renders it.
 *
 * Findings have two origins. A rule-origin finding names a committed rule, so
 * its `Policy` is derived from `RULE_META` — the single source of truth for the
 * rule's title, description, guards, grace period and notify template. A
 * verdict-origin finding is not a policy rule at all, so it gets its own
 * "Criterion verification" presentation rather than pretending to be one.
 */
export function policyForFinding(finding: Finding): Policy {
  const base = {
    severity: finding.severity,
    enabled: true,
    firedLast7d: 0,
  };

  const meta = finding.policy ? RULE_META[finding.policy] : undefined;
  if (meta) {
    return {
      ...base,
      id: meta.id,
      name: meta.title,
      description: meta.description,
      trigger: meta.trigger,
      guards: meta.guards,
      graceMinutes: meta.gracePeriodHours * 60,
      notifyTemplate: meta.notifyTemplate,
    };
  }

  return {
    ...base,
    id: "criterion_verification",
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

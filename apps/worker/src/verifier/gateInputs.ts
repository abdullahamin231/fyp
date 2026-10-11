import { isDecisiveEligibleEdge, type FreshnessState } from "@unify/contracts";
import type { LinkPolicy } from "../graph/nodes.js";
import type { ProviderSummary } from "../packet/provider.js";

/**
 * Gate inputs derived from the graph (§11.8 check 3, FR-05, FR-10, FR-28).
 *
 * Pure on purpose: the worker computes these once per job from what the
 * provider actually read, and the tests can drive the gate with them directly
 * without a database.
 *
 *  · `ruleApplicable` — the criterion says the governing rule applies
 *  · `linksEligible`   — every criterion-incident link the verdict would rest
 *                       on is decisive-eligible (confirmed or
 *                       system-confirmed, never an unresolved candidate)
 *  · `thresholdsOk`    — every such link clears the workspace's lower
 *                       confirmation band (FR-28's silent-suggestion floor)
 *  · `freshnessState`  — stale sources make a criterion show no verdict (UC-01)
 */
export interface GateInputs {
  ruleApplicable: boolean;
  linksEligible: boolean;
  thresholdsOk: boolean;
  freshnessState: FreshnessState;
}

export function gateInputsFrom(summary: ProviderSummary, policy: LinkPolicy): GateInputs {
  const edges = summary.supportingEdges;
  const linksEligible = edges.every((edge) =>
    isDecisiveEligibleEdge({
      sourceClass: edge.sourceClass,
      linkState: edge.linkState,
      resolver: edge.resolver,
    }),
  );
  const thresholdsOk = edges.every((edge) => edge.confidence >= policy.lower);
  return {
    ruleApplicable: summary.ruleApplicable,
    linksEligible,
    thresholdsOk,
    freshnessState: summary.freshnessState,
  };
}

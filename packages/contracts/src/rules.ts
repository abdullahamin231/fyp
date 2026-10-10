import { ruleSchema, type Rule } from "./rule.js";

/**
 * The committed deterministic policy records.
 *
 * These are data, not executable rule logic. The worker evaluates `guards` and
 * `condition` against a normalized delta and records this id/version on any
 * finding it creates.
 */
export const RULE_1_DESIGN_VERSION_DRIFT = {
  id: "RULE_1",
  version: 1,
  edgeType: "IMPLEMENTS",
  trigger: { on: "edge.updated", entityType: "PullRequest" },
  guards: [
    {
      path: "source.freshness",
      op: "eq",
      value: "CURRENT",
      description: "the linked implementation and design sources are current",
    },
    {
      path: "delta.changeKind",
      op: "not_in",
      value: ["formatting_only", "generated_file"],
      description: "the change has design-relevant content",
    },
    {
      path: "delta.mergedAt",
      op: "unchanged_for",
      hours: 24,
      description: "the merged change has remained observable for the grace period",
    },
  ],
  condition:
    "delta.pullRequest.merged && edge.linkState == 'active' && edge.sourceClass in ['observed', 'derived'] && delta.designVersion != edge.metadata.designVersion",
  gracePeriodHours: 24,
  produces: "design_version_drift",
  severity: "high",
  notify: {
    channels: ["slack", "in_app"],
    roles: ["developer", "designer"],
    hops: 2,
    template: "rule_1_design_version_drift",
  },
  resolutionOptions: ["acknowledge", "resolve", "dispute"],
  active: true,
} satisfies Rule;

export const RULE_2_WORKFLOW_STATE_INCONSISTENCY = {
  id: "RULE_2",
  version: 1,
  edgeType: "IMPLEMENTS",
  trigger: { on: "node.updated", entityType: "PullRequest" },
  guards: [
    {
      path: "delta.workflowState",
      op: "in",
      value: ["MERGED", "CLOSED"],
      description: "the change has reached a terminal code-review state",
    },
    {
      path: "delta.sourceFreshness",
      op: "eq",
      value: "CURRENT",
      description: "the work-item source was reconciled before evaluation",
    },
    {
      path: "delta.completedAt",
      op: "unchanged_for",
      hours: 4,
      description: "the terminal state has exceeded the workflow grace period",
    },
  ],
  condition:
    "delta.pullRequest.workflowState in ['MERGED', 'CLOSED'] && delta.ticket.canonicalState not in workspace.workflowStateMap.acceptableAfterMerge",
  gracePeriodHours: 4,
  produces: "workflow_state_inconsistency",
  severity: "medium",
  notify: {
    channels: ["slack", "in_app"],
    roles: ["developer", "pm"],
    hops: 2,
    template: "rule_2_workflow_state_inconsistency",
  },
  resolutionOptions: ["acknowledge", "resolve", "dispute"],
  active: true,
} satisfies Rule;

export const RULE_3_OVERLAPPING_CHANGE_SCOPE = {
  id: "RULE_3",
  version: 1,
  edgeType: "TOUCHES_COMPONENT",
  trigger: { on: "edge.created", entityType: "PullRequest" },
  guards: [
    {
      path: "delta.scope.overlapRatio",
      op: "gte",
      value: 0.5,
      description: "the two active changes overlap materially in their touched scope",
    },
    {
      path: "delta.scope.fileClass",
      op: "not_in",
      value: ["generated", "vendor"],
      description: "generated and vendor files are excluded from overlap analysis",
    },
    {
      path: "delta.otherPullRequest.state",
      op: "in",
      value: ["OPEN", "IN_REVIEW"],
      description: "the overlapping change is still active",
    },
  ],
  condition:
    "delta.pullRequest.state in ['OPEN', 'IN_REVIEW'] && delta.otherPullRequest.state in ['OPEN', 'IN_REVIEW'] && delta.scope.overlapRatio >= 0.5",
  gracePeriodHours: 0,
  produces: "overlapping_change_scope",
  severity: "medium",
  notify: {
    channels: ["slack", "in_app"],
    roles: ["developer", "reviewer"],
    hops: 2,
    template: "rule_3_overlapping_change_scope",
  },
  resolutionOptions: ["acknowledge", "resolve", "dispute"],
  active: true,
} satisfies Rule;

export const COMMITTED_RULES = [
  RULE_1_DESIGN_VERSION_DRIFT,
  RULE_2_WORKFLOW_STATE_INCONSISTENCY,
  RULE_3_OVERLAPPING_CHANGE_SCOPE,
] as const satisfies readonly Rule[];

/** Validate the committed records at module load and expose schema-shaped data. */
export const committedRules: readonly Rule[] = COMMITTED_RULES.map((rule) =>
  ruleSchema.parse(rule),
);

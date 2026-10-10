-- =============================================================================
-- UNIFY — 00009: committed deterministic rules
--
-- The TypeScript records in packages/contracts/src/rules.ts are the readable
-- source of truth. This migration mirrors them into the versioned rules table
-- used by the worker. Findings store (rule_id, rule_version), so later changes
-- must insert a new version rather than update an existing record.
-- =============================================================================

insert into public.rules (
  id,
  version,
  edge_type,
  trigger,
  guards,
  condition,
  grace_period_hours,
  produces,
  severity,
  notify,
  resolution_options,
  active
)
values
(
  'RULE_1',
  1,
  'IMPLEMENTS',
  '{"on":"edge.updated","entityType":"PullRequest"}'::jsonb,
  '[
    {"path":"source.freshness","op":"eq","value":"CURRENT","description":"the linked implementation and design sources are current"},
    {"path":"delta.changeKind","op":"not_in","value":["formatting_only","generated_file"],"description":"the change has design-relevant content"},
    {"path":"delta.mergedAt","op":"unchanged_for","hours":24,"description":"the merged change has remained observable for the grace period"}
  ]'::jsonb,
  'delta.pullRequest.merged && edge.linkState == ''active'' && edge.sourceClass in [''observed'', ''derived''] && delta.designVersion != edge.metadata.designVersion',
  24,
  'design_version_drift',
  'high',
  '{"channels":["slack","in_app"],"roles":["developer","designer"],"hops":2,"template":"rule_1_design_version_drift"}'::jsonb,
  array['acknowledge', 'resolve', 'dispute'],
  true
),
(
  'RULE_2',
  1,
  'IMPLEMENTS',
  '{"on":"node.updated","entityType":"PullRequest"}'::jsonb,
  '[
    {"path":"delta.workflowState","op":"in","value":["MERGED","CLOSED"],"description":"the change has reached a terminal code-review state"},
    {"path":"delta.sourceFreshness","op":"eq","value":"CURRENT","description":"the work-item source was reconciled before evaluation"},
    {"path":"delta.completedAt","op":"unchanged_for","hours":4,"description":"the terminal state has exceeded the workflow grace period"}
  ]'::jsonb,
  'delta.pullRequest.workflowState in [''MERGED'', ''CLOSED''] && delta.ticket.canonicalState not in workspace.workflowStateMap.acceptableAfterMerge',
  4,
  'workflow_state_inconsistency',
  'medium',
  '{"channels":["slack","in_app"],"roles":["developer","pm"],"hops":2,"template":"rule_2_workflow_state_inconsistency"}'::jsonb,
  array['acknowledge', 'resolve', 'dispute'],
  true
),
(
  'RULE_3',
  1,
  'TOUCHES_COMPONENT',
  '{"on":"edge.created","entityType":"PullRequest"}'::jsonb,
  '[
    {"path":"delta.scope.overlapRatio","op":"gte","value":0.5,"description":"the two active changes overlap materially in their touched scope"},
    {"path":"delta.scope.fileClass","op":"not_in","value":["generated","vendor"],"description":"generated and vendor files are excluded from overlap analysis"},
    {"path":"delta.otherPullRequest.state","op":"in","value":["OPEN","IN_REVIEW"],"description":"the overlapping change is still active"}
  ]'::jsonb,
  'delta.pullRequest.state in [''OPEN'', ''IN_REVIEW''] && delta.otherPullRequest.state in [''OPEN'', ''IN_REVIEW''] && delta.scope.overlapRatio >= 0.5',
  0,
  'overlapping_change_scope',
  'medium',
  '{"channels":["slack","in_app"],"roles":["developer","reviewer"],"hops":2,"template":"rule_3_overlapping_change_scope"}'::jsonb,
  array['acknowledge', 'resolve', 'dispute'],
  true
)
on conflict (id, version) do nothing;

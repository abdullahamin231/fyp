import type { Rule } from "./rule.js";
import { committedRules } from "./rules.js";

/**
 * Presentation metadata for a committed rule, derived from the rule record so
 * the reviewer surface never re-types a title, guard or grace window (candidate
 * 1 of the architecture review).
 *
 * The rule record is the single source of truth; this module is a *view* over
 * it, not a second copy. `guards` are the human-readable `guard.description`
 * strings, `trigger` is a display label, and `gracePeriodHours` is the deployed
 * value (the simulation lab's "what-if" candidate windows are a separate,
 * deliberately non-deployed config).
 */
export interface RuleMeta {
  id: string;
  title: string;
  description: string;
  /** Display label, e.g. `rule · edge.updated (RULE_1)`. */
  trigger: string;
  /** Human-readable guard restatements, in record order. */
  guards: string[];
  gracePeriodHours: number;
  notifyTemplate: string;
  severity: Rule["severity"];
  produces: Rule["produces"];
}

function ruleMetaFor(rule: Rule): RuleMeta {
  return {
    id: rule.id,
    title: rule.title,
    description: rule.description,
    trigger: `rule · ${rule.trigger.on} (${rule.id})`,
    guards: rule.guards.map((guard) => guard.description),
    gracePeriodHours: rule.gracePeriodHours,
    notifyTemplate: rule.notify.template,
    severity: rule.severity,
    produces: rule.produces,
  };
}

/** Committed rule id → its presentation metadata. Keyed by rule id, not version. */
export const RULE_META: Readonly<Record<string, RuleMeta>> = Object.fromEntries(
  committedRules.map((rule) => [rule.id, ruleMetaFor(rule)]),
);

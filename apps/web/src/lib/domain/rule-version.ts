import { SEVERITIES, type Severity as DbSeverity } from "@unify/contracts";
import type { RuleRow } from "@/lib/data/rules";

/** What a reviewer may change on a rule. Trigger, guards and condition are code, not settings. */
export interface RuleEdits {
  gracePeriodHours: number;
  severity: DbSeverity;
  notifyTemplate: string;
  active: boolean;
}

export const RULE_SEVERITIES: readonly DbSeverity[] = SEVERITIES;

/**
 * The row to insert as the rule's next version, or the reason there is none.
 * Rules are append-only by version (primary key `(id, version)`): saving never
 * rewrites history, it adds a version the engines then read as the latest.
 */
export function nextRuleVersion(latest: RuleRow, edits: RuleEdits): { row: RuleRow } | { error: string } {
  if (!Number.isInteger(edits.gracePeriodHours) || edits.gracePeriodHours < 0) {
    return { error: "Grace period must be a whole number of hours, zero or more." };
  }
  if (!RULE_SEVERITIES.includes(edits.severity)) return { error: `Unknown severity ${edits.severity}.` };
  const template = edits.notifyTemplate.trim();
  if (!template) return { error: "The notification template cannot be empty." };
  const unchanged =
    latest.grace_period_hours === edits.gracePeriodHours &&
    latest.severity === edits.severity &&
    latest.notify.template === template &&
    latest.active === edits.active;
  if (unchanged) return { error: "Nothing changed." };
  return {
    row: {
      ...latest,
      version: latest.version + 1,
      grace_period_hours: edits.gracePeriodHours,
      severity: edits.severity,
      notify: { ...latest.notify, template },
      active: edits.active,
    },
  };
}

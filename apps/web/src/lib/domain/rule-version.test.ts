import { describe, expect, it } from "vitest";
import type { RuleRow } from "@/lib/data/rules";
import { nextRuleVersion, type RuleEdits } from "./rule-version";

const latest: RuleRow = {
  id: "RULE_2",
  version: 3,
  edge_type: "TRACKS",
  trigger: { on: "state_change", entityType: "PullRequest" },
  guards: [],
  condition: "pr.merged and ticket.category != done",
  grace_period_hours: 4,
  produces: "workflow_inconsistency",
  severity: "medium",
  notify: { channels: ["slack"], roles: ["owner"], hops: 1, template: "{pr} merged but {ticket} open" },
  active: true,
};

const same: RuleEdits = { gracePeriodHours: 4, severity: "medium", notifyTemplate: "{pr} merged but {ticket} open", active: true };

describe("nextRuleVersion", () => {
  it("adds a version with the edits and keeps everything else", () => {
    const next = nextRuleVersion(latest, { ...same, gracePeriodHours: 8, active: false });
    expect(next).toEqual({ row: { ...latest, version: 4, grace_period_hours: 8, active: false } });
  });

  it("trims the template and keeps the routing", () => {
    const next = nextRuleVersion(latest, { ...same, notifyTemplate: "  new text  " });
    expect("row" in next && next.row.notify).toEqual({ ...latest.notify, template: "new text" });
  });

  it("refuses a save that changes nothing, a negative or fractional grace, or an empty template", () => {
    expect(nextRuleVersion(latest, same)).toEqual({ error: "Nothing changed." });
    expect(nextRuleVersion(latest, { ...same, gracePeriodHours: -1 })).toHaveProperty("error");
    expect(nextRuleVersion(latest, { ...same, gracePeriodHours: 1.5 })).toHaveProperty("error");
    expect(nextRuleVersion(latest, { ...same, notifyTemplate: "   " })).toHaveProperty("error");
  });
});

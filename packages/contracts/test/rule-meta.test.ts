import { describe, expect, it } from "vitest";
import { committedRules, RULE_META } from "../src/index.js";

describe("rule metadata", () => {
  it("has one entry per committed rule, keyed by rule id", () => {
    expect(Object.keys(RULE_META).sort()).toEqual(
      committedRules.map((rule) => rule.id).sort(),
    );
  });

  it("derives guards from the rule's guard descriptions", () => {
    for (const rule of committedRules) {
      expect(RULE_META[rule.id].guards).toEqual(rule.guards.map((guard) => guard.description));
    }
  });

  it("carries the deployed grace period, not a re-typed copy", () => {
    for (const rule of committedRules) {
      expect(RULE_META[rule.id].gracePeriodHours).toBe(rule.gracePeriodHours);
    }
  });

  it("exposes a non-empty title and description for every rule", () => {
    for (const rule of committedRules) {
      expect(RULE_META[rule.id].title.length).toBeGreaterThan(0);
      expect(RULE_META[rule.id].description.length).toBeGreaterThan(0);
    }
  });

  it("names the notify template and finding kind the rule produces", () => {
    for (const rule of committedRules) {
      expect(RULE_META[rule.id].notifyTemplate).toBe(rule.notify.template);
      expect(RULE_META[rule.id].produces).toBe(rule.produces);
    }
  });
});

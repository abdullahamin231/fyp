import { describe, expect, it } from "vitest";
import {
  COMMITTED_RULES,
  guardSchema,
  ruleSchema,
  committedRules,
} from "../src/index.js";
import { baseRule } from "./fixtures.js";

describe("rule guards", () => {
  it("requires hours for unchanged_for", () => {
    const guard = { path: "status", op: "unchanged_for", description: "state has not moved" };
    expect(guardSchema.safeParse(guard).success).toBe(false);
  });

  it("accepts unchanged_for with an hours window", () => {
    const guard = { path: "status", op: "unchanged_for", hours: 48, description: "stuck for 48h" };
    expect(guardSchema.safeParse(guard).success).toBe(true);
  });

  it("rejects hours on any other op", () => {
    const guard = { path: "status", op: "eq", value: "open", hours: 12, description: "state is open" };
    expect(guardSchema.safeParse(guard).success).toBe(false);
  });
});

describe("versioned rule records", () => {
  it("ships the three committed rules at explicit versions", () => {
    expect(COMMITTED_RULES.map((rule) => `${rule.id}@${rule.version}`)).toEqual([
      "RULE_1@1",
      "RULE_2@1",
      "RULE_3@1",
    ]);
    expect(committedRules).toHaveLength(3);
    expect(new Set(committedRules.map((rule) => rule.produces)).size).toBe(3);
  });

  it("keeps every committed record valid against the shared rule schema", () => {
    for (const rule of COMMITTED_RULES) {
      expect(ruleSchema.safeParse(rule).success).toBe(true);
    }
  });

  it("parses Rule 1 with its notification routing", () => {
    const rule = ruleSchema.parse(baseRule());
    expect(rule.produces).toBe("design_version_drift");
    expect(rule.notify.hops).toBeLessThanOrEqual(2);
  });

  it("rejects a notification hop bound beyond the committed bound", () => {
    const rule = baseRule({ notify: { ...baseRule().notify, hops: 3 } });
    expect(ruleSchema.safeParse(rule).success).toBe(false);
  });

  it("requires at least one resolution option", () => {
    expect(ruleSchema.safeParse(baseRule({ resolutionOptions: [] })).success).toBe(false);
  });

  it("allows a rule that subscribes by entity only", () => {
    expect(ruleSchema.safeParse(baseRule({ edgeType: null })).success).toBe(true);
  });

  it("rejects an unknown finding kind", () => {
    expect(ruleSchema.safeParse(baseRule({ produces: "vibe_drift" as never })).success).toBe(false);
  });
});

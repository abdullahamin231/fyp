import { describe, expect, it, vi } from "vitest";
import { fakeSupabase, type FakeSupabase } from "@/test/fake-supabase";

let fake: FakeSupabase;
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => fake.client }));

const { listRules } = await import("./rules");

const rule = (id: string, version: number, extra: Record<string, unknown> = {}) => ({
  id,
  version,
  edge_type: "IMPLEMENTS",
  trigger: { on: "edge.updated", entityType: "PullRequest" },
  guards: [{ path: "a", op: "eq", description: "guard" }],
  condition: "true",
  grace_period_hours: 24,
  produces: "design_version_drift",
  severity: "high",
  notify: { channels: ["in_app"], roles: ["developer"], hops: 1, template: "t" },
  active: true,
  ...extra,
});

describe("listRules", () => {
  it("shows the latest version of each rule with its contracts title and 7-day firing count", async () => {
    fake = fakeSupabase({
      tables: {
        rules: [rule("RULE_1", 1, { active: false }), rule("RULE_1", 2, { grace_period_hours: 48 }), rule("RULE_2", 1)],
        findings: [
          { id: "f1", rule_id: "RULE_1", created_at: "2026-10-16T00:00:00Z" },
          { id: "f2", rule_id: "RULE_1", created_at: "2026-10-01T00:00:00Z" },
          { id: "f3", rule_id: "RULE_2", created_at: "2026-10-15T00:00:00Z" },
        ],
      },
    });
    const rules = await listRules(new Date("2026-10-17T00:00:00Z"));
    expect(rules.map((r) => [r.id, r.version, r.versionCount, r.gracePeriodHours, r.active, r.fired7d])).toEqual([
      ["RULE_1", 2, 2, 48, true, 1],
      ["RULE_2", 1, 1, 24, true, 1],
    ]);
    expect(rules[0].title).toBe("Design drift after PR merge");
  });
});

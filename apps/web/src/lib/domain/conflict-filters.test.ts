import { describe, expect, it } from "vitest";
import type { Finding } from "@/lib/types";
import { applyConflictFilters, conflictsCsv, parseConflictFilters, ruleOptions } from "./conflict-filters";

const finding = (over: Partial<Finding>): Finding =>
  ({
    id: "f1",
    policy: "RULE_2",
    policyTitle: "Workflow inconsistency",
    title: "PR merged, ticket open",
    severity: "warning",
    status: "open",
    artifacts: [{ tool: "jira", ref: "UNI-7", label: "Ticket" }],
    ageLabel: "2h",
    createdAt: "2026-10-19T00:00:00Z",
    assignedTo: [],
    team: "",
    summary: "",
    freshness: "CURRENT",
    reviewRequired: false,
    criteria: [],
    ...over,
  }) as Finding;

const all = [
  finding({}),
  finding({ id: "f2", policy: null, policyTitle: "Criterion verification", severity: "critical", status: "resolved", artifacts: [{ tool: "github", ref: "#48", label: "PR" }] }),
];

describe("conflict filters", () => {
  it("parse from the URL, ignoring values the inbox does not know", () => {
    expect(parseConflictFilters({ status: "resolved", severity: "bogus", rule: "RULE_2", q: "  UNI-7 " })).toEqual({
      status: "resolved",
      severity: "all",
      rule: "RULE_2",
      q: "UNI-7",
    });
    expect(parseConflictFilters({})).toEqual({ status: "all", severity: "all", rule: "all", q: "" });
  });

  it("combine status, severity, rule and text", () => {
    const base = parseConflictFilters({});
    expect(applyConflictFilters(all, { ...base, status: "resolved" }).map((f) => f.id)).toEqual(["f2"]);
    expect(applyConflictFilters(all, { ...base, rule: "verdict" }).map((f) => f.id)).toEqual(["f2"]);
    expect(applyConflictFilters(all, { ...base, q: "uni-7" }).map((f) => f.id)).toEqual(["f1"]);
    expect(applyConflictFilters(all, { ...base, severity: "critical", rule: "RULE_2" })).toEqual([]);
  });

  it("offer only the rules present, and export rows as CSV", () => {
    expect(ruleOptions(all)).toEqual([
      { value: "verdict", label: "Criterion verification" },
      { value: "RULE_2", label: "RULE_2: Workflow inconsistency" },
    ]);
    expect(conflictsCsv([all[0]!]).split("\n")[1]).toBe("f1,warning,open,RULE_2,\"PR merged, ticket open\",UNI-7,2026-10-19T00:00:00Z");
  });
});

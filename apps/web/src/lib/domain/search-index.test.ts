import { describe, expect, it } from "vitest";
import type { RuleView } from "@/lib/data/rules";
import type { Finding } from "@/lib/types";
import type { ExplorerGraph, ExplorerNode } from "./graph";
import { buildSearchIndex, tokenSuggestionsFor } from "./search-index";

const NOW = new Date("2026-10-19T12:00:00Z");
const node = (id: string, label: string, tool: "jira" | "github"): ExplorerNode =>
  ({ id, label, kind: "requirement", tool, x: 0, y: 0, kindLabel: "Jira Ticket", subtitle: "", meta: "", description: "", locator: `${tool}::${label}`, fields: [], action: "" }) as ExplorerNode;

const graph: ExplorerGraph = {
  nodes: [node("n1", "UNI-7", "jira"), node("n2", "#48", "github")],
  edges: [{ from: "n2", to: "n1", label: "REFERENCES", eligible: true, eligibility: "confirmed", confidence: 0.9, provenance: "explicit" }],
};

const finding = {
  id: "f1",
  policy: "RULE_2",
  policyTitle: "Workflow inconsistency",
  title: "PR merged, ticket open",
  severity: "warning",
  status: "open",
  artifacts: [{ tool: "jira", ref: "UNI-7", label: "Ticket" }],
  createdAt: "2026-10-19T09:00:00Z",
  summary: "",
} as Finding;

const rule = { id: "RULE_2", version: 2, title: "Workflow inconsistency", description: "", condition: "pr.merged", severity: "high", active: true, fired7d: 1 } as RuleView;

describe("search index", () => {
  const matches = buildSearchIndex({ findings: [finding], graph, rules: [rule], now: NOW });

  it("indexes each finding, node, link and rule once", () => {
    expect(matches.map((m) => [m.kind, m.title])).toEqual([
      ["conflict", "PR merged, ticket open"],
      ["artifact", "UNI-7"],
      ["artifact", "#48"],
      ["link", "#48 REFERENCES UNI-7"],
      ["policy", "RULE_2: Workflow inconsistency"],
    ]);
  });

  it("keeps link confidence on the 0-1 scale the confidence filter expects", () => {
    expect(matches.find((m) => m.kind === "link")?.confidence).toBe(0.9);
    expect(matches[0]?.ageHours).toBe(3);
  });

  it("suggests only values that occur", () => {
    expect(tokenSuggestionsFor(matches)).toEqual([
      { key: "severity", value: "warning" },
      { key: "tool", value: "jira" },
      { key: "status", value: "open" },
      { key: "policy", value: "RULE_2" },
      { key: "tool", value: "github" },
      { key: "severity", value: "critical" },
    ]);
  });
});

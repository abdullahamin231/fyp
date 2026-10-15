import { describe, expect, it } from "vitest";
import type { ExplorerEdge, ExplorerNode } from "@/lib/domain/graph";
import type { GraphNodeKind } from "@/lib/types";
import { computeLayout, layeredLayout, type LayoutMode } from "./layout";

function node(
  id: string,
  kind: GraphNodeKind,
  kindLabel: string,
  lane = "MISHALS-WORKSPACE",
): ExplorerNode {
  return {
    id,
    label: `${lane} · ${id}`,
    kind,
    x: 0,
    y: 0,
    kindLabel,
    subtitle: lane,
    meta: kindLabel,
    description: "",
    locator: id,
    fields: [],
    action: "View",
  };
}

function edge(from: string, to: string): ExplorerEdge {
  return {
    from,
    to,
    label: "REFERENCES",
    eligible: true,
    eligibility: "system-confirmed",
    confidence: 1,
    provenance: "inferred",
  };
}

const nodes = [
  node("UNI-7", "requirement", "Jira Ticket"),
  node("UNI-7/AC-1", "requirement", "Criterion"),
  node("UNI-7/AC-2", "requirement", "Criterion"),
  node("pr-47", "pr", "Pull Request"),
  node("pr-48", "pr", "Pull Request"),
  node("b6e5230", "pr", "Commit"),
  node("isSourceStale", "code", "Code Symbol"),
  node("ingestion.test", "test", "Test Case"),
  node("UNI-1", "requirement", "Jira Ticket", "OTHER"),
];
const edges = [
  edge("UNI-7", "UNI-7/AC-1"),
  edge("UNI-7", "UNI-7/AC-2"),
  edge("pr-47", "UNI-7"),
  edge("pr-48", "UNI-7"),
  edge("pr-47", "b6e5230"),
  edge("b6e5230", "isSourceStale"),
  edge("ingestion.test", "isSourceStale"),
];

describe("graph layouts", () => {
  it("reads left to right: ticket, criteria, change, commit, code, tests", () => {
    const at = layeredLayout(nodes, edges);
    const x = (id: string) => at.get(id)!.x;
    expect(x("UNI-7")).toBeLessThan(x("UNI-7/AC-1"));
    expect(x("UNI-7/AC-1")).toBeLessThan(x("pr-47"));
    expect(x("pr-47")).toBeLessThan(x("b6e5230"));
    expect(x("b6e5230")).toBeLessThan(x("isSourceStale"));
    expect(x("isSourceStale")).toBeLessThan(x("ingestion.test"));
  });

  it("gives each workspace its own lane", () => {
    const at = layeredLayout(nodes, edges);
    const lane = nodes
      .filter((n) => n.subtitle === "MISHALS-WORKSPACE")
      .map((n) => at.get(n.id)!.y);
    expect(at.get("UNI-1")!.y).toBeGreaterThan(Math.max(...lane));
  });

  it.each<LayoutMode>(["layered", "radial", "force"])(
    "%s: places every node, none on top of another, deterministically",
    (mode) => {
      const first = computeLayout(mode, nodes, edges);
      expect(first.size).toBe(nodes.length);
      const points = [...first.values()];
      for (let i = 0; i < points.length; i += 1) {
        for (let j = i + 1; j < points.length; j += 1) {
          expect(Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y)).toBeGreaterThan(
            60,
          );
        }
      }
      expect(computeLayout(mode, nodes, edges)).toEqual(first);
    },
  );
});

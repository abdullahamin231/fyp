import { describe, expect, it } from "vitest";
import { driftBlastRadius, type ExplorerGraph, type ExplorerNode } from "./graph";

const node = (id: string, findingId?: string) => ({ id, label: id.toUpperCase(), findingId }) as ExplorerNode;
const edge = (from: string, to: string) => ({ from, to }) as ExplorerGraph["edges"][number];

describe("driftBlastRadius", () => {
  it("covers each finding's node and its direct neighbours, naming the cause", () => {
    const graph = { nodes: [node("t", "f1"), node("pr"), node("code"), node("far")], edges: [edge("pr", "t"), edge("code", "pr"), edge("far", "code")] };
    const radius = driftBlastRadius(graph as ExplorerGraph);
    expect([...radius.keys()].sort()).toEqual(["pr", "t"]);
    expect(radius.get("pr")).toEqual({ findingId: "f1", sourceId: "t", sourceLabel: "T" });
  });

  it("lets a node carrying its own finding report that finding, not a neighbour's", () => {
    const graph = { nodes: [node("a", "f1"), node("b", "f2")], edges: [edge("a", "b")] };
    expect(driftBlastRadius(graph as ExplorerGraph).get("b")?.findingId).toBe("f2");
  });

  it("is empty when no node carries a finding", () => {
    expect(driftBlastRadius({ nodes: [node("a")], edges: [] } as unknown as ExplorerGraph).size).toBe(0);
  });
});

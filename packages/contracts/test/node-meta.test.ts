import { describe, expect, it } from "vitest";
import { NODE_TYPE_META, NODE_TYPES, slotForNodeType } from "../src/index.js";

describe("node-type metadata", () => {
  it("covers every node type with a slot or a tool", () => {
    for (const type of NODE_TYPES) {
      const meta = NODE_TYPE_META[type];
      expect(meta, `node type ${type} should have an entry`).toBeDefined();
    }
  });

  it("maps evidence-bearing node types to their packet slot", () => {
    expect(slotForNodeType("Requirement")).toBe("REQUIREMENT_TEXT");
    expect(slotForNodeType("DesignConstraint")).toBe("DESIGN_CONSTRAINTS");
    expect(slotForNodeType("TestCase")).toBe("TEST_EVIDENCE");
    expect(slotForNodeType("CodeSymbol")).toBe("SYMBOL_CARDS");
    expect(slotForNodeType("Commit")).toBe("DIFF_HUNKS");
    expect(slotForNodeType("PullRequest")).toBe("DIFF_HUNKS");
    expect(slotForNodeType("Ticket")).toBe("GRAPH_NEIGHBOURHOOD");
    expect(slotForNodeType("Message")).toBe("GRAPH_NEIGHBOURHOOD");
  });

  it("leaves non-evidence node types without a slot", () => {
    expect(slotForNodeType("DesignArtifact")).toBeUndefined();
    expect(slotForNodeType("Criterion")).toBeUndefined();
    expect(slotForNodeType("Person")).toBeUndefined();
  });

  it("gives every node type with a slot a display tool", () => {
    for (const type of NODE_TYPES) {
      const meta = NODE_TYPE_META[type];
      if (meta?.slot) {
        expect(meta.tool, `node type ${type} has a slot but no tool`).toBeDefined();
      }
    }
  });
});

import type { NodeType, PacketSlot, ToolKind } from "./enums.js";

/**
 * One table for the node-type vocabulary (candidate 3 of the architecture
 * review): which packet slot a node type's evidence lands in, and which display
 * tool icon it wears.
 *
 * Before this table, the slot mapping lived in the worker (`TYPE_TO_SLOT`) and
 * the tool mapping lived in the web (`toolForNodeType`), so adding a node type
 * meant editing two apps. Now both read this one record.
 *
 * A node type may have a slot, a tool, both, or neither:
 *   · `slot` — the packet section its `payload.slotItems` land in (§1.7)
 *   · `tool` — the display icon/identity a reviewer sees
 */
export interface NodeTypeMeta {
  slot?: PacketSlot;
  tool?: ToolKind;
}

export const NODE_TYPE_META: Readonly<Partial<Record<NodeType, NodeTypeMeta>>> = {
  Requirement: { slot: "REQUIREMENT_TEXT", tool: "jira" },
  DesignConstraint: { slot: "DESIGN_CONSTRAINTS", tool: "figma" },
  TestCase: { slot: "TEST_EVIDENCE", tool: "test" },
  CodeSymbol: { slot: "SYMBOL_CARDS", tool: "git" },
  Commit: { slot: "DIFF_HUNKS", tool: "github" },
  PullRequest: { slot: "DIFF_HUNKS", tool: "github" },
  Ticket: { slot: "GRAPH_NEIGHBOURHOOD", tool: "jira" },
  Message: { slot: "GRAPH_NEIGHBOURHOOD", tool: "slack" },
  DesignArtifact: { tool: "figma" },
  Criterion: { tool: "jira" },
  Person: {},
};

/**
 * The packet slot a node type's evidence belongs in, or `undefined` when the
 * type contributes to the graph-neighbourhood slot through its edges only.
 * This is the worker's `TYPE_TO_SLOT`, now derived from `NODE_TYPE_META`.
 */
export function slotForNodeType(type: NodeType): PacketSlot | undefined {
  return NODE_TYPE_META[type]?.slot;
}

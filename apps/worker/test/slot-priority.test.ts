/**
 * Within-slot admission priority (packet/provider.ts).
 *
 * The assembler stops a slot at the first item that would overrun it and never
 * squeezes a smaller item in, so provider order decides what survives. For
 * TEST_EVIDENCE that order must put the test *run* — the record of whether the
 * suite passed — ahead of the test *sources*, or a failing run can be dropped
 * while its own sources fill the slot. That is exactly how a CONTRADICTED
 * verdict once landed as PARTIAL against the live graph.
 */
import { describe, expect, it } from "vitest";
import { makeItem, prioritizeSlotItems } from "../src/packet/provider.js";

describe("prioritizeSlotItems", () => {
  const sources = [
    makeItem("test-1", "test_source", "the source of a test", { file: "a.test.ts" }),
    makeItem("run", "test_run", "$ npm test\nFAIL\n(exit 1, 5 ms)", { file: "(test run)" }),
  ];

  it("admits the test run before the test sources", () => {
    const ordered = prioritizeSlotItems({ TEST_EVIDENCE: sources })!;
    expect(ordered.TEST_EVIDENCE!.map((i) => i.kind)).toEqual(["test_run", "test_source"]);
  });

  it("is deterministic and idempotent", () => {
    const once = prioritizeSlotItems({ TEST_EVIDENCE: sources })!;
    const twice = prioritizeSlotItems(once)!;
    expect(twice.TEST_EVIDENCE!.map((i) => i.id)).toEqual(once.TEST_EVIDENCE!.map((i) => i.id));
  });

  it("tie-breaks equal-priority kinds by citation id, never by arrival order", () => {
    const items = [
      makeItem("b", "test_source", "second", { file: "b.test.ts" }),
      makeItem("a", "test_source", "first", { file: "a.test.ts" }),
    ];
    const ordered = prioritizeSlotItems({ TEST_EVIDENCE: items })!;
    expect(ordered.TEST_EVIDENCE!.map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("leaves slots without a priority map untouched", () => {
    const diffHunks = [makeItem("h2", "diff_hunk", "second hunk"), makeItem("h1", "diff_hunk", "first hunk")];
    const ordered = prioritizeSlotItems({ DIFF_HUNKS: diffHunks })!;
    expect(ordered.DIFF_HUNKS!.map((i) => i.id)).toEqual(["h2", "h1"]);
  });
});

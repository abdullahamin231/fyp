import { describe, expect, it } from "vitest";
import { PACKET_SLOTS } from "@unify/contracts";
import { assemble } from "../src/packet/assemble.js";
import { estimateTokens, sha256 } from "../src/packet/tokens.js";
import { DEFAULT_BUDGETS, demoPacket } from "./helpers.js";

const item = (id: string, content: string) => ({
  id,
  kind: "span",
  content,
  contentSha256: sha256(content),
});

function baseInput(overrides: Partial<Parameters<typeof assemble>[0]> = {}) {
  return {
    criterionNodeId: "c1",
    baseCommit: "a".repeat(40),
    headCommit: "b".repeat(40),
    tokenBudget: 8000,
    slotBudgets: DEFAULT_BUDGETS,
    sources: {},
    ...overrides,
  };
}

describe("deterministic token estimator", () => {
  it("is ceil(length / 4) and never zero for non-empty text", () => {
    expect(estimateTokens("")).toBe(0);
    expect(estimateTokens("abcd")).toBe(1);
    expect(estimateTokens("abcde")).toBe(2);
    expect(estimateTokens("x".repeat(4000))).toBe(1000);
  });
});

describe("packet assembly (§1.7)", () => {
  it("records the estimator so a budget is interpretable", async () => {
    const built = await demoPacket();
    expect(built.packet.manifest.tokenEstimator).toBe("chars_div_4_v1");
  });

  it("admits every slot of the demo packet with a fixed assembly order", async () => {
    const built = await demoPacket();
    const slots = built.packet.manifest.slots.map((slot) => slot.slot);
    expect(slots).toEqual([...PACKET_SLOTS]);
    expect(built.packet.manifest.assemblyOrder).toEqual([...PACKET_SLOTS]);
    expect(built.packet.manifest.evictionOrder).toEqual([...PACKET_SLOTS].reverse());
    expect(built.packet.manifest.truncated).toBe(false);
    expect(built.itemIds.size).toBeGreaterThan(5);
  });

  it("stops a slot at the first item that overruns its budget and records why", () => {
    const budget = estimateTokens("0123456789abcdef"); // 4 tokens
    const assembled = assemble(
      baseInput({
        slotBudgets: { ...DEFAULT_BUDGETS, SYMBOL_CARDS: budget },
        sources: {
          SYMBOL_CARDS: [
            item("s1", "0123456789abcdef"), // exactly the budget
            item("s2", "ghijkl"),           // does not fit
            item("s3", "x"),                // would fit, but the slot already overflowed
          ],
        },
      }),
    );
    const slot = assembled.manifest.slots.find((s) => s.slot === "SYMBOL_CARDS")!;
    expect(slot.included.map((i) => i.id)).toEqual(["s1"]);
    expect(slot.omitted).toEqual([
      { id: "s2", kind: "span", reason: "BUDGET_EXCEEDED" },
      { id: "s3", kind: "span", reason: "BUDGET_EXCEEDED" },
    ]);
    expect(slot.tokensUsed).toBe(budget);
    expect(assembled.manifest.truncated).toBe(true);
  });

  it("records an empty body as SOURCE_UNAVAILABLE rather than rendering it", () => {
    const assembled = assemble(
      baseInput({
        sources: { TEST_EVIDENCE: [item("t1", ""), item("t2", "ran fine")] },
      }),
    );
    const slot = assembled.manifest.slots.find((s) => s.slot === "TEST_EVIDENCE")!;
    expect(slot.included.map((i) => i.id)).toEqual(["t2"]);
    expect(slot.omitted).toEqual([{ id: "t1", kind: "span", reason: "SOURCE_UNAVAILABLE" }]);
  });

  it("evicts whole slots in the recorded eviction order when the total overruns", () => {
    const assembled = assemble(
      baseInput({
        tokenBudget: 4,
        slotBudgets: { ...DEFAULT_BUDGETS, REQUIREMENT_TEXT: 10, DESIGN_CONSTRAINTS: 10 },
        sources: {
          REQUIREMENT_TEXT: [item("r1", "0123456789abcdef")],
          DESIGN_CONSTRAINTS: [item("d1", "0123456789abcdef")],
        },
      }),
    );
    // Eviction order is the reverse of assembly, so the later-filled slot
    // (DESIGN_CONSTRAINTS) is evicted first and the requirement survives.
    const requirement = assembled.manifest.slots.find((s) => s.slot === "REQUIREMENT_TEXT")!;
    const design = assembled.manifest.slots.find((s) => s.slot === "DESIGN_CONSTRAINTS")!;
    expect(design.included).toHaveLength(0);
    expect(design.omitted[0]?.reason).toBe("EVICTED");
    expect(requirement.included).toHaveLength(1);
    expect(assembled.tokensUsed).toBeLessThanOrEqual(4);
  });

  it("fails loudly on a duplicate citation handle", () => {
    expect(() =>
      assemble(
        baseInput({
          sources: {
            SYMBOL_CARDS: [item("dup", "aaaa"), item("dup", "bbbb")],
          },
        }),
      ),
    ).toThrow(/duplicate citation handle/);
  });

  it("is byte-identical across runs for identical inputs", async () => {
    const first = await demoPacket();
    const second = await demoPacket();
    expect(JSON.stringify(first.packet)).toBe(JSON.stringify(second.packet));
    expect(first.packet.packetHash).toBe(second.packet.packetHash);
    expect(first.promptText).toBe(second.promptText);
  });
});

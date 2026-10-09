import { describe, expect, it } from "vitest";
import { contextPacketSchema, slotManifestSchema } from "../src/index.js";
import { basePacket, baseSpan } from "./fixtures.js";

describe("context packets (FR-08, §1.7)", () => {
  it("parses a deterministic packet with a full manifest", () => {
    const packet = contextPacketSchema.parse(basePacket());
    expect(packet.manifest.slots).toHaveLength(2);
    expect(packet.manifest.truncated).toBe(false);
  });

  it("rejects a slot that used more than its budget", () => {
    const packet = basePacket();
    const overBudget = {
      ...packet.manifest.slots[0]!,
      slot: "DIFF_HUNKS" as const,
      tokenBudget: 100,
      tokensUsed: 900,
    };
    const result = slotManifestSchema.safeParse(overBudget);
    expect(result.success).toBe(false);
  });

  it("requires truncation to be declared when something was omitted (§1.7)", () => {
    const packet = basePacket();
    const manifest = {
      ...packet.manifest,
      truncated: false,
      slots: [
        {
          slot: "DIFF_HUNKS" as const,
          tokenBudget: 2500,
          tokensUsed: 2400,
          included: [{ id: baseSpan.spanId, kind: "span", tokens: 2400 }],
          omitted: [{ id: "symbol-nearbyWidget", kind: "span", reason: "BUDGET_EXCEEDED" as const }],
        },
      ],
    };
    expect(contextPacketSchema.safeParse({ ...packet, manifest }).success).toBe(false);
  });

  it("accepts the same manifest once truncation is declared", () => {
    const packet = basePacket();
    const manifest = {
      ...packet.manifest,
      truncated: true,
      slots: [
        {
          slot: "DIFF_HUNKS" as const,
          tokenBudget: 2500,
          tokensUsed: 2400,
          included: [{ id: baseSpan.spanId, kind: "span", tokens: 2400 }],
          omitted: [{ id: "symbol-nearbyWidget", kind: "span", reason: "BUDGET_EXCEEDED" as const }],
        },
      ],
    };
    expect(contextPacketSchema.safeParse({ ...packet, manifest }).success).toBe(true);
  });

  it("rejects duplicate slots in the assembly order", () => {
    const packet = basePacket();
    const manifest = { ...packet.manifest, assemblyOrder: ["DIFF_HUNKS", "DIFF_HUNKS"] as const };
    expect(contextPacketSchema.safeParse({ ...packet, manifest }).success).toBe(false);
  });

  it("requires a budget for every declared slot", () => {
    const packet = basePacket();
    const { POLICY_DEFINITION: _dropped, ...partialBudgets } = packet.slotBudgets;
    expect(contextPacketSchema.safeParse({ ...packet, slotBudgets: partialBudgets }).success).toBe(false);
  });

  it("keeps the packet hash pinned to a sha256", () => {
    const packet = basePacket();
    expect(contextPacketSchema.safeParse({ ...packet, packetHash: "abc" }).success).toBe(false);
  });
});

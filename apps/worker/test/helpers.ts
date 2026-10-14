import type { PacketSlot } from "@unify/contracts";
import { DEFAULT_SLOT_BUDGETS } from "../src/config.js";
import type { ModelCall, ModelClient, ModelDescriptor, ModelResult } from "../src/model/types.js";
import { buildPacket, type BuiltPacket } from "../src/packet/builder.js";
import { fixtureBundleSources, type FixtureBundle } from "../src/fixture/bundle.js";

export const PACKET_ID = "00000000-0000-4000-8000-00000000b001";
export const CRITERION_ID = "00000000-0000-4000-8000-00000000c001";

export const DEFAULT_BUDGETS = DEFAULT_SLOT_BUDGETS;

/**
 * The canonical test case, inlined here rather than as a data file so the
 * packet builder and gate tests have something byte-stable to assert against.
 */
export const caseBundle: FixtureBundle = {
  caseId: "CASE-01",
  repo: "acme/checkout-ui",
  baseCommit: "3f1c9d2a8b4e7c6f5a0d9b8e7c6f5a4d3e2b1c0a",
  headCommit: "9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d",
  freshness: "CURRENT",
  change: { externalId: "PR-142", title: "Apply discount codes to the cart total", author: "reviewer" },
  criterion: {
    externalId: "C-01",
    text: "Applying a valid discount code must reduce the total returned by calculateTotal.",
    requirementRef: "PROJ-142",
    ruleApplicable: true,
  },
  requirement: {
    externalId: "PROJ-142",
    text: "Discount codes: applying a valid code reduces the cart total by the code's percentage, and the reduced total is what every surface renders.",
  },
  designConstraints: [
    {
      externalId: "DC-01",
      text: "Discounts are applied inside calculateTotal so the checkout UI and the pricing API can never disagree about the total.",
    },
  ],
  tests: [
    {
      externalId: "TC-01",
      file: "src/cart/total.test.ts",
      command: "vitest run src/cart/total.test.ts",
      passed: true,
      log: "PASS src/cart/total.test.ts\n  ✓ applies a percentage discount to the cart total (4 ms)\n  ✓ leaves the total unchanged for an unknown code (1 ms)\n\nTests  2 passed (2)",
    },
  ],
  symbols: [
    {
      externalId: "SYM-01",
      file: "src/cart/total.ts",
      symbol: "calculateTotal",
      startLine: 4,
      endLine: 20,
      content:
        "export function calculateTotal(items: CartItem[], discountCode?: string): number {\n  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);\n  const discount = discountCode ? DISCOUNTS[discountCode] ?? 0 : 0;\n  return subtotal * (1 - discount);\n}",
    },
  ],
  diff: [
    {
      externalId: "COMMIT-HEAD",
      file: "src/cart/total.ts",
      startLine: 8,
      endLine: 10,
      content:
        "-export function calculateTotal(items: CartItem[]): number {\n-  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);\n+  const discount = discountCode ? DISCOUNTS[discountCode] ?? 0 : 0;\n+  return subtotal * (1 - discount);\n}",
    },
    {
      externalId: "COMMIT-HEAD",
      file: "src/cart/total.test.ts",
      startLine: 6,
      endLine: 9,
      content:
        "+it('applies a percentage discount to the cart total', () => {\n+  expect(calculateTotal(cart, 'SAVE10')).toBe(90);\n+});",
    },
  ],
  neighbours: [
    {
      externalId: "PROJ-142-TICKET",
      type: "Ticket",
      text: "PROJ-142 Discount codes — as a shopper I enter a code at checkout and the total drops by the code's percentage.",
    },
  ],
  edges: [
    { from: "PR-142", to: "C-01", type: "SATISFIES", sourceClass: "observed", confidence: 1.0, resolver: "explicit-reference", linkState: "active" },
    { from: "C-01", to: "PROJ-142", type: "PART_OF", sourceClass: "observed", confidence: 1.0, resolver: "explicit-reference", linkState: "active" },
    { from: "PROJ-142-TICKET", to: "PROJ-142", type: "PART_OF", sourceClass: "observed", confidence: 1.0, resolver: "explicit-reference", linkState: "active" },
    { from: "PR-142", to: "SYM-01", type: "IMPLEMENTS", sourceClass: "observed", confidence: 0.95, resolver: "explicit-reference", linkState: "active" },
    { from: "C-01", to: "TC-01", type: "SATISFIES", sourceClass: "observed", confidence: 1.0, resolver: "explicit-reference", linkState: "active" },
  ],
  policy: {
    id: "R4",
    text: "A criterion may only be reported decisive when the change it names is linked to the criterion by a confirmed link and is covered by at least one passing test.",
  },
};

/** Build the demo packet the same way the runner does, but with fixed ids. */
export async function demoPacket(
  overrides: {
    slotBudgets?: Record<PacketSlot, number>;
    tokenBudget?: number;
    /** Drop these slots' evidence — e.g. remove tests to force a PARTIAL. */
    omitSlots?: readonly PacketSlot[];
  } = {},
): Promise<BuiltPacket> {
  const bundle = caseBundle;
  const { sources } = fixtureBundleSources(bundle);
  const filtered = Object.fromEntries(
    Object.entries(sources).filter(([slot]) => !overrides.omitSlots?.includes(slot as PacketSlot)),
  ) as typeof sources;
  return buildPacket({
    packetId: PACKET_ID,
    criterion: {
      id: CRITERION_ID,
      text: bundle.criterion.text,
      requirementRef: bundle.criterion.requirementRef,
    },
    baseCommit: bundle.baseCommit,
    headCommit: bundle.headCommit,
    tokenBudget: overrides.tokenBudget ?? 8000,
    slotBudgets: overrides.slotBudgets ?? DEFAULT_BUDGETS,
    sources: filtered,
  });
}

/**
 * A model that answers a fixed script, one call at a last value repeated.
 * Lets a test drive the loop's control flow (malformed replies, critic
 * disagreements) without touching the deterministic stub's behaviour.
 */
export function scriptedModel(responses: readonly (string | Error)[]): ModelClient & {
  calls: ModelCall[];
} {
  const calls: ModelCall[] = [];
  let index = 0;
  return {
    provider: "stub",
    calls,
    describe(): ModelDescriptor {
      return {
        modelId: "scripted:test",
        modelVersion: "1",
        quantisation: "n/a",
        tokenizer: "test",
        settings: { temperature: 0 },
      };
    },
    async complete(call: ModelCall): Promise<ModelResult> {
      calls.push(call);
      const next = responses[Math.min(index, responses.length - 1)];
      index += 1;
      if (next === undefined) throw new Error("scriptedModel: no response scripted");
      if (next instanceof Error) throw next;
      return { text: next, durationMs: 1 };
    },
  };
}

/** A uuid-ish constant so loop tests get byte-identical run metadata. */
export const RUN_ID = "00000000-0000-4000-8000-00000000f001";
export const FIXED_NOW = 1_800_000_000_000;

export const fixedRun = { now: () => FIXED_NOW, uuid: () => RUN_ID };

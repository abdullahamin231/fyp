import { fileURLToPath } from "node:url";
import type { PacketSlot } from "@unify/contracts";
import { DEFAULT_SLOT_BUDGETS } from "../src/config.js";
import type { ModelCall, ModelClient, ModelDescriptor, ModelResult } from "../src/model/types.js";
import { buildPacket, type BuiltPacket } from "../src/packet/builder.js";
import { loadFixtureBundle } from "../src/packet/providers/fixture.js";
import { fixtureBundleSources } from "../src/fixture/bundle.js";

/** The demo case — the same bundle `npm run seed` writes into the graph. */
export const DEMO_BUNDLE_PATH = fileURLToPath(
  new URL("../fixtures/demo_case.json", import.meta.url),
);

export const PACKET_ID = "00000000-0000-4000-8000-00000000b001";
export const CRITERION_ID = "00000000-0000-4000-8000-00000000c001";

export const DEFAULT_BUDGETS = DEFAULT_SLOT_BUDGETS;

/** Build the demo packet the same way the runner does, but with fixed ids. */
export async function demoPacket(
  overrides: {
    slotBudgets?: Record<PacketSlot, number>;
    tokenBudget?: number;
    /** Drop these slots' evidence — e.g. remove tests to force a PARTIAL. */
    omitSlots?: readonly PacketSlot[];
  } = {},
): Promise<BuiltPacket> {
  const bundle = await loadFixtureBundle(DEMO_BUNDLE_PATH);
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

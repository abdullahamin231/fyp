import { z } from "zod";
import {
  OMISSION_REASONS,
  PACKET_SLOTS,
  omissionReasonSchema,
  packetSlotSchema,
} from "./enums.js";
import { commitSha, nonEmpty, sha256Hex, uuid } from "./scalars.js";

/**
 * Context-packet contracts (ERD `context_packets`, FR-08, §1.7, §27.1).
 *
 * A packet is what the model actually saw when it judged one atomic criterion.
 * It is immutable and hash-covered, and its manifest records both what went in
 * and what was left out, so "the model had no evidence" is a recorded fact
 * rather than a reconstruction (ch5).
 */

/** One item admitted to a slot. `id` is the citation handle. */
export const packetItemSchema = z.strictObject({
  /** Stable id (span id / symbol id). Verdict citations must quote this id. */
  id: nonEmpty,
  /** What kind of thing it is, e.g. `span`, `symbol_card`, `diff_hunk`. */
  kind: nonEmpty,
  tokens: z.number().int().nonnegative(),
});
export type PacketItem = z.infer<typeof packetItemSchema>;

/** One item excluded from a slot — recorded, never silently dropped (§1.7). */
export const omittedItemSchema = z.strictObject({
  id: nonEmpty,
  kind: nonEmpty,
  reason: omissionReasonSchema,
});
export type OmittedItem = z.infer<typeof omittedItemSchema>;

export const slotManifestSchema = z
  .strictObject({
    slot: packetSlotSchema,
    tokenBudget: z.number().int().nonnegative(),
    tokensUsed: z.number().int().nonnegative(),
    included: z.array(packetItemSchema),
    omitted: z.array(omittedItemSchema),
  })
  .refine((s) => s.tokensUsed <= s.tokenBudget, {
    message: "tokensUsed must not exceed the slot token budget",
    path: ["tokensUsed"],
  });
export type SlotManifest = z.infer<typeof slotManifestSchema>;

/**
 * Full manifest. `assemblyOrder` and `evictionOrder` are stored because byte-
 * identical reproducibility (FR-08) depends on them, not just on the contents
 * (§1.7 fixed assembly / eviction order).
 */
export const packetManifestSchema = z
  .strictObject({
    slots: z.array(slotManifestSchema).min(1),
    /** True when anything was omitted for budget reasons. */
    truncated: z.boolean(),
    assemblyOrder: z.array(packetSlotSchema),
    evictionOrder: z.array(packetSlotSchema),
  })
  .refine(
    (m) => m.truncated === m.slots.some((s) => s.omitted.length > 0),
    {
      message: "truncated must be true exactly when some slot omitted an item",
      path: ["truncated"],
    },
  )
  .refine(
    (m) =>
      new Set(m.assemblyOrder).size === m.assemblyOrder.length &&
      new Set(m.evictionOrder).size === m.evictionOrder.length,
    { message: "assembly and eviction orders must not repeat a slot" },
  );
export type PacketManifest = z.infer<typeof packetManifestSchema>;

/** Per-slot token budgets (§1.7). Every declared slot must have one. */
export const slotBudgetsSchema = z
  .record(packetSlotSchema, z.number().int().positive())
  .refine(
    (budgets) => PACKET_SLOTS.every((slot) => budgets[slot] !== undefined),
    { message: "every packet slot needs a token budget" },
  );
export type SlotBudgets = z.infer<typeof slotBudgetsSchema>;

export const contextPacketSchema = z.strictObject({
  id: uuid,
  /** The `Criterion` node this packet was assembled for. */
  criterionNodeId: uuid,
  baseCommit: commitSha,
  headCommit: commitSha,
  /** Total token budget for the packet. */
  tokenBudget: z.number().int().positive(),
  slotBudgets: slotBudgetsSchema,
  manifest: packetManifestSchema,
  /** SHA-256 of the prompt template + version used for this run. */
  promptHash: sha256Hex,
  /** SHA-256 over the assembled packet. Identical inputs → identical hash. */
  packetHash: sha256Hex,
});
export type ContextPacket = z.infer<typeof contextPacketSchema>;

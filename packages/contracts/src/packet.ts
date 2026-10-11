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
  /**
   * SHA-256 of the item's verbatim content, when the packet recorded it.
   * The gate checks a citation's `contentSha256` against this so a model that
   * quotes the right id but the wrong text is caught (FR-10).
   */
  contentSha256: sha256Hex.optional(),
  /**
   * The verbatim text itself, when the packet recorded it.
   *
   * A verdict that cannot be re-read is a verdict a reviewer has to take on
   * trust — the opposite of the evidence case this project exists for. Keeping
   * the text in the manifest (and therefore under `packetHash`) means the
   * reviewer sees the exact bytes the model cited, byte-checkable against the
   * hash, without re-deriving them from a source that may since have moved.
   */
  content: z.string().optional(),
  /** Where the item lives, so a reviewer can open it from the evidence case. */
  cite: z
    .strictObject({
      file: nonEmpty.optional(),
      symbol: nonEmpty.optional(),
      startLine: z.number().int().positive().optional(),
      endLine: z.number().int().positive().optional(),
    })
    .optional(),
});
export type PacketItem = z.infer<typeof packetItemSchema>;

/**
 * One piece of evidence as the *analyser* produces it, before budgeting.
 *
 * This is the handover shape between the code/test analyser (Slice B) and the
 * packet builder (Slice C): the analyser writes a `slotItems` array into the
 * payload of the graph node that owns the evidence, and the builder reads it
 * back, counts tokens, admits or evicts, and turns it into a `PacketItem`.
 * `content` is verbatim and never rewritten — the hash is what the verdict
 * gate compares a citation against.
 */
export const evidenceItemSchema = z.strictObject({
  /** Stable citation handle, unique within the packet. */
  id: nonEmpty,
  /** `span` | `symbol_card` | `diff_hunk` | `test_run` | `requirement` | … */
  kind: nonEmpty,
  content: z.string(),
  contentSha256: sha256Hex,
  cite: z
    .strictObject({
      file: nonEmpty.optional(),
      symbol: nonEmpty.optional(),
      startLine: z.number().int().positive().optional(),
      endLine: z.number().int().positive().optional(),
    })
    .optional(),
});
export type EvidenceItem = z.infer<typeof evidenceItemSchema>;

/** Payload key every UNIFY analyser uses to publish evidence for a node. */
export const SLOT_ITEMS_KEY = "slotItems";
export type NodePayloadWithSlotItems = { slotItems?: EvidenceItem[] };

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
    /**
     * Which token estimator produced the budgets above — recorded because
     * "8000 tokens" means nothing without the counting method beside it, and
     * reproducibility (FR-08) covers the counting too.
     */
    tokenEstimator: nonEmpty.optional(),
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

import type { ContextPacket, EvidenceItem, PacketSlot } from "@unify/contracts";
import { assemble, contentHashes } from "./assemble.js";
import { canonicalHash } from "./hash.js";
import { PACKET_TEMPLATE_VERSION, renderPacket } from "./render.js";

/**
 * Packet construction: evidence → budgeted, hashed, immutable packet.
 *
 * Steps, all deterministic and all pure (no clock, no randomness except the
 * caller-assigned id):
 *
 *   1. assemble against fixed slot budgets and a fixed order
 *   2. hash the manifest (canonical JSON) → `packetHash`
 *   3. hash template + version → `promptHash`
 *   4. render the packet body the model sees
 *
 * The caller persists the result (`context_packets`), so what the verifier ran
 * against is byte-recoverable from the database — §11.8 provenance check 5.
 */
export interface BuildPacketInput {
  /** Id for the `context_packets` row; assigned by the caller for testability. */
  packetId: string;
  criterion: {
    id: string;
    text: string;
    requirementRef?: string | null;
  };
  baseCommit: string;
  headCommit: string;
  tokenBudget: number;
  slotBudgets: Record<PacketSlot, number>;
  sources: Partial<Record<PacketSlot, readonly EvidenceItem[]>>;
  assemblyOrder?: readonly PacketSlot[];
  evictionOrder?: readonly PacketSlot[];
}

export interface BuiltPacket {
  packet: ContextPacket;
  /** Verbatim content of every admitted item, keyed by citation handle. */
  contentById: Map<string, string>;
  /** Citation handle → SHA-256 of admitted content (what the gate checks). */
  contentHashes: Map<string, string>;
  /** Every admitted citation handle. */
  itemIds: Set<string>;
  /** Rendered packet body — identical for every pass of this run. */
  promptText: string;
}

export function buildPacket(input: BuildPacketInput): BuiltPacket {
  const assembled = assemble({
    criterionNodeId: input.criterion.id,
    baseCommit: input.baseCommit,
    headCommit: input.headCommit,
    tokenBudget: input.tokenBudget,
    slotBudgets: input.slotBudgets,
    sources: input.sources,
    ...(input.assemblyOrder ? { assemblyOrder: input.assemblyOrder } : {}),
    ...(input.evictionOrder ? { evictionOrder: input.evictionOrder } : {}),
  });

  const packetHash = canonicalHash(assembled.manifest);
  const promptHash = canonicalHash({
    template: PACKET_TEMPLATE_VERSION,
    // The packet body is what varies run to run; the hash covers the template
    // contract so two runs with the same evidence and template are comparable.
    sections: assembled.manifest.slots.map((slot) => slot.slot),
  });

  const packet: ContextPacket = {
    id: input.packetId,
    criterionNodeId: input.criterion.id,
    baseCommit: input.baseCommit,
    headCommit: input.headCommit,
    packetHash,
    promptHash,
    tokenBudget: input.tokenBudget,
    slotBudgets: { ...input.slotBudgets },
    manifest: assembled.manifest,
  };

  const contentById = new Map<string, string>();
  for (const [id, item] of assembled.itemsById) contentById.set(id, item.content);

  return {
    packet,
    contentById,
    contentHashes: contentHashes(assembled),
    itemIds: new Set(assembled.itemsById.keys()),
    promptText: renderPacket({
      criterion: input.criterion,
      baseCommit: input.baseCommit,
      headCommit: input.headCommit,
      slots: assembled.slots,
      tokensUsed: assembled.tokensUsed,
    }),
  };
}

import {
  PACKET_SLOTS,
  type EvidenceItem,
  type OmissionReason,
  type PacketItem,
  type PacketManifest,
  type PacketSlot,
  type SlotManifest,
} from "@unify/contracts";
import { canonicalHash } from "./hash.js";
import { TOKEN_ESTIMATOR, estimateTokens } from "./tokens.js";

/**
 * Deterministic context-packet assembly (FR-08, §1.7, §11.5).
 *
 * The rules that make a packet reproducible, in the order they bite:
 *
 *  1. **Fixed assembly order** — slots are filled in `assemblyOrder`, and
 *     items inside a slot are admitted in provider order. Nothing is
 *     re-ranked, deduplicated by relevance or shuffled.
 *  2. **Per-slot budgets** — the first item that would overrun a slot's budget
 *     stops that slot: every remaining item is recorded as `BUDGET_EXCEEDED`.
 *     There is no second pass that lets a smaller item squeeze in, because a
 *     second pass would make admission depend on item sizes in a way that is
 *     hard to reason about and impossible to reproduce from the manifest.
 *  3. **Fixed eviction order** — if the slots together overrun the *total*
 *     budget, whole slots are evicted in `evictionOrder` until they fit.
 *  4. **Nothing is silently dropped** — every item not in the packet lands in
 *     `manifest.slots[].omitted` with a reason, and `truncated` is derived from
 *     that, not asserted alongside it.
 *
 * The builder fails loudly on a duplicate citation handle: two items with one
 * id would make every verdict citation ambiguous, so it is a bug, not a
 * condition to paper over.
 */

export interface AssembleInput {
  criterionNodeId: string;
  baseCommit: string;
  headCommit: string;
  /** Total token budget for the packet. */
  tokenBudget: number;
  /** Per-slot budgets — every slot in `PACKET_SLOTS` must have one. */
  slotBudgets: Record<PacketSlot, number>;
  /** Evidence per slot, already in provider order. */
  sources: Partial<Record<PacketSlot, readonly EvidenceItem[]>>;
  /** Defaults to `PACKET_SLOTS`; overridden in tests to pin the contract. */
  assemblyOrder?: readonly PacketSlot[];
  /** Defaults to the reverse of the assembly order. */
  evictionOrder?: readonly PacketSlot[];
}

export interface AssembledSlot {
  slot: PacketSlot;
  /** Admitted items in packet order, content included for rendering. */
  items: (PacketItem & { content: string })[];
}

export interface AssembledPacket {
  manifest: PacketManifest;
  /** Admitted items grouped by slot, in assembly order. */
  slots: AssembledSlot[];
  /** Every admitted item by citation handle — what the gate resolves against. */
  itemsById: Map<string, PacketItem & { content: string }>;
  /** Total tokens actually used across all slots. */
  tokensUsed: number;
}

export function assemble(input: AssembleInput): AssembledPacket {
  const assemblyOrder = input.assemblyOrder ?? PACKET_SLOTS;
  const evictionOrder = input.evictionOrder ?? [...assemblyOrder].reverse();

  for (const slot of PACKET_SLOTS) {
    if (input.slotBudgets[slot] === undefined) {
      throw new Error(`missing token budget for slot ${slot}`);
    }
  }

  const included = new Map<PacketSlot, (PacketItem & { content: string })[]>();
  const omitted = new Map<PacketSlot, { id: string; kind: string; reason: OmissionReason }[]>();
  const itemsById = new Map<string, PacketItem & { content: string }>();

  const omit = (slot: PacketSlot, item: { id: string; kind: string }, reason: OmissionReason) => {
    omitted.get(slot)!.push({ id: item.id, kind: item.kind, reason });
  };

  for (const slot of PACKET_SLOTS) {
    included.set(slot, []);
    omitted.set(slot, []);
  }

  // 1–2 · per-slot budgets, assembly order.
  for (const slot of assemblyOrder) {
    const budget = input.slotBudgets[slot]!;
    const items = input.sources[slot] ?? [];
    let used = 0;
    let overflowed = false;

    for (const item of items) {
      if (itemsById.has(item.id)) {
        throw new Error(
          `duplicate citation handle ${JSON.stringify(item.id)} — packet citations must be unique`,
        );
      }
      if (item.content.length === 0) {
        // An empty body is how a provider says "this exists but was not
        // retrievable" — recorded, never rendered as if it were evidence.
        omit(slot, item, "SOURCE_UNAVAILABLE");
        continue;
      }
      if (overflowed) {
        omit(slot, item, "BUDGET_EXCEEDED");
        continue;
      }
      const tokens = estimateTokens(item.content);
      if (used + tokens > budget) {
        overflowed = true;
        omit(slot, item, "BUDGET_EXCEEDED");
        continue;
      }
      used += tokens;
      const admitted = {
        id: item.id,
        kind: item.kind,
        tokens,
        content: item.content,
        ...(item.contentSha256 ? { contentSha256: item.contentSha256 } : {}),
        ...(item.cite ? { cite: item.cite } : {}),
      };
      included.get(slot)!.push(admitted);
      itemsById.set(item.id, admitted);
    }
  }

  const slotTokens = (slot: PacketSlot) =>
    included.get(slot)!.reduce((sum, item) => sum + item.tokens, 0);

  // 3 · total budget — evict whole slots in the recorded eviction order.
  let total = PACKET_SLOTS.reduce((sum, slot) => sum + slotTokens(slot), 0);
  for (const slot of evictionOrder) {
    if (total <= input.tokenBudget) break;
    const evicted = included.get(slot)!;
    if (evicted.length === 0) continue;
    for (const item of evicted) {
      omit(slot, item, "EVICTED");
      itemsById.delete(item.id);
    }
    total -= evicted.reduce((sum, item) => sum + item.tokens, 0);
    included.set(slot, []);
  }

  // 4 · manifest, with truncation *derived* from the omissions. The admitted
  // item's verbatim `content` stays in the manifest: the evidence case a
  // reviewer reads must show the exact bytes the model cited, and the packet
  // hash covers them.
  const slots: SlotManifest[] = assemblyOrder.map((slot) => ({
    slot,
    tokenBudget: input.slotBudgets[slot]!,
    tokensUsed: slotTokens(slot),
    included: included.get(slot)!,
    omitted: omitted.get(slot)!,
  }));

  const manifest: PacketManifest = {
    slots,
    truncated: slots.some((slot) => slot.omitted.length > 0),
    assemblyOrder: [...assemblyOrder],
    evictionOrder: [...evictionOrder],
    tokenEstimator: TOKEN_ESTIMATOR,
  };

  return {
    manifest,
    slots: assemblyOrder.map((slot) => ({ slot, items: included.get(slot)! })),
    itemsById,
    tokensUsed: total,
  };
}

/**
 * Citation handles → SHA-256 of the admitted text. This is exactly what the
 * verdict gate compares a citation's `contentSha256` against (FR-10).
 */
export function contentHashes(assembled: AssembledPacket): Map<string, string> {
  const out = new Map<string, string>();
  for (const [id, item] of assembled.itemsById) {
    if (item.contentSha256) out.set(id, item.contentSha256);
    else out.set(id, canonicalHash(item.content));
  }
  return out;
}

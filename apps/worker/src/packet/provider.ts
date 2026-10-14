import {
  NODE_TYPE_META,
  SLOT_ITEMS_KEY,
  evidenceItemSchema,
  type Edge,
  type EvidenceItem,
  type FreshnessState,
  type NodeType,
  type PacketSlot,
} from "@unify/contracts";
import { sha256 } from "./tokens.js";

/**
 * Evidence sourcing seam (TODO §3.3).
 *
 * The packet builder never knows *where* evidence comes from — it asks an
 * `EvidenceProvider` for slot sources and a summary of the links the verdict
 * will rest on. Two implementations exist from day one:
 *
 *   `GraphEvidenceProvider`  reads the evidence graph (what runs in production)
 *   `FixtureEvidenceProvider` reads a frozen case bundle (tests, CI, demos)
 *
 * When the Slice B analyser lands, it changes nothing here: it publishes
 * evidence items into node payloads (`payload.slotItems`), which is exactly
 * what the graph provider already reads back.
 */
export interface ProviderContext {
  criterionNodeId: string;
  workspaceId: string;
  /**
   * The revision pair this packet is pinned to (FR-06, §22.2). When present,
   * evidence is scoped to it: a node describing another change's commit — or a
   * pull request at another head — belongs to that change's packet, not this
   * one. Without this, two open pull requests on the same criterion share one
   * evidence window and produce one identical verdict for both.
   */
  baseCommit?: string;
  headCommit?: string;
}

/** The links a verdict would rest on — criterion-incident edges only. */
export type SupportingEdge = Pick<
  Edge,
  "fromId" | "toId" | "type" | "sourceClass" | "confidence" | "resolver" | "linkState"
>;

/** What the provider learned while gathering evidence (gate inputs + provenance). */
export interface ProviderSummary {
  ruleApplicable: boolean;
  supportingEdges: readonly SupportingEdge[];
  freshnessState: FreshnessState;
  nodesRead: number;
  edgesRead: number;
}

export interface EvidenceBundle {
  sources: Partial<Record<PacketSlot, readonly EvidenceItem[]>>;
  summary: ProviderSummary;
}

export interface EvidenceProvider {
  /** Recorded in run logs so a packet's provenance names its evidence source. */
  readonly name: string;
  load(ctx: ProviderContext): Promise<EvidenceBundle>;
}

/**
 * Admission priority within a slot, for the kinds where one item's *content*
 * is the evidence and another's content is only context for it.
 *
 * The assembler fills a slot in provider order and stops at the first item
 * that would overrun it (no second pass — that would make admission depend on
 * item sizes). Provider order for the graph is node id, which is arbitrary, so
 * without this the single most decisive item in a slot can land after its
 * budget is spent: a failing test run once recorded as PARTIAL because the
 * run's log arrived after the test sources had filled TEST_EVIDENCE.
 *
 * This is not relevance re-ranking: the order is a fixed, recorded function of
 * the item kind, so the same graph still yields byte-identical packets (FR-08).
 * Kinds absent from the map keep provider order, tie-broken by citation id.
 */
const SLOT_ITEM_PRIORITY: Partial<Record<PacketSlot, Record<string, number>>> = {
  TEST_EVIDENCE: { test_run: 0, test_source: 1 },
};

/** Reorder a slot's items into admission order (stable, deterministic). */
export function prioritizeSlotItems(
  sources: Partial<Record<PacketSlot, readonly EvidenceItem[]>>,
): Partial<Record<PacketSlot, readonly EvidenceItem[]>> {
  const out: Partial<Record<PacketSlot, readonly EvidenceItem[]>> = {};
  for (const [slot, items] of Object.entries(sources) as [PacketSlot, readonly EvidenceItem[]][]) {
    const priority = SLOT_ITEM_PRIORITY[slot];
    if (!priority || !items) {
      out[slot] = items;
      continue;
    }
    out[slot] = [...items].sort((a, b) => {
      const pa = priority[a.kind] ?? 99;
      const pb = priority[b.kind] ?? 99;
      return pa === pb ? a.id.localeCompare(b.id) : pa - pb;
    });
  }
  return out;
}

/**
 * Which packet slot a node type's evidence belongs in (§1.7).
 *
 * Derived from `NODE_TYPE_META` in `@unify/contracts` — the single table that
 * also carries each node type's display tool, so the worker and the reviewer
 * surface can never disagree about the node-type vocabulary.
 *
 * This is the whole contract between "a node in the graph" and "a section of
 * the packet": publish `payload.slotItems` on a node of one of these types and
 * it lands in the matching slot. Node types without an entry contribute to the
 * graph-neighbourhood slot through their edges, not through payload items.
 */
export const TYPE_TO_SLOT: Partial<Record<NodeType, PacketSlot>> = Object.fromEntries(
  Object.entries(NODE_TYPE_META).flatMap(([type, meta]) =>
    meta.slot ? [[type, meta.slot]] : [],
  ),
) as Partial<Record<NodeType, PacketSlot>>;

/**
 * Citation handles are namespaced by the owning node's external id, so two
 * nodes can publish `span-1` without ever making a verdict citation ambiguous.
 * The namespace survives into the manifest, which is what lets a reviewer see
 * at a glance *which artefact* a cited span came from.
 */
export function namespaceItemId(externalId: string, itemId: string): string {
  return `${externalId}#${itemId}`;
}

/** Extract valid evidence items from a node payload; invalid entries are dropped. */
export function slotItemsFromPayload(
  externalId: string,
  payload: unknown,
): { items: EvidenceItem[]; invalid: number } {
  const items: EvidenceItem[] = [];
  let invalid = 0;
  const raw =
    payload && typeof payload === "object" && Array.isArray((payload as Record<string, unknown>)[SLOT_ITEMS_KEY])
      ? ((payload as Record<string, unknown>)[SLOT_ITEMS_KEY] as unknown[])
      : [];

  for (const entry of raw) {
    const parsed = evidenceItemSchema.safeParse(entry);
    if (!parsed.success) {
      invalid += 1;
      continue;
    }
    items.push({ ...parsed.data, id: namespaceItemId(externalId, parsed.data.id) });
  }
  return { items, invalid };
}

/**
 * Build an evidence item, hashing the content here so a caller can never
 * publish text under a hash it did not compute (FR-10's citation check is
 * only as good as this line).
 */
export function makeItem(
  id: string,
  kind: string,
  content: string,
  cite?: { file: string; symbol?: string; startLine?: number; endLine?: number },
): EvidenceItem {
  return { id, kind, content, contentSha256: sha256(content), ...(cite ? { cite } : {}) };
}

/** One text line describing an edge, for the GRAPH_NEIGHBOURHOOD slot. */
export function edgeLine(
  fromLabel: string,
  edge: { type: string; sourceClass: string; confidence: number; resolver: string },
  toLabel: string,
): string {
  return `${fromLabel} -[${edge.type} · ${edge.sourceClass}]-> ${toLabel} (confidence ${edge.confidence.toFixed(2)}, resolver ${edge.resolver})`;
}

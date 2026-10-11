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

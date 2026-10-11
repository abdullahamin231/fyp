import type { SupabaseClient } from "@supabase/supabase-js";
import type { EvidenceItem, PacketSlot } from "@unify/contracts";
import { loadCriterion, loadEdgesWithin, loadFreshness, loadNodes, loadRuleById } from "../../graph/nodes.js";
import { canonicalJson } from "../hash.js";
import {
  TYPE_TO_SLOT,
  edgeLine,
  makeItem,
  slotItemsFromPayload,
  type EvidenceBundle,
  type EvidenceProvider,
  type ProviderContext,
  type SupportingEdge,
} from "../provider.js";

/**
 * Evidence from the live evidence graph — the production provider.
 *
 * Retrieval is a bounded two-hop walk from the criterion (§11.5): what the
 * criterion links to, and what *those* link to. Every node in the window that
 * has a packet slot contributes its `payload.slotItems`; every active edge in
 * the window is rendered as neighbourhood evidence. Nothing is re-ranked: the
 * order is node id, then payload order, then edge order — so the same graph
 * always yields the same packet (FR-08).
 *
 * When the Slice B analyser exists, it publishes code/test evidence into node
 * payloads; this class is already the consumer of exactly that shape.
 */
export class GraphEvidenceProvider implements EvidenceProvider {
  readonly name = "graph";

  constructor(
    private readonly client: SupabaseClient,
    private readonly opts: { maxHops?: number } = {},
  ) {}

  async load(ctx: ProviderContext): Promise<EvidenceBundle> {
    const criterion = await loadCriterion(this.client, ctx.criterionNodeId);
    const maxHops = this.opts.maxHops ?? 3;

    interface Row {
      id: string;
      from_id: string;
      to_id: string;
      type: string;
      source_class: string;
      confidence: number;
      resolver: string;
      link_state: string;
    }
    const edgeById = new Map<string, Row>();
    const visited = new Set<string>([criterion.id]);
    let frontier = [criterion.id];

    for (let hop = 0; hop < maxHops && frontier.length > 0; hop += 1) {
      const edges = await loadEdgesWithin(this.client, frontier);
      const next: string[] = [];
      for (const edge of edges) {
        edgeById.set(edge.id, edge);
        for (const id of [edge.from_id, edge.to_id]) {
          if (!visited.has(id)) {
            visited.add(id);
            next.push(id);
          }
        }
      }
      frontier = next;
    }

    const nodes = await loadNodes(this.client, [...visited]);
    const externalById = new Map(nodes.map((node) => [node.id, node.external_id]));

    const sources: Partial<Record<PacketSlot, EvidenceItem[]>> = {};
    const push = (slot: PacketSlot, items: EvidenceItem[]) => {
      if (items.length === 0) return;
      sources[slot] = [...(sources[slot] ?? []), ...items];
    };

    let invalidPayloadItems = 0;
    for (const node of nodes) {
      const slot = TYPE_TO_SLOT[node.type as keyof typeof TYPE_TO_SLOT];
      if (!slot) continue;
      const { items, invalid } = slotItemsFromPayload(node.external_id, node.payload);
      invalidPayloadItems += invalid;
      push(slot, items);
    }

    const orderedEdges = [...edgeById.values()].sort((a, b) =>
      a.from_id === b.from_id
        ? a.type === b.type
          ? a.to_id.localeCompare(b.to_id)
          : a.type.localeCompare(b.type)
        : a.from_id.localeCompare(b.from_id),
    );

    const label = (id: string) => externalById.get(id) ?? id;
    push(
      "GRAPH_NEIGHBOURHOOD",
      orderedEdges.map((edge, index) =>
        makeItem(
          `edge-${index + 1}`,
          "graph_edge",
          edgeLine(label(edge.from_id), { ...edge, sourceClass: edge.source_class }, label(edge.to_id)),
          { file: "(graph)" },
        ),
      ),
    );

    if (criterion.policyId) {
      const rule = await loadRuleById(this.client, criterion.policyId);
      if (rule) {
        push("POLICY_DEFINITION", [
          makeItem(
            `rule:${rule.id}#v${rule.version}`,
            "policy_definition",
            `rule ${rule.id} v${rule.version} (${rule.edgeType} → ${rule.produces}, severity ${rule.severity}, active ${rule.active})\ncondition: ${rule.condition}\ntrigger: ${canonicalJson(rule.trigger)}\nguards: ${canonicalJson(rule.guards)}`,
            { file: "(policy)" },
          ),
        ]);
      }
    }

    if (invalidPayloadItems > 0) {
      console.warn(
        `GraphEvidenceProvider: dropped ${invalidPayloadItems} malformed payload item(s) in the ${nodes.length}-node window`,
      );
    }

    const supportingEdges: SupportingEdge[] = orderedEdges
      .filter((edge) => edge.from_id === criterion.id || edge.to_id === criterion.id)
      .map((edge) => ({
        fromId: edge.from_id,
        toId: edge.to_id,
        type: edge.type as SupportingEdge["type"],
        sourceClass: edge.source_class as SupportingEdge["sourceClass"],
        confidence: edge.confidence,
        resolver: edge.resolver,
        linkState: edge.link_state as SupportingEdge["linkState"],
      }));

    return {
      sources,
      summary: {
        ruleApplicable: criterion.ruleApplicable,
        supportingEdges,
        freshnessState: await loadFreshness(this.client, criterion.workspaceId),
        nodesRead: nodes.length,
        edgesRead: orderedEdges.length,
      },
    };
  }
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { EvidenceItem, PacketSlot } from "@unify/contracts";
import { loadCriterion, loadEdgesWithin, loadFreshness, loadNodes, loadRuleById } from "../../graph/nodes.js";
import { canonicalJson } from "../hash.js";
import {
  TYPE_TO_SLOT,
  edgeLine,
  makeItem,
  prioritizeSlotItems,
  slotItemsFromPayload,
  type EvidenceBundle,
  type EvidenceProvider,
  type ProviderContext,
  type SupportingEdge,
} from "../provider.js";

/** The node shape `loadNodes` returns (its row type is module-local there). */
type NodeRow = Awaited<ReturnType<typeof loadNodes>>[number];

/**
 * Evidence from the live evidence graph — the production provider.
 * Retrieval is a bounded walk from the criterion (§11.5): what the criterion
 * links to, and what those link to, to the hop bound. Every node in the window
 * that has a packet slot contributes its `payload.slotItems`; every active edge
 * in the window is rendered as neighbourhood evidence. Nothing is re-ranked:
 * the order is node id, then payload order, then edge order — so the same graph
 * always yields the same packet (FR-08).
 *
 * The window is then scoped to the job's pinned revision pair: the graph is
 * shared state, so a node or pull request belonging to a different head is
 * dropped rather than mixed into a packet that claims to be about this change.
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
    const head = ctx.headCommit ?? null;

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

    // Scope the window to the pinned revision pair (FR-06): the walking graph
    // is shared, mutable state — several open changes can link to the same
    // criterion — so a node describing another commit, or a pull request at
    // another head, belongs to that change's packet. Context nodes (the
    // criterion, its ticket, requirements and design constraints) describe the
    // criterion itself and always belong.
    const CONTEXT_TYPES = new Set(["Criterion", "Ticket", "Requirement", "DesignConstraint", "DesignArtifact", "Person"]);
    const atThisHead = (node: NodeRow): boolean =>
      !head ||
      node.version === head ||
      node.payload?.sha === head ||
      node.payload?.commit === head ||
      node.payload?.headSha === head;
    const kept = nodes.filter((node) => CONTEXT_TYPES.has(node.type) || atThisHead(node));
    const keptIds = new Set(kept.map((node) => node.id));
    const dropped = nodes.length - kept.length;
    if (dropped > 0) {
      console.warn(
        `GraphEvidenceProvider: dropped ${dropped} node(s) from another revision pair ` +
          `(${kept.length}/${nodes.length} kept for head ${head ?? "(unscoped)"})`,
      );
    }

    const sources: Partial<Record<PacketSlot, EvidenceItem[]>> = {};
    const push = (slot: PacketSlot, items: EvidenceItem[]) => {
      if (items.length === 0) return;
      sources[slot] = [...(sources[slot] ?? []), ...items];
    };

    let invalidPayloadItems = 0;
    for (const node of kept) {
      const slot = TYPE_TO_SLOT[node.type as keyof typeof TYPE_TO_SLOT];
      if (!slot) continue;
      const { items, invalid } = slotItemsFromPayload(node.external_id, node.payload);
      invalidPayloadItems += invalid;
      push(slot, items);
    }

    // Only edges between two kept nodes: an edge into a dropped node would
    // smuggle another change's evidence into the neighbourhood rendering.
    const orderedEdges = [...edgeById.values()]
      .filter((edge) => keptIds.has(edge.from_id) && keptIds.has(edge.to_id))
      .sort((a, b) =>
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
        `GraphEvidenceProvider: dropped ${invalidPayloadItems} malformed payload item(s) in the ${kept.length}-node window`,
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
      sources: prioritizeSlotItems(sources),
      summary: {
        ruleApplicable: criterion.ruleApplicable,
        supportingEdges,
        freshnessState: await loadFreshness(this.client, criterion.workspaceId),
        // What this packet actually read — the scoped window, not the raw walk.
        nodesRead: kept.length,
        edgesRead: orderedEdges.length,
      },
    };
  }
}

import { z } from "zod";
import {
  edgeTypeSchema,
  linkStateSchema,
  nodeTypeSchema,
  sourceClassSchema,
  type EvidenceItem,
  type NodeType,
  type PacketSlot,
} from "@unify/contracts";
import {
  TYPE_TO_SLOT,
  edgeLine,
  makeItem,
  namespaceItemId,
  prioritizeSlotItems,
  slotItemsFromPayload,
  type EvidenceBundle,
  type ProviderSummary,
  type SupportingEdge,
} from "../packet/provider.js";

/**
 * Frozen case bundles — the dataset-shaped fixtures the packet builder and the
 * demo run are tested against (TODO §3.3 "packet code slots served via
 * dataset fixtures first").
 *
 * A bundle carries *text*, which the dataset's `04_cases/*.json` do not: those
 * record `content_sha256` and line ranges but never the cited lines
 * themselves. Cloning four repos to recover ~40 spans would make the build
 * depend on the network and on history that can drift, so this repo keeps its
 * own small, immutable case instead — same vocabulary, same hash discipline
 * (`contentSha256` is computed from the content, so the gate's byte-for-byte
 * citation check is exercised for real), and the dataset cases remain the
 * evaluation reference rather than a runtime dependency.
 *
 * The bundle is also the single source of truth for the demo seed: the seed
 * writes `fixtureNodePayloads` into graph nodes, and `GraphEvidenceProvider`
 * reads the same payloads back — so tests and the live run assemble identical
 * packets from identical data.
 */

const hex40 = z.string().regex(/^[0-9a-f]{40}$/, "expected a 40-character commit sha");
const nonEmpty = z.string().min(1);

const citeShape = z.strictObject({
  file: nonEmpty,
  symbol: nonEmpty.optional(),
  startLine: z.number().int().positive(),
  endLine: z.number().int().positive(),
});

const codeItemShape = citeShape.extend({ content: z.string(), externalId: nonEmpty });
export const fixtureEdgeSchema = z.strictObject({
  from: nonEmpty,
  to: nonEmpty,
  type: edgeTypeSchema,
  sourceClass: sourceClassSchema,
  confidence: z.number().min(0).max(1),
  resolver: nonEmpty,
  linkState: linkStateSchema,
});

export const fixtureBundleSchema = z.strictObject({
  caseId: nonEmpty,
  repo: nonEmpty,
  baseCommit: hex40,
  headCommit: hex40,
  freshness: z.enum(["CURRENT", "STALE", "UNKNOWN"]).default("CURRENT"),
  change: z.strictObject({
    externalId: nonEmpty,
    title: nonEmpty,
    author: nonEmpty,
  }),
  criterion: z.strictObject({
    externalId: nonEmpty,
    text: nonEmpty,
    requirementRef: z.string().nullable().default(null),
    ruleApplicable: z.boolean().default(true),
  }),
  requirement: z.strictObject({ externalId: nonEmpty, text: nonEmpty }),
  designConstraints: z
    .array(z.strictObject({ externalId: nonEmpty, text: nonEmpty }))
    .default([]),
  tests: z
    .array(
      z.strictObject({
        externalId: nonEmpty,
        file: nonEmpty,
        command: nonEmpty,
        passed: z.boolean(),
        log: z.string(),
      }),
    )
    .default([]),
  symbols: z.array(codeItemShape.extend({ symbol: nonEmpty })).default([]),
  diff: z.array(codeItemShape).default([]),
  neighbours: z
    .array(z.strictObject({ externalId: nonEmpty, type: nodeTypeSchema, text: nonEmpty }))
    .default([]),
  edges: z.array(fixtureEdgeSchema).default([]),
  policy: z.strictObject({ id: nonEmpty, text: nonEmpty }).nullable().default(null),
});

export type FixtureBundle = z.infer<typeof fixtureBundleSchema>;

function item(
  localId: string,
  kind: string,
  content: string,
  cite?: { file: string; symbol?: string; startLine?: number; endLine?: number },
): EvidenceItem {
  return makeItem(localId, kind, content, cite);
}

/**
 * POLICY_DEFINITION evidence: the deterministic rule text the gate will name.
 * Rules live in the `rules` table, not as nodes, so this slot is fed directly
 * rather than through `payload.slotItems`.
 */
export function policyItem(policy: { id: string; text: string } | null): EvidenceItem | null {
  if (!policy) return null;
  return makeItem(`rule:${policy.id}#text`, "policy_definition", policy.text, {
    file: "(policy)",
  });
}

/**
 * One graph node's publishable payload: `payload.slotItems` for the packet,
 * plus the type-specific fields a reviewer UI may read.
 */
export interface FixtureNode {
  externalId: string;
  type: NodeType;
  payload: Record<string, unknown>;
}

/**
 * Turn a bundle into the node payloads the analyser would have written.
 * `GraphEvidenceProvider` and the fixture provider both derive their slot
 * sources from this, so the live path and the test path cannot drift.
 */
export function fixtureNodePayloads(bundle: FixtureBundle): FixtureNode[] {
  const nodes: FixtureNode[] = [];

  nodes.push({
    externalId: bundle.criterion.externalId,
    type: "Criterion",
    payload: {
      text: bundle.criterion.text,
      requirementRef: bundle.criterion.requirementRef,
      ruleApplicable: bundle.criterion.ruleApplicable,
      // Which deterministic rule governs this criterion — read from the
      // `rules` table by the graph provider, which turns it into
      // POLICY_DEFINITION evidence.
      policyId: bundle.policy?.id ?? null,
      repo: bundle.repo,
    },
  });

  nodes.push({
    externalId: bundle.change.externalId,
    type: "PullRequest",
    payload: {
      title: bundle.change.title,
      author: bundle.change.author,
      baseCommit: bundle.baseCommit,
      headCommit: bundle.headCommit,
      slotItems: [
        item(
          "summary",
          "change_summary",
          `${bundle.change.title}\nauthor: ${bundle.change.author}\nbase ${bundle.baseCommit} → head ${bundle.headCommit}`,
          { file: "(change)" },
        ),
      ],
    },
  });

  nodes.push({
    externalId: bundle.requirement.externalId,
    type: "Requirement",
    payload: {
      text: bundle.requirement.text,
      slotItems: [item("text", "requirement", bundle.requirement.text, { file: "(requirement)" })],
    },
  });

  for (const constraint of bundle.designConstraints) {
    nodes.push({
      externalId: constraint.externalId,
      type: "DesignConstraint",
      payload: {
        text: constraint.text,
        slotItems: [item("text", "design_constraint", constraint.text, { file: "(design)" })],
      },
    });
  }

  for (const test of bundle.tests) {
    const content = `${test.file}\n$ ${test.command}\n${test.passed ? "PASS" : "FAIL"}\n${test.log}`;
    nodes.push({
      externalId: test.externalId,
      type: "TestCase",
      payload: {
        file: test.file,
        command: test.command,
        passed: test.passed,
        slotItems: [item("run", "test_run", content, { file: test.file })],
      },
    });
  }

  if (bundle.diff.length > 0) {
    nodes.push({
      externalId: `commit:${bundle.headCommit.slice(0, 12)}`,
      type: "Commit",
      payload: {
        sha: bundle.headCommit,
        repo: bundle.repo,
        slotItems: bundle.diff.map((hunk, index) =>
          item(
            `hunk-${index + 1}`,
            "diff_hunk",
            `${hunk.file} @@ ${hunk.startLine}-${hunk.endLine} @@\n${hunk.content}`,
            { file: hunk.file, startLine: hunk.startLine, endLine: hunk.endLine },
          ),
        ),
      },
    });
  }

  for (const symbol of bundle.symbols) {
    nodes.push({
      externalId: symbol.externalId,
      type: "CodeSymbol",
      payload: {
        file: symbol.file,
        symbol: symbol.symbol,
        startLine: symbol.startLine,
        endLine: symbol.endLine,
        slotItems: [
          item(
            "card",
            "symbol_card",
            `${symbol.file}#${symbol.symbol} lines ${symbol.startLine}-${symbol.endLine}\n${symbol.content}`,
            {
              file: symbol.file,
              symbol: symbol.symbol,
              startLine: symbol.startLine,
              endLine: symbol.endLine,
            },
          ),
        ],
      },
    });
  }

  for (const neighbour of bundle.neighbours) {
    nodes.push({
      externalId: neighbour.externalId,
      type: neighbour.type,
      payload: {
        text: neighbour.text,
        slotItems: [item("text", "neighbour_note", neighbour.text, { file: "(linked)" })],
      },
    });
  }

  return nodes;
}

/** Build slot sources from bundle node payloads, with citation namespacing applied. */
export function fixtureBundleSources(bundle: FixtureBundle): EvidenceBundle {  const nodes = fixtureNodePayloads(bundle);
  const byExternalId = new Map(nodes.map((node) => [node.externalId, node]));
  const criterion = bundle.criterion.externalId;

  const sources: Partial<Record<PacketSlot, EvidenceItem[]>> = {};
  const push = (slot: PacketSlot, items: EvidenceItem[]) => {
    if (items.length === 0) return;
    const existing = sources[slot] ?? [];
    sources[slot] = [...existing, ...items];
  };

  for (const node of nodes) {
    const slot = TYPE_TO_SLOT[node.type];
    if (!slot) continue;
    const { items } = slotItemsFromPayload(node.externalId, node.payload);
    push(slot, items);
  }

  // Edges the verdict will rest on, rendered as neighbourhood evidence.
  const label = (id: string) => byExternalId.get(id)?.externalId ?? id;
  push(
    "GRAPH_NEIGHBOURHOOD",
    bundle.edges.map((edge, index) =>
      makeItem(
        `edge-${index + 1}`,
        "graph_edge",
        edgeLine(label(edge.from), edge, label(edge.to)),
        { file: "(graph)" },
      ),
    ),
  );

  const policy = policyItem(bundle.policy);
  if (policy) push("POLICY_DEFINITION", [policy]);

  const supportingEdges: SupportingEdge[] = bundle.edges
    .filter((edge) => edge.from === criterion || edge.to === criterion)
    .map((edge) => ({
      fromId: edge.from,
      toId: edge.to,
      type: edge.type,
      sourceClass: edge.sourceClass,
      confidence: edge.confidence,
      resolver: edge.resolver,
      linkState: edge.linkState,
    }));

  const summary: ProviderSummary = {
    ruleApplicable: bundle.criterion.ruleApplicable,
    supportingEdges,
    freshnessState: bundle.freshness,
    nodesRead: nodes.length,
    edgesRead: bundle.edges.length,
  };

  // Same fixed admission priority as the graph provider (packet/provider.ts),
  // so a packet from a bundle and a packet from the live graph are assembled
  // under one order.
  return { sources: prioritizeSlotItems(sources), summary };
}

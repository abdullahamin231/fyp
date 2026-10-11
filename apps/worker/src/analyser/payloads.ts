/**
 * Analysis → evidence-graph nodes and edges (the Slice B → Slice C handover).
 *
 * Each node carries `payload.slotItems` in the `EvidenceItem` shape from
 * @unify/contracts, which is exactly what the packet builder reads back
 * (packet/provider.ts `slotItemsFromPayload`). The node type decides the
 * packet slot (contracts `NODE_TYPE_META`):
 *   Commit      → DIFF_HUNKS      one `diff_hunk` item per hunk
 *   CodeSymbol  → SYMBOL_CARDS    one `symbol_card` item (FR-25)
 *   TestCase    → TEST_EVIDENCE   one `test_source` item per test block
 *
 * Edges are only emitted for relations the analyser established, never for
 * guesses: `Commit PART_OF PullRequest` when the PR is known, and
 * `TestCase COVERS CodeSymbol` only when the test file imports the symbol's
 * file. A test that merely mentions the name is still listed as evidence,
 * but gets no edge.
 */
import type { EdgeType, EvidenceItem, NodeType } from "@unify/contracts";
import { makeItem } from "../packet/provider.js";
import { ANALYSER, type Analysis, type ChangedSymbol } from "./analyse.js";

export interface AnalyserNode {
  externalId: string;
  type: NodeType;
  payload: Record<string, unknown> & { slotItems: EvidenceItem[] };
}

export interface AnalyserEdge {
  from: string; // externalId
  to: string;
  type: EdgeType;
  sourceClass: "derived";
  confidence: number;
  resolver: string;
}

export const RESOLVER = `analyser:${ANALYSER.name}@${ANALYSER.version}`;

/** `src/logic/createFormControl.ts` → `src logic create form control ts` (FR-25 path tokens). */
export function pathTokens(path: string): string {
  return path
    .split(/[/._-]+/)
    .flatMap((part) => part.split(/(?<=[a-z0-9])(?=[A-Z])/))
    .filter(Boolean)
    .map((t) => t.toLowerCase())
    .join(" ");
}

/** The symbol card text (FR-25). Fixed field order, so the same symbol always yields the same bytes. */
export function symbolCard(sym: ChangedSymbol, commitMessage: string): string {
  const subject = commitMessage.split("\n")[0] ?? "";
  const lines = [
    `symbol: ${sym.fqName} (${sym.kind}, ${sym.change})`,
    `file: ${sym.file} lines ${sym.startLine}-${sym.endLine}`,
    `path tokens: ${pathTokens(sym.file)}`,
    `signature: ${sym.signature}`,
    `doc: ${sym.docComment ?? "(none)"}`,
    `comments: ${sym.leadingComments.length ? sym.leadingComments.join(" | ") : "(none)"}`,
    `imports: ${sym.imports.length ? sym.imports.join(", ") : "(none)"}`,
    `callers: ${sym.callers.length ? sym.callers.map((c) => `${c.symbol} (${c.file}:${c.line}, ${c.resolution})`).join("; ") : "(none found)"}`,
    `unresolved: ${sym.unresolved.length ? sym.unresolved.map((u) => `${u.kind} line ${u.line}`).join("; ") : "(none)"}`,
    `commit: ${subject}`,
    "---",
    sym.text,
  ];
  return lines.join("\n");
}

export function symbolExternalId(repo: string, sym: { file: string; fqName: string }): string {
  return `${repo}:${sym.file}#${sym.fqName}`;
}

export function toGraph(
  analysis: Analysis,
  options: { pullRequestExternalId?: string } = {},
): { nodes: AnalyserNode[]; edges: AnalyserEdge[] } {
  const nodes: AnalyserNode[] = [];
  const edges: AnalyserEdge[] = [];
  const edge = (from: string, to: string, type: EdgeType): AnalyserEdge => ({
    from, to, type, sourceClass: "derived", confidence: 1, resolver: RESOLVER,
  });

  // Commit: the diff hunks.
  const commitId = `commit:${analysis.head.slice(0, 12)}`;
  nodes.push({
    externalId: commitId,
    type: "Commit",
    payload: {
      sha: analysis.head,
      base: analysis.base,
      repo: analysis.repo,
      message: analysis.headMessage,
      analyser: RESOLVER,
      slotItems: analysis.hunks.map((h) => {
        const start = Math.max(1, h.newStart);
        const end = Math.max(start, h.newStart + h.newLines - 1);
        return makeItem(h.id, "diff_hunk", `${h.file} @@ -${h.oldStart},${h.oldLines} +${h.newStart},${h.newLines} @@\n${h.text}`, {
          file: h.file,
          startLine: start,
          endLine: end,
        });
      }),
    },
  });
  if (options.pullRequestExternalId) edges.push(edge(commitId, options.pullRequestExternalId, "PART_OF"));

  // CodeSymbol: one card per changed symbol.
  for (const sym of analysis.changedSymbols) {
    nodes.push({
      externalId: symbolExternalId(analysis.repo, sym),
      type: "CodeSymbol",
      payload: {
        file: sym.file,
        symbol: sym.fqName,
        kind: sym.kind,
        change: sym.change,
        startLine: sym.startLine,
        endLine: sym.endLine,
        signature: sym.signature,
        commit: analysis.head,
        analyser: RESOLVER,
        slotItems: [
          makeItem("card", "symbol_card", symbolCard(sym, analysis.headMessage), {
            file: sym.file,
            symbol: sym.fqName,
            startLine: sym.startLine,
            endLine: sym.endLine,
          }),
        ],
      },
    });
  }

  // TestCase: one node per test file, one item per relevant test block.
  for (const ev of analysis.tests) {
    const id = `${analysis.repo}:${ev.file}`;
    nodes.push({
      externalId: id,
      type: "TestCase",
      payload: {
        file: ev.file,
        reasons: ev.reasons,
        tests: ev.tests.map((t) => t.name),
        analyser: RESOLVER,
        slotItems: ev.tests.map((t, i) =>
          makeItem(`test-${i + 1}`, "test_source", `${ev.file} > ${t.name}\n${t.text}`, {
            file: ev.file,
            startLine: t.startLine,
            endLine: t.endLine,
          }),
        ),
      },
    });
    // COVERS only where the test file imports the symbol's file: an established relation.
    const mentioned = new Set(ev.tests.flatMap((t) => t.mentions));
    for (const sym of analysis.changedSymbols) {
      if (!mentioned.has(sym.fqName)) continue;
      if (!ev.importsChangedFiles.includes(sym.file)) continue;
      edges.push(edge(id, symbolExternalId(analysis.repo, sym), "COVERS"));
    }
  }

  return { nodes, edges };
}


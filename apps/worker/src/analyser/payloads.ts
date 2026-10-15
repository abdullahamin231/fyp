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
 * guesses. When the pull request is known (`pullRequestExternalId`):
 *   Commit      PART_OF     PullRequest
 *   PullRequest IMPLEMENTS  CodeSymbol   every symbol the diff touches
 *   PullRequest IMPLEMENTS  TestCase     every test file the diff touches
 *   PullRequest IMPLEMENTS  TestCase     the test *run* at head, when one ran
 * and always:
 *   TestCase    COVERS      CodeSymbol   only when the test imports the
 *                                        symbol's file
 * A test that merely mentions a symbol's name is still listed as evidence but
 * gets no COVERS edge.
 *
 * Why IMPLEMENTS from the PR: the packet builder walks the graph outward from
 * a criterion (criterion -> PR -> ...). Without an edge from the PR, symbol
 * cards and tests would sit in the graph unreachable, and only the diff hunks
 * (on the Commit) would reach a packet. IMPLEMENTS is the type the worker's
 * fixture already uses for PR -> symbol.
 *
 * The test-run node needs that edge like any other evidence node: it is the
 * only record of whether the suite passed at head, and an orphan node is
 * invisible to the walk — which is how a failing suite once landed as PARTIAL
 * instead of CONTRADICTED.
 */
import type { EdgeType, EvidenceItem, NodeType } from "@unify/contracts";
import { makeItem } from "../packet/provider.js";
import { ANALYSER, type Analysis, type ChangedSymbol } from "./analyse.js";

export interface AnalyserNode {
  externalId: string;
  type: NodeType;
  /** The commit this node's evidence describes (nodes.version). */
  version: string;
  payload: Record<string, unknown> & { slotItems: EvidenceItem[] };
}

export interface AnalyserEdge {
  from: string; // externalId
  fromType: NodeType;
  to: string;
  toType: NodeType;
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
    `coverage: ${
      sym.coverage === undefined ? "(not measured)"
      : sym.coverage === null ? "(file not in coverage report)"
      : `${sym.coverage.covered}/${sym.coverage.instrumented} lines run by tests; changed lines ${sym.coverage.changedCovered}/${sym.coverage.changedInstrumented}`
    }`,
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
  const edge = (from: string, fromType: NodeType, to: string, toType: NodeType, type: EdgeType): AnalyserEdge => ({
    from, fromType, to, toType, type, sourceClass: "derived", confidence: 1, resolver: RESOLVER,
  });
  const version = analysis.head;

  // Commit: the diff hunks.
  const commitId = `commit:${analysis.head.slice(0, 12)}`;
  nodes.push({
    externalId: commitId,
    type: "Commit",
    version,
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
  if (options.pullRequestExternalId) {
    edges.push(edge(commitId, "Commit", options.pullRequestExternalId, "PullRequest", "PART_OF"));
  }

  // CodeSymbol: one card per changed symbol.
  const pr = options.pullRequestExternalId;
  for (const sym of analysis.changedSymbols) {
    if (pr) edges.push(edge(pr, "PullRequest", symbolExternalId(analysis.repo, sym), "CodeSymbol", "IMPLEMENTS"));
    nodes.push({
      externalId: symbolExternalId(analysis.repo, sym),
      type: "CodeSymbol",
      version,
      payload: {
        file: sym.file,
        symbol: sym.fqName,
        kind: sym.kind,
        change: sym.change,
        startLine: sym.startLine,
        endLine: sym.endLine,
        signature: sym.signature,
        coverage: sym.coverage ?? null,
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
    if (pr && ev.reasons.includes("changed")) edges.push(edge(pr, "PullRequest", id, "TestCase", "IMPLEMENTS"));
    nodes.push({
      externalId: id,
      type: "TestCase",
      version,
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
      edges.push(edge(id, "TestCase", symbolExternalId(analysis.repo, sym), "CodeSymbol", "COVERS"));
    }
  }

  // TestCase for the test run, if one was requested: same `test_run` item shape
  // as the fixtures (bundle.ts) — verdict on its own line, then the exit
  // detail. The stub model keys off exactly that shape (`\nFAIL\n` /
  // `\nPASS\n`), so this line's format is load-bearing, not cosmetic.
  if (analysis.testRun) {
    const run = analysis.testRun;
    const verdict = run.timedOut ? "TIMEOUT" : run.passed ? "PASS" : "FAIL";
    const runId = `${analysis.repo}:test-run:${analysis.head.slice(0, 12)}`;
    nodes.push({
      externalId: runId,
      type: "TestCase",
      version,
      payload: {
        command: run.command,
        passed: run.passed,
        exitCode: run.exitCode,
        durationMs: run.durationMs,
        analyser: RESOLVER,
        slotItems: [
          makeItem("run", "test_run", `$ ${run.command}\n${verdict}\n(exit ${run.exitCode ?? "none"}, ${run.durationMs} ms)\n${run.logTail}`, {
            file: "(test run)",
          }),
        ],
      },
    });
    // Reachable from the criterion walk (criterion -> PR -> run). Without this
    // edge the node is an orphan: it exists in the graph but never enters a
    // packet, and a failing suite reads as PARTIAL rather than CONTRADICTED.
    if (pr) edges.push(edge(pr, "PullRequest", runId, "TestCase", "IMPLEMENTS"));
  }

  return { nodes, edges };
}


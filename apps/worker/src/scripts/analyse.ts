#!/usr/bin/env node
/**
 * Run the change analyser (TypeScript/JavaScript and Python) on one pull
 * request's base..head.
 *
 *   npm run analyse -- --repo <git repo> --base <rev> --head <rev>
 *       [--name owner/repo]            repo name used in node ids
 *       [--pr <PR external id>]        e.g. owner/repo#123 → Commit PART_OF that PR
 *       [--json <out.json>]            write the analysis + graph nodes/edges
 *       [--run-tests "<command>"]      OPT-IN: run this in a throwaway checkout of head
 *       [--coverage-file <path>]       LCOV file that command writes (relative to the repo root)
 *       [--timeout <seconds>]          for --run-tests (default 600)
 *       [--lcov <file> [--lcov-root <dir>]]  an LCOV report produced elsewhere
 *       [--publish --workspace <slug>]       write nodes/edges to Supabase (needs .env and
 *                                            migration 00016)
 *
 * Without --run-tests the analyser only reads git objects and never runs code.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { analyse } from "../analyser/analyse.js";
import { toGraph } from "../analyser/payloads.js";
import { publishGraph, publishViaSupabase } from "../analyser/publish.js";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const repoDir = arg("repo");
const base = arg("base");
const head = arg("head");
if (!repoDir || !base || !head) {
  console.error("usage: npm run analyse -- --repo <dir> --base <rev> --head <rev> [--name owner/repo] [--pr <id>] [--json <file>]");
  process.exit(2);
}

const command = arg("run-tests");
const lcovFile = arg("lcov");
const started = Date.now();
const analysis = analyse(repoDir, base, head, {
  repo: arg("name"),
  runTests: command
    ? { command, coverageFile: arg("coverage-file"), timeoutMs: Number(arg("timeout") ?? 600) * 1000 }
    : undefined,
  lcov: lcovFile ? { text: readFileSync(lcovFile, "utf8"), root: arg("lcov-root") } : undefined,
});
const graph = toGraph(analysis, { pullRequestExternalId: arg("pr") });
const ms = Date.now() - started;

console.log(`${analysis.analyser.name} ${analysis.analyser.version}  ${analysis.repo}  ${analysis.base.slice(0, 7)}..${analysis.head.slice(0, 7)}  (${ms} ms)`);
console.log(`commit: ${analysis.headMessage.split("\n")[0]}\n`);

console.log(`Changed files (${analysis.files.length}):`);
for (const f of analysis.files) {
  const hunks = analysis.hunks.filter((h) => h.file === f.path);
  const tag = f.test ? "test" : f.code ? "code" : "other";
  console.log(`  ${f.status.padEnd(8)} ${tag.padEnd(5)} ${f.path}  ${hunks.map((h) => `+${h.newStart},${h.newLines}`).join(" ")}`);
}

console.log(`\nChanged symbols (${analysis.changedSymbols.length}):`);
for (const s of analysis.changedSymbols) {
  console.log(`  ${s.change.padEnd(8)} ${s.kind.padEnd(8)} ${s.file}#${s.fqName}  lines ${s.startLine}-${s.endLine}  [${s.hunkIds.join(", ")}]`);
  if (s.callers.length) console.log(`           callers: ${s.callers.map((c) => `${c.symbol} (${c.resolution})`).join(", ")}`);
  if (s.nameOnlyMatches) console.log(`           + ${s.nameOnlyMatches} name-only call site(s) in files that don't import it (not trusted)`);
  for (const u of s.unresolved) console.log(`           unresolved ${u.kind} at line ${u.line}: ${u.text}`);
  if (s.coverage) {
    console.log(`           coverage: ${s.coverage.covered}/${s.coverage.instrumented} lines run; changed lines ${s.coverage.changedCovered}/${s.coverage.changedInstrumented}`);
  } else if (s.coverage === null) {
    console.log("           coverage: file not in the coverage report");
  }
}
for (const m of analysis.moduleLevelChanges) {
  console.log(`  module-level change in ${m.file} (${m.side} lines ${m.lines[0]}-${m.lines[m.lines.length - 1]}, ${m.hunkId})`);
}

console.log(`\nTest evidence (${analysis.tests.length} file(s)):`);
for (const t of analysis.tests) {
  const imports = t.importsChangedFiles.length ? `imports ${t.importsChangedFiles.join(", ")}` : "no import of a changed file";
  console.log(`  ${t.file}  [${t.reasons.join(", ")}; ${imports}]`);
  for (const b of t.tests.slice(0, 8)) console.log(`    - ${b.name}${b.mentions.length ? `  (mentions ${b.mentions.join(", ")})` : ""}`);
  if (t.tests.length > 8) console.log(`    … ${t.tests.length - 8} more`);
}
for (const s of analysis.skipped) console.log(`  skipped ${s.file}: ${s.reason}`);
if (analysis.testRun) {
  const r = analysis.testRun;
  console.log(`\nTest run: ${r.timedOut ? "TIMEOUT" : r.passed ? "PASS" : "FAIL"} (exit ${r.exitCode}, ${r.durationMs} ms)  $ ${r.command}`);
}

console.log(`\nGraph: ${graph.nodes.length} nodes (${graph.nodes.map((n) => n.type).join(", ")}), ${graph.edges.length} edges`);

if (process.argv.includes("--publish")) {
  const { loadConfig } = await import("../config.js");
  const { createServiceClient } = await import("../db.js");
  const client = createServiceClient(loadConfig());
  const slug = arg("workspace");
  if (!slug) throw new Error("--publish needs --workspace <slug>");
  const ws = await client.from("workspaces").select("id").eq("slug", slug).maybeSingle();
  if (ws.error) throw new Error(`find workspace: ${ws.error.message}`);
  if (!ws.data) throw new Error(`no workspace with slug "${slug}"`);
  const result = await publishGraph(publishViaSupabase(client), (ws.data as { id: string }).id, graph);
  console.log(`\nPublished to workspace "${slug}": nodes +${result.nodesInserted} new / ${result.nodesUpdated} updated; edges +${result.edgesInserted} new / ${result.edgesExisting} existing`);
  for (const e of result.edgesSkipped) console.log(`  skipped edge ${e.from} -${e.type}-> ${e.to}: ${e.reason}`);
}

const out = arg("json");
if (out) {
  writeFileSync(out, JSON.stringify({ analysis, graph }, null, 2));
  console.log(`wrote ${out}`);
}

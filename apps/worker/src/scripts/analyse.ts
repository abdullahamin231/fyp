#!/usr/bin/env node
/**
 * Run the TypeScript change analyser on one pull request's base..head.
 *
 *   npm run analyse -- --repo <path-to-git-repo> --base <rev> --head <rev>
 *                      [--name owner/repo] [--pr <PR external id>] [--json <out.json>]
 *
 * Prints a readable summary. With --json, also writes the full analysis plus
 * the graph nodes/edges (the `payload.slotItems` the packet builder reads).
 * Read-only: it reads git objects and never runs the repository's code.
 */
import { writeFileSync } from "node:fs";
import { analyse } from "../analyser/analyse.js";
import { toGraph } from "../analyser/payloads.js";

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

const started = Date.now();
const analysis = analyse(repoDir, base, head, { repo: arg("name") });
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

console.log(`\nGraph: ${graph.nodes.length} nodes (${graph.nodes.map((n) => n.type).join(", ")}), ${graph.edges.length} edges`);

const out = arg("json");
if (out) {
  writeFileSync(out, JSON.stringify({ analysis, graph }, null, 2));
  console.log(`wrote ${out}`);
}

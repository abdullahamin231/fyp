#!/usr/bin/env node
/**
 * FR-06 acceptance check: run the analyser on every pilot case and compare it
 * with what the case record itself says changed.
 *
 *   npm run analyse:evaluate -- --clones <dir> [--fetch] [--cases <dir>]
 *
 * --cases   defaults to ../../docs/dataset/04_cases (from apps/worker)
 * --clones  one folder per repo id (RHF, EXC, MAN); created with --fetch, which
 *           fetches exactly the base/head commits each case needs (shallow).
 *
 * Gold comes only from the committed case files, never from the constructor's
 * answer key:
 *   files     code + test files listed in `changed_hunks` / `changed_test_hunks`
 *   changed   candidate spans that overlap a changed code hunk  → must be found
 *   unchanged candidate spans that overlap no changed hunk     → must NOT be found
 *             (these include the hard negatives)
 *   tests     the changed test files                           → must be reported
 * Cases with a `head_patch` are evaluated at head + patch, as the annotators saw them.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { analyse, type Analysis } from "../analyser/analyse.js";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const casesDir = resolve(arg("cases") ?? "../../docs/dataset/04_cases");
const clonesDir = arg("clones");
if (!clonesDir) {
  console.error("usage: npm run analyse:evaluate -- --clones <dir> [--fetch] [--cases <dir>]");
  process.exit(2);
}

interface Range { file: string; start_line: number; end_line: number }
interface Case {
  case_id: string;
  repository: { repo_id: string; url: string };
  versions: { base_sha: string; head_sha: string; head_patch: string | null };
  code_evidence: { changed_hunks: Range[] };
  test_evidence: { changed_test_hunks: Range[] };
  candidate_spans: (Range & { span_id: string; symbol: string })[];
}

const git = (dir: string, ...args: string[]) =>
  execFileSync("git", ["-C", dir, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

const cases: Case[] = readdirSync(casesDir)
  .filter((f) => /^P\d+\.json$/.test(f))
  .sort()
  .map((f) => JSON.parse(readFileSync(join(casesDir, f), "utf8")));

// ---- optional: fetch the exact commits each repo needs -------------------------
if (process.argv.includes("--fetch")) {
  const byRepo = new Map<string, { url: string; shas: Set<string> }>();
  for (const c of cases) {
    const r = byRepo.get(c.repository.repo_id) ?? { url: c.repository.url, shas: new Set<string>() };
    r.shas.add(c.versions.base_sha).add(c.versions.head_sha);
    byRepo.set(c.repository.repo_id, r);
  }
  for (const [id, r] of byRepo) {
    const dir = join(clonesDir, id);
    if (!existsSync(join(dir, ".git"))) {
      mkdirSync(dir, { recursive: true });
      git(dir, "init", "-q");
      git(dir, "remote", "add", "origin", `${r.url}.git`);
    }
    console.log(`fetching ${r.shas.size} commits of ${id} …`);
    git(dir, "fetch", "-q", "--depth=1", "origin", ...r.shas);
  }
}

// ---- helpers ----------------------------------------------------------------------
const overlaps = (a: Range, b: { file: string; start: number; end: number }) =>
  a.file === b.file && a.start_line <= b.end && b.start <= a.end_line;
const lastSegment = (name: string) => name.split(".").pop()!;

/** For a patched case: commit head + patch on a scratch branch, return its sha. */
function patchedHead(dir: string, c: Case): string {
  const branch = `unify-eval-${c.case_id}`;
  try {
    return git(dir, "rev-parse", "--verify", `${branch}^{commit}`);
  } catch {
    /* not built yet */
  }
  const wt = join(dir, `.wt-${c.case_id}`);
  git(dir, "worktree", "add", "-q", "--detach", wt, c.versions.head_sha);
  git(wt, "apply", join(casesDir, c.versions.head_patch!));
  git(wt, "add", "-A");
  git(wt, "-c", "user.name=unify-eval", "-c", "user.email=eval@unify.local", "commit", "-q", "-m", `${c.case_id}: evaluated head (head + head_patch)`);
  const sha = git(wt, "rev-parse", "HEAD");
  git(dir, "branch", "-f", branch, sha);
  git(dir, "worktree", "remove", "--force", wt);
  return sha;
}

// ---- run -------------------------------------------------------------------------
interface Row {
  id: string;
  files: string;
  changedFound: string;
  unchangedClean: string;
  tests: string;
  extraSymbols: number;
  ms: number;
  misses: string[];
}
const rows: Row[] = [];
type Pair = [number, number]; // [correct, total]
const totals: Record<"files" | "changed" | "unchanged" | "tests", Pair> = {
  files: [0, 0], changed: [0, 0], unchanged: [0, 0], tests: [0, 0],
};
const byShape: Record<"symbol" | "region" | "descriptive", { changed: Pair; unchanged: Pair }> = {
  symbol: { changed: [0, 0], unchanged: [0, 0] },
  region: { changed: [0, 0], unchanged: [0, 0] },
  descriptive: { changed: [0, 0], unchanged: [0, 0] },
};

for (const c of cases) {
  const dir = join(clonesDir, c.repository.repo_id);
  const head = c.versions.head_patch ? patchedHead(dir, c) : c.versions.head_sha;
  const t0 = Date.now();
  const a: Analysis = analyse(dir, c.versions.base_sha, head, { repo: c.repository.repo_id });
  const ms = Date.now() - t0;
  const misses: string[] = [];

  // files
  const goldFiles = [...new Set([...c.code_evidence.changed_hunks, ...c.test_evidence.changed_test_hunks].map((h) => h.file))];
  const foundFiles = goldFiles.filter((f) => a.files.some((x) => x.path === f));
  for (const f of goldFiles) if (!foundFiles.includes(f)) misses.push(`file not reported: ${f}`);

  // spans: changed vs unchanged, by overlap with the case's own changed code hunks.
  // Candidate spans come in three shapes, scored differently:
  //   symbol       `setError`, `Toast.render`     → the analyser must (not) report that symbol
  //   region       `Select › onBlur`              → a region inside symbol `Select`: the analyser
  //                                                  must report `Select` AND a hunk on those lines
  //   descriptive  `react-server entry`           → no symbol (config, re-exports, JSX): a hunk on
  //                                                  those lines is what counts
  const codeHunks = c.code_evidence.changed_hunks.map((h) => ({ file: h.file, start: h.start_line, end: h.end_line }));
  const analyserHunks = a.hunks.map((h) => ({ file: h.file, start: h.newStart, end: h.newStart + Math.max(h.newLines, 1) - 1 }));
  const shape = (s: Case["candidate_spans"][number]): keyof typeof byShape =>
    s.symbol.includes("›") ? "region" : /^[A-Za-z_$][\w$.]*$/.test(s.symbol) ? "symbol" : "descriptive";
  const hasSymbol = (file: string, name: string) =>
    a.changedSymbols.some((x) => x.file === file && lastSegment(x.fqName) === lastSegment(name));
  const hunkOn = (s: Range) => analyserHunks.some((h) => overlaps(s, h));
  const found = (s: Case["candidate_spans"][number]): boolean => {
    const kind = shape(s);
    if (kind === "symbol") return hasSymbol(s.file, s.symbol);
    if (kind === "region") return hasSymbol(s.file, s.symbol.split("›")[0]!.trim()) && hunkOn(s);
    return hunkOn(s);
  };
  const changedSpans = c.candidate_spans.filter((s) => codeHunks.some((h) => overlaps(s, h)));
  const unchangedSpans = c.candidate_spans.filter((s) => !codeHunks.some((h) => overlaps(s, h)));
  const changedHit = changedSpans.filter(found);
  const unchangedClean = unchangedSpans.filter((s) => !found(s));
  for (const s of changedSpans) if (!found(s)) misses.push(`changed ${shape(s)} span missed: ${s.span_id} ${s.symbol}`);
  for (const s of unchangedSpans) if (found(s)) misses.push(`unchanged ${shape(s)} span reported as changed: ${s.span_id} ${s.symbol}`);
  for (const s of c.candidate_spans) {
    const k = shape(s);
    const isChanged = changedSpans.includes(s);
    byShape[k][isChanged ? "changed" : "unchanged"][1] += 1;
    if (found(s) === isChanged) byShape[k][isChanged ? "changed" : "unchanged"][0] += 1;
  }

  // tests
  const goldTests = [...new Set(c.test_evidence.changed_test_hunks.map((h) => h.file))];
  const testsHit = goldTests.filter((f) => a.tests.some((t) => t.file === f && t.reasons.includes("changed")));
  for (const f of goldTests) if (!testsHit.includes(f)) misses.push(`changed test not reported: ${f}`);

  // symbols reported that are not candidate spans at all (informational: candidates are a sample, not the full change)
  const extra = a.changedSymbols.filter((x) => !c.candidate_spans.some((s) => s.file === x.file && lastSegment(s.symbol) === x.name)).length;

  totals.files[0] += foundFiles.length; totals.files[1] += goldFiles.length;
  totals.changed[0] += changedHit.length; totals.changed[1] += changedSpans.length;
  totals.unchanged[0] += unchangedClean.length; totals.unchanged[1] += unchangedSpans.length;
  totals.tests[0] += testsHit.length; totals.tests[1] += goldTests.length;

  rows.push({
    id: c.case_id,
    files: `${foundFiles.length}/${goldFiles.length}`,
    changedFound: `${changedHit.length}/${changedSpans.length}`,
    unchangedClean: `${unchangedClean.length}/${unchangedSpans.length}`,
    tests: `${testsHit.length}/${goldTests.length}`,
    extraSymbols: extra,
    ms,
    misses,
  });
}

console.log("| Case | Files found | Changed spans found | Unchanged spans not flagged | Changed tests found | Other changed symbols | ms |");
console.log("|---|---|---|---|---|---|---|");
for (const r of rows) console.log(`| ${r.id} | ${r.files} | ${r.changedFound} | ${r.unchangedClean} | ${r.tests} | ${r.extraSymbols} | ${r.ms} |`);
const pct = ([a, b]: Pair) => `${a}/${b}`;
console.log(`| **All** | ${pct(totals.files)} | ${pct(totals.changed)} | ${pct(totals.unchanged)} | ${pct(totals.tests)} | | |`);
console.log("\nBy span shape (correct / total):");
for (const [k, v] of Object.entries(byShape)) {
  console.log(`  ${k.padEnd(12)} changed found ${v.changed[0]}/${v.changed[1]}   unchanged not flagged ${v.unchanged[0]}/${v.unchanged[1]}`);
}
const misses = rows.flatMap((r) => r.misses.map((m) => `${r.id}: ${m}`));
console.log(misses.length ? `\nMisses:\n${misses.map((m) => `  - ${m}`).join("\n")}` : "\nNo misses.");
const times = rows.map((r) => r.ms).sort((a, b) => a - b);
console.log(`\nAnalysis time per case: median ${times[Math.floor(times.length / 2)]} ms, max ${times[times.length - 1]} ms (NFR-07 target: p95 < 60 s)`);

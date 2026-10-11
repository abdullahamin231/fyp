/**
 * Line coverage for changed symbols, read from an LCOV file.
 *
 * LCOV is the plain-text format that Jest and Vitest (`--coverage` with the
 * lcov reporter) and Python's coverage.py (`coverage lcov`) all write, so one
 * reader serves both languages. The parts used here:
 *   SF:<path>          start of a source file's record
 *   DA:<line>,<hits>   that line is instrumented and ran <hits> times
 *   end_of_record
 *
 * For each changed symbol we report how many of its instrumented lines ran,
 * and, more to the point for review, how many of its *changed* lines ran.
 * A changed line no test executed is evidence the change is untested.
 */
import type { Analysis } from "./analyse.js";

/** file (as written in the LCOV file) → line → hit count */
export type Lcov = Map<string, Map<number, number>>;

export interface SymbolCoverage {
  /** Lines of the symbol the coverage tool instrumented. */
  instrumented: number;
  /** ... of which ran at least once. */
  covered: number;
  /** Changed lines of the symbol that are instrumented. */
  changedInstrumented: number;
  /** ... of which ran at least once. */
  changedCovered: number;
}

export function parseLcov(text: string): Lcov {
  const out: Lcov = new Map();
  let current: Map<number, number> | null = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith("SF:")) {
      current = new Map();
      out.set(line.slice(3).replace(/\\/g, "/"), current);
    } else if (line.startsWith("DA:") && current) {
      const [ln, hits] = line.slice(3).split(",");
      current.set(Number(ln), Math.max(current.get(Number(ln)) ?? 0, Number(hits)));
    } else if (line === "end_of_record") {
      current = null;
    }
  }
  return out;
}

/**
 * Find a repo path's record in the LCOV data. Paths in LCOV files may be
 * absolute (written inside a temporary checkout) or relative, so we strip the
 * checkout root if given, then fall back to the unique record ending in
 * `/<repo path>`.
 */
function recordFor(lcov: Lcov, repoPath: string, root?: string): Map<number, number> | undefined {
  const normRoot = root?.replace(/\\/g, "/").replace(/\/$/, "");
  for (const [file, lines] of lcov) {
    const rel = normRoot && file.startsWith(`${normRoot}/`) ? file.slice(normRoot.length + 1) : file;
    if (rel === repoPath || rel === `./${repoPath}`) return lines;
  }
  const suffix = [...lcov.entries()].filter(([file]) => file.endsWith(`/${repoPath}`));
  return suffix.length === 1 ? suffix[0]![1] : undefined;
}

/** Attach coverage to every changed (non-deleted) symbol that has an LCOV record. */
export function applyCoverage(analysis: Analysis, lcov: Lcov, root?: string): void {
  for (const sym of analysis.changedSymbols) {
    if (sym.change === "deleted") continue;
    const record = recordFor(lcov, sym.file, root);
    if (!record) {
      sym.coverage = null; // file not in the coverage report: not measured
      continue;
    }
    // Changed lines inside this symbol, from its hunks (head side).
    const changed = new Set<number>();
    for (const h of analysis.hunks) {
      if (!sym.hunkIds.includes(h.id)) continue;
      for (let l = h.newStart; l < h.newStart + h.newLines; l += 1) {
        if (l >= sym.startLine && l <= sym.endLine) changed.add(l);
      }
    }
    let instrumented = 0, covered = 0, changedInstrumented = 0, changedCovered = 0;
    for (const [line, hits] of record) {
      if (line < sym.startLine || line > sym.endLine) continue;
      instrumented += 1;
      if (hits > 0) covered += 1;
      if (changed.has(line)) {
        changedInstrumented += 1;
        if (hits > 0) changedCovered += 1;
      }
    }
    sym.coverage = { instrumented, covered, changedInstrumented, changedCovered };
  }
}

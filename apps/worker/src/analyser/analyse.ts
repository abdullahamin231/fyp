/**
 * The TypeScript/JavaScript change analyser (FR-06, FR-25; TODO §3.2).
 *
 * Given a repository and two commits (base, head), it reports:
 *   1. changed files and diff hunks, with exact line ranges;
 *   2. changed symbols: for every changed line, the innermost function, method
 *      or class around it, classified as added / modified / deleted;
 *   3. for each changed symbol, a bounded caller neighbourhood (call sites in
 *      the same file, or in files that import the symbol's file);
 *   4. test evidence: changed tests, and tests that reference a changed symbol;
 *   5. unresolved sites: dynamic code inside changed symbols whose target
 *      cannot be known statically.
 *
 * It is deterministic: the same repository, base and head give the same
 * output, with every list in a fixed order. It only reads git objects, never a
 * working tree, and it never runs repository code.
 */
import { posix } from "node:path";
import { Git, type ChangedFile, type Hunk } from "./git.js";
import { callSites, innermostSymbol, parseSource, type DynamicSite, type ParsedFile, type ParsedSymbol } from "./parse.js";
import { parsePython, pythonCallSites, pythonImportResolvesTo } from "./parse-python.js";
import { applyCoverage, parseLcov, type SymbolCoverage } from "./coverage.js";
import { runTestsAtHead, type TestRun } from "./run-tests.js";

export const ANALYSER = { name: "unify-ts-analyser", version: "0.1.0" } as const;

const CODE_EXT = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs|py)$/;
const CODE_GLOBS = ["*.ts", "*.tsx", "*.mts", "*.cts", "*.js", "*.jsx", "*.mjs", "*.cjs", "*.py"] as const;
const isPython = (path: string) => path.endsWith(".py");

/** Parse a file with the parser for its language (TypeScript/JavaScript or Python). */
export function parseFile(path: string, text: string): ParsedFile {
  return isPython(path) ? parsePython(text) : parseSource(path, text);
}
/** JS/TS: `*.test.ts`, `*.spec.tsx`, `__tests__/`, `test/`, `tests/`. Python: `test_*.py`, `*_test.py`. */
const TEST_PATH = /(^|\/)(__tests__|tests?)\/|\.(test|spec)\.[cm]?[jt]sx?$|(^|\/)test_[^/]*\.py$|_test\.py$/;

export function isTestPath(path: string): boolean {
  return TEST_PATH.test(path);
}

export interface AnalyserLimits {
  /** Callers reported per changed symbol. */
  maxCallers: number;
  /** Files searched per changed symbol, for callers and for tests separately. */
  maxFilesPerSearch: number;
  /** Names shorter than this are too generic to search for (`a`, `id`, `on`). */
  minSearchableName: number;
}

export const DEFAULT_LIMITS: AnalyserLimits = { maxCallers: 10, maxFilesPerSearch: 40, minSearchableName: 3 };

export type ChangeKind = "added" | "modified" | "deleted";

export interface Caller {
  file: string;
  /** fqName of the calling symbol, or `(module)` for top-level code. */
  symbol: string;
  line: number;
  /** How we know this call reaches the changed symbol. */
  resolution: "same-file" | "import";
}

export interface ChangedSymbol {
  file: string;
  name: string;
  fqName: string;
  kind: ParsedSymbol["kind"];
  change: ChangeKind;
  /** Range at head, or at base for a deleted symbol. */
  startLine: number;
  endLine: number;
  hunkIds: string[];
  signature: string;
  docComment: string | null;
  leadingComments: string[];
  exported: boolean;
  text: string;
  imports: string[];
  callers: Caller[];
  /** Call sites matched by name only in files that do not import this file: counted, not trusted. */
  nameOnlyMatches: number;
  unresolved: DynamicSite[];
  /** Line coverage from an LCOV report: undefined = no report given, null = file not in the report. */
  coverage?: SymbolCoverage | null;
}

export interface ModuleLevelChange {
  file: string;
  hunkId: string;
  side: "head" | "base";
  lines: number[];
}

export interface TestReference {
  name: string;
  startLine: number;
  endLine: number;
  text: string;
  /** Changed symbols (fqName) this test mentions by name. */
  mentions: string[];
}

export interface TestEvidence {
  file: string;
  /** `changed`: this test file is part of the change. `references`: it mentions a changed symbol. */
  reasons: ("changed" | "references")[];
  /** Changed-symbol files this test file imports (relative imports that resolve to them). */
  importsChangedFiles: string[];
  tests: TestReference[];
}

export interface Analysis {
  analyser: typeof ANALYSER;
  repo: string;
  base: string;
  head: string;
  headMessage: string;
  files: (ChangedFile & { code: boolean; test: boolean })[];
  hunks: Hunk[];
  changedSymbols: ChangedSymbol[];
  moduleLevelChanges: ModuleLevelChange[];
  tests: TestEvidence[];
  /** Files that could not be parsed, with the reason. */
  skipped: { file: string; reason: string }[];
  /** Present only when a test command was given (the analyser never runs code otherwise). */
  testRun?: TestRun;
}

export interface AnalyseOptions {
  repo?: string;
  limits?: Partial<AnalyserLimits>;
  /** Opt-in: run this command in a throwaway checkout of head. */
  runTests?: { command: string; coverageFile?: string; timeoutMs?: number };
  /** An LCOV report produced elsewhere, and the checkout root its paths start with. */
  lcov?: { text: string; root?: string };
}

/** Does `specifier`, imported from `importer`, point at `target` (a repo path)? Relative imports only. */
export function importResolvesTo(importer: string, specifier: string, target: string): boolean {
  if (isPython(importer)) return isPython(target) && pythonImportResolvesTo(importer, specifier, target);
  if (!specifier.startsWith(".")) return false;
  const resolved = posix.normalize(posix.join(posix.dirname(importer), specifier));
  const stem = target.replace(CODE_EXT, "");
  return resolved === stem || resolved === target || `${resolved}/index` === stem;
}

const byPosition = <T extends { file: string; startLine: number }>(a: T, b: T) =>
  a.file === b.file ? a.startLine - b.startLine : a.file.localeCompare(b.file);

export function analyse(
  repoDir: string,
  baseRev: string,
  headRev: string,
  options: AnalyseOptions = {},
): Analysis {
  const limits = { ...DEFAULT_LIMITS, ...options.limits };
  const git = new Git(repoDir);
  const base = git.resolve(baseRev);
  const head = git.resolve(headRev);
  const skipped: Analysis["skipped"] = [];

  // ---- 1. files and hunks ------------------------------------------------------
  const files = git
    .changedFiles(base, head)
    .map((f) => ({ ...f, code: CODE_EXT.test(f.path), test: isTestPath(f.path) }))
    .sort((a, b) => a.path.localeCompare(b.path));
  const hunks = git.hunks(base, head);

  // Parsed files are cached per (commit, path): each file is parsed at most once per side.
  const cache = new Map<string, ParsedFile | null>();
  const parsed = (rev: string, path: string): ParsedFile | null => {
    const key = `${rev}:${path}`;
    if (!cache.has(key)) {
      const text = git.show(rev, path);
      let result: ParsedFile | null = null;
      if (text !== null) {
        try {
          result = parseFile(path, text);
        } catch (error) {
          skipped.push({ file: path, reason: `parse failed at ${rev.slice(0, 7)}: ${(error as Error).message}` });
        }
      }
      cache.set(key, result);
    }
    return cache.get(key)!;
  };

  // ---- 2. changed symbols ---------------------------------------------------------
  const symbols = new Map<string, ChangedSymbol>(); // key: file#fqName
  const moduleLevel: ModuleLevelChange[] = [];

  const touch = (file: string, sym: ParsedSymbol, change: ChangeKind, hunkId: string, imports: string[]) => {
    const key = `${file}#${sym.fqName}`;
    const existing = symbols.get(key);
    if (existing) {
      if (!existing.hunkIds.includes(hunkId)) existing.hunkIds.push(hunkId);
      return;
    }
    symbols.set(key, {
      file,
      name: sym.name,
      fqName: sym.fqName,
      kind: sym.kind,
      change,
      startLine: sym.startLine,
      endLine: sym.endLine,
      hunkIds: [hunkId],
      signature: sym.signature,
      docComment: sym.docComment,
      leadingComments: sym.leadingComments,
      exported: sym.exported,
      text: sym.text,
      imports,
      callers: [],
      nameOnlyMatches: 0,
      unresolved: [],
    });
  };

  for (const hunk of hunks) {
    const file = files.find((f) => f.path === hunk.file);
    if (!file?.code || file.test) continue; // tests are reported as test evidence, not symbols

    const headFile = file.status === "deleted" ? null : parsed(head, file.path);
    const baseFile = file.status === "added" ? null : parsed(base, file.oldPath);
    const headNames = new Set(headFile?.symbols.map((s) => s.fqName));
    const baseNames = new Set(baseFile?.symbols.map((s) => s.fqName));

    // Added or changed lines: look them up in the head version.
    const loose: number[] = [];
    for (let l = hunk.newStart; l < hunk.newStart + hunk.newLines; l += 1) {
      const sym = headFile && innermostSymbol(headFile.symbols, l);
      if (sym) touch(file.path, sym, baseNames.has(sym.fqName) ? "modified" : "added", hunk.id, headFile.imports.map((i) => i.specifier));
      else loose.push(l);
    }
    if (loose.length) moduleLevel.push({ file: file.path, hunkId: hunk.id, side: "head", lines: loose });

    // Removed lines: look them up in the base version.
    const looseOld: number[] = [];
    for (let l = hunk.oldStart; l < hunk.oldStart + hunk.oldLines; l += 1) {
      const sym = baseFile && innermostSymbol(baseFile.symbols, l);
      if (!sym) {
        looseOld.push(l);
      } else if (headNames.has(sym.fqName)) {
        // Still exists at head: a modification. Report it with its head range.
        const headSym = headFile!.symbols.find((s) => s.fqName === sym.fqName)!;
        touch(file.path, headSym, "modified", hunk.id, headFile!.imports.map((i) => i.specifier));
      } else {
        touch(file.path, sym, "deleted", hunk.id, baseFile.imports.map((i) => i.specifier));
      }
    }
    if (looseOld.length) moduleLevel.push({ file: file.path, hunkId: hunk.id, side: "base", lines: looseOld });
  }

  const changedSymbols = [...symbols.values()].sort(byPosition);

  // ---- 3 + 5. callers and unresolved sites -------------------------------------------
  for (const sym of changedSymbols) {
    if (sym.change === "deleted") continue;
    const own = parsed(head, sym.file);
    sym.unresolved = (own?.dynamicSites ?? []).filter((d) => d.line >= sym.startLine && d.line <= sym.endLine);
    if (sym.name.length < limits.minSearchableName) continue;

    const candidates = git
      .filesMentioning(head, sym.name, CODE_GLOBS)
      .filter((f) => !isTestPath(f))
      .slice(0, limits.maxFilesPerSearch);
    const callers: Caller[] = [];
    for (const file of candidates) {
      const text = git.show(head, file);
      if (text === null) continue;
      const pf = parsed(head, file);
      const resolution =
        file === sym.file ? "same-file"
        : pf?.imports.some((i) => importResolvesTo(file, i.specifier, sym.file)) ? "import"
        : null;
      const sites = isPython(file) ? pythonCallSites(text, sym.name) : callSites(file, text, sym.name);
      for (const line of sites) {
        if (file === sym.file && line >= sym.startLine && line <= sym.endLine) continue; // inside itself
        if (!resolution) {
          sym.nameOnlyMatches += 1;
          continue;
        }
        const caller = pf ? innermostSymbol(pf.symbols, line) : null;
        callers.push({ file, symbol: caller?.fqName ?? "(module)", line, resolution });
      }
    }
    sym.callers = callers.sort((a, b) => (a.file === b.file ? a.line - b.line : a.file.localeCompare(b.file))).slice(0, limits.maxCallers);
  }

  // ---- 4. test evidence ------------------------------------------------------------
  const tests = new Map<string, TestEvidence>();
  const evidenceFor = (file: string): TestEvidence => {
    let ev = tests.get(file);
    if (!ev) {
      const pf = parsed(head, file);
      ev = {
        file,
        reasons: [],
        importsChangedFiles: [...new Set(changedSymbols.map((s) => s.file))]
          .filter((target) => pf?.imports.some((i) => importResolvesTo(file, i.specifier, target)))
          .sort(),
        tests: [],
      };
      tests.set(file, ev);
    }
    return ev;
  };
  const addTest = (ev: TestEvidence, block: { name: string; startLine: number; endLine: number; text: string }, mention?: string) => {
    let t = ev.tests.find((x) => x.startLine === block.startLine);
    if (!t) {
      t = { ...block, mentions: [] };
      ev.tests.push(t);
    }
    if (mention && !t.mentions.includes(mention)) t.mentions.push(mention);
  };

  // (a) test files that are part of the change: the test blocks the diff touches
  for (const file of files.filter((f) => f.code && f.test && f.status !== "deleted")) {
    const pf = parsed(head, file.path);
    const ev = evidenceFor(file.path);
    ev.reasons.push("changed");
    for (const hunk of hunks.filter((h) => h.file === file.path && h.newLines > 0)) {
      const end = hunk.newStart + hunk.newLines - 1;
      for (const block of pf?.testBlocks ?? []) {
        if (block.startLine <= end && hunk.newStart <= block.endLine) addTest(ev, block);
      }
    }
  }

  // (b) test files that mention a changed symbol by name: the test blocks that do
  for (const sym of changedSymbols) {
    if (sym.change === "deleted" || sym.name.length < limits.minSearchableName) continue;
    const word = new RegExp(`\\b${sym.name.replace(/[$]/g, "\\$")}\\b`);
    const testFiles = git
      .filesMentioning(head, sym.name, CODE_GLOBS)
      .filter(isTestPath)
      .slice(0, limits.maxFilesPerSearch);
    for (const file of testFiles) {
      const pf = parsed(head, file);
      const blocks = (pf?.testBlocks ?? []).filter((b) => word.test(b.text));
      if (blocks.length === 0) continue;
      const ev = evidenceFor(file);
      if (!ev.reasons.includes("references")) ev.reasons.push("references");
      for (const block of blocks) addTest(ev, block, sym.fqName);
    }
  }

  for (const ev of tests.values()) ev.tests.sort((a, b) => a.startLine - b.startLine);

  const analysis: Analysis = {
    analyser: ANALYSER,
    repo: options.repo ?? posix.basename(repoDir),
    base,
    head,
    headMessage: git.message(head),
    files,
    hunks,
    changedSymbols,
    moduleLevelChanges: moduleLevel,
    tests: [...tests.values()].sort((a, b) => a.file.localeCompare(b.file)),
    skipped,
  };

  // ---- 6. optional: test run and coverage ---------------------------------------
  if (options.runTests) {
    const { lcov, root, ...run } = runTestsAtHead(repoDir, head, options.runTests.command, options.runTests);
    analysis.testRun = run;
    if (lcov) applyCoverage(analysis, parseLcov(lcov), root);
  }
  if (options.lcov) applyCoverage(analysis, parseLcov(options.lcov.text), options.lcov.root);

  return analysis;
}

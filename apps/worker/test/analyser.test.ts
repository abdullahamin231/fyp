/**
 * The TypeScript change analyser on small throwaway git repositories.
 * Each test commits a "base", edits files, commits a "head", and checks what
 * the analyser reports between the two.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { evidenceItemSchema } from "@unify/contracts";
import { analyse, importResolvesTo, isTestPath } from "../src/analyser/analyse.js";
import { parseSource } from "../src/analyser/parse.js";
import { pathTokens, toGraph } from "../src/analyser/payloads.js";

const repos: string[] = [];
afterEach(() => {
  for (const dir of repos.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** Make a repo with `base` files committed, then `head` changes committed. Returns [dir, base, head]. */
function repo(base: Record<string, string>, head: Record<string, string | null>): [string, string, string] {
  const dir = mkdtempSync(join(tmpdir(), "unify-analyser-"));
  repos.push(dir);
  const git = (...args: string[]) =>
    execFileSync("git", ["-C", dir, "-c", "user.name=t", "-c", "user.email=t@t", ...args], { encoding: "utf8" }).trim();
  const write = (files: Record<string, string | null>) => {
    for (const [path, content] of Object.entries(files)) {
      const full = join(dir, path);
      if (content === null) rmSync(full);
      else {
        mkdirSync(dirname(full), { recursive: true });
        writeFileSync(full, content);
      }
    }
  };
  git("init", "-q");
  write(base);
  git("add", "-A");
  git("commit", "-q", "-m", "base");
  const b = git("rev-parse", "HEAD");
  write(head);
  git("add", "-A");
  git("commit", "-q", "-m", "fix #7: head change");
  return [dir, b, git("rev-parse", "HEAD")];
}

const FORM = `import { set } from "./utils";

/** Build the form controller. */
export function createForm() {
  const state = { errors: {} as Record<string, string> };

  // Remove one error, or all of them.
  const clearErrors = (name?: string) => {
    if (name) delete state.errors[name];
    else state.errors = {};
  };

  const setError = (name: string, message: string) => {
    state.errors[name] = message;
  };

  const reset = () => {
    clearErrors();
  };

  return { clearErrors, setError, reset };
}
`;

describe("parseSource", () => {
  it("finds nested arrow functions with their enclosing names, doc and comments", () => {
    const p = parseSource("src/form.ts", FORM);
    expect(p.symbols.map((s) => s.fqName)).toEqual([
      "createForm",
      "createForm.clearErrors",
      "createForm.setError",
      "createForm.reset",
    ]);
    const clear = p.symbols.find((s) => s.name === "clearErrors")!;
    expect(clear).toMatchObject({ kind: "function", startLine: 8, endLine: 11, exported: false });
    expect(clear.leadingComments).toEqual(["// Remove one error, or all of them."]);
    expect(clear.signature).toBe("const clearErrors = (name?: string) =>");
    const create = p.symbols.find((s) => s.name === "createForm")!;
    expect(create.docComment).toBe("/** Build the form controller. */");
    expect(create.exported).toBe(true);
    expect(p.imports).toEqual([{ specifier: "./utils", names: ["set"] }]);
  });

  it("finds classes, methods, wrapped components, and test blocks", () => {
    const p = parseSource(
      "src/a.test.tsx",
      `class Store { get size() { return 1; } add(x: number) { return x; } }
export const Button = memo((props: P) => <b>{props.x}</b>);
describe("Store", () => { it("adds", () => { expect(new Store().add(1)).toBe(1); }); });
test.each([1])("each %i", () => {});`,
    );
    expect(p.symbols.map((s) => `${s.kind}:${s.fqName}`)).toEqual([
      "class:Store", "method:Store.size", "method:Store.add", "function:Button",
    ]);
    expect(p.testBlocks.map((t) => t.name)).toEqual(["Store > adds"]);
  });

  it("marks dynamic code as unresolved instead of guessing a target", () => {
    const p = parseSource(
      "src/d.ts",
      `const m = await import(path); const r = require(name); handlers[type](e); import("./static"); obj["literal"]();`,
    );
    expect(p.dynamicSites.map((d) => d.kind)).toEqual(["dynamic-import", "dynamic-require", "computed-call"]);
  });
});

describe("analyse", () => {
  it("maps a one-line fix to the innermost function, not its container or neighbours", () => {
    const [dir, base, head] = repo(
      { "src/form.ts": FORM, "src/utils.ts": "export const set = () => {};\n" },
      { "src/form.ts": FORM.replace("delete state.errors[name];", "state.errors = { ...state.errors }; delete state.errors[name];") },
    );
    const a = analyse(dir, base, head);
    expect(a.files.map((f) => `${f.status}:${f.path}`)).toEqual(["modified:src/form.ts"]);
    expect(a.hunks).toHaveLength(1);
    expect(a.hunks[0]).toMatchObject({ file: "src/form.ts", newStart: 9, newLines: 1, oldStart: 9, oldLines: 1 });
    expect(a.changedSymbols.map((s) => `${s.change}:${s.fqName}`)).toEqual(["modified:createForm.clearErrors"]);
    expect(a.headMessage).toBe("fix #7: head change");
  });

  it("reports added and deleted symbols, and changes outside any symbol", () => {
    const [dir, base, head] = repo(
      { "src/a.ts": "export const VERSION = 1;\nexport function old() { return 1; }\n" },
      { "src/a.ts": "export const VERSION = 2;\nexport function fresh() { return 2; }\n" },
    );
    const a = analyse(dir, base, head);
    expect(a.changedSymbols.map((s) => `${s.change}:${s.fqName}`).sort()).toEqual(["added:fresh", "deleted:old"]);
    expect(a.moduleLevelChanges.map((m) => `${m.side}:${m.lines.join(",")}`)).toEqual(["head:1", "base:1"]);
  });

  it("finds callers in the same file and in files that import it; name-only matches are not trusted", () => {
    const [dir, base, head] = repo(
      {
        "src/total.ts": "export function total(xs: number[]) {\n  return xs.length;\n}\n",
        "src/cart.ts": 'import { total } from "./total";\nexport function checkout(xs: number[]) {\n  return total(xs);\n}\n',
        "src/other.ts": "export function unrelated(o: any) {\n  return o.total([]);\n}\n",
      },
      { "src/total.ts": "export function total(xs: number[]) {\n  return xs.reduce((a, b) => a + b, 0);\n}\n" },
    );
    const sym = analyse(dir, base, head).changedSymbols[0]!;
    expect(sym.fqName).toBe("total");
    expect(sym.callers).toEqual([{ file: "src/cart.ts", symbol: "checkout", line: 3, resolution: "import" }]);
    expect(sym.nameOnlyMatches).toBe(1);
  });

  it("reports changed tests and tests that reference a changed symbol", () => {
    const [dir, base, head] = repo(
      {
        "src/total.ts": "export function total(xs: number[]) {\n  return 0;\n}\n",
        "src/total.test.ts":
          'import { total } from "./total";\nit("sums", () => {\n  expect(total([1, 2])).toBe(3);\n});\nit("other", () => {\n  expect(1).toBe(1);\n});\n',
        "e2e/flow.spec.ts": 'it("uses total", () => {\n  page.total();\n});\n',
      },
      {
        "src/total.ts": "export function total(xs: number[]) {\n  return xs.reduce((a, b) => a + b, 0);\n}\n",
        "src/total.test.ts":
          'import { total } from "./total";\nit("sums", () => {\n  expect(total([1, 2])).toBe(3);\n});\nit("other", () => {\n  expect(2).toBe(2);\n});\n',
      },
    );
    const a = analyse(dir, base, head);
    expect(a.changedSymbols.map((s) => s.fqName)).toEqual(["total"]); // test files are not symbols
    const [e2e, unit] = a.tests;
    expect(unit).toMatchObject({ file: "src/total.test.ts", reasons: ["changed", "references"], importsChangedFiles: ["src/total.ts"] });
    expect(unit!.tests.map((t) => `${t.name}:${t.mentions.join(",")}`)).toEqual(["sums:total", "other:"]);
    expect(e2e).toMatchObject({ file: "e2e/flow.spec.ts", reasons: ["references"], importsChangedFiles: [] });

    // Only the importing test gets a COVERS edge; the name-only e2e test is evidence without an edge.
    const g = toGraph(a, { pullRequestExternalId: "acme#1" });
    expect(g.edges.map((e) => `${e.from} -${e.type}-> ${e.to}`)).toEqual([
      `commit:${a.head.slice(0, 12)} -PART_OF-> acme#1`,
      `${a.repo}:src/total.test.ts -COVERS-> ${a.repo}:src/total.ts#total`,
    ]);
  });

  it("is deterministic and produces payload items the packet builder accepts", () => {
    const [dir, base, head] = repo({ "src/form.ts": FORM }, { "src/form.ts": FORM.replace("message;", "message.trim();") });
    const first = toGraph(analyse(dir, base, head));
    expect(toGraph(analyse(dir, base, head))).toEqual(first);
    const items = first.nodes.flatMap((n) => n.payload.slotItems);
    expect(items.map((i) => i.kind).sort()).toEqual(["diff_hunk", "symbol_card"]);
    for (const item of items) expect(evidenceItemSchema.safeParse(item).success).toBe(true);
    const card = items.find((i) => i.kind === "symbol_card")!;
    expect(card.content).toContain("symbol: createForm.setError (function, modified)");
    expect(card.content).toContain("path tokens: src form ts");
    expect(card.content).toContain("commit: fix #7: head change");
  });
});

describe("helpers", () => {
  it("resolves relative imports, including index files, and ignores packages", () => {
    expect(importResolvesTo("src/cart.ts", "./total", "src/total.ts")).toBe(true);
    expect(importResolvesTo("src/a/b.ts", "../total", "src/total.tsx")).toBe(true);
    expect(importResolvesTo("src/a.ts", "./lib", "src/lib/index.ts")).toBe(true);
    expect(importResolvesTo("src/a.ts", "react", "src/react.ts")).toBe(false);
  });

  it("recognises test paths and splits path tokens", () => {
    expect(["a.test.ts", "x/__tests__/y.tsx", "tests/z.js", "b.spec.mjs"].every(isTestPath)).toBe(true);
    expect(isTestPath("src/testing-utils.ts")).toBe(false);
    expect(pathTokens("src/logic/createFormControl.ts")).toBe("src logic create form control ts");
  });
});

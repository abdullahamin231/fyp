/**
 * Python support, coverage / test runs, and publishing to the evidence graph.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { PGlite } from "@electric-sql/pglite";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { analyse } from "../src/analyser/analyse.js";
import { parseLcov } from "../src/analyser/coverage.js";
import { parsePython, pythonImportResolvesTo } from "../src/analyser/parse-python.js";
import { toGraph } from "../src/analyser/payloads.js";
import { publishGraph, publishViaSql } from "../src/analyser/publish.js";
import { WORKSPACE_ID, createTestDb } from "../src/linking/local-db.js";

const repos: string[] = [];
afterEach(() => {
  for (const dir of repos.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function repo(base: Record<string, string>, head: Record<string, string>): [string, string, string] {
  const dir = mkdtempSync(join(tmpdir(), "unify-analyser-x-"));
  repos.push(dir);
  const git = (...args: string[]) =>
    execFileSync("git", ["-C", dir, "-c", "user.name=t", "-c", "user.email=t@t", ...args], { encoding: "utf8" }).trim();
  const write = (files: Record<string, string>) => {
    for (const [path, content] of Object.entries(files)) {
      mkdirSync(dirname(join(dir, path)), { recursive: true });
      writeFileSync(join(dir, path), content);
    }
  };
  git("init", "-q");
  write(base);
  git("add", "-A");
  git("commit", "-q", "-m", "base");
  const b = git("rev-parse", "HEAD");
  write(head);
  git("add", "-A");
  git("commit", "-q", "-m", "fix: clamp discount");
  return [dir, b, git("rev-parse", "HEAD")];
}

const CART_PY = `from .rules import clamp


class Cart:
    """A shopping cart."""

    def total(self, items, discount=0):
        subtotal = sum(items)
        return subtotal * (1 - discount)

    def size(self, items):
        return len(items)
`;

describe("Python", () => {
  it("parses classes, methods, docstrings and imports", () => {
    const p = parsePython(CART_PY);
    expect(p.symbols.map((s) => `${s.kind}:${s.fqName}:${s.startLine}-${s.endLine}`)).toEqual([
      "class:Cart:4-12",
      "method:Cart.total:7-9",
      "method:Cart.size:11-12",
    ]);
    expect(p.symbols[0]!.docComment).toBe('"""A shopping cart."""');
    expect(p.imports).toEqual([{ specifier: ".rules", names: ["clamp"] }]);
    expect(pythonImportResolvesTo("shop/cart.py", ".rules", "shop/rules.py")).toBe(true);
    expect(pythonImportResolvesTo("tests/test_cart.py", "shop.cart", "src/shop/cart.py")).toBe(true);
    expect(pythonImportResolvesTo("tests/test_cart.py", "shop.other", "shop/cart.py")).toBe(false);
  });

  it("maps a Python change to the method, and finds the pytest test that uses it", () => {
    const [dir, base, head] = repo(
      {
        "shop/__init__.py": "",
        "shop/rules.py": "def clamp(x, lo, hi):\n    return max(lo, min(hi, x))\n",
        "shop/cart.py": CART_PY,
        "tests/test_cart.py":
          "from shop.cart import Cart\n\n\ndef test_total():\n    assert Cart().total([10]) == 10\n\n\ndef test_size():\n    assert Cart().size([1]) == 1\n",
      },
      { "shop/cart.py": CART_PY.replace("(1 - discount)", "(1 - clamp(discount, 0, 1))") },
    );
    const a = analyse(dir, base, head);
    expect(a.changedSymbols.map((s) => `${s.change}:${s.fqName}`)).toEqual(["modified:Cart.total"]);
    expect(a.tests).toHaveLength(1);
    expect(a.tests[0]).toMatchObject({ file: "tests/test_cart.py", reasons: ["references"], importsChangedFiles: ["shop/cart.py"] });
    expect(a.tests[0]!.tests.map((t) => t.name)).toEqual(["test_total"]);
    expect(toGraph(a).edges.map((e) => e.type)).toEqual(["COVERS"]);
  });
});

describe("coverage and test runs", () => {
  it("reads LCOV and reports changed-line coverage per symbol", () => {
    const lcov = parseLcov("SF:/tmp/x/src/a.ts\nDA:1,1\nDA:2,0\nend_of_record\n");
    expect([...lcov.get("/tmp/x/src/a.ts")!.entries()]).toEqual([[1, 1], [2, 0]]);
  });

  it("runs the given test command in a throwaway checkout and applies its coverage", () => {
    const body = (n: string) => `export function total(xs: number[]) {\n  const s = ${n};\n  if (s < 0) {\n    return 0;\n  }\n  return s;\n}\n`;
    // The "test command" is a script that writes an LCOV report: line 2 (the changed line) ran, line 4 did not.
    const writer =
      "const fs=require('fs');fs.mkdirSync('coverage',{recursive:true});" +
      "fs.writeFileSync('coverage/lcov.info',`SF:${process.cwd()}/src/total.ts\\nDA:1,1\\nDA:2,3\\nDA:3,3\\nDA:4,0\\nDA:6,3\\nend_of_record\\n`);";
    const [dir, base, head] = repo(
      { "src/total.ts": body("0"), "write-lcov.cjs": writer },
      { "src/total.ts": body("xs.reduce((a, b) => a + b, 0)") },
    );
    const a = analyse(dir, base, head, {
      runTests: { command: "node write-lcov.cjs", coverageFile: "coverage/lcov.info", timeoutMs: 30_000 },
    });
    expect(a.testRun).toMatchObject({ command: "node write-lcov.cjs", passed: true, exitCode: 0, timedOut: false });
    expect(a.changedSymbols[0]!.coverage).toEqual({ instrumented: 5, covered: 4, changedInstrumented: 1, changedCovered: 1 });

    const g = toGraph(a);
    const card = g.nodes.find((n) => n.type === "CodeSymbol")!.payload.slotItems[0]!;
    expect(card.content).toContain("coverage: 4/5 lines run by tests; changed lines 1/1");
    const run = g.nodes.find((n) => n.externalId.includes(":test-run:"))!;
    expect(run.payload.slotItems[0]!.content).toMatch(/^\$ node write-lcov\.cjs\nPASS \(exit 0, \d+ ms\)/);
    // The throwaway checkout is gone again.
    expect(execFileSync("git", ["-C", dir, "worktree", "list"], { encoding: "utf8" }).trim().split("\n")).toHaveLength(1);
  });

  it("reports a failing command as FAIL without throwing", () => {
    const [dir, base, head] = repo({ "a.ts": "export const f = () => 1;\n" }, { "a.ts": "export const f = () => 2;\n" });
    const a = analyse(dir, base, head, { runTests: { command: "node -e \"process.exit(3)\"" } });
    expect(a.testRun).toMatchObject({ passed: false, exitCode: 3 });
  });
});

describe("publish_analysis", () => {
  let db: PGlite;
  beforeEach(async () => {
    db = await createTestDb();
  });

  async function sample(): Promise<ReturnType<typeof toGraph>> {
    const [dir, base, head] = repo(
      {
        "src/total.ts": "export function total(xs: number[]) {\n  return 0;\n}\n",
        "src/total.test.ts": 'import { total } from "./total";\nit("sums", () => {\n  expect(total([1])).toBe(1);\n});\n',
      },
      { "src/total.ts": "export function total(xs: number[]) {\n  return xs.reduce((a, b) => a + b, 0);\n}\n" },
    );
    return toGraph(analyse(dir, base, head, { repo: "acme/shop" }), { pullRequestExternalId: "acme/shop#7" });
  }
  const count = async (t: string) => (await db.query<{ n: number }>(`select count(*)::int as n from public.${t}`)).rows[0]!.n;

  it("writes nodes and established edges; an edge to a missing PR is skipped, not invented", async () => {
    const publish = publishViaSql(db);
    const first = await publishGraph(publish, WORKSPACE_ID, await sample());
    expect(first).toMatchObject({ nodesInserted: 3, nodesUpdated: 0, edgesInserted: 1, edgesExisting: 0 });
    expect(first.edgesSkipped).toEqual([
      { from: expect.stringMatching(/^commit:/), to: "acme/shop#7", type: "PART_OF", reason: "to node not in graph" },
      { from: "acme/shop#7", to: "acme/shop:src/total.ts#total", type: "IMPLEMENTS", reason: "from node not in graph" },
    ]);
    const types = await db.query<{ type: string }>("select type::text from public.nodes order by type");
    expect(types.rows.map((r) => r.type)).toEqual(["CodeSymbol", "Commit", "TestCase"]);
    const card = await db.query<{ k: string }>(
      "select payload->'slotItems'->0->>'kind' as k from public.nodes where type = 'CodeSymbol'",
    );
    expect(card.rows[0]!.k).toBe("symbol_card");
  });

  it("re-publishing the same analysis updates nodes and adds nothing", async () => {
    const publish = publishViaSql(db);
    const graph = await sample();
    await db.query(
      "insert into public.nodes (workspace_id, type, external_id) values ($1, 'PullRequest', 'acme/shop#7')",
      [WORKSPACE_ID],
    );
    const first = await publishGraph(publish, WORKSPACE_ID, graph);
    expect(first).toMatchObject({ nodesInserted: 3, edgesInserted: 3, edgesSkipped: [] });
    const second = await publishGraph(publish, WORKSPACE_ID, graph);
    expect(second).toMatchObject({ nodesInserted: 0, nodesUpdated: 3, edgesInserted: 0, edgesExisting: 3 });
    expect(await count("nodes")).toBe(4);
    expect(await count("edges")).toBe(3);
  });

  it("only service_role may call it", async () => {
    await db.exec("set role authenticated");
    await expect(publishGraph(publishViaSql(db), WORKSPACE_ID, { nodes: [], edges: [] })).rejects.toThrow(/permission denied/);
    await db.exec("reset role");
  });
});

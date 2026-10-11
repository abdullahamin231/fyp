/**
 * Slice B -> Slice C, end to end: real analyser output, placed in a graph,
 * read by the production GraphEvidenceProvider, assembled by the real packet
 * builder. This is the hand-off the stub/fixture provider stood in for.
 *
 * The graph lives in memory behind a tiny fake of the few supabase-js query
 * shapes graph/nodes.ts uses (from / select / eq / in / or / order /
 * maybeSingle), so the provider code under test is exactly the production
 * code, only the transport is replaced.
 */
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it } from "vitest";
import { analyse } from "../src/analyser/analyse.js";
import { toGraph } from "../src/analyser/payloads.js";
import { DEFAULT_SLOT_BUDGETS } from "../src/config.js";
import { buildPacket } from "../src/packet/builder.js";
import { GraphEvidenceProvider } from "../src/packet/providers/graph.js";

type Row = Record<string, unknown>;

/** Just enough of supabase-js for graph/nodes.ts, over in-memory rows. */
function fakeClient(tables: Record<string, Row[]>): SupabaseClient {
  const query = (rows: Row[]) => {
    const filters: ((r: Row) => boolean)[] = [];
    const orders: string[] = [];
    let head = false;
    const run = () => {
      let out = rows.filter((r) => filters.every((f) => f(r)));
      // Stable sorts applied last-key-first give a multi-key ORDER BY.
      for (const col of [...orders].reverse()) out = [...out].sort((a, b) => String(a[col]).localeCompare(String(b[col])));
      return out;
    };
    // "a.eq.X,b.eq.X" or "a.in.(x,y),b.in.(x,y)": split on commas outside parentheses.
    const orTerms = (expr: string) => expr.match(/[^,(]+(\([^)]*\))?/g) ?? [];
    const q = {
      select(_cols: string, opts?: { head?: boolean }) {
        head = !!opts?.head;
        return q;
      },
      eq(col: string, value: unknown) {
        filters.push((r) => r[col] === value);
        return q;
      },
      in(col: string, values: unknown[]) {
        filters.push((r) => values.includes(r[col]));
        return q;
      },
      or(expr: string) {
        const preds = orTerms(expr).map((term) => {
          const [, col, op, value] = /^(\w+)\.(eq|in)\.(.*)$/.exec(term)!;
          if (op === "eq") return (r: Row) => String(r[col!]) === value;
          const list = value!.slice(1, -1).split(",");
          return (r: Row) => list.includes(String(r[col!]));
        });
        filters.push((r) => preds.some((p) => p(r)));
        return q;
      },
      order(col: string) {
        orders.push(col);
        return q;
      },
      maybeSingle: async () => ({ data: run()[0] ?? null, error: null }),
      then(resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) {
        const data = run();
        return Promise.resolve(head ? { data: null, count: data.length, error: null } : { data, count: data.length, error: null }).then(resolve, reject);
      },
    };
    return q;
  };
  return { from: (table: string) => query(tables[table] ?? []) } as unknown as SupabaseClient;
}

const repos: string[] = [];
afterEach(() => {
  for (const dir of repos.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function repo(base: Record<string, string>, head: Record<string, string>): [string, string, string] {
  const dir = mkdtempSync(join(tmpdir(), "unify-packet-"));
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
  git("commit", "-q", "-m", "UNI-7 apply discount codes");
  return [dir, b, git("rev-parse", "HEAD")];
}

const WS = "11111111-1111-4111-8111-111111111111";
const PR = "acme/shop#7";

/** Criterion <-SATISFIES- PR, as linking + criterion ingestion would leave it, plus the analyser's nodes and edges. */
async function packetFor(options: { dropEdgeType?: string } = {}) {
  const [dir, base, head] = repo(
    {
      "src/total.ts": "export function total(xs: number[]) {\n  return 0;\n}\n",
      "src/total.test.ts": 'import { total } from "./total";\nit("sums", () => {\n  expect(total([1, 2])).toBe(0);\n});\n',
    },
    {
      "src/total.ts": "export function total(xs: number[]) {\n  return xs.reduce((a, b) => a + b, 0);\n}\n",
      "src/total.test.ts": 'import { total } from "./total";\nit("sums", () => {\n  expect(total([1, 2])).toBe(3);\n});\n',
    },
  );
  const analysis = analyse(dir, base, head, { repo: "acme/shop" });
  const graph = toGraph(analysis, { pullRequestExternalId: PR });

  const nodes: Row[] = [];
  const idOf = new Map<string, string>(); // `${type}|${externalId}` -> uuid
  const addNode = (type: string, externalId: string, payload: Row) => {
    const id = randomUUID();
    idOf.set(`${type}|${externalId}`, id);
    nodes.push({ id, workspace_id: WS, type, external_id: externalId, version: null, payload });
    return id;
  };
  const criterionId = addNode("Criterion", "C-1", { text: "Totals sum the cart items." });
  addNode("PullRequest", PR, { title: "UNI-7 apply discount codes" });
  for (const n of graph.nodes) addNode(n.type, n.externalId, n.payload);

  const edge = (from: string, to: string, type: string): Row => ({
    id: randomUUID(), from_id: from, to_id: to, type,
    source_class: "observed", confidence: 1, resolver: "test", link_state: "active",
  });
  const edges: Row[] = [edge(idOf.get(`PullRequest|${PR}`)!, criterionId, "SATISFIES")];
  for (const e of graph.edges) {
    if (e.type === options.dropEdgeType) continue;
    const from = idOf.get(`${e.fromType}|${e.from}`);
    const to = idOf.get(`${e.toType}|${e.to}`);
    if (from && to) edges.push(edge(from, to, e.type));
  }

  const provider = new GraphEvidenceProvider(fakeClient({ nodes, edges, checkpoints: [] }));
  const bundle = await provider.load({ criterionNodeId: criterionId, workspaceId: WS });
  const built = buildPacket({
    packetId: "00000000-0000-4000-8000-0000000000aa",
    criterion: { id: criterionId, text: "Totals sum the cart items." },
    baseCommit: analysis.base,
    headCommit: analysis.head,
    tokenBudget: 8000,
    slotBudgets: DEFAULT_SLOT_BUDGETS,
    sources: bundle.sources,
  });
  const kinds = (slot: keyof typeof bundle.sources) => (bundle.sources[slot] ?? []).map((i) => i.kind);
  return { bundle, built, kinds };
}

describe("analyser output -> GraphEvidenceProvider -> packet", () => {
  it("puts diff hunks, symbol cards and test evidence into the packet", async () => {
    const { kinds, built } = await packetFor();
    expect(kinds("DIFF_HUNKS")).toEqual(["diff_hunk", "diff_hunk"]);
    expect(kinds("SYMBOL_CARDS")).toEqual(["symbol_card"]);
    expect(kinds("TEST_EVIDENCE")).toEqual(["test_source"]);

    // Admitted to the packet, citable by namespaced id, content hash-checked.
    const ids = [...built.itemIds];
    expect(ids).toContain("acme/shop:src/total.ts#total#card");
    expect(ids).toContain("acme/shop:src/total.test.ts#test-1");
    expect(ids.filter((id) => id.startsWith("commit:"))).toHaveLength(2);
    expect(built.contentById.get("acme/shop:src/total.ts#total#card")).toContain("symbol: total (function, modified)");
  });

  it("without the PR IMPLEMENTS edges only the diff hunks are reachable (the gap this closes)", async () => {
    const { kinds } = await packetFor({ dropEdgeType: "IMPLEMENTS" });
    expect(kinds("DIFF_HUNKS")).toEqual(["diff_hunk", "diff_hunk"]); // Commit PART_OF PR still there
    expect(kinds("SYMBOL_CARDS")).toEqual([]);
    expect(kinds("TEST_EVIDENCE")).toEqual([]);
  });
});

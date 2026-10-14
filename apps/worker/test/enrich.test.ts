/**
 * Evidence enrichment (`src/analyser/enrich.ts`) — the worker's live half.
 *
 * These run against a real throwaway git repository and a fake Supabase client
 * that records every query shape the module makes. No network: repository
 * resolution is injected (`resolveRepoDir`), so the clone/fetch cache path
 * (only exercised against a real remote) is not part of these tests.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ensureEvidence } from "../src/analyser/enrich.js";
import type { Config } from "../src/config.js";
import type { CriterionInfo } from "../src/graph/nodes.js";

const repos: string[] = [];
afterEach(() => {
  for (const dir of repos.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** Base commit + head commit that breaks the shipped test (the demo's shape). */
function repo(): { dir: string; base: string; head: string } {
  const dir = mkdtempSync(join(tmpdir(), "unify-enrich-"));
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
  write({
    "src/total.ts": "export function total(items: { price: number }[]): number {\n  return items.reduce((sum, i) => sum + i.price, 0);\n}\n",
    "src/total.test.ts": "import { total } from \"./total\";\n\ntest(\"sums prices\", () => {\n  expect(total([{ price: 10 }])).toBe(10);\n});\n",
    "package.json": "{ \"name\": \"demo\", \"scripts\": { \"test\": \"exit 0\" } }\n",
  });
  git("add", "-A");
  git("commit", "-q", "-m", "base");
  const base = git("rev-parse", "HEAD");
  // Head: breaks the behaviour but leaves the test in place, so a test run at
  // head records FAIL — the CONTRADICTED shape (stub.ts keys off \nFAIL\n in
  // the TEST_EVIDENCE slot).
  write({
    "src/total.ts": "export function total(items: { price: number }[]): number {\n  return items.reduce((sum, i) => sum + i.price, 0) - 1;\n}\n",
  });
  git("add", "-A");
  git("commit", "-q", "-m", "break total");
  return { dir, base, head: git("rev-parse", "HEAD") };
}

// ---------------------------------------------------------------------------
// A recording fake of the handful of supabase-js query shapes enrich uses.
// ---------------------------------------------------------------------------

interface Captured {
  table: string;
  select: string;
  filters: Array<[string, string]>;
  inFilters: Array<[string, string[]]>;
}

interface Route {
  table: string;
  match?: (c: Captured) => boolean;
  data: unknown;
}

/** supabase-js semantics: no rows through maybeSingle() is null, not []. */
function firstRow(data: unknown): unknown {
  if (Array.isArray(data)) return data[0] ?? null;
  return data ?? null;
}

class QueryBuilder implements PromiseLike<{ data: unknown; error: unknown }> {
  readonly filters: Array<[string, string]> = [];
  readonly inFilters: Array<[string, string[]]> = [];
  constructor(
    private readonly client: FakeClient,
    readonly table: string,
    readonly select: string,
  ) {}
  eq(column: string, value: string) { this.filters.push([column, value]); return this; }
  like(column: string, pattern: string) { this.filters.push([column, `like:${pattern}`]); return this; }
  in(column: string, values: string[]) { this.inFilters.push([column, values]); return this; }
  or(_value: string) { return this; }
  maybeSingle() { return this.settle().then((r) => ({ ...r, data: firstRow(r.data) })); }
  single() { return this.settle().then((r) => ({ ...r, data: firstRow(r.data) })); }
  then<TResult1 = { data: unknown; error: unknown }, TResult2 = never>(
    onfulfilled?: ((value: { data: unknown; error: unknown }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.settle().then(onfulfilled, onrejected);
  }
  private settle() {
    return Promise.resolve(this.client.route({
      table: this.table,
      select: this.select,
      filters: this.filters,
      inFilters: this.inFilters,
    }));
  }
}

class FakeClient {
  routes: Route[];
  rpcCalls: Array<{ name: string; args: Record<string, unknown> }> = [];
  constructor(routes: Route[]) {
    this.routes = routes;
  }
  from(table: string) {
    const self = this;
    return { select: (columns: string) => new QueryBuilder(self, table, columns) };
  }
  async rpc(name: string, args: Record<string, unknown> = {}) {
    this.rpcCalls.push({ name, args });
    if (name === "publish_analysis") {
      return {
        data: { nodesInserted: 4, nodesUpdated: 0, edgesInserted: 3, edgesExisting: 0, edgesSkipped: [] },
        error: null,
      };
    }
    return { data: null, error: null };
  }
  route(c: Captured): { data: unknown; error: unknown } {
    const hit = this.routes.find((route) => route.table === c.table && (!route.match || route.match(c)));
    if (!hit) return { data: null, error: { message: `no route for ${c.table} ${JSON.stringify(c.filters)}` } };
    return { data: hit.data, error: null };
  }
}

const CRITERION: CriterionInfo = {
  id: "c-0000-0000-0000-000000000001",
  workspaceId: "ws-1",
  externalId: "UNI-7/AC-1",
  text: "The checkout total includes the discount.",
  requirementRef: "UNI-7",
  ruleApplicable: true,
  policyId: null,
};

const config = {
  analysisEnabled: true,
  repoCacheDir: "/nonexistent-cache",
  analysisTestTimeoutMs: 60_000,
} as unknown as Config;

const NODES = {
  ticket: { id: "n-ticket", type: "Ticket", external_id: "UNI-7", payload: { status: "Done" } },
  pr: { id: "n-pr", type: "PullRequest", external_id: "acme/store#42", payload: { repo: "acme/store" } },
  commit: { id: "n-commit", type: "Commit", external_id: "commit:existing", payload: {} },
};

/**
 * The graph around a criterion as ingestion leaves it: the ticket linked to
 * the criterion by a REFERENCES edge (from upsertCriteriaFromJira), and the
 * PR linked to the ticket by a TRACKS edge (from the linker).
 */
function graphRoutes(overrides: { commitExists?: boolean; hasPR?: boolean; hasTarget?: boolean } = {}): Route[] {
  return [
    // criterion-incident edges: selected as "from_id, to_id, type" → the REFERENCES edge.
    { table: "edges", match: (c) => c.select.includes("type"), data: [{ from_id: "n-ticket", to_id: CRITERION.id, type: "REFERENCES" }] },
    // nodes loaded from that edge → the ticket.
    { table: "nodes", match: (c) => c.inFilters[0]?.[1].includes("n-ticket") === true, data: [NODES.ticket] },
    // TRACKS edges of the ticket: selected as "from_id, to_id" (no "type" column).
    { table: "edges", match: (c) => !c.select.includes("type"), data: overrides.hasPR === false ? [] : [{ from_id: "n-ticket", to_id: "n-pr" }] },
    // nodes loaded from TRACKS → the pull request the webhook created.
    { table: "nodes", match: (c) => c.inFilters[0]?.[1].includes("n-pr") === true, data: [NODES.pr] },
    // commit-node existence check: the single-row nodes lookup by external_id.
    { table: "nodes", match: (c) => c.filters.some(([col, val]) => col === "external_id" && String(val).startsWith("commit:")), data: overrides.commitExists ? [NODES.commit] : [] },
    // analysis target (workspace + repo). `null`/`[]` through maybeSingle means
    // "no row", which is the no-target case — not a query error.
    { table: "analysis_targets", data: overrides.hasTarget === false ? [] : [{ test_command: "exit 1" }] },
  ];
}

describe("ensureEvidence", () => {
  it("publishes analysis for the job's commit pair, attached to the webhook's PR node", async () => {
    const { dir, base, head } = repo();
    const client = new FakeClient(graphRoutes());
    const outcome = await ensureEvidence(
      { client: client as unknown as SupabaseClient, config, resolveRepoDir: async () => dir },
      { workspace_id: "ws-1", base_commit: base, head_commit: head },
      CRITERION,
    );

    expect(outcome.status).toBe("published");
    const publish = client.rpcCalls.find((call) => call.name === "publish_analysis");
    expect(publish).toBeDefined();
    const args = publish!.args as unknown as {
      p_nodes: Array<{ externalId: string; type: string; payload: Record<string, unknown> }>;
      p_edges: Array<{ from: string; to: string; type: string; fromType: string; toType: string }>;
    };
    // Commit + symbol cards + the test file + the test run.
    expect(args.p_nodes.map((n) => n.type).sort()).toEqual(["CodeSymbol", "Commit", "TestCase", "TestCase"]);
    // The PR id matches the node the webhook-ingested PR created exactly, so
    // IMPLEMENTS/PART_OF edges attach instead of being reported as skipped.
    expect(args.p_edges).toContainEqual({
      from: "acme/store#42",
      fromType: "PullRequest",
      to: "acme/store:src/total.ts#total",
      toType: "CodeSymbol",
      type: "IMPLEMENTS",
      sourceClass: "derived",
      confidence: 1,
      resolver: expect.any(String),
    });
    expect(args.p_edges).toContainEqual({
      from: `commit:${head.slice(0, 12)}`,
      fromType: "Commit",
      to: "acme/store#42",
      toType: "PullRequest",
      type: "PART_OF",
      sourceClass: "derived",
      confidence: 1,
      resolver: expect.any(String),
    });
    // The deliberately broken head produced a failing test run: FAIL lands in
    // the TEST_EVIDENCE slot, which is what makes the verdict CONTRADICTED.
    if (outcome.status !== "published") throw new Error("unreachable");
    expect(outcome.testRunPassed).toBe(false);
    const runNode = args.p_nodes.find((n) => n.externalId === `acme/store:test-run:${head.slice(0, 12)}`);
    expect(runNode?.payload.passed).toBe(false);
  });

  it("skips everything when the graph already has evidence for this head", async () => {
    const client = new FakeClient(graphRoutes({ commitExists: true }));
    const outcome = await ensureEvidence(
      {
        client: client as unknown as SupabaseClient,
        config,
        resolveRepoDir: async () => { throw new Error("must not run git"); },
      },
      { workspace_id: "ws-1", base_commit: "a".repeat(40), head_commit: "b".repeat(40) },
      CRITERION,
    );
    expect(outcome).toEqual({ status: "already-present" });
    expect(client.rpcCalls).toEqual([]);
  });

  it("abstains when the ticket has no pull request", async () => {
    const client = new FakeClient(graphRoutes({ hasPR: false }));
    const outcome = await ensureEvidence(
      {
        client: client as unknown as SupabaseClient,
        config,
        resolveRepoDir: async () => { throw new Error("must not run git"); },
      },
      { workspace_id: "ws-1", base_commit: "a".repeat(40), head_commit: "b".repeat(40) },
      CRITERION,
    );
    expect(outcome).toEqual({ status: "no-pull-request", ticketExternalId: "UNI-7" });
    expect(client.rpcCalls).toEqual([]);
  });

  it("refuses a repository with no analysis target — analysis is never silent", async () => {
    const { dir, base, head } = repo();
    const client = new FakeClient(graphRoutes({ hasTarget: false }));
    const outcome = await ensureEvidence(
      { client: client as unknown as SupabaseClient, config, resolveRepoDir: async () => dir },
      { workspace_id: "ws-1", base_commit: base, head_commit: head },
      CRITERION,
    );
    expect(outcome).toEqual({ status: "no-target", repo: "acme/store" });
    expect(client.rpcCalls).toEqual([]);
  });

  it("fails the caller (never a verdict) when the repository cannot be resolved", async () => {
    const client = new FakeClient(graphRoutes());
    await expect(
      ensureEvidence(
        {
          client: client as unknown as SupabaseClient,
          config,
          resolveRepoDir: async () => { throw new Error("clone failed: repository not found"); },
        },
        { workspace_id: "ws-1", base_commit: "a".repeat(40), head_commit: "b".repeat(40) },
        CRITERION,
      ),
    ).rejects.toThrow(/clone failed/);
    expect(client.rpcCalls).toEqual([]);
  });
});

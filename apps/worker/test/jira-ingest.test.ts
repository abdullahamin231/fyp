/**
 * `ingest_jira_issue` (migration 00036) on a real Postgres with the full
 * migration chain: the criterion lifecycle, NFR relabelling and re-queueing of
 * verification that the Jira webhook drives.
 *
 * The issue objects below have the shape apps/web/src/lib/integrations/
 * jira-issue.ts produces from a webhook body (`JiraIssueSync`).
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite, type PGliteInterface } from "@electric-sql/pglite";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

const MIGRATIONS = join(dirname(fileURLToPath(import.meta.url)), "../../../supabase/migrations");
const WS = "11111111-1111-4111-8111-111111111111";
const OTHER_WS = "22222222-2222-4222-8222-222222222222";
const BASE = "a".repeat(40);
const HEAD = "b".repeat(40);

let template: PGlite;
let db: PGliteInterface;

beforeAll(async () => {
  template = new PGlite();
  await template.exec(`
    create schema auth;
    create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);
    create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
    create function auth.jwt() returns jsonb language sql stable as $$ select '{}'::jsonb $$;
    create role anon; create role authenticated; create role service_role;
  `);
  for (const file of readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort()) {
    await template.exec(readFileSync(join(MIGRATIONS, file), "utf8"));
  }
  await template.query("insert into workspaces (id, name, slug) values ($1, 'Demo', 'demo'), ($2, 'Other', 'other')", [WS, OTHER_WS]);
}, 60_000);

beforeEach(async () => {
  db = await template.clone();
});

type Kind = "ticket" | "nfr" | "partial";
let clock = Date.parse("2026-10-17T10:00:00Z");

function issue(kind: Kind, criteria: string[] | null, key = "UNI-42") {
  clock += 60_000;
  const at = new Date(clock).toISOString();
  const common = { key, kind, version: at, occurredAt: at, status: "In Progress", owner: "Mishal Ahmed" };
  if (kind === "nfr") {
    return { ...common, payload: { kind: "nfr", key, summary: "p95 under 200 ms", text: "p95 under 200 ms\nAll checkout endpoints." } };
  }
  return {
    ...common,
    payload: { key, summary: "Apply discount codes", text: "Apply discount codes", status: "In Progress", statusCategory: "indeterminate", url: null },
    criteria: criteria && { texts: criteria, source: "description", resolver: "jira:description" },
  };
}

interface Result {
  kind: string;
  nodeId?: string;
  skipped?: boolean;
  criteria: { created: string[]; changed: string[]; unchanged: string[]; retired: string[]; jobIds: string[] } | null;
}

let deliveries = 0;
async function deliver(body: ReturnType<typeof issue>, eventId = `jira:delivery-${++deliveries}:ticket:${body.key}`): Promise<Result> {
  await db.query(
    `insert into events (event_id, vendor_delivery_id, workspace_id, source_tool, entity_type, entity_id, action, actor, occurred_at, raw_hash)
     values ($1, $1, $2, 'jira', 'ticket', $3, 'jira:issue_updated', 'jira', $4, 'hash') on conflict do nothing`,
    [eventId, WS, body.key, body.occurredAt],
  );
  const { rows } = await db.query<{ r: Result }>("select public.ingest_jira_issue($1, $2, $3::jsonb) as r", [WS, eventId, JSON.stringify(body)]);
  return rows[0]!.r;
}

async function criteria(key = "UNI-42") {
  const { rows } = await db.query<{ external_id: string; text: string; version: string; status: string | null; live: boolean; snapshots: number }>(
    `select n.external_id, n.payload ->> 'text' as text, n.version, n.status, n.valid_to is null as live,
            (select count(*)::int from artifact_snapshots s where s.node_id = n.id) as snapshots
       from nodes n
      where n.workspace_id = $1 and n.type = 'Criterion' and n.external_id like $2
      order by n.external_id`,
    [WS, `${key}/AC-%`],
  );
  return rows;
}

async function liveNode(type: "Ticket" | "Requirement", key = "UNI-42"): Promise<boolean | null> {
  const { rows } = await db.query<{ live: boolean }>(
    "select valid_to is null as live from nodes where workspace_id = $1 and type = $2 and external_id = $3",
    [WS, type, key],
  );
  return rows[0]?.live ?? null;
}

async function jobs() {
  const { rows } = await db.query<{ external_id: string; base_commit: string; head_commit: string; state: string }>(
    `select n.external_id, j.base_commit, j.head_commit, j.state
       from verification_jobs j join nodes n on n.id = j.criterion_node_id
      order by n.external_id, j.enqueued_at`,
  );
  return rows;
}

/** A PR the linker has already recorded as tracking the ticket, plus the GitHub delivery that named its base. */
async function trackingPullRequest(ticketNodeId: string) {
  const { rows } = await db.query<{ id: string }>(
    `insert into nodes (workspace_id, type, external_id, version, status, payload)
     values ($1, 'PullRequest', 'acme/store#7', $2, 'open', '{"repo": "acme/store", "number": 7}') returning id`,
    [WS, HEAD],
  );
  await db.query(
    "insert into edges (from_id, to_id, type, source_class, resolver) values ($1, $2, 'TRACKS', 'observed', 'explicit-reference')",
    [rows[0]!.id, ticketNodeId],
  );
  await db.query(
    "insert into integration_deliveries (workspace_id, provider, vendor_delivery_id, raw_payload) values ($1, 'github', 'gh-1', $2::jsonb)",
    [WS, JSON.stringify({ action: "opened", number: 7, repository: { full_name: "acme/store" }, pull_request: { number: 7, base: { sha: BASE }, head: { sha: HEAD } } })],
  );
}

describe("ingest_jira_issue: criterion lifecycle", () => {
  it("creates one criterion per listed item, linked from the ticket, with a snapshot each", async () => {
    const result = await deliver(issue("ticket", ["total drops", "receipt matches"]));

    expect(result.kind).toBe("ticket");
    expect(result.criteria!.created).toHaveLength(2);
    expect(await criteria()).toEqual([
      expect.objectContaining({ external_id: "UNI-42/AC-1", text: "total drops", live: true, snapshots: 1 }),
      expect.objectContaining({ external_id: "UNI-42/AC-2", text: "receipt matches", live: true, snapshots: 1 }),
    ]);
    const { rows } = await db.query<{ n: number }>(
      `select count(*)::int as n from edges e join nodes t on t.id = e.from_id
        where t.type = 'Ticket' and e.type = 'REFERENCES' and e.source_class = 'derived'`,
    );
    expect(rows[0]!.n).toBe(2);
  });

  it("bumps the version and snapshots a criterion whose text changed, leaving the others untouched", async () => {
    await deliver(issue("ticket", ["total drops", "receipt matches"]));
    const before = await criteria();
    const edit = issue("ticket", ["total drops", "receipt and email match"]);
    const result = await deliver(edit);

    const after = await criteria();
    expect(result.criteria!.changed).toHaveLength(1);
    expect(after[0]).toEqual(before[0]);
    expect(after[1]).toMatchObject({ text: "receipt and email match", version: edit.version, snapshots: 2, live: true });
  });

  it("retires a removed criterion, keeps its history, and cancels its queued job", async () => {
    const first = await deliver(issue("ticket", ["total drops"]));
    await trackingPullRequest(first.nodeId!);
    await deliver(issue("ticket", ["total drops", "receipt matches"]));
    expect((await jobs()).map((j) => [j.external_id, j.state])).toEqual([["UNI-42/AC-2", "queued"]]);

    const result = await deliver(issue("ticket", ["total drops"]));

    expect(result.criteria!.retired).toHaveLength(1);
    expect((await criteria())[1]).toMatchObject({ external_id: "UNI-42/AC-2", status: "retired", live: false, snapshots: 1 });
    expect((await jobs()).map((j) => [j.external_id, j.state])).toEqual([["UNI-42/AC-2", "cancelled"]]);
  });

  it("treats a reorder as a text change at each moved position", async () => {
    await deliver(issue("ticket", ["total drops", "receipt matches"]));
    const result = await deliver(issue("ticket", ["receipt matches", "total drops"]));

    expect(result.criteria!.changed).toHaveLength(2);
    expect((await criteria()).map((c) => [c.external_id, c.text])).toEqual([
      ["UNI-42/AC-1", "receipt matches"],
      ["UNI-42/AC-2", "total drops"],
    ]);
  });

  it("is a no-op when the same delivery is replayed", async () => {
    const first = await deliver(issue("ticket", ["total drops"]));
    await trackingPullRequest(first.nodeId!);
    const body = issue("ticket", ["total drops", "receipt matches"]);
    await deliver(body, "jira:replayed:ticket:UNI-42");
    const graph = await criteria();
    const queued = await jobs();

    const replay = await deliver(body, "jira:replayed:ticket:UNI-42");

    expect(replay.criteria).toMatchObject({ created: [], changed: [], retired: [], jobIds: [] });
    expect(await criteria()).toEqual(graph);
    expect(await jobs()).toEqual(queued);
  });

  it("leaves criteria alone when the payload carries no criteria section (comment webhooks)", async () => {
    await deliver(issue("ticket", ["total drops"]));
    const result = await deliver(issue("partial", null));

    expect(result).toMatchObject({ kind: "ticket", criteria: null });
    expect((await criteria()).map((c) => c.live)).toEqual([true]);
  });
});

describe("ingest_jira_issue: re-verification", () => {
  it("queues new and changed criteria on every tracking PR at its current head", async () => {
    const first = await deliver(issue("ticket", ["total drops"]));
    await trackingPullRequest(first.nodeId!);

    const result = await deliver(issue("ticket", ["total drops (rounded)", "receipt matches"]));

    expect(result.criteria!.jobIds).toHaveLength(2);
    expect(await jobs()).toEqual([
      { external_id: "UNI-42/AC-1", base_commit: BASE, head_commit: HEAD, state: "queued" },
      { external_id: "UNI-42/AC-2", base_commit: BASE, head_commit: HEAD, state: "queued" },
    ]);
  });

  it("queues nothing when no pull request tracks the ticket", async () => {
    const result = await deliver(issue("ticket", ["total drops"]));
    expect(result.criteria!.jobIds).toEqual([]);
    expect(await jobs()).toEqual([]);
  });
});

describe("ingest_jira_issue: NFR relabelling", () => {
  it("an nfr label turns the ticket into a Requirement and retires the ticket and its criteria", async () => {
    await deliver(issue("ticket", ["total drops"]));
    const result = await deliver(issue("nfr", null));

    expect(result.kind).toBe("nfr");
    expect(await liveNode("Requirement")).toBe(true);
    expect(await liveNode("Ticket")).toBe(false);
    expect((await criteria()).map((c) => c.live)).toEqual([false]);
    const { rows } = await db.query<{ payload: Record<string, unknown> }>(
      "select payload from nodes where type = 'Requirement' and external_id = 'UNI-42'",
    );
    expect(rows[0]!.payload).toMatchObject({ kind: "nfr", key: "UNI-42", text: "p95 under 200 ms\nAll checkout endpoints." });
  });

  it("removing the label converges back: ticket and criteria live, Requirement retired", async () => {
    await deliver(issue("ticket", ["total drops"]));
    await deliver(issue("nfr", null));
    const result = await deliver(issue("ticket", ["total drops"]));

    expect(result.criteria!.changed).toHaveLength(1);
    expect(await liveNode("Ticket")).toBe(true);
    expect(await liveNode("Requirement")).toBe(false);
    expect((await criteria()).map((c) => [c.status, c.live])).toEqual([[null, true]]);
  });

  it("a comment on an NFR does not resurrect the ticket", async () => {
    await deliver(issue("ticket", ["total drops"]));
    await deliver(issue("nfr", null));
    const result = await deliver(issue("partial", null));

    expect(result).toMatchObject({ kind: "nfr", skipped: true });
    expect(await liveNode("Ticket")).toBe(false);
    expect(await liveNode("Requirement")).toBe(true);
  });
});

describe("events delivery ids (00035)", () => {
  it("are unique per workspace, not across workspaces", async () => {
    const insert = (eventId: string, workspaceId: string) =>
      db.query(
        `insert into events (event_id, vendor_delivery_id, workspace_id, source_tool, entity_type, entity_id, action, actor, occurred_at, raw_hash)
         values ($1, 'sha256:same-body', $2, 'jira', 'ticket', 'UNI-1', 'jira:issue_updated', 'jira', now(), 'h')`,
        [eventId, workspaceId],
      );
    await insert("e-1", WS);
    await expect(insert("e-2", OTHER_WS)).resolves.toBeDefined();
    await expect(insert("e-3", WS)).rejects.toThrow(/events_delivery_unique/);
  });
});

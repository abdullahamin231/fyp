/**
 * `ingest_jira_issue` (migration 00036) on a real Postgres with the full
 * migration chain: the criterion lifecycle, NFR relabelling and re-queueing of
 * verification that the Jira webhook drives.
 *
 * The issue objects below have the shape apps/web/src/lib/integrations/
 * jira-issue.ts produces from a webhook body (`JiraIssueSync`).
 */
import { readdirSync, readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite, type PGliteInterface } from "@electric-sql/pglite";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

const MIGRATIONS = join(dirname(fileURLToPath(import.meta.url)), "../../../supabase/migrations");
const WS = "11111111-1111-4111-8111-111111111111";
const OTHER_WS = "22222222-2222-4222-8222-222222222222";
const BASE = "a".repeat(40);
const HEAD = "b".repeat(40);

let template: PGlite;
let legacyTemplate: PGliteInterface;
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
    if (file.startsWith("00039_")) legacyTemplate = await template.clone();
    await template.exec(readFileSync(join(MIGRATIONS, file), "utf8"));
  }
  await template.query("insert into workspaces (id, name, slug) values ($1, 'Demo', 'demo'), ($2, 'Other', 'other')", [WS, OTHER_WS]);
}, 60_000);

beforeEach(async () => {
  db = await template.clone();
});

afterEach(async () => { await db.close(); });
afterAll(async () => { await template.close(); await legacyTemplate.close(); });

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
  it("ignores an old replay after newer criteria have been applied", async () => {
    const old = issue("ticket", ["old text", "removed later"]);
    await deliver(old, "jira:old-delivery");
    const current = issue("ticket", ["current text"]);
    await deliver(current);
    const before = await criteria();

    expect(await deliver(old, "jira:old-delivery")).toMatchObject({ skipped: true, reason: "stale_version" });
    expect(await criteria()).toEqual(before);
    expect((await db.query<{ version: string }>("select version from nodes where type = 'Ticket'")).rows[0]!.version).toBe(current.version);
  });

  it("compares Jira versions as instants rather than timestamp strings", async () => {
    const current = issue("ticket", ["current text"]);
    current.version = "2026-10-19T10:30:00.000+0000";
    await deliver(current);
    const old = issue("ticket", ["old text"]);
    old.version = "2026-10-19T12:00:00+02:00";
    expect(await deliver(old)).toMatchObject({ skipped: true });
    expect((await criteria())[0]!.text).toBe("current text");
  });

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
  it("queues a distinct job when criteria change during a running verification", async () => {
    const first = await deliver(issue("ticket", ["first text"]));
    await trackingPullRequest(first.nodeId!);
    const edit = await deliver(issue("ticket", ["second text"]));
    const oldJob = edit.criteria!.jobIds[0]!;
    await db.query("update verification_jobs set state = 'running' where id = $1", [oldJob]);

    const next = issue("ticket", ["third text"]);
    const changed = await deliver(next);
    expect(changed.criteria!.jobIds).toHaveLength(1);
    expect(changed.criteria!.jobIds[0]).not.toBe(oldJob);
    const rows = (await db.query("select criterion_text, state from verification_jobs order by enqueued_at")).rows;
    expect(rows).toEqual([{ criterion_text: "second text", state: "running" }, { criterion_text: "third text", state: "queued" }]);

    const repeated = await db.query<{ id: string }>("select enqueue_verification($1, $2, $3) as id", [changed.criteria!.changed[0], BASE, HEAD]);
    expect(repeated.rows[0]!.id).toBe(changed.criteria!.jobIds[0]);
  });

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
  it("does not undo an NFR relabelling when an older ticket delivery arrives", async () => {
    const old = issue("ticket", ["old criterion"]);
    await deliver(old);
    await deliver(issue("nfr", null));
    expect(await deliver(old)).toMatchObject({ kind: "nfr", skipped: true });
    expect(await liveNode("Requirement")).toBe(true);
    expect(await liveNode("Ticket")).toBe(false);
    expect((await criteria())[0]!.live).toBe(false);
  });

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
  it("ingests the same GitHub delivery independently in two workspaces", async () => {
    const link = (workspace: string) => db.query<{ r: { status: string; eventId: string } }>(
      "select link_pull_request_event($1, 'same-delivery', 'opened', 'github', now(), 'hash', $2::jsonb, '[]'::jsonb) as r",
      [workspace, JSON.stringify({ repo: "acme/shop", number: 7, title: "Change", branch: "feature", headSha: HEAD, state: "open" })],
    );
    const first = (await link(WS)).rows[0]!.r;
    const second = (await link(OTHER_WS)).rows[0]!.r;
    expect(first).toMatchObject({ status: "no_key", eventId: `${WS}:github:same-delivery` });
    expect(second).toMatchObject({ status: "no_key", eventId: `${OTHER_WS}:github:same-delivery` });
    expect((await link(OTHER_WS)).rows[0]!.r).toEqual({ status: "duplicate_event", eventId: second.eventId });
    expect((await db.query("select id from nodes where type = 'PullRequest'")).rows).toHaveLength(2);
  });

  it("keeps legacy GitHub IDs on replay without suppressing a second workspace", async () => {
    await db.query(`insert into events (event_id,vendor_delivery_id,workspace_id,source_tool,entity_type,entity_id,action,actor,occurred_at,raw_hash)
      values ('github:legacy','legacy',$1,'github','PullRequest','acme/shop#7','opened','github',now(),'h')`, [WS]);
    const link = (workspace: string) => db.query<{ r: { status: string; eventId: string } }>(
      "select link_pull_request_event($1, 'legacy', 'opened', 'github', now(), 'h', $2::jsonb, '[]'::jsonb) as r",
      [workspace, JSON.stringify({ repo: "acme/shop", number: 7, title: "Change", branch: "feature", headSha: HEAD, state: "open" })],
    );
    expect((await link(WS)).rows[0]!.r).toEqual({ status: "duplicate_event", eventId: "github:legacy" });
    expect((await link(OTHER_WS)).rows[0]!.r.status).toBe("no_key");
  });

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

/** A real packet + gated verdict in the shape the worker's completion RPC sends. */
async function packetAndVerdict(jobId: string) {
  const packetId = randomUUID();
  await db.query(`insert into context_packets
    (id, criterion_node_id, base_commit, head_commit, token_budget, slot_budgets, manifest, prompt_hash, packet_hash)
    select $1, criterion_node_id, base_commit, head_commit, 8000, '{}'::jsonb, '[]'::jsonb, repeat('a',64), repeat('b',64)
      from verification_jobs where id = $2`, [packetId, jobId]);
  return { id: randomUUID(), packet_id: packetId, status: "SUPPORTED", evidence: [], reason: "Evidence supports the criterion",
    freshness_state: "CURRENT", review_required: false, pass_count: 1, stop_reason: "VERIFIED", gate_outcome: "PASSED", model_and_run: {} };
}

async function complete(jobId: string, verdict: Awaited<ReturnType<typeof packetAndVerdict>>, annotation: string | null = "verified") {
  return (await db.query<{ r: { state: string; verdictId?: string; findingId?: string } }>(
    "select complete_verification_job($1,$2::jsonb,$3) as r", [jobId, JSON.stringify(verdict), annotation],
  )).rows[0]!.r;
}

describe("verification publication at a criterion revision", () => {
  async function runningJob() {
    const first = await deliver(issue("ticket", ["first text"]));
    await trackingPullRequest(first.nodeId!);
    const edit = await deliver(issue("ticket", ["second text"]));
    const jobId = edit.criteria!.jobIds[0]!;
    await db.query("update verification_jobs set state = 'running' where id = $1", [jobId]);
    return jobId;
  }

  it("cancels an obsolete run without replacing a newer revision's finding", async () => {
    const oldJob = await runningJob();
    const oldVerdict = await packetAndVerdict(oldJob);
    const edit = await deliver(issue("ticket", ["new criterion"]));
    const newJob = edit.criteria!.jobIds[0]!;
    await db.query("update verification_jobs set state = 'running' where id = $1", [newJob]);
    const published = await complete(newJob, await packetAndVerdict(newJob));
    expect(published.state).toBe("succeeded");
    expect(await complete(oldJob, oldVerdict)).toEqual({ state: "cancelled" });
    expect((await db.query("select id, state, verdict_id from findings")).rows).toEqual([
      { id: published.findingId, state: "open", verdict_id: published.verdictId },
    ]);
    expect((await db.query("select id from verdicts")).rows).toHaveLength(1);
  });

  it("rejects publication for a criterion retired during model execution", async () => {
    const jobId = await runningJob();
    const verdict = await packetAndVerdict(jobId);
    await deliver(issue("ticket", []));
    expect(await complete(jobId, verdict)).toEqual({ state: "cancelled" });
    expect((await db.query("select id from verdicts")).rows).toEqual([]);
  });

  it("commits verdict/finding/job together, retries once, and preserves supersession history", async () => {
    const jobId = await runningJob();
    const verdict = await packetAndVerdict(jobId);
    await expect(complete(jobId, verdict, null)).rejects.toThrow(/null value/);
    expect((await db.query("select id from verdicts")).rows).toEqual([]);
    expect((await db.query<{ state: string }>("select state from verification_jobs where id = $1", [jobId])).rows[0]!.state).toBe("running");
    const published = await complete(jobId, verdict);
    expect(await complete(jobId, verdict)).toEqual(published);
    const next = await deliver(issue("ticket", ["new text"]));
    const nextJob = next.criteria!.jobIds[0]!;
    await db.query("update verification_jobs set state = 'running' where id = $1", [nextJob]);
    const newer = await complete(nextJob, await packetAndVerdict(nextJob));
    expect((await db.query("select state, superseded_by_id from findings where id = $1", [published.findingId])).rows[0])
      .toEqual({ state: "superseded", superseded_by_id: newer.findingId });
  });

  it("restricts the new completion RPC to the service role", async () => {
    const jobId = await runningJob();
    const verdict = await packetAndVerdict(jobId);
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`set role ${role}`);
      await expect(db.query("select complete_verification_job($1, '{}'::jsonb, 'x')", [randomUUID()])).rejects.toThrow(/permission denied/);
      await db.exec("reset role");
    }
    await db.exec("set role service_role");
    expect((await complete(jobId, verdict)).state).toBe("succeeded");
    await db.exec("reset role");
  });

  it("replaces pre-migration running work and keeps it cancelled", async () => {
    await db.close();
    db = await legacyTemplate.clone();
    await db.query("insert into workspaces (id,name,slug) values ($1,'Demo','demo')", [WS]);
    const oldJob = await runningJob();
    await db.exec(readFileSync(join(MIGRATIONS, "00039_verification_criterion_revision.sql"), "utf8"));
    const rows = (await db.query("select id, state, criterion_text from verification_jobs order by enqueued_at")).rows;
    expect(rows).toEqual([
      { id: oldJob, state: "cancelled", criterion_text: null },
      { id: expect.any(String), state: "queued", criterion_text: "second text" },
    ]);
    await db.query("select finish_verification_job($1, 'failed', null, 'old worker')", [oldJob]);
    expect((await db.query<{ state: string }>("select state from verification_jobs where id = $1", [oldJob])).rows[0]!.state).toBe("cancelled");
  });
});

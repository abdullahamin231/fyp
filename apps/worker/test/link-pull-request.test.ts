/**
 * The linker against a real Postgres loaded with the project's migrations.
 * Each `it` is one of the demo cases.
 */
import type { PGlite } from "@electric-sql/pglite";
import { beforeEach, describe, expect, it } from "vitest";
import { linkPullRequestEvent, type PullRequestEvent } from "../src/linking/link-pull-request.js";
import { WORKSPACE_ID, createTestDb, seedTickets } from "../src/linking/local-db.js";

const OPTIONS = { projectKeys: ["UNI"] };

function prEvent(overrides: Partial<PullRequestEvent["pr"]> = {}, deliveryId = "delivery-1"): PullRequestEvent {
  return {
    workspaceId: WORKSPACE_ID,
    deliveryId,
    action: "opened",
    actor: "mishal",
    occurredAt: "2026-10-11T10:00:00Z",
    rawHash: "a".repeat(64),
    pr: {
      repo: "abdullahamin231/fyp",
      number: 42,
      title: "UNI-123 Add login form",
      branch: "feature/UNI-123-login",
      headSha: "c".repeat(40),
      state: "open",
      commits: [{ sha: "d".repeat(40), message: "UNI-123 form markup" }],
      ...overrides,
    },
  };
}

async function count(db: PGlite, table: string): Promise<number> {
  const r = await db.query<{ n: number }>(`select count(*)::int as n from public.${table}`);
  return r.rows[0]!.n;
}

describe("linkPullRequestEvent", () => {
  let db: PGlite;
  beforeEach(async () => {
    db = await createTestDb();
    await seedTickets(db, ["UNI-123", "UNI-124"]);
  });

  it("normal: links the PR to the ticket it names", async () => {
    const result = await linkPullRequestEvent(db, prEvent(), OPTIONS);

    expect(result.status).toBe("processed");
    if (result.status !== "processed") return;
    expect(result.keys).toHaveLength(1);
    expect(result.keys[0]).toMatchObject({
      key: "UNI-123",
      status: "linked",
      foundIn: ["title", "branch", "commit:ddddddd"],
    });

    const edge = await db.query<Record<string, unknown>>(
      `select e.type, e.source_class, e.confidence, e.resolver, e.link_state, t.external_id as ticket
         from public.edges e join public.nodes t on t.id = e.to_id`,
    );
    expect(edge.rows).toEqual([
      {
        type: "TRACKS",
        source_class: "observed",
        confidence: 1,
        resolver: "explicit-reference",
        link_state: "active",
        ticket: "UNI-123",
      },
    ]);
  });

  it("edge: no key → event and PR node are stored, no edge", async () => {
    const result = await linkPullRequestEvent(
      db,
      prEvent({ title: "Refactor button styles", branch: "chore/buttons", commits: [] }),
      OPTIONS,
    );
    expect(result.status).toBe("no_key");
    expect(await count(db, "events")).toBe(1);
    expect(await count(db, "edges")).toBe(0);
  });

  it("failure: unknown key → reported, no edge, nothing invented", async () => {
    const nodesBefore = await count(db, "nodes");
    const result = await linkPullRequestEvent(
      db,
      prEvent({ title: "UNI-999 Ghost ticket", branch: "feature/ghost", commits: [] }),
      OPTIONS,
    );
    expect(result).toMatchObject({ status: "processed", keys: [{ key: "UNI-999", status: "unknown_key" }] });
    expect(await count(db, "edges")).toBe(0);
    expect(await count(db, "nodes")).toBe(nodesBefore + 1); // only the PR node, no fake Ticket

    // The key is kept on the event so it can be re-resolved later.
    const ev = await db.query<{ references: unknown }>(`select "references" from public.events`);
    expect(ev.rows[0]!.references).toEqual([{ sourceTool: "jira", entityType: "Ticket", entityId: "UNI-999" }]);
  });

  it("dedupe: the same delivery twice is a no-op the second time", async () => {
    const first = await linkPullRequestEvent(db, prEvent(), OPTIONS);
    const second = await linkPullRequestEvent(db, prEvent(), OPTIONS);

    expect(first.status).toBe("processed");
    expect(second).toEqual({ status: "duplicate_event", eventId: "github:delivery-1" });
    expect(await count(db, "events")).toBe(1);
    expect(await count(db, "edges")).toBe(1);
  });

  it("dedupe: a new event naming an already-linked key adds no second edge", async () => {
    await linkPullRequestEvent(db, prEvent(), OPTIONS);
    const edited = await linkPullRequestEvent(
      db,
      { ...prEvent({ title: "UNI-123 Add login form (v2)" }, "delivery-2"), action: "edited" },
      OPTIONS,
    );
    expect(edited).toMatchObject({ status: "processed", keys: [{ key: "UNI-123", status: "already_linked" }] });
    expect(await count(db, "events")).toBe(2);
    expect(await count(db, "edges")).toBe(1);
  });

  it("dedupe: a link a reviewer dismissed is not revived by a new mention", async () => {
    await linkPullRequestEvent(db, prEvent(), OPTIONS);
    await db.query(`update public.edges set link_state = 'dismissed'`);

    const again = await linkPullRequestEvent(db, prEvent({}, "delivery-3"), OPTIONS);
    expect(again).toMatchObject({
      status: "processed",
      keys: [{ key: "UNI-123", status: "already_linked", linkState: "dismissed" }],
    });
    expect(await count(db, "edges")).toBe(1);
  });

  it("dedupe: a revoked link frees the slot, so a new mention links again", async () => {
    await linkPullRequestEvent(db, prEvent(), OPTIONS);
    await db.query(`update public.edges set link_state = 'revoked', valid_to = now()`);

    const again = await linkPullRequestEvent(db, prEvent({}, "delivery-4"), OPTIONS);
    expect(again).toMatchObject({ status: "processed", keys: [{ key: "UNI-123", status: "linked" }] });
    const states = await db.query<{ link_state: string }>(`select link_state from public.edges order by created_at`);
    expect(states.rows.map((r) => r.link_state).sort()).toEqual(["active", "revoked"]);
  });

  it("mixed: one known and one unknown key in the same PR", async () => {
    const result = await linkPullRequestEvent(
      db,
      prEvent({ title: "UNI-124 and UNI-999", branch: "x", commits: [] }),
      OPTIONS,
    );
    expect(result).toMatchObject({
      status: "processed",
      keys: [
        { key: "UNI-124", status: "linked" },
        { key: "UNI-999", status: "unknown_key" },
      ],
    });
  });

  it("is atomic: if a write fails, the event is not recorded either", async () => {
    // Simulate the database failing on the edge insert, i.e. AFTER the event
    // row and the PR node have already been written inside the transaction.
    const failingDb = {
      query: (sql: string, params?: unknown[]) => {
        if (sql.includes("insert into public.edges")) throw new Error("simulated outage");
        return db.query(sql, params);
      },
    } as typeof db;
    await expect(linkPullRequestEvent(failingDb, prEvent(), OPTIONS)).rejects.toThrow("simulated outage");
    expect(await count(db, "events")).toBe(0);
    expect(await count(db, "edges")).toBe(0);
  });
});

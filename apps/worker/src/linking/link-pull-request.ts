/**
 * Deterministic PR → Jira issue linking (FR-04, Ch.6).
 *
 * Input: one GitHub pull-request event (opened / edited / synchronize).
 * Output: `TRACKS` edges in the evidence graph from the PR node to every Jira
 * Ticket node whose key the PR mentions, plus a report of what happened to
 * each key.
 *
 * Tables used (all from supabase/migrations/00003_schema.sql, i.e. the ERD):
 *   events  append-only log; UNIQUE (source_tool, vendor_delivery_id)
 *   nodes   one row per artefact; UNIQUE (workspace_id, type, external_id)
 *   edges   typed links between nodes; one current edge per (from, to, type)
 *           (edges_current_identity_uidx, 00010_edge_dedupe.sql: unique
 *           where link_state <> 'revoked')
 *
 * The four demo cases and where each is decided:
 *   normal       key found, ticket exists       → new edge         (step 4)
 *   no key       nothing matched                → event kept, no edge
 *   unknown key  key matched, no such ticket    → reported, no edge (step 4)
 *   same event   webhook delivered twice        → second is a no-op (step 1)
 *
 * Everything runs in one transaction, so an event is never recorded without
 * its links or the other way round.
 */
import type { Db } from "./db.js";
import { extractJiraKeys, type KeySource } from "./extract-keys.js";

export interface PullRequestEvent {
  workspaceId: string;
  /** GitHub's `X-GitHub-Delivery` header. Identical on every redelivery. */
  deliveryId: string;
  /** `opened`, `edited`, `synchronize`, ... */
  action: string;
  /** GitHub login of whoever caused the event. */
  actor: string;
  /** When it happened on GitHub (ISO-8601 with timezone). */
  occurredAt: string;
  /** SHA-256 of the raw webhook body, as `events.raw_hash` requires. */
  rawHash: string;
  pr: {
    repo: string; // "owner/name"
    number: number;
    title: string;
    branch: string;
    headSha: string;
    state: "open" | "closed" | "merged";
    commits: { sha: string; message: string }[];
  };
}

export type KeyOutcome =
  /** A new TRACKS edge was created. */
  | { key: string; status: "linked"; edgeId: string; foundIn: KeySource[] }
  /** The edge already existed (from an earlier event); nothing was written. */
  | { key: string; status: "already_linked"; edgeId: string; linkState: string; foundIn: KeySource[] }
  /** The key looks valid but no Ticket with that key has been ingested. */
  | { key: string; status: "unknown_key"; foundIn: KeySource[] };

export type LinkResult =
  /** This delivery was processed before. Nothing was written. */
  | { status: "duplicate_event"; eventId: string }
  /** Event recorded, PR node updated, but the PR mentions no Jira key. */
  | { status: "no_key"; eventId: string; prNodeId: string }
  /** Event recorded and each key resolved; see `keys` for per-key results. */
  | { status: "processed"; eventId: string; prNodeId: string; keys: KeyOutcome[] };

export interface LinkOptions {
  /** Jira project keys bound to this workspace, e.g. ["UNI"]. null = any. */
  projectKeys: readonly string[] | null;
}

/** Who resolved the link. Same convention as `Edge.resolver` in @unify/contracts. */
const RESOLVER = "explicit-reference";

export async function linkPullRequestEvent(
  db: Db,
  event: PullRequestEvent,
  options: LinkOptions,
): Promise<LinkResult> {
  const prExternalId = `${event.pr.repo}#${event.pr.number}`;
  // Same delivery id → same event id, so a redelivery collides with itself.
  const eventId = `github:${event.deliveryId}`;
  const keys = extractJiraKeys(event.pr, options.projectKeys);

  await db.query("begin");
  try {
    // ---- Step 1: record the event, or stop if we have seen it before. ------
    // `on conflict do nothing` + `returning` gives back zero rows when the
    // UNIQUE (source_tool, vendor_delivery_id) constraint is hit. That zero is
    // how we detect "same event twice", with no race between check and insert.
    const references = keys.map((k) => ({ sourceTool: "jira", entityType: "Ticket", entityId: k.key }));
    const inserted = await db.query<{ event_id: string }>(
      `insert into public.events
         (event_id, vendor_delivery_id, workspace_id, source_tool,
          entity_type, entity_id, version, action, actor,
          occurred_at, "references", raw_hash)
       values ($1, $2, $3, 'github', 'PullRequest', $4, $5, $6, $7, $8, $9::jsonb, $10)
       on conflict do nothing
       returning event_id`,
      [
        eventId, event.deliveryId, event.workspaceId, prExternalId, event.pr.headSha,
        event.action, event.actor, event.occurredAt, JSON.stringify(references), event.rawHash,
      ],
    );
    if (inserted.rows.length === 0) {
      await db.query("rollback");
      return { status: "duplicate_event", eventId };
    }

    // ---- Step 2: create or update the PullRequest node. --------------------
    // One node per PR (the ERD's UNIQUE (workspace_id, type, external_id));
    // a later event for the same PR updates it in place.
    const prNode = await db.query<{ id: string }>(
      `insert into public.nodes (workspace_id, type, external_id, version, status, owner, last_modified, payload)
       values ($1, 'PullRequest', $2, $3, $4, $5, $6, $7::jsonb)
       on conflict (workspace_id, type, external_id) do update
         set version = excluded.version,
             status = excluded.status,
             last_modified = excluded.last_modified,
             payload = excluded.payload
       returning id`,
      [
        event.workspaceId, prExternalId, event.pr.headSha, event.pr.state, event.actor, event.occurredAt,
        JSON.stringify({ repo: event.pr.repo, number: event.pr.number, title: event.pr.title, branch: event.pr.branch }),
      ],
    );
    const prNodeId = prNode.rows[0]!.id;

    // ---- Step 3: no key → done. The event row is still kept (it is a log). --
    if (keys.length === 0) {
      await db.query("commit");
      return { status: "no_key", eventId, prNodeId };
    }

    // ---- Step 4: resolve each key to a Ticket node and link it. ------------
    const outcomes: KeyOutcome[] = [];
    for (const { key, foundIn } of keys) {
      const ticket = await db.query<{ id: string }>(
        `select id from public.nodes
          where workspace_id = $1 and type = 'Ticket' and external_id = $2`,
        [event.workspaceId, key],
      );
      if (ticket.rows.length === 0) {
        // We never invent a Ticket node: an edge to a guessed node would be
        // evidence we do not have. The key stays in events.references, so it
        // can be re-resolved once the Jira issue is ingested.
        outcomes.push({ key, status: "unknown_key", foundIn });
        continue;
      }
      const ticketId = ticket.rows[0]!.id;

      // observed + confidence 1.0: the PR author typed this key themselves,
      // so this link may support a decisive finding (FR-05). The partial
      // unique index from 00010 makes a second insert a no-op. The WHERE
      // clause must match that index's predicate exactly, or Postgres
      // rejects the ON CONFLICT.
      const edge = await db.query<{ id: string }>(
        `insert into public.edges (from_id, to_id, type, source_class, confidence, resolver, metadata)
         values ($1, $2, 'TRACKS', 'observed', 1.0, $3, $4::jsonb)
         on conflict (from_id, to_id, type) where link_state <> 'revoked' do nothing
         returning id`,
        [prNodeId, ticketId, RESOLVER, JSON.stringify({ key, foundIn, eventId })],
      );
      if (edge.rows.length > 0) {
        outcomes.push({ key, status: "linked", edgeId: edge.rows[0]!.id, foundIn });
      } else {
        // Report the existing edge, including its state: if a reviewer has
        // dismissed it, a new mention of the key must not quietly revive it.
        const existing = await db.query<{ id: string; link_state: string }>(
          `select id, link_state from public.edges
            where from_id = $1 and to_id = $2 and type = 'TRACKS' and link_state <> 'revoked'`,
          [prNodeId, ticketId],
        );
        const row = existing.rows[0]!;
        outcomes.push({ key, status: "already_linked", edgeId: row.id, linkState: row.link_state, foundIn });
      }
    }

    await db.query("commit");
    return { status: "processed", eventId, prNodeId, keys: outcomes };
  } catch (error) {
    await db.query("rollback");
    throw error;
  }
}

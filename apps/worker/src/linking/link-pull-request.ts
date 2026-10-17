/**
 * Deterministic PR → Jira issue linking (FR-04, Ch.6).
 *
 * Input: one GitHub pull-request event (opened / edited / synchronize).
 * Output: `TRACKS` edges in the evidence graph from the PR node to every Jira
 * Ticket node whose key the PR mentions, plus a report of what happened to
 * each key.
 *
 * The work is split in two:
 *   1. here, in TypeScript: find the keys (`extractJiraKeys`, @unify/contracts).
 *      Pure, no I/O.
 *   2. in the database: one call to the `link_pull_request_event` function
 *      (supabase/migrations/00015_link_pull_request_event.sql), which records
 *      the event, upserts the PR node, looks up each ticket and writes the
 *      edges. A Postgres function runs as one transaction, so an event is never
 *      recorded without its links. supabase-js cannot hold a transaction open
 *      across calls, which is why that half lives in SQL.
 *
 * The four linking cases and where each is decided (steps refer to 00015):
 *   normal       key found, ticket exists       → new edge         (step 4)
 *   no key       nothing matched                → event kept, no edge (step 3)
 *   unknown key  key matched, no such ticket    → reported, no edge (step 4)
 *   same event   webhook delivered twice        → second is a no-op (step 1)
 */
import { extractJiraKeys, type ExtractedKey, type KeySource } from "@unify/contracts";

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

/** The arguments of `link_pull_request_event`, named as the SQL function names them. */
export interface LinkFunctionArgs {
  p_workspace_id: string;
  p_delivery_id: string;
  p_action: string;
  p_actor: string;
  p_occurred_at: string;
  p_raw_hash: string;
  p_pr: { repo: string; number: number; title: string; branch: string; headSha: string; state: string };
  p_keys: ExtractedKey[];
}

/** Something that can call the database function: supabase-js or plain SQL (see callers.ts). */
export type LinkFunction = (args: LinkFunctionArgs) => Promise<LinkResult>;

export async function linkPullRequestEvent(
  callLinkFunction: LinkFunction,
  event: PullRequestEvent,
  options: LinkOptions,
): Promise<LinkResult> {
  // Step 0 (TypeScript): which keys does this PR mention, and where?
  const keys = extractJiraKeys(event.pr, options.projectKeys);

  // Steps 1-4 (database): one call, one transaction.
  const { commits: _commits, ...pr } = event.pr;
  return callLinkFunction({
    p_workspace_id: event.workspaceId,
    p_delivery_id: event.deliveryId,
    p_action: event.action,
    p_actor: event.actor,
    p_occurred_at: event.occurredAt,
    p_raw_hash: event.rawHash,
    p_pr: pr,
    p_keys: keys,
  });
}

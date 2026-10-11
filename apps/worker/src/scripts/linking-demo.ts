/**
 * Live-demo script for deterministic linking.
 *
 *   npm install                          (once, from the repo root)
 *   cd apps/worker
 *   npm run demo:linking                 local: in-process Postgres with the project's migrations
 *   npm run demo:linking -- --live       hosted Supabase (needs .env, see below)
 *
 * Both modes run the same linker and the same database function
 * (`link_pull_request_event`, migration 00015). They differ only in where the
 * function runs:
 *   local  PGlite, loaded with migrations 00001–00003, 00005, 00010, 00015.
 *   live   the hosted project, through supabase-js with the worker's
 *          service-role client. Needs SUPABASE_URL and
 *          SUPABASE_SERVICE_ROLE_KEY in apps/worker/.env (the same two the
 *          verification worker uses) and 00015 applied to the project.
 *          Writes into its own workspace (slug `linking-demo`), never into the
 *          verification demo's. Every run uses a fresh demo repo name, so a
 *          re-run starts clean even though events are append-only.
 *
 * The script ingests two Jira tickets (UNI-123, UNI-124) as Ticket nodes, plays
 * five pull-request events through the linker, and prints each outcome and the
 * resulting TRACKS edges.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { viaSql, viaSupabase } from "../linking/callers.js";
import { linkPullRequestEvent, type LinkFunction, type PullRequestEvent } from "../linking/link-pull-request.js";

const OPTIONS = { projectKeys: ["UNI"] };
const TICKETS = ["UNI-123", "UNI-124"];
const live = process.argv.includes("--live");

/** One row of the summary table at the end. */
interface EdgeRow {
  pr: string;
  type: string;
  ticket: string;
  source_class: string;
  confidence: number;
  resolver: string;
  link_state: string;
}

interface Backend {
  workspaceId: string;
  link: LinkFunction;
  edges(repo: string): Promise<EdgeRow[]>;
  eventCount(repo: string): Promise<number>;
}

// ---- local backend: PGlite --------------------------------------------------
async function localBackend(): Promise<Backend> {
  const { WORKSPACE_ID, createTestDb, seedTickets } = await import("../linking/local-db.js");
  const db = await createTestDb();
  await seedTickets(db, TICKETS);
  return {
    workspaceId: WORKSPACE_ID,
    link: viaSql(db),
    async edges(repo) {
      const r = await db.query<EdgeRow>(
        `select pr.external_id as pr, e.type, t.external_id as ticket, e.source_class,
                e.confidence, e.resolver, e.link_state
           from public.edges e
           join public.nodes pr on pr.id = e.from_id
           join public.nodes t  on t.id  = e.to_id
          where pr.external_id like $1`,
        [`${repo}#%`],
      );
      return r.rows;
    },
    async eventCount(repo) {
      const r = await db.query<{ n: number }>(
        "select count(*)::int as n from public.events where entity_id like $1",
        [`${repo}#%`],
      );
      return r.rows[0]!.n;
    },
  };
}

// ---- live backend: hosted Supabase -------------------------------------------
async function must<T>(p: PromiseLike<{ data: T | null; error: { message: string } | null }>, op: string): Promise<T> {
  const { data, error } = await p;
  if (error) throw new Error(`${op}: ${error.message}`);
  return data as T;
}

async function liveBackend(): Promise<Backend> {
  const { loadConfig } = await import("../config.js");
  const { createServiceClient } = await import("../db.js");
  const client: SupabaseClient = createServiceClient(loadConfig());

  // Own workspace, created once and reused.
  const existing = await must(
    client.from("workspaces").select("id").eq("slug", "linking-demo").maybeSingle(),
    "find workspace",
  );
  const workspaceId =
    (existing as { id: string } | null)?.id ??
    (await must(
      client.from("workspaces").insert({ name: "Linking demo", slug: "linking-demo" }).select("id").single(),
      "create workspace",
    ) as { id: string }).id;

  // "Ingest" the two tickets (idempotent).
  await must(
    client
      .from("nodes")
      .upsert(
        TICKETS.map((key) => ({ workspace_id: workspaceId, type: "Ticket", external_id: key, status: "In Progress" })),
        { onConflict: "workspace_id,type,external_id", ignoreDuplicates: true },
      ),
    "seed tickets",
  );

  return {
    workspaceId,
    link: viaSupabase(client),
    async edges(repo) {
      const prs = await must(
        client.from("nodes").select("id, external_id").eq("workspace_id", workspaceId)
          .eq("type", "PullRequest").like("external_id", `${repo}#%`),
        "read PR nodes",
      ) as { id: string; external_id: string }[];
      if (prs.length === 0) return [];
      const edges = await must(
        client.from("edges").select("from_id, to_id, type, source_class, confidence, resolver, link_state")
          .in("from_id", prs.map((p) => p.id)),
        "read edges",
      ) as (Omit<EdgeRow, "pr" | "ticket"> & { from_id: string; to_id: string })[];
      const tickets = await must(
        client.from("nodes").select("id, external_id").in("id", edges.map((e) => e.to_id)),
        "read tickets",
      ) as { id: string; external_id: string }[];
      const name = (rows: { id: string; external_id: string }[], id: string) =>
        rows.find((r) => r.id === id)?.external_id ?? id;
      return edges.map(({ from_id, to_id, ...e }) => ({ pr: name(prs, from_id), ticket: name(tickets, to_id), ...e }));
    },
    async eventCount(repo) {
      const { count, error } = await client
        .from("events").select("event_id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId).like("entity_id", `${repo}#%`);
      if (error) throw new Error(`count events: ${error.message}`);
      return count ?? 0;
    },
  };
}

// ---- the five demo events ----------------------------------------------------
const backend = live ? await liveBackend() : await localBackend();
// A fresh repo name per live run keeps runs apart (events can't be deleted).
const runTag = live ? `-${Date.now().toString(36)}` : "";
const repo = `unify-demo/linking${runTag}`;

function event(deliveryId: string, number: number, title: string, branch: string, commitMessage: string): PullRequestEvent {
  return {
    workspaceId: backend.workspaceId,
    deliveryId: `${deliveryId}${runTag}`,
    action: "opened",
    actor: "mishal",
    occurredAt: new Date().toISOString(),
    rawHash: "0".repeat(64),
    pr: {
      repo,
      number,
      title,
      branch,
      headSha: "c".repeat(40),
      state: "open",
      commits: [{ sha: "d".repeat(40), message: commitMessage }],
    },
  };
}

const cases: [string, PullRequestEvent][] = [
  ["1. Normal: key in title, branch and commit",
    event("d-101", 101, "UNI-123 Add login form", "feature/UNI-123-login", "UNI-123 form markup")],
  ["2. No key",
    event("d-102", 102, "Refactor button styles", "chore/buttons", "tidy css")],
  ["3. Unknown key (no such ticket) + a lookalike (UTF-8)",
    event("d-103", 103, "UNI-999 Encode names as UTF-8", "feature/ghost", "wip")],
  ["4. Same delivery as case 1, sent again",
    event("d-101", 101, "UNI-123 Add login form", "feature/UNI-123-login", "UNI-123 form markup")],
  ["5. New event on PR 101 that mentions UNI-123 again",
    event("d-104", 101, "UNI-123 Add login form (v2)", "feature/UNI-123-login", "UNI-123 review fixes")],
];

console.log(`Mode: ${live ? "LIVE (hosted Supabase)" : "local (in-process Postgres)"}`);
console.log(`Tickets in graph: ${TICKETS.join(", ")}\n`);

for (const [label, ev] of cases) {
  const result = await linkPullRequestEvent(backend.link, ev, OPTIONS);
  console.log(label);
  console.log(`   PR #${ev.pr.number}  title="${ev.pr.title}"  branch=${ev.pr.branch}`);
  if (result.status === "processed") {
    for (const k of result.keys) {
      const extra = k.status === "already_linked" ? ` (${k.linkState})` : "";
      console.log(`   → ${k.key}: ${k.status}${extra}   found in: ${k.foundIn.join(", ")}`);
    }
  } else {
    console.log(`   → ${result.status}`);
  }
  console.log();
}

const edges = await backend.edges(repo);
console.log(`edges for ${repo} (${edges.length} row):`);
console.table(edges);
console.log(`events: ${await backend.eventCount(repo)} rows (5 deliveries sent, 1 was a duplicate)`);

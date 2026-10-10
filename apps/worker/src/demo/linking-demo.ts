/**
 * Live-demo script for deterministic linking.
 *
 *   cd apps/worker && npm install && npm run demo:linking
 *
 * Starts an in-process Postgres with the project's migrations, ingests two
 * Jira tickets (UNI-123, UNI-124), then plays the demo cases through the real
 * linker and prints what happened and what is now in the `edges` table.
 */
import { linkPullRequestEvent, type PullRequestEvent } from "../linking/link-pull-request.js";
import { WORKSPACE_ID, createTestDb, seedTickets } from "../../test/helpers/test-db.js";

const OPTIONS = { projectKeys: ["UNI"] };

function event(deliveryId: string, number: number, title: string, branch: string, commitMessage: string): PullRequestEvent {
  return {
    workspaceId: WORKSPACE_ID,
    deliveryId,
    action: "opened",
    actor: "mishal",
    occurredAt: new Date().toISOString(),
    rawHash: "0".repeat(64),
    pr: {
      repo: "abdullahamin231/fyp",
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

const db = await createTestDb();
await seedTickets(db, ["UNI-123", "UNI-124"]);
console.log("Tickets in graph: UNI-123, UNI-124\n");

for (const [label, ev] of cases) {
  const result = await linkPullRequestEvent(db, ev, OPTIONS);
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

const edges = await db.query(
  `select pr.external_id as pr, e.type, t.external_id as ticket, e.source_class, e.confidence, e.resolver, e.link_state
     from public.edges e
     join public.nodes pr on pr.id = e.from_id
     join public.nodes t  on t.id  = e.to_id`,
);
const events = await db.query<{ n: number }>("select count(*)::int as n from public.events");
console.log(`edges table (${edges.rows.length} row):`);
console.table(edges.rows);
console.log(`events table: ${events.rows[0]!.n} rows (5 deliveries sent, 1 was a duplicate)`);

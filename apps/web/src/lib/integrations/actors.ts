import { asRecord, text } from "./common";
import type { IntegrationProvider } from "./types";

/**
 * Who a provider payload names, with the provider's stable account id.
 *
 * Identity is the account id and nothing else: Jira `accountId`, GitHub numeric
 * `id`, Figma user `id`. Handles and display names are hints for humans, and an
 * email is only ever stored, never matched on.
 */
export type ActorRelation = "author" | "assignee" | "reporter" | "owner";

export interface PayloadActor {
  tool: IntegrationProvider;
  accountId: string;
  handle: string | null;
  displayName: string | null;
  email: string | null;
  relation: ActorRelation;
}

/** Ids arrive as numbers (GitHub) or strings (Jira, Figma); text() alone would drop numbers. */
function idOf(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return text(value);
}

function githubUser(value: unknown, relation: ActorRelation): PayloadActor | null {
  const user = asRecord(value);
  const accountId = idOf(user.id);
  if (!accountId) return null;
  return { tool: "github", accountId, handle: text(user.login), displayName: text(user.name), email: text(user.email), relation };
}

function jiraUser(value: unknown, relation: ActorRelation): PayloadActor | null {
  const user = asRecord(value);
  const accountId = text(user.accountId);
  if (!accountId) return null;
  return { tool: "jira", accountId, handle: null, displayName: text(user.displayName), email: text(user.emailAddress), relation };
}

function figmaUser(value: unknown, relation: ActorRelation): PayloadActor | null {
  const user = asRecord(value);
  const accountId = idOf(user.id);
  if (!accountId) return null;
  return { tool: "figma", accountId, handle: text(user.handle), displayName: null, email: text(user.email), relation };
}

const present = (actors: (PayloadActor | null)[]): PayloadActor[] => actors.filter((a): a is PayloadActor => a !== null);

/** GitHub pull_request payload: `pull_request.user` is the author, `assignee`/`assignees` the assigned. */
export function githubPullRequestActors(payload: Record<string, unknown>): { actors: PayloadActor[]; assigneesKnown: boolean } {
  const pr = asRecord(payload.pull_request);
  const listed = Array.isArray(pr.assignees) ? pr.assignees : null;
  const assignees = listed ?? (pr.assignee ? [pr.assignee] : []);
  return {
    actors: present([
      githubUser(pr.user, "author"),
      ...assignees.map((a) => githubUser(a, "assignee")),
    ]),
    // A body without either key says nothing about assignment; one with an empty list says "unassigned".
    assigneesKnown: listed !== null || "assignee" in pr,
  };
}

/** Jira issue payload: `fields.assignee` and `fields.reporter`; null means unassigned, absent means unknown. */
export function jiraIssueActors(body: Record<string, unknown>): { actors: PayloadActor[]; assigneeKnown: boolean } {
  const fields = asRecord(asRecord(body.issue).fields);
  return {
    actors: present([jiraUser(fields.assignee, "assignee"), jiraUser(fields.reporter, "reporter")]),
    assigneeKnown: "assignee" in fields,
  };
}

/** Figma webhook/poll `user`. The author of a version is not the file's owner, so it is `author`. */
export function figmaEventActors(payload: Record<string, unknown>): PayloadActor[] {
  return present([figmaUser(payload.user, "author")]);
}

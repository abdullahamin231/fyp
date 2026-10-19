/**
 * A Jira webhook body, reduced to what `ingest_jira_issue` (migration 00036)
 * needs to bring the graph in line with the issue.
 *
 *   ticket   an ordinary issue: Ticket node + its acceptance criteria
 *   nfr      an issue labelled `nfr`: one Requirement node, no criteria
 *   partial  the body does not carry labels (comment webhooks), so the kind
 *            is unknown; the database keeps whichever kind is live
 *
 * `criteria` is null when the body does not carry the description at all,
 * which tells the database to leave the ticket's criteria untouched. An empty
 * list means the section is gone and every criterion is retired.
 */
import { asRecord, text } from "./common";
import { extractCriteria } from "./criteria";

export const NFR_LABEL = "nfr";

export type JiraIssueKind = "ticket" | "nfr" | "partial";

export interface JiraIssueSync {
  key: string;
  kind: JiraIssueKind;
  version: string;
  occurredAt: string;
  status: string | null;
  owner: string | null;
  payload: Record<string, unknown>;
  criteria: { texts: string[]; source: string | null; resolver: string } | null;
}

export function guessCategory(status: string | null): string | null {
  if (!status) return null;
  const s = status.toLowerCase();
  if (["done", "closed", "resolved", "complete", "completed"].includes(s)) return "done";
  if (["to do", "todo", "open", "backlog", "new"].includes(s)) return "new";
  return "indeterminate";
}

/** Plain text of a description that may be a string or an ADF document. */
function plainText(value: unknown): string {
  if (typeof value === "string") return value;
  const node = asRecord(value);
  if (node.type === "text") return text(node.text) ?? "";
  const children = Array.isArray(node.content) ? node.content : [];
  const joiner = node.type === "doc" ? "\n" : "";
  return children.map(plainText).join(joiner);
}

function kindOf(fields: Record<string, unknown>): JiraIssueKind {
  if (!Array.isArray(fields.labels)) return "partial";
  return fields.labels.some((label) => typeof label === "string" && label.toLowerCase() === NFR_LABEL) ? "nfr" : "ticket";
}

export function jiraIssueSync(
  body: Record<string, unknown>,
  criteriaField: string | null,
  occurredAt: string,
): JiraIssueSync | null {
  const issue = asRecord(body.issue);
  const key = text(issue.key);
  if (!key) return null;
  const fields = asRecord(issue.fields);
  const changelog = Array.isArray(asRecord(body.changelog).items) ? (asRecord(body.changelog).items as unknown[]) : [];
  const statusChange = asRecord(changelog.find((item) => text(asRecord(item).field) === "status"));
  const deleted = text(body.webhookEvent) === "jira:issue_deleted";
  const status = deleted ? "Deleted" : (text(asRecord(fields.status).name) ?? text(statusChange.toString));
  // Jira's own grouping of statuses: "new" (To Do), "indeterminate" (In Progress), "done".
  const statusCategory = deleted ? "deleted" : (text(asRecord(asRecord(fields.status).statusCategory).key) ?? guessCategory(status));
  const self = text(issue.self);
  const url = self ? `${new URL(self).origin}/browse/${key}` : null;
  const summary = text(fields.summary);
  const kind = kindOf(fields);
  const common = {
    key,
    version: text(fields.updated) ?? occurredAt,
    occurredAt,
    status,
    owner: text(asRecord(fields.assignee).displayName),
  };

  if (kind === "nfr") {
    const description = plainText(fields.description).trim();
    return {
      ...common,
      kind,
      payload: { kind: "nfr", key, summary, text: [summary, description].filter(Boolean).join("\n"), status, statusCategory, url },
      criteria: null,
    };
  }

  const extracted = extractCriteria(body, criteriaField);
  return {
    ...common,
    kind,
    payload: { key, summary, text: summary, status, statusCategory, url },
    criteria: extracted && {
      texts: extracted.texts,
      source: extracted.source,
      resolver: extracted.source === "field" ? `jira:customfield:${criteriaField}` : "jira:description",
    },
  };
}

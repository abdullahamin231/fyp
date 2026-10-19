/**
 * Jira Cloud webhook bodies for tests, shaped like a real `jira:issue_updated`
 * delivery: the issue is the REST v2 representation (description in wiki
 * markup), with every navigable field present and null when empty.
 * https://developer.atlassian.com/cloud/jira/platform/webhooks/
 */
import type { AdfNode } from "./criteria";

export const WIKI_DESCRIPTION = [
  "As a shopper I want discount codes applied at checkout.",
  "",
  "h3. Acceptance Criteria",
  "",
  "* the cart total drops by the code percentage",
  "* the reduced total is *what checkout renders*",
  "*# and what the receipt shows",
  "",
  "h3. Notes",
  "",
  "* rounding follows the finance spec, not a criterion",
].join("\n");

const paragraph = (...content: AdfNode[]): AdfNode => ({ type: "paragraph", content });
const textNode = (text: string, marks?: { type: string }[]): AdfNode => ({ type: "text", text, ...(marks ? { marks } : {}) });
const item = (...content: AdfNode[]): AdfNode => ({ type: "listItem", content });

/** The same description as REST v3 returns it. */
export const ADF_DESCRIPTION: AdfNode = {
  type: "doc",
  version: 1,
  content: [
    paragraph(textNode("As a shopper I want discount codes applied at checkout.")),
    { type: "heading", attrs: { level: 3 }, content: [textNode("Acceptance Criteria")] },
    {
      type: "bulletList",
      content: [
        item(paragraph(textNode("the cart total drops by the code percentage"))),
        item(
          paragraph(textNode("the reduced total is "), textNode("what checkout renders", [{ type: "strong" }])),
          { type: "orderedList", attrs: { order: 1 }, content: [item(paragraph(textNode("and what the receipt shows")))] },
        ),
      ],
    },
    { type: "heading", attrs: { level: 3 }, content: [textNode("Notes")] },
    { type: "bulletList", content: [item(paragraph(textNode("rounding follows the finance spec, not a criterion")))] },
  ],
};

export interface IssueOverrides {
  key?: string;
  description?: string | AdfNode | null;
  labels?: string[];
  summary?: string;
  status?: string;
  statusCategory?: "new" | "indeterminate" | "done";
  /** Epoch milliseconds of the webhook event. */
  timestamp?: number;
  webhookEvent?: string;
  extraFields?: Record<string, unknown>;
}

export function jiraIssueWebhook(overrides: IssueOverrides = {}): Record<string, unknown> {
  const key = overrides.key ?? "UNI-42";
  const timestamp = overrides.timestamp ?? Date.parse("2026-10-17T10:00:00Z");
  const updated = new Date(timestamp).toISOString().replace("Z", "+0000");
  return {
    timestamp,
    webhookEvent: overrides.webhookEvent ?? "jira:issue_updated",
    issue_event_type_name: "issue_generic",
    user: {
      self: "https://unify-demo.atlassian.net/rest/api/2/user?accountId=5b10a2844c20165700ede21g",
      accountId: "5b10a2844c20165700ede21g",
      displayName: "Mishal Ahmed",
      active: true,
      timeZone: "Asia/Karachi",
      accountType: "atlassian",
    },
    issue: {
      id: "10042",
      self: "https://unify-demo.atlassian.net/rest/api/2/issue/10042",
      key,
      fields: {
        summary: overrides.summary ?? "Apply discount codes at checkout",
        issuetype: { id: "10001", name: "Story", subtask: false },
        project: { id: "10000", key: key.split("-")[0], name: "Unify" },
        labels: overrides.labels ?? [],
        status: {
          name: overrides.status ?? "In Progress",
          statusCategory: { id: 4, key: overrides.statusCategory ?? "indeterminate", name: "In Progress" },
        },
        assignee: { accountId: "5b10a2844c20165700ede21g", displayName: "Mishal Ahmed" },
        created: "2026-10-01T09:00:00.000+0000",
        updated,
        description: overrides.description === undefined ? WIKI_DESCRIPTION : overrides.description,
        customfield_10045: null,
        ...overrides.extraFields,
      },
    },
    changelog: {
      id: "10124",
      items: [{ field: "description", fieldtype: "jira", fieldId: "description", from: null, fromString: "", to: null, toString: "" }],
    },
  };
}

/** `comment_created` carries a trimmed issue: no description, no labels. */
export function jiraCommentWebhook(key = "UNI-42", timestamp = Date.parse("2026-10-17T11:00:00Z")): Record<string, unknown> {
  return {
    timestamp,
    webhookEvent: "comment_created",
    comment: { id: "10200", body: "Looks good", author: { accountId: "5b10a2844c20165700ede21g" } },
    issue: {
      id: "10042",
      self: "https://unify-demo.atlassian.net/rest/api/2/issue/10042",
      key,
      fields: {
        summary: "Apply discount codes at checkout",
        issuetype: { id: "10001", name: "Story", subtask: false },
        status: { name: "In Progress", statusCategory: { id: 4, key: "indeterminate", name: "In Progress" } },
        assignee: { accountId: "5b10a2844c20165700ede21g", displayName: "Mishal Ahmed" },
      },
    },
  };
}

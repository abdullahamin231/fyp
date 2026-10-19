import { describe, expect, it } from "vitest";
import { jiraAdapter } from "./adapters";
import { jiraIssueSync } from "./jira-issue";
import { ADF_DESCRIPTION, jiraCommentWebhook, jiraIssueWebhook } from "./jira-webhook.fixture";

const AT = "2026-10-17T10:00:00.000Z";

describe("jiraIssueSync", () => {
  it("reads an ordinary issue as a ticket with its acceptance criteria", () => {
    const issue = jiraIssueSync(jiraIssueWebhook(), null, AT)!;
    expect(issue.kind).toBe("ticket");
    expect(issue.key).toBe("UNI-42");
    expect(issue.status).toBe("In Progress");
    expect(issue.payload).toMatchObject({ statusCategory: "indeterminate", url: "https://unify-demo.atlassian.net/browse/UNI-42" });
    expect(issue.criteria).toEqual({
      texts: [
        "the cart total drops by the code percentage",
        "the reduced total is *what checkout renders*",
        "and what the receipt shows",
      ],
      source: "description",
      resolver: "jira:description",
    });
  });

  it("reports an empty list when the criteria section was removed, so they are retired", () => {
    const issue = jiraIssueSync(jiraIssueWebhook({ description: "Just a story, no criteria yet." }), null, AT)!;
    expect(issue.criteria).toEqual({ texts: [], source: null, resolver: "jira:description" });
  });

  it("reads an issue labelled nfr (any case) as a requirement with plain text, no criteria", () => {
    const issue = jiraIssueSync(
      jiraIssueWebhook({ labels: ["backend", "NFR"], summary: "Checkout p95 under 200 ms", description: ADF_DESCRIPTION }),
      null,
      AT,
    )!;
    expect(issue.kind).toBe("nfr");
    expect(issue.criteria).toBeNull();
    expect(issue.payload.kind).toBe("nfr");
    expect(issue.payload.text).toMatch(/^Checkout p95 under 200 ms\nAs a shopper I want discount codes applied at checkout\./);
  });

  it("marks a comment webhook as partial and leaves criteria untouched", () => {
    const issue = jiraIssueSync(jiraCommentWebhook(), null, AT)!;
    expect(issue.kind).toBe("partial");
    expect(issue.criteria).toBeNull();
  });

  it("reports a deleted issue with a Deleted status", () => {
    const issue = jiraIssueSync(jiraIssueWebhook({ webhookEvent: "jira:issue_deleted" }), null, AT)!;
    expect(issue.status).toBe("Deleted");
    expect(issue.payload.statusCategory).toBe("deleted");
  });
});

describe("jira delivery ids", () => {
  const normalise = (body: Record<string, unknown>, headers: Record<string, string> = {}) =>
    jiraAdapter.normalise(body, new Date(AT), new Headers(headers))[0]!.vendorDeliveryId;

  it("use Jira's identifier header when present", () => {
    expect(normalise(jiraIssueWebhook(), { "x-atlassian-webhook-identifier": "abc-123" })).toBe("abc-123");
  });

  it("fall back to the body, so replays match and different events differ", () => {
    const first = normalise(jiraIssueWebhook({ timestamp: 1 }));
    expect(normalise(jiraIssueWebhook({ timestamp: 1 }))).toBe(first);
    expect(normalise(jiraIssueWebhook({ timestamp: 2 }))).not.toBe(first);
    expect(first).not.toBe("jira:issue_updated");
  });
});

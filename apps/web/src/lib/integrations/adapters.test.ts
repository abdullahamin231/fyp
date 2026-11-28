import { describe, expect, it } from "vitest";
import { figmaAdapter, githubAdapter, jiraAdapter } from "./adapters";
import { createHmac } from "node:crypto";

describe("integration adapters", () => {
  it("normalises numeric GitHub pull request numbers", () => {
    const events = githubAdapter.normalise({
      action: "opened",
      number: 42,
      repository: { full_name: "abdullahamin231/fyp" },
      sender: { login: "abdullah" },
      pull_request: {
        title: "UNI-42 implementation",
        body: "Closes UNI-42",
        base: { sha: "a".repeat(40) },
        head: { sha: "b".repeat(40), ref: "feat/UNI-42" },
      },
    }, new Date("2026-11-28T12:00:00Z"), new Headers({
      "x-github-delivery": "delivery-42",
      "x-github-event": "pull_request",
    }));

    expect(events).toHaveLength(1);
    expect(events[0]!.entityId).toBe("abdullahamin231/fyp#42");
    expect(events[0]!.version).toBe("b".repeat(40));
    expect(events[0]!.references.map((reference) => reference.entityId)).toEqual(["UNI-42"]);
  });

  it("uses Jira stable delivery ids and account identities", () => {
    const events = jiraAdapter.normalise({
      webhookEvent: "jira:issue_updated",
      timestamp: 1_800_000_000_000,
      issue: { key: "UNI-7", fields: { summary: "UNI-7 criterion", updated: "2026-11-28T12:00:00Z" } },
      user: { accountId: "jira-user-7" },
    }, new Date("2026-11-28T12:01:00Z"), new Headers({
      "x-atlassian-webhook-identifier": "jira-delivery-7",
    }));

    expect(events).toHaveLength(1);
    expect(events[0]!.vendorDeliveryId).toBe("jira-delivery-7");
    expect(events[0]!.actor).toBe("jira-user-7");
  });

  it("verifies GitHub and Figma provider secrets", () => {
    const secret = "test-secret";
    const raw = Buffer.from(JSON.stringify({ zen: "responsive" }));
    const signature = `sha256=${createHmac("sha256", secret).update(raw).digest("hex")}`;
    expect(() => githubAdapter.verify(raw, new Headers({ "x-hub-signature-256": signature }), secret)).not.toThrow();
    expect(() => githubAdapter.verify(raw, new Headers({ "x-hub-signature-256": "sha256=bad" }), secret)).toThrow();

    const figma = Buffer.from(JSON.stringify({ passcode: secret }));
    expect(() => figmaAdapter.verify(figma, new Headers(), secret)).not.toThrow();
  });
});

import { asRecord, rawHash, referencesFromText, text, verifyHmacSha256 } from "./common";
import type { IntegrationAdapter, NormalizedIntegrationEvent } from "./types";

function baseEvent(
  sourceTool: NormalizedIntegrationEvent["sourceTool"],
  delivery: string,
  entityType: string,
  entityId: string,
  action: string,
  actor: string,
  occurredAt: string,
  receivedAt: Date,
  payload: Record<string, unknown>,
  extra: Partial<NormalizedIntegrationEvent> = {},
): NormalizedIntegrationEvent {
  return {
    eventId: `${sourceTool}:${delivery}:${entityType}:${entityId}:${action}`,
    vendorDeliveryId: delivery,
    sourceTool,
    entityType,
    entityId,
    version: null,
    action,
    stateBefore: null,
    stateAfter: null,
    actor,
    occurredAt: Number.isNaN(Date.parse(occurredAt)) ? receivedAt.toISOString() : new Date(occurredAt).toISOString(),
    receivedAt: receivedAt.toISOString(),
    references: [],
    rawHash: rawHash(Buffer.from(JSON.stringify(payload))),
    payload,
    ...extra,
  };
}

export const githubAdapter: IntegrationAdapter = {
  provider: "github",
  verify(rawBody, headers, secret) {
    verifyHmacSha256(rawBody, headers.get("x-hub-signature-256"), secret, "sha256=");
  },
  normalise(payload, receivedAt, headers) {
    const body = asRecord(payload);
    const delivery = text(headers.get("x-github-delivery")) ?? text(body.delivery) ?? "unknown";
    const event = text(headers.get("x-github-event")) ?? "unknown";
    const action = text(body.action) ?? event;
    const repo = asRecord(body.repository);
    const repoName = text(repo.full_name) ?? text(repo.name) ?? "unknown";
    const sender = asRecord(body.sender);
    const actor = text(sender.login) ?? "github";
    const occurredAt = text(body.updated_at) ?? text(body.created_at) ?? receivedAt.toISOString();
    if (event === "pull_request") {
      const pr = asRecord(body.pull_request);
      const number = text(body.number) ?? text(pr.number) ?? (typeof (body.number ?? pr.number) === "number" ? String(body.number ?? pr.number) : "unknown");
      const base = asRecord(pr.base);
      const head = asRecord(pr.head);
      const baseSha = text(base.sha);
      const headSha = text(head.sha);
      const references = referencesFromText("github", [
        ["title", pr.title],
        ["body", pr.body],
        ["branch", head.ref],
      ]);
      return [baseEvent("github", delivery, "pull_request", `${repoName}#${number}`, action, actor, occurredAt, receivedAt, body, {
        version: headSha,
        stateBefore: action === "closed" ? "open" : null,
        stateAfter: action === "closed" ? (pr.merged === true ? "merged" : "closed") : action === "opened" ? "open" : null,
        references,
        payload: { ...body, base_sha: baseSha, head_sha: headSha, repo: repoName },
      })];
    }
    if (event === "push") {
      const after = text(body.after);
      if (!after) return [];
      return [baseEvent("github", delivery, "commit", `${repoName}@${after}`, "pushed", actor, occurredAt, receivedAt, body, {
        version: after,
        references: referencesFromText("github", [["commits", JSON.stringify(body.commits)]]),
        payload: { ...body, repo: repoName },
      })];
    }
    return [];
  },
};

export const jiraAdapter: IntegrationAdapter = {
  provider: "jira",
  verify(rawBody, headers, secret) {
    verifyHmacSha256(rawBody, headers.get("x-hub-signature"), secret, "sha256=");
  },
  normalise(payload, receivedAt, headers) {
    const body = asRecord(payload);
    // Without Jira's identifier header, the body itself is the identity: a true
    // replay dedupes, and two different events can never share an id.
    const delivery = text(headers.get("x-atlassian-webhook-identifier")) ?? `body:${rawHash(Buffer.from(JSON.stringify(payload)))}`;
    const issue = asRecord(body.issue);
    const fields = asRecord(issue.fields);
    const key = text(issue.key);
    if (!key) return [];
    const eventName = text(body.webhookEvent) ?? "jira:issue_updated";
    const actor = text(asRecord(body.user).accountId) ?? text(asRecord(body.user).displayName) ?? "jira";
    const timestamp = Number(body.timestamp);
    const occurredAt = Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : receivedAt.toISOString();
    const changelog = asRecord(body.changelog);
    const items = Array.isArray(changelog.items) ? changelog.items : [];
    const state = items.find((item) => text(asRecord(item).field) === "status");
    const stateItem = asRecord(state);
    return [baseEvent("jira", delivery, "ticket", key, eventName, actor, occurredAt, receivedAt, body, {
      version: text(fields.updated) ?? occurredAt,
      stateBefore: text(stateItem.fromString),
      stateAfter: text(stateItem.toString),
      references: referencesFromText("jira", [
        ["summary", fields.summary],
        ["description", fields.description],
        ["comments", JSON.stringify(fields.comment)],
      ]),
    })];
  },
};

export const figmaAdapter: IntegrationAdapter = {
  provider: "figma",
  verify(rawBody, _headers, secret) {
    const body = asRecord(JSON.parse(rawBody.toString("utf8")));
    if (text(body.passcode) !== secret) throw new Error("Invalid Figma webhook passcode");
  },
  normalise(payload, receivedAt) {
    const body = asRecord(payload);
    const eventType = text(body.event_type) ?? text(body.eventType);
    if (eventType !== "FILE_VERSION_UPDATE" && eventType !== "DEV_MODE_STATUS_UPDATE") return [];
    const fileKey = text(body.file_key) ?? text(body.fileKey);
    if (!fileKey) return [];
    const version = text(body.version_id) ?? text(body.versionId);
    const nodeId = text(body.node_id) ?? text(body.nodeId) ?? "file";
    const delivery = text(body.id) ?? text(body.webhook_id) ?? `${fileKey}:${version ?? "none"}:${eventType}`;
    const actor = text(asRecord(body.user).handle) ?? text(asRecord(body.user).email) ?? "figma";
    const occurredAt = text(body.timestamp) ?? receivedAt.toISOString();
    return [baseEvent("figma", delivery, "design_artifact", `${fileKey}:${nodeId}`, eventType, actor, occurredAt, receivedAt, body, {
      version,
      stateBefore: text(body.previous_status),
      stateAfter: text(body.status),
      references: referencesFromText("figma", [["payload", JSON.stringify(body)]])
    })];
  },
};

export const adapters = { figma: figmaAdapter, github: githubAdapter, jira: jiraAdapter } as const;

import { createHmac, randomUUID } from "node:crypto";
import { connectionForWebhook } from "@/lib/integrations/server";

/**
 * The scripted demo (docs/demo-walkthrough.md), as data the /demo page drives.
 *
 * Every step goes through the **real** webhook endpoint with a valid signature
 * — the same verification, normalisation, linking, enqueue and worker path a
 * live delivery takes. Nothing here writes a node, edge or verdict directly.
 */

export const DEMO_REPO = "abdullahamin231/fyp";
export const LINKING_WORKSPACE = "demo-linking";

export interface DemoTicket {
  key: string;
  summary: string;
  criteria: string[];
  /** The pull request that implements (or breaks) it. */
  pr: number;
  expect: "SUPPORTED" | "CONTRADICTED";
}

export const DEMO_TICKETS: DemoTicket[] = [
  {
    key: "UNI-7",
    summary: "Mark ingestion sources stale after a quiet window (packages/contracts: isSourceStale)",
    criteria: [
      "a checkpoint whose last successful ingest is older than the staleness threshold is marked stale",
      "a checkpoint that never recorded a success is stale, since freshness cannot be claimed for a source that was never observed",
      "a checkpoint dated in the future (clock skew) reads as fresh, not stale",
    ],
    pr: 47,
    expect: "SUPPORTED",
  },
  {
    key: "UNI-8",
    summary: "Stale-source threshold: exactly at the threshold counts as stale (packages/contracts: isSourceStale)",
    criteria: [
      "a checkpoint whose last successful ingest is exactly at the staleness threshold is marked stale",
      "a checkpoint that never recorded a success is stale",
    ],
    pr: 48,
    expect: "CONTRADICTED",
  },
];

export interface DeliveryResult {
  status: number;
  body: Record<string, unknown> | null;
}

const sign = (secret: string, body: string) =>
  `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;

async function post(
  origin: string,
  provider: "jira" | "github",
  workspaceId: string,
  payload: unknown,
  headers: (raw: string, secret: string) => Record<string, string>,
): Promise<DeliveryResult> {
  const secret = await connectionForWebhook(workspaceId, provider);
  const raw = JSON.stringify(payload);
  const response = await fetch(`${origin}/api/webhooks/${provider}/${workspaceId}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers(raw, secret) },
    body: raw,
    cache: "no-store",
  });
  const body = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  return { status: response.status, body };
}

/** A real-shaped `jira:issue_created` delivery, as `scripts/jira-replay.mjs` sends. */
export function deliverJiraIssue(
  origin: string,
  workspaceId: string,
  issue: { key: string; summary: string; criteria?: string[]; status: string; category: string },
  deliveryTag: string = randomUUID(),
): Promise<DeliveryResult> {
  const description = issue.criteria?.length
    ? ["## Acceptance Criteria", ...issue.criteria.map((c) => `- ${c}`)].join("\n")
    : undefined;
  const payload = {
    timestamp: Date.now(),
    webhookEvent: "jira:issue_created",
    issue_event_type_name: "issue_created",
    user: { accountId: "demo-reviewer", displayName: "Demo Reviewer" },
    issue: {
      id: `demo-${issue.key}`,
      key: issue.key,
      self: `https://unify-demo.atlassian.net/rest/api/2/issue/${issue.key}`,
      fields: {
        summary: issue.summary,
        ...(description ? { description } : {}),
        updated: new Date().toISOString(),
        status: { name: issue.status, statusCategory: { key: issue.category } },
        project: { key: issue.key.split("-")[0] },
      },
    },
  };
  return post(origin, "jira", workspaceId, payload, (raw, secret) => ({
    "x-hub-signature": sign(secret, raw),
    "x-atlassian-webhook-identifier": `demo:${issue.key}:${deliveryTag}`,
  }));
}

/** A real-shaped `pull_request` delivery; `deliveryId` is what GitHub would send. */
export function deliverPullRequest(
  origin: string,
  workspaceId: string,
  payload: Record<string, unknown>,
  deliveryId: string = randomUUID(),
): Promise<DeliveryResult> {
  return post(origin, "github", workspaceId, payload, (raw, secret) => ({
    "x-github-event": "pull_request",
    "x-github-delivery": deliveryId,
    "x-hub-signature-256": sign(secret, raw),
  }));
}

/**
 * Re-run a demo PR through the chain.
 *
 * With `GITHUB_DEMO_TOKEN` set (a fine-grained token: pull requests read/write
 * on this one repository) the PR is really closed and reopened on GitHub, and
 * GitHub itself delivers the webhook. Without it, the page replays the
 * `reopened` delivery built from the PR as GitHub's public API returns it right
 * now — real head/base commits, signed like GitHub signs — and says so.
 */
export async function reverifyPullRequest(
  origin: string,
  workspaceId: string,
  number: number,
): Promise<{ mode: "github" | "replayed"; result: DeliveryResult | null }> {
  const token = process.env.GITHUB_DEMO_TOKEN;
  const api = `https://api.github.com/repos/${DEMO_REPO}/pulls/${number}`;
  const ghHeaders: Record<string, string> = {
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  };

  if (token) {
    for (const state of ["closed", "open"]) {
      const response = await fetch(api, {
        method: "PATCH",
        headers: { ...ghHeaders, "content-type": "application/json" },
        body: JSON.stringify({ state }),
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`GitHub refused to set PR #${number} ${state}: ${response.status}`);
    }
    return { mode: "github", result: null };
  }

  const response = await fetch(api, { headers: ghHeaders, cache: "no-store" });
  if (!response.ok) throw new Error(`Could not read PR #${number} from GitHub: ${response.status}`);
  const pr = (await response.json()) as Record<string, unknown> & {
    base: { repo: Record<string, unknown> };
    user: Record<string, unknown>;
  };
  const payload = {
    action: "reopened",
    number,
    pull_request: { ...pr, state: "open" },
    repository: pr.base.repo,
    sender: pr.user,
  };
  return { mode: "replayed", result: await deliverPullRequest(origin, workspaceId, payload) };
}

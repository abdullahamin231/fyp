import { describe, expect, it, vi } from "vitest";
import { fakeSupabase, type FakeSupabase } from "@/test/fake-supabase";

process.env.INTEGRATION_ENCRYPTION_KEY = "test-key";
let fake: FakeSupabase;
vi.mock("@/lib/supabase/admin", () => ({ admin: () => fake.client }));

const { reconcileGithubWorkspace } = await import("./github-reconcile");
const { processPullRequestDelivery } = await import("./pipeline");

const WS = "ws-1";
const A = "a".repeat(40);
const B = "b".repeat(40);
const BASE = "c".repeat(40);

function setup() {
  fake = fakeSupabase({
    tables: {
      analysis_targets: [{ workspace_id: WS, repo_full_name: "acme/shop" }],
      nodes: [
        { id: "t7", workspace_id: WS, type: "Ticket", external_id: "UNI-7", valid_to: null },
        { id: "c7", workspace_id: WS, type: "Criterion", external_id: "UNI-7/AC-1", valid_to: null },
        { id: "pr1", workspace_id: WS, type: "PullRequest", external_id: "acme/shop#1", version: A },
      ],
    },
    rpc: {
      link_pull_request_event: (args) => ({
        status: "processed",
        eventId: `github:${String(args.p_delivery_id)}`,
        prNodeId: "pr2",
        keys: (args.p_keys as { key: string }[]).map((k) => ({ key: k.key, status: "linked" })),
      }),
      enqueue_verification: () => "job-1",
    },
  });
}

const pr = (number: number, head: string, title: string) => ({
  number,
  title,
  body: null,
  state: "open",
  head: { sha: head, ref: `feature/${number}` },
  base: { sha: BASE },
});

describe("GitHub reconciliation", () => {
  it("replays only the open pull requests whose head the graph has not seen, through the webhook path", async () => {
    setup();
    const results = await reconcileGithubWorkspace(WS, {
      openPullRequests: async () => [pr(1, A, "UNI-7 already seen"), pr(2, B, "UNI-7 missed webhook")],
    });
    expect(results).toHaveLength(1);
    expect(results[0]!.replayed.map((r) => [r.number, r.head])).toEqual([[2, B]]);

    const link = fake.rpcCalls.find((c) => c.name === "link_pull_request_event")!;
    expect(link.args.p_delivery_id).toBe(`reconcile:acme/shop#2@${B}`);
    expect(fake.rpcCalls.filter((c) => c.name === "enqueue_verification").map((c) => c.args)).toEqual([
      { p_criterion_node_id: "c7", p_base_commit: BASE, p_head_commit: B },
    ]);
    expect(fake.tables.integration_deliveries).toEqual([expect.objectContaining({ vendor_delivery_id: `reconcile:acme/shop#2@${B}` })]);
  });

  it("reports a repository it could not read instead of failing the pass", async () => {
    setup();
    const results = await reconcileGithubWorkspace(WS, {
      openPullRequests: async () => {
        throw new Error("GitHub /repos/acme/shop/pulls returned 404");
      },
    });
    expect(results).toEqual([{ repo: "acme/shop", open: 0, replayed: [], error: "GitHub /repos/acme/shop/pulls returned 404" }]);
  });
});

describe("pull request deliveries", () => {
  it("find Jira keys in commit messages as well as the title", async () => {
    setup();
    const outcome = await processPullRequestDelivery(
      fake.client as never,
      { workspaceId: WS, deliveryId: "d1", payload: { action: "opened", number: 3, pull_request: pr(3, B, "Discounts"), repository: { full_name: "acme/shop" } }, rawHash: "h", receivedAt: new Date() },
      { commits: async () => [{ sha: "1234567890", message: "UNI-7: apply the code at checkout" }] },
    );
    expect(outcome.commitsRead).toBe(1);
    const keys = fake.rpcCalls.find((c) => c.name === "link_pull_request_event")!.args.p_keys;
    expect(keys).toEqual([{ key: "UNI-7", foundIn: ["commit:1234567"] }]);
  });

  it("still link from the title when commits cannot be read", async () => {
    setup();
    const outcome = await processPullRequestDelivery(
      fake.client as never,
      { workspaceId: WS, deliveryId: "d2", payload: { action: "edited", number: 4, pull_request: pr(4, B, "UNI-7 tidy"), repository: { full_name: "acme/shop" } }, rawHash: "h", receivedAt: new Date() },
      { commits: async () => { throw new Error("no token"); } },
    );
    expect(outcome.commitsRead).toBe("unavailable");
    expect(fake.rpcCalls.find((c) => c.name === "link_pull_request_event")!.args.p_keys).toEqual([{ key: "UNI-7", foundIn: ["title"] }]);
    expect(outcome.verification).toBeUndefined();
  });
});

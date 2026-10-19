import { describe, expect, it, vi } from "vitest";
import { fakeSupabase, type FakeSupabase } from "@/test/fake-supabase";

process.env.INTEGRATION_ENCRYPTION_KEY = "test-key";
let fake: FakeSupabase;
vi.mock("@/lib/supabase/admin", () => ({ admin: () => fake.client }));

const { reconcileJiraWorkspace, searchUpdatedIssues } = await import("./jira-reconcile");

const WS = "ws-1";
const issue = (key: string, updated: string) => ({
  key,
  self: `https://acme.atlassian.net/rest/api/3/issue/${key}`,
  fields: { summary: `${key} summary`, description: null, labels: [], status: { name: "To Do", statusCategory: { key: "new" } }, assignee: null, updated },
});

describe("Jira reconciliation", () => {
  it("replays only issues whose update the graph has not recorded, through the webhook ingest", async () => {
    fake = fakeSupabase({
      tables: {
        integration_apps: [{ workspace_id: WS, provider: "jira", criteria_field: null }],
        nodes: [{ id: "t1", workspace_id: WS, type: "Ticket", external_id: "UNI-1", version: "2026-10-19T10:00:00.000+0000", valid_to: null }],
      },
      rpc: { ingest_jira_issue: (args) => ({ kind: "ticket", nodeId: `node-${String((args.p_issue as { key: string }).key)}` }) },
    });
    const result = await reconcileJiraWorkspace(WS, {
      search: async () => [issue("UNI-1", "2026-10-19T10:00:00.000+0000"), issue("UNI-2", "2026-10-19T11:00:00.000+0000")],
    });
    expect(result.seen).toBe(2);
    expect(result.replayed.map((r) => r.key)).toEqual(["UNI-2"]);
    const ingest = fake.rpcCalls.find((c) => c.name === "ingest_jira_issue")!;
    expect(ingest.args.p_event_id).toEqual(expect.any(String));
    expect(fake.tables.integration_deliveries).toEqual([expect.objectContaining({ vendor_delivery_id: "reconcile:UNI-2@2026-10-19T11:00:00.000+0000" })]);
    expect(fake.tables.events).toEqual([expect.objectContaining({ event_id: ingest.args.p_event_id, entity_id: "UNI-2" })]);
  });
});

describe("enhanced JQL search", () => {
  it("follows nextPageToken, and stops on a repeated token even if isLast never flips", async () => {
    const urls: string[] = [];
    const pages = [
      { issues: [issue("UNI-1", "a")], nextPageToken: "t1", isLast: false },
      { issues: [issue("UNI-2", "b")], nextPageToken: "t1", isLast: false },
    ];
    const fetchImpl = (async (url: string) => {
      urls.push(url);
      return new Response(JSON.stringify(pages[urls.length - 1]));
    }) as unknown as typeof fetch;
    const issues = await searchUpdatedIssues("tok", "cloud-1", { windowMinutes: 60, extraFields: ["customfield_10045"] }, fetchImpl);
    expect(issues.map((i) => i.key)).toEqual(["UNI-1", "UNI-2"]);
    expect(urls).toHaveLength(2);
    const first = new URL(urls[0]!);
    expect(first.pathname).toBe("/ex/jira/cloud-1/rest/api/3/search/jql");
    expect(first.searchParams.get("jql")).toBe("updated >= -60m ORDER BY updated ASC");
    expect(first.searchParams.get("fields")).toContain("customfield_10045");
    expect(new URL(urls[1]!).searchParams.get("nextPageToken")).toBe("t1");
  });
});

import { describe, expect, it } from "vitest";
import { fakeSupabase } from "@/test/fake-supabase";
import { figmaAdapter, jiraAdapter } from "./adapters";
import { githubDeliveryEventId, upsertNormalizedEvents } from "./events";

describe("workspace event identities", () => {
  const jira = jiraAdapter.normalise({ webhookEvent: "jira:issue_updated", timestamp: 1_800_000_000_000,
    issue: { key: "UNI-1", fields: { updated: "2026-10-19T10:00:00Z" } } }, new Date(),
    new Headers({ "x-atlassian-webhook-identifier": "same-delivery" }));

  it("persists the same Jira delivery in each workspace and deduplicates replays", async () => {
    const fake = fakeSupabase();
    const one = await upsertNormalizedEvents(fake.client as never, "ws-1", "jira", jira, "hash");
    const two = await upsertNormalizedEvents(fake.client as never, "ws-2", "jira", jira, "hash");
    expect(one[0]!.eventId).not.toBe(two[0]!.eventId);
    expect(await upsertNormalizedEvents(fake.client as never, "ws-1", "jira", jira, "hash")).toEqual(one);
    expect(fake.tables.events).toHaveLength(2);
    expect(fake.tables.events!.map((row) => row.workspace_id)).toEqual(["ws-1", "ws-2"]);
  });

  it("returns the original ID on a legacy replay for snapshots/checkpoints/receipts", async () => {
    const fake = fakeSupabase({ tables: { events: [{ workspace_id: "ws-1", source_tool: "jira",
      vendor_delivery_id: "same-delivery", event_id: jira[0]!.eventId }] } });
    const replay = await upsertNormalizedEvents(fake.client as never, "ws-1", "jira", jira, "hash");
    expect(replay[0]!.eventId).toBe(jira[0]!.eventId);
    expect(fake.tables.events).toHaveLength(1);
    const other = await upsertNormalizedEvents(fake.client as never, "ws-2", "jira", jira, "hash");
    expect(other[0]!.eventId).toBe(`ws-2:${jira[0]!.eventId}`);
  });

  it("also scopes Figma poll events for the same watched file/version", async () => {
    const fake = fakeSupabase();
    const events = figmaAdapter.normalise({ event_type: "FILE_VERSION_UPDATE", file_key: "SharedFigmaFile1",
      version_id: "v1", id: "figma:poll:SharedFigmaFile1:v1" }, new Date(), new Headers());
    const one = await upsertNormalizedEvents(fake.client as never, "ws-1", "figma", events, "hash");
    const two = await upsertNormalizedEvents(fake.client as never, "ws-2", "figma", events, "hash");
    expect(one[0]!.eventId).not.toBe(two[0]!.eventId);
    expect(fake.tables.events).toHaveLength(2);
  });

  it("uses the linker's workspace ID while retaining legacy GitHub receipts", async () => {
    const fake = fakeSupabase({ tables: { events: [{ workspace_id: "ws-1", source_tool: "github",
      vendor_delivery_id: "legacy", event_id: "github:legacy" }] } });
    expect(await githubDeliveryEventId(fake.client as never, "ws-1", "legacy")).toBe("github:legacy");
    expect(await githubDeliveryEventId(fake.client as never, "ws-2", "legacy")).toBe("ws-2:github:legacy");
  });
});

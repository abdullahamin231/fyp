import { describe, expect, it } from "vitest";
import { fakeSupabase } from "@/test/fake-supabase";
import { deliverInApp, inboxFor, markDelivered } from "./notification-delivery";

const note = (id: string, channel: string, delivery_status: string, finding_id = "f1", recipient_id = "p1") => ({ id, finding_id, recipient_id, channel, delivery_status });

function world(notifications: Record<string, unknown>[]) {
  return fakeSupabase({
    tables: {
      notifications,
      nodes: [
        { id: "p1", type: "Person", payload: { userId: "u1" } },
        { id: "p2", type: "Person", payload: { userId: "u2" } },
      ],
      findings: [
        { id: "f1", annotation: "UNI-1 merged but ticket open", severity: "medium", created_at: "2026-11-01T00:00:00Z" },
        { id: "f2", annotation: "UNI-2 done but PR open", severity: "high", created_at: "2026-11-02T00:00:00Z" },
      ],
    },
  });
}

describe("in-app delivery (FR-14)", () => {
  it("moves a finding's pending in-app notifications to sent, and leaves Slack pending", async () => {
    const fake = world([note("n1", "in_app", "pending"), note("n2", "slack", "pending")]);
    expect(await deliverInApp(fake.client as never, "f1")).toBe(1);
    expect(fake.tables.notifications).toEqual([
      expect.objectContaining({ id: "n1", delivery_status: "sent" }),
      expect.objectContaining({ id: "n2", delivery_status: "pending" }),
    ]);
  });

  it("is idempotent: a second call changes nothing", async () => {
    const fake = world([note("n1", "in_app", "pending")]);
    await deliverInApp(fake.client as never, "f1");
    expect(await deliverInApp(fake.client as never, "f1")).toBe(0);
  });

  it("records delivery with a timestamp, and only for rows that were sent", async () => {
    const fake = world([note("n1", "in_app", "sent"), note("n2", "in_app", "pending")]);
    await markDelivered(fake.client as never, ["n1", "n2"], new Date("2026-11-24T10:00:00Z"));
    expect(fake.tables.notifications).toEqual([
      expect.objectContaining({ id: "n1", delivery_status: "delivered", delivered_at: "2026-11-24T10:00:00.000Z" }),
      expect.objectContaining({ id: "n2", delivery_status: "pending" }),
    ]);
  });

  it("builds the inbox from the user's own Person, newest finding first, in-app only", async () => {
    const fake = world([
      note("n1", "in_app", "sent", "f1"),
      note("n2", "in_app", "delivered", "f2"),
      note("n3", "in_app", "pending", "f1"),
      note("n4", "slack", "sent", "f1"),
      note("n5", "in_app", "sent", "f1", "p2"),
    ]);
    const inbox = await inboxFor(fake.client as never, "u1");
    expect(inbox.map((item) => [item.id, item.status])).toEqual([["n2", "delivered"], ["n1", "sent"]]);
    expect(inbox[0]).toMatchObject({ annotation: "UNI-2 done but PR open", severity: "high", findingId: "f2" });
  });

  it("returns an empty inbox for a user with no Person node", async () => {
    expect(await inboxFor(world([]).client as never, "nobody")).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import {
  IngestionEngine,
  MockVendor,
  type VendorResource,
} from "../src/index.js";

const workspaceId = "00000000-0000-4000-8000-000000000001";
const t0 = "2026-10-09T10:00:00Z";
const t1 = "2026-10-09T10:00:01Z";
const t2 = "2026-10-09T10:00:02Z";

function resource(overrides: Partial<VendorResource> = {}): VendorResource {
  return {
    resourceId: "pr-244",
    entityType: "PullRequest",
    entityId: "244",
    version: "1",
    action: "opened",
    stateAfter: "open",
    actor: "alex",
    occurredAt: t0,
    payload: { title: "Checkout" },
    ...overrides,
  };
}

describe("ingestion reliability", () => {
  it("deduplicates a redelivered vendor delivery without changing state", () => {
    const vendor = new MockVendor("github", [resource()]);
    const engine = new IngestionEngine({ workspaceId });
    const delivery = vendor.delivery(workspaceId, "pr-244", "gh-1");

    expect(engine.ingest(delivery).status).toBe("inserted");
    expect(engine.ingest(delivery).status).toBe("duplicate");
    expect(engine.snapshot().events).toHaveLength(1);
    expect(engine.snapshot().resources.get("github:pr-244")?.version).toBe("1");
  });

  it("converges after out-of-order delivery", () => {
    const vendor = new MockVendor("github", [
      resource({ version: "1", action: "opened", occurredAt: t0 }),
      resource({ version: "2", action: "closed", stateAfter: "merged", occurredAt: t2 }),
    ]);
    const engine = new IngestionEngine({ workspaceId });

    engine.ingest(vendor.delivery(workspaceId, "pr-244", "gh-2"));
    const older = engine.ingest(vendor.delivery(workspaceId, "pr-244", "gh-1"));

    expect(older.status).toBe("ignored_older");
    expect(engine.snapshot().resources.get("github:pr-244")?.version).toBe("2");
    expect(engine.getCheckpoint("github", "pr-244").lastStateAt).toBe(t2);
  });

  it("reconciles a missed delivery as a system event", () => {
    const vendor = new MockVendor("jira", [resource({
      resourceId: "ticket-1",
      entityType: "Ticket",
      entityId: "PROJ-1",
      version: "3",
      action: "state_changed",
      stateAfter: "done",
      occurredAt: t2,
    })]);
    const engine = new IngestionEngine({ workspaceId });

    const [result] = engine.reconcile("jira", vendor);

    expect(result?.status).toBe("reconciled");
    expect(result?.event.sourceTool).toBe("system");
    expect(engine.snapshot().resources.get("jira:ticket-1")?.stateAfter).toBe("done");
  });

  it("marks source checkpoints stale after an outage and clears them on recovery", () => {
    let now = Date.parse(t0);
    const vendor = new MockVendor("figma", [resource({
      resourceId: "file-1",
      entityType: "DesignArtifact",
      entityId: "file-1",
    })]);
    const engine = new IngestionEngine({
      workspaceId,
      staleAfterMs: 1000,
      now: () => new Date(now).toISOString(),
    });
    engine.ingest(vendor.delivery(workspaceId, "file-1", "fig-1"));
    vendor.setAvailable(false);

    expect(() => engine.reconcile("figma", vendor)).toThrow("unavailable");
    now += 1001;
    expect(() => engine.reconcile("figma", vendor)).toThrow("unavailable");
    expect(engine.getCheckpoint("figma", "file-1").sourceStale).toBe(true);

    vendor.setAvailable(true);
    engine.reconcile("figma", vendor);
    expect(engine.getCheckpoint("figma", "file-1").sourceStale).toBe(false);
  });
});

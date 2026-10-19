import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakeSupabase, type FakeSupabase } from "@/test/fake-supabase";

let fake: FakeSupabase;
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => fake.client }));

const { listLinks } = await import("./queries");

const id = (prefix: string, i: number) => `${prefix}-${String(i).padStart(4, "0")}`;

describe("listLinks", () => {
  beforeEach(() => {
    const nodes = Array.from({ length: 300 }, (_, i) => ({
      id: id("n", i),
      workspace_id: "ws-1",
      type: "Ticket",
      external_id: `UNI-${i}`,
      payload: { title: `Ticket ${i}` },
      last_modified: "2026-01-01T00:00:00Z",
    }));
    const edges = Array.from({ length: 150 }, (_, i) => ({
      id: id("e", i),
      from_id: id("n", 2 * i),
      to_id: id("n", 2 * i + 1),
      type: "REFERENCES",
      source_class: "observed",
      confidence: 1,
      resolver: "jira:issue-link",
      link_state: "active",
      created_at: `2026-01-01T00:${String(i % 60).padStart(2, "0")}:00Z`,
      resolved_at: null,
      resolution_reason: null,
    }));
    fake = fakeSupabase({ tables: { nodes, edges } });
  });

  it("resolves 300 endpoints in chunks of at most 100 ids", async () => {
    const { links, suggestions } = await listLinks();
    const nodeReads = fake.requests.filter((r) => r.table === "nodes");
    expect(nodeReads).toHaveLength(3);
    for (const read of nodeReads) {
      const ids = read.filters.find((f) => f.op === "in")?.value as string[];
      expect(ids.length).toBeLessThanOrEqual(100);
    }
    const all = [...links, ...suggestions];
    expect(all).toHaveLength(150);
    expect(all.every((link) => link.source.ref.startsWith("UNI-") && link.target.ref.startsWith("UNI-"))).toBe(true);
  });
});

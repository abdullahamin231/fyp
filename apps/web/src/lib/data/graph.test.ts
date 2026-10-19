import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakeSupabase, type FakeSupabase } from "@/test/fake-supabase";

let fake: FakeSupabase;
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => fake.client }));

const { loadExplorerGraph } = await import("./graph");

const node = (i: number) => ({
  id: `00000000-0000-0000-0000-${String(i).padStart(12, "0")}`,
  workspace_id: "ws-1",
  type: i % 2 === 0 ? "Ticket" : "PullRequest",
  external_id: `X-${i}`,
  payload: {},
  last_modified: "2026-01-01T00:00:00Z",
});

const edge = (from: number, to: number) => ({
  id: `edge-${from}-${to}`,
  from_id: node(from).id,
  to_id: node(to).id,
  type: "IMPLEMENTS",
  source_class: "observed",
  confidence: 1,
  resolver: "github:pr-body",
  link_state: "active",
  created_at: "2026-01-01T00:00:00Z",
  resolved_at: null,
  resolution_reason: null,
});

describe("loadExplorerGraph", () => {
  beforeEach(() => {
    const nodes = Array.from({ length: 250 }, (_, i) => node(i));
    fake = fakeSupabase({
      tables: {
        workspaces: [{ id: "ws-1", slug: "acme" }],
        nodes,
        edges: [edge(1, 249), edge(150, 2), { ...edge(3, 4), link_state: "dismissed" }],
        findings: [{ id: "f-1", subject_node_id: node(249).id, state: "open", annotation: "drift" }],
      },
    });
  });

  it("never sends more than 100 ids in one .in() filter", async () => {
    await loadExplorerGraph();
    const inFilters = fake.requests.flatMap((r) => r.filters.filter((f) => f.op === "in"));
    expect(inFilters.length).toBeGreaterThan(2);
    for (const filter of inFilters) expect((filter.value as unknown[]).length).toBeLessThanOrEqual(100);
  });

  it("still returns every node, cross-chunk edge and open finding", async () => {
    const graph = await loadExplorerGraph();
    expect(graph.nodes).toHaveLength(250);
    expect(graph.edges.map((e) => [e.from, e.to])).toEqual(
      expect.arrayContaining([
        [node(1).id, node(249).id],
        [node(150).id, node(2).id],
      ]),
    );
    expect(graph.edges).toHaveLength(2);
    expect(graph.nodes.find((n) => n.id === node(249).id)?.findingId).toBe("f-1");
  });
});

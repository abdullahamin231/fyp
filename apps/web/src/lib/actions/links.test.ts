import { describe, expect, it, vi } from "vitest";
import { fakeSupabase, type FakeSupabase } from "@/test/fake-supabase";

let fake: FakeSupabase;
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => fake.client }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

const { createManualLinkByRefAction } = await import("./links");

const WS = "ws-1";
const nodes = [
  { id: "t1", workspace_id: WS, type: "Ticket", external_id: "UNI-7", valid_to: null },
  { id: "p1", workspace_id: WS, type: "PullRequest", external_id: "acme/shop#48", valid_to: null },
  { id: "p2", workspace_id: WS, type: "PullRequest", external_id: "acme/admin#48", valid_to: null },
  { id: "c9", workspace_id: WS, type: "Criterion", external_id: "UNI-9/AC-1", valid_to: "2026-10-01" },
];

function setup(extra: Record<string, unknown[]> = {}) {
  fake = fakeSupabase({
    user: { id: "u1", email: "ada@example.com" },
    tables: { nodes: nodes.map((n) => ({ ...n })), ...extra } as never,
    rpc: { node_workspace: () => WS },
  });
}

describe("manual links from the wizard", () => {
  it("resolve both references and write a reviewer-confirmed edge, audited", async () => {
    setup();
    const result = await createManualLinkByRefAction("acme/shop#48", "UNI-7", "VERIFIES", "covers the discount AC");
    expect(result).toMatchObject({ ok: true, confirmedBy: "ada@example.com" });
    expect(fake.tables.edges).toEqual([
      expect.objectContaining({ from_id: "p1", to_id: "t1", type: "COVERS", source_class: "observed", resolver: "user:u1", resolution_reason: "covers the discount AC" }),
    ]);
    expect(fake.tables.audit_log).toEqual([expect.objectContaining({ action: "link_confirmed", reason: "covers the discount AC" })]);
  });

  it("refuse an ambiguous short reference instead of guessing", async () => {
    setup();
    const result = await createManualLinkByRefAction("#48", "UNI-7", "IMPLEMENTS", "");
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/#48 is ambiguous: PullRequest acme\/shop#48, PullRequest acme\/admin#48/);
    expect(fake.tables.edges ?? []).toEqual([]);
  });

  it("refuse unknown and retired artifacts", async () => {
    setup();
    expect((await createManualLinkByRefAction("UNI-404", "UNI-7", "REFERENCES", "")).error).toBe("No artifact named UNI-404 in your workspaces.");
    expect((await createManualLinkByRefAction("UNI-9/AC-1", "UNI-7", "REFERENCES", "")).error).toMatch(/No artifact named UNI-9\/AC-1/);
  });
});

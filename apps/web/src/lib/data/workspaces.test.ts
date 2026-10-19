import { describe, expect, it, vi } from "vitest";
import { fakeSupabase, type FakeSupabase } from "@/test/fake-supabase";

let fake: FakeSupabase;
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => fake.client }));

const { workspaceAccess } = await import("./workspaces");

const tables = () => ({
  workspaces: [{ id: "ws-1", name: "Acme", slug: "acme" }],
  workspace_members: [
    { workspace_id: "ws-1", user_id: "owner-1", role: "owner" },
    { workspace_id: "ws-1", user_id: "member-1", role: "member" },
  ],
});

describe("workspaceAccess", () => {
  it("reports an owner as admin", async () => {
    fake = fakeSupabase({ tables: tables(), user: { id: "owner-1" } });
    const access = await workspaceAccess("acme");
    expect(access).toMatchObject({ status: "admin", userId: "owner-1", workspace: { id: "ws-1", role: "owner" } });
  });

  it("reports a plain member as member instead of throwing", async () => {
    fake = fakeSupabase({ tables: tables(), user: { id: "member-1" } });
    await expect(workspaceAccess("acme")).resolves.toMatchObject({ status: "member" });
  });

  it("reports none for a stranger, an unknown slug, or no session", async () => {
    fake = fakeSupabase({ tables: tables(), user: { id: "stranger" } });
    await expect(workspaceAccess("acme")).resolves.toEqual({ status: "none" });
    await expect(workspaceAccess("nope")).resolves.toEqual({ status: "none" });
    fake = fakeSupabase({ tables: tables(), user: null });
    await expect(workspaceAccess("acme")).resolves.toEqual({ status: "none" });
  });
});

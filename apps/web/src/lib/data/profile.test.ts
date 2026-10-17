import { describe, expect, it, vi } from "vitest";
import { fakeSupabase, type FakeSupabase } from "@/test/fake-supabase";

let fake: FakeSupabase;
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => fake.client }));

const { loadProfile } = await import("./profile");

describe("loadProfile", () => {
  it("joins the profile row, strongest role and the workspaces' connected accounts", async () => {
    fake = fakeSupabase({
      user: { id: "u1", email: "ada@example.com" },
      tables: {
        profiles: [{ id: "u1", full_name: "Ada Lovelace", email: "ada@example.com", created_at: "2026-01-02T00:00:00Z" }],
        workspace_members: [
          { workspace_id: "ws-1", user_id: "u1", role: "member", created_at: "1", workspaces: { id: "ws-1", name: "Acme", slug: "acme" } },
          { workspace_id: "ws-2", user_id: "u1", role: "admin", created_at: "2", workspaces: { id: "ws-2", name: "Beta", slug: "beta" } },
        ],
        integration_connections: [
          {
            workspace_id: "ws-2",
            provider: "github",
            external_account_name: "beta-org",
            scopes: ["read:org"],
            updated_at: "2026-03-01T00:00:00Z",
            access_token_ciphertext: "secret",
          },
          { workspace_id: "ws-9", provider: "jira", external_account_name: "other", scopes: [], updated_at: "x" },
        ],
      },
    });
    const profile = await loadProfile();
    expect(profile).toMatchObject({
      name: "Ada Lovelace",
      initials: "AL",
      topRole: "admin",
      workspaceCount: 2,
      connections: [
        { provider: "github", workspaceSlug: "beta", accountName: "beta-org", scopes: ["read:org"] },
      ],
    });
    const read = fake.requests.find((r) => r.table === "integration_connections");
    expect(read?.columns).toBeDefined();
    expect(read?.columns).not.toMatch(/token|secret|ciphertext/);
  });

  it("returns null with no session", async () => {
    fake = fakeSupabase({ user: null });
    await expect(loadProfile()).resolves.toBeNull();
  });
});

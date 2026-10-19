import { describe, expect, it } from "vitest";
import { fakeSupabase } from "@/test/fake-supabase";
import { createWorkspace, slugify } from "./create-workspace";

describe("createWorkspace", () => {
  it("calls create_workspace with the trimmed name and slug and returns the stored row", async () => {
    const fake = fakeSupabase({
      rpc: { create_workspace: (args) => ({ id: "ws-9", name: String(args.p_name), slug: String(args.p_slug), created_by: "u" }) },
    });
    const result = await createWorkspace(fake.client, "  Acme Eng ", "acme-eng");
    expect(fake.rpcCalls).toEqual([{ name: "create_workspace", args: { p_name: "Acme Eng", p_slug: "acme-eng" } }]);
    expect(result).toEqual({ ok: true, workspace: { id: "ws-9", name: "Acme Eng", slug: "acme-eng" } });
  });

  it("reports a taken slug in words", async () => {
    const fake = fakeSupabase({
      rpc: {
        create_workspace: () => {
          throw Object.assign(new Error("duplicate key"), { code: "23505" });
        },
      },
    });
    await expect(createWorkspace(fake.client, "Acme", "acme")).resolves.toEqual({
      ok: false,
      error: 'Slug "acme" is already taken',
    });
  });
});

describe("slugify", () => {
  it("produces the kebab-case the slug CHECK accepts", () => {
    expect(slugify("  Acme Engineering!! 2026 ")).toBe("acme-engineering-2026");
  });
});

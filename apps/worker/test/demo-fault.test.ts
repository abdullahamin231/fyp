import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { loadDemoFault } from "../src/graph/nodes.js";

function clientReturning(result: { data: unknown; error: unknown }): SupabaseClient {
  const query = {
    select: () => query,
    eq: () => query,
    maybeSingle: async () => result,
  };
  return { from: () => query } as unknown as SupabaseClient;
}

describe("loadDemoFault (the /demo T10 switch)", () => {
  it("reads an armed fault", async () => {
    expect(await loadDemoFault(clientReturning({ data: { stub_fabricate: "only" }, error: null }), "w")).toBe("only");
  });

  it("treats no row, an unknown value, or a missing table as no fault", async () => {
    expect(await loadDemoFault(clientReturning({ data: null, error: null }), "w")).toBe("none");
    expect(await loadDemoFault(clientReturning({ data: { stub_fabricate: "bogus" }, error: null }), "w")).toBe("none");
    expect(await loadDemoFault(clientReturning({ data: null, error: { code: "PGRST205", message: "missing" } }), "w")).toBe("none");
  });

  it("fails the job on any other database error rather than guessing", async () => {
    await expect(
      loadDemoFault(clientReturning({ data: null, error: { code: "57014", message: "timeout" } }), "w"),
    ).rejects.toThrow("loadDemoFault");
  });
});

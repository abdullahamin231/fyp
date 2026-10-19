import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { WORKER_SETTINGS, type Config } from "../src/config.js";
import { fixtureBundleSources } from "../src/fixture/bundle.js";
import { StubModelClient } from "../src/model/stub.js";
import { runJob, type JobRow } from "../src/runner.js";
import { caseBundle, CRITERION_ID } from "./helpers.js";

const version = "2026-10-19T10:00:00Z";
const job: JobRow = {
  id: "00000000-0000-4000-8000-000000000001", workspace_id: "workspace", criterion_node_id: CRITERION_ID,
  base_commit: caseBundle.baseCommit, head_commit: caseBundle.headCommit, state: "running", attempts: 1,
  criterion_version: version, criterion_text: caseBundle.criterion.text,
};

function setup(completionState: "succeeded" | "cancelled", storedVersion = version) {
  const writes: { table: string; value: Record<string, unknown> | Record<string, unknown>[] }[] = [];
  const calls: { name: string; args: Record<string, unknown> }[] = [];
  const client = {
    from(table: string) {
      const query = {
        select() { return query; }, eq() { return query; },
        maybeSingle() {
          return Promise.resolve({ error: null, data: table === "nodes"
            ? { id: CRITERION_ID, workspace_id: "workspace", type: "Criterion", external_id: "UNI-42/AC-1",
              version: storedVersion, payload: caseBundle.criterion }
            : { link_policy: { upper: 0.85, lower: 0.55 } } });
        },
        insert(value: Record<string, unknown> | Record<string, unknown>[]) {
          writes.push({ table, value });
          return Promise.resolve({ data: null, error: null });
        },
      };
      return query;
    },
    rpc(name: string, args: Record<string, unknown>) {
      calls.push({ name, args });
      if (name === "finish_verification_job") return Promise.resolve({ data: null, error: null });
      if (name !== "complete_verification_job") throw new Error(`Unexpected RPC ${name}`);
      const verdict = args.p_verdict as { id: string };
      return Promise.resolve({ error: null, data: completionState === "cancelled" ? { state: "cancelled" }
        : { state: "succeeded", verdictId: verdict.id, findingId: "published-finding" } });
    },
  } as unknown as SupabaseClient;
  const config: Config = { ...WORKER_SETTINGS, analysisEnabled: false, supabaseUrl: "https://example.com", serviceRoleKey: "test" };
  return { deps: { client, config, model: new StubModelClient(),
    provider: { name: "fixture", load: async () => fixtureBundleSources(caseBundle) } }, writes, calls };
}

describe("runner with revision-aware publication", () => {
  it("uses atomic completion for the gated verdict and reports the stored finding", async () => {
    const { deps, writes, calls } = setup("succeeded");
    const outcome = await runJob(deps, job);
    expect(outcome).toMatchObject({ state: "succeeded", findingId: "published-finding", status: "SUPPORTED" });
    expect(writes.map((write) => write.table)).toEqual(["context_packets", "verifier_passes"]);
    expect(calls).toEqual([{ name: "complete_verification_job", args: {
      p_job_id: job.id, p_annotation: expect.stringContaining("UNI-42/AC-1: SUPPORTED"),
      p_verdict: expect.objectContaining({ id: outcome.verdictId, packet_id: outcome.packetId, gate_outcome: "PASSED" }),
    } }]);
  });

  it("reports cancellation when criteria change during a model call, keeping packet/pass history", async () => {
    const { deps, writes, calls } = setup("cancelled");
    const outcome = await runJob(deps, job);
    expect(outcome).toMatchObject({ state: "cancelled", verdictId: null, findingId: null, status: null });
    expect(outcome.packetId).not.toBeNull();
    expect(writes.map((write) => write.table)).toEqual(["context_packets", "verifier_passes"]);
    expect(calls.map((call) => call.name)).toEqual(["complete_verification_job"]);
  });

  it("skips the model when the queued criterion version is already obsolete", async () => {
    const { deps, writes, calls } = setup("succeeded", "2026-10-19T11:00:00Z");
    deps.model.complete = async () => { throw new Error("Obsolete work must not call the model"); };
    expect(await runJob(deps, job)).toMatchObject({ state: "cancelled", packetId: null, passes: 0 });
    expect(writes).toEqual([]);
    expect(calls).toEqual([{ name: "finish_verification_job", args: {
      p_job_id: job.id, p_state: "cancelled", p_stop_reason: null, p_error: "criterion changed before verification",
    } }]);
  });
});

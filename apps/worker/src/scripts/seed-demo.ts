#!/usr/bin/env node
/**
 * Seed the demo workspace from a frozen case bundle.
 *
 * This stands in for the Slice B analyser until it exists: it writes the same
 * node payloads an analyser would publish (`payload.slotItems`), wires the
 * deterministic links the case asserts, records an ingestion checkpoint so
 * freshness is `CURRENT` rather than `UNKNOWN`, and enqueues the criterion for
 * verification. The worker then verifies from the graph — the seed and the
 * live path share the payload shape, not the code path.
 *
 * Idempotent: re-running updates payloads and skips rows that already exist.
 *
 *   npm run seed [-- <bundle.json>]
 */
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { loadConfig } from "../config.js";
import { createServiceClient } from "../db.js";
import { fixtureNodePayloads, type FixtureNode } from "../fixture/bundle.js";
import { loadFixtureBundle } from "../packet/providers/fixture.js";

const config = loadConfig();
const client = createServiceClient(config);
// Default to the demo bundle that ships with the worker (cwd is apps/worker
// when run through npm); `npm run seed -- path/to/bundle.json` overrides it.
const bundlePath = resolve(process.argv[2] ?? "fixtures/demo_case.json");
const bundle = await loadFixtureBundle(bundlePath);

interface NodeRow {
  id: string;
  external_id: string;
  type: string;
}

async function ensureWorkspace(name: string, slug: string): Promise<string> {
  const existing = await client.from("workspaces").select("id").eq("slug", slug).maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) return (existing.data as { id: string }).id;

  const created = await client
    .from("workspaces")
    .insert({ name, slug })
    .select("id")
    .single();
  if (created.error) throw new Error(created.error.message);
  return (created.data as { id: string }).id;
}

async function ensureMembers(workspaceId: string): Promise<string[]> {
  const users = await client.auth.admin.listUsers();
  if (users.error) throw new Error(users.error.message);
  const ids = users.data.users.map((user) => user.id);
  if (ids.length === 0) {
    console.warn("seed: no auth users exist yet — sign up in the web app, then re-run the seed");
    return [];
  }
  const { error } = await client
    .from("workspace_members")
    .upsert(
      ids.map((userId) => ({ workspace_id: workspaceId, user_id: userId, role: "owner" })),
      { onConflict: "workspace_id,user_id" },
    );
  if (error) throw new Error(error.message);
  return ids;
}

async function ensureNode(workspaceId: string, node: FixtureNode): Promise<string> {
  const existing = await client
    .from("nodes")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("external_id", node.externalId)
    .eq("type", node.type)
    .maybeSingle();
  if (existing.error) throw new Error(existing.error.message);

  if (existing.data) {
    const id = (existing.data as { id: string }).id;
    const { error } = await client
      .from("nodes")
      .update({ payload: node.payload, last_modified: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return id;
  }

  const now = new Date().toISOString();
  const inserted = await client
    .from("nodes")
    .insert({
      id: randomUUID(),
      workspace_id: workspaceId,
      type: node.type,
      external_id: node.externalId,
      version: null,
      last_modified: now,
      valid_from: now,
      valid_to: null,
      payload: node.payload,
    })
    .select("id")
    .single();
  if (inserted.error) throw new Error(inserted.error.message);
  return (inserted.data as { id: string }).id;
}

async function ensureEdges(ids: Map<string, string>): Promise<number> {
  const { data, error } = await client
    .from("edges")
    .select("from_id, to_id, type")
    .in("from_id", [...ids.values()])
    .in("to_id", [...ids.values()]);
  if (error) throw new Error(error.message);
  const existing = new Set(
    ((data ?? []) as { from_id: string; to_id: string; type: string }[]).map(
      (edge) => `${edge.from_id}|${edge.to_id}|${edge.type}`,
    ),
  );

  let created = 0;
  const now = new Date().toISOString();
  for (const edge of bundle.edges) {
    const fromId = ids.get(edge.from);
    const toId = ids.get(edge.to);
    if (!fromId || !toId) {
      console.warn(`seed: edge ${edge.from} → ${edge.to} skipped (unknown endpoint)`);
      continue;
    }
    if (existing.has(`${fromId}|${toId}|${edge.type}`)) continue;
    const { error: insertError } = await client.from("edges").insert({
      id: randomUUID(),
      from_id: fromId,
      to_id: toId,
      type: edge.type,
      source_class: edge.sourceClass,
      confidence: edge.confidence,
      resolver: edge.resolver,
      link_state: edge.linkState,
      valid_from: now,
      metadata: { provenance: `fixture:${bundle.caseId}` },
    });
    if (insertError) throw new Error(insertError.message);
    created += 1;
  }
  return created;
}

async function ensureCheckpoint(workspaceId: string): Promise<void> {
  const existing = await client
    .from("checkpoints")
    .select("workspace_id")
    .eq("workspace_id", workspaceId)
    .eq("source_tool", "github")
    .eq("resource_id", bundle.repo)
    .maybeSingle();
  if (existing.error) throw new Error(existing.error.message);

  const row = {
    workspace_id: workspaceId,
    source_tool: "github",
    resource_id: bundle.repo,
    // No event id: the demo publishes no webhook stream, and `events.event_id`
    // is a real foreign key — inventing one fails the constraint. Freshness
    // (loadFreshness) reads checkpoint existence + `source_stale`, not this.
    last_event_id: null,
    last_state_at: new Date().toISOString(),
    last_success_at: new Date().toISOString(),
    source_stale: bundle.freshness === "STALE",
  };
  const { error } = existing.data
    ? await client
        .from("checkpoints")
        .update(row)
        .eq("workspace_id", workspaceId)
        .eq("source_tool", "github")
        .eq("resource_id", bundle.repo)
    : await client.from("checkpoints").insert(row);
  if (error) throw new Error(error.message);
}

const workspaceId = await ensureWorkspace(`UNIFY demo — ${bundle.caseId}`, bundle.caseId.toLowerCase());
await ensureMembers(workspaceId);

const nodeIds = new Map<string, string>();
for (const node of fixtureNodePayloads(bundle)) {
  nodeIds.set(node.externalId, await ensureNode(workspaceId, node));
}

const criterionId = nodeIds.get(bundle.criterion.externalId);
if (!criterionId) throw new Error(`fixture ${bundlePath} has no criterion node`);

const edgesCreated = await ensureEdges(nodeIds);
await ensureCheckpoint(workspaceId);

const { data: jobId, error: enqueueError } = await client.rpc("enqueue_verification", {
  p_criterion_node_id: criterionId,
  p_base_commit: bundle.baseCommit,
  p_head_commit: bundle.headCommit,
  p_requested_by: null,
});
if (enqueueError) throw new Error(enqueueError.message);

console.log(
  JSON.stringify(
    {
      bundle: bundlePath,
      caseId: bundle.caseId,
      workspaceId,
      criterionNodeId: criterionId,
      nodes: nodeIds.size,
      edgesCreated,
      jobId,
      next: "npm run once   # verify the queued criterion",
    },
    null,
    2,
  ),
);

"use server";

import { revalidatePath } from "next/cache";
import {
  ensureActorNode,
  getSessionClient,
  recordAudit,
  requireUser,
} from "./audit";

/**
 * Confirm / reject a link suggestion (UC-02, FR-04/05/28).
 *
 * Runs with the reviewer's own session under RLS — there is no service key
 * here, so the write is exactly as permitted as the caller's workspace role.
 * Both actions record *when* and *why* (`edges.resolved_at`,
 * `resolution_reason`, 00013) as well as appending the `audit_log` row, so the
 * provenance modal can answer "who agreed to this link, and on what basis".
 */

export interface ActionOutcome {
  ok: boolean;
  error?: string;
}

const fail = (error: unknown): ActionOutcome => ({
  ok: false,
  error: error instanceof Error ? error.message : String(error),
});

/** The caller, their workspace for this edge, and their `Person` node. */
async function edgeContext(edgeId: string) {
  const client = await getSessionClient();
  const user = await requireUser(client);

  const ws = await client.rpc("edge_workspace", { e: edgeId });
  if (ws.error) throw new Error(`edge_workspace: ${ws.error.message}`);
  const workspaceId = ws.data as string | null;
  if (!workspaceId) throw new Error("Unknown link.");

  const actorId = await ensureActorNode(client, workspaceId, user);
  return { client, user, actorId };
}

/** A suggestion becomes an active link the reviewer signs their name to. */
export async function confirmLinkAction(
  edgeId: string,
  reason?: string,
): Promise<ActionOutcome> {
  try {
    const { client, user, actorId } = await edgeContext(edgeId);
    const why = reason?.trim() || "confirmed by reviewer";

    const res = await client
      .from("edges")
      .update({
        resolver: `user:${user.id}`,
        link_state: "active",
        resolved_at: new Date().toISOString(),
        resolution_reason: why,
      })
      .eq("id", edgeId)
      .select("id")
      .maybeSingle();
    if (res.error) throw new Error(`edges: ${res.error.message}`);
    if (!res.data) throw new Error("Link not found.");

    await recordAudit(client, {
      actorId,
      action: "link_confirmed",
      reason: why,
      snapshot: { edgeId },
    });
    revalidatePath("/links");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/**
 * The reviewer's "no". Dismissal is sticky by design (00010): the row keeps
 * holding the link's identity, so the next webhook mentioning the same
 * artefacts does not silently resurrect what a human already rejected.
 */
export async function dismissLinkAction(
  edgeId: string,
  reason: string,
): Promise<ActionOutcome> {
  try {
    const why = reason.trim();
    if (!why) return { ok: false, error: "A reason is required to reject a link." };

    const { client, user, actorId } = await edgeContext(edgeId);

    const res = await client
      .from("edges")
      .update({
        resolver: `user:${user.id}`,
        link_state: "dismissed",
        resolved_at: new Date().toISOString(),
        resolution_reason: why,
      })
      .eq("id", edgeId)
      .select("id")
      .maybeSingle();
    if (res.error) throw new Error(`edges: ${res.error.message}`);
    if (!res.data) throw new Error("Link not found.");

    await recordAudit(client, {
      actorId,
      action: "link_dismissed",
      reason: why,
      snapshot: { edgeId },
    });
    revalidatePath("/links");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export interface ManualLinkOutcome extends ActionOutcome {
  edgeId?: string;
  confirmedBy?: string;
}

/** Wizard relation names onto the `edge_type` enum (00001). */
const EDGE_TYPE_FOR = {
  SATISFIES: "SATISFIES",
  REFERENCES: "REFERENCES",
  IMPLEMENTS: "IMPLEMENTS",
  VERIFIES: "COVERS",
  BLOCKS: "BLOCKS",
} as const;
export type ManualRelation = keyof typeof EDGE_TYPE_FOR;

/**
 * A reviewer asserts a link the system did not find. It is recorded as
 * observed and resolved by the reviewer, so it is `confirmed` and decisive,
 * and audited like any other confirmation. The database refuses a second
 * current link with the same (from, to, type).
 */
export async function createManualLinkAction(
  fromId: string,
  toId: string,
  relation: ManualRelation = "REFERENCES",
  reason?: string,
): Promise<ManualLinkOutcome> {
  try {
    if (fromId === toId) return { ok: false, error: "A node cannot link to itself." };
    const client = await getSessionClient();
    const user = await requireUser(client);
    const [fromWs, toWs] = await Promise.all([
      client.rpc("node_workspace", { n: fromId }),
      client.rpc("node_workspace", { n: toId }),
    ]);
    if (fromWs.error) throw new Error(`node_workspace: ${fromWs.error.message}`);
    if (toWs.error) throw new Error(`node_workspace: ${toWs.error.message}`);
    const workspaceId = fromWs.data as string | null;
    if (!workspaceId || workspaceId !== toWs.data) return { ok: false, error: "Both nodes must be in the same workspace." };

    const actorId = await ensureActorNode(client, workspaceId, user);
    const why = reason?.trim() || "linked by reviewer";
    const res = await client
      .from("edges")
      .insert({
        from_id: fromId,
        to_id: toId,
        type: EDGE_TYPE_FOR[relation],
        source_class: "observed",
        confidence: 1,
        resolver: `user:${user.id}`,
        resolved_at: new Date().toISOString(),
        resolution_reason: why,
        metadata: { manual: true },
      })
      .select("id")
      .single();
    if (res.error) {
      if (res.error.code === "23505") return { ok: false, error: "Those two nodes are already linked." };
      throw new Error(`edges: ${res.error.message}`);
    }
    const edgeId = (res.data as { id: string }).id;
    await recordAudit(client, { actorId, action: "link_confirmed", reason: why, snapshot: { edgeId, manual: true } });
    revalidatePath("/graph");
    revalidatePath("/links");
    const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "you";
    return { ok: true, edgeId, confirmedBy: name };
  } catch (error) {
    return fail(error);
  }
}

/**
 * One current node the caller can see whose external id is `ref`, or ends in
 * it (`#48` finds `owner/repo#48`). Anything else is reported, never guessed.
 */
async function resolveNodeRef(ref: string): Promise<{ id: string } | { error: string }> {
  const client = await getSessionClient();
  const exact = await client.from("nodes").select("id, type, external_id").eq("external_id", ref).is("valid_to", null).limit(5);
  if (exact.error) throw new Error(`nodes: ${exact.error.message}`);
  let rows = (exact.data ?? []) as { id: string; type: string; external_id: string }[];
  if (rows.length === 0 && /#\d+$/.test(ref)) {
    const suffix = await client.from("nodes").select("id, type, external_id").like("external_id", `%${ref}`).is("valid_to", null).limit(5);
    if (suffix.error) throw new Error(`nodes: ${suffix.error.message}`);
    rows = (suffix.data ?? []) as typeof rows;
  }
  if (rows.length === 1) return { id: rows[0]!.id };
  if (rows.length === 0) return { error: `No artifact named ${ref} in your workspaces.` };
  return { error: `${ref} is ambiguous: ${rows.map((r) => `${r.type} ${r.external_id}`).join(", ")}.` };
}

/** The link wizard: artifacts named by reference instead of picked on the graph. */
export async function createManualLinkByRefAction(
  sourceRef: string,
  targetRef: string,
  relation: ManualRelation,
  notes: string,
): Promise<ManualLinkOutcome> {
  try {
    const [source, target] = await Promise.all([resolveNodeRef(sourceRef.trim()), resolveNodeRef(targetRef.trim())]);
    if ("error" in source) return { ok: false, error: source.error };
    if ("error" in target) return { ok: false, error: target.error };
    return await createManualLinkAction(source.id, target.id, relation, notes);
  } catch (error) {
    return fail(error);
  }
}

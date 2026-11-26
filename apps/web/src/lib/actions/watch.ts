"use server";

import { revalidatePath } from "next/cache";
import { ensureActorNode, getSessionClient, recordAudit, requireUser } from "./audit";
import type { ActionOutcome } from "./links";

/**
 * Opt in to, or out of, findings on one artefact (FR-14, proposal §9.7).
 *
 * `WATCHES` is the only role edge a person asks for; ingestion never derives
 * it. It runs on the member's own session under RLS (`edges_insert_member`) —
 * no service key — and only ever touches an edge whose `from_id` is the
 * caller's own Person node, so nobody can watch or unwatch on another's behalf.
 *
 * Unwatching `revoke`s the edge rather than dismissing or deleting it. The
 * unique index (00023) keeps a `dismissed` row holding its slot forever, which
 * would make re-watching impossible; `revoked` frees the slot, and the row
 * stays as history.
 *
 * Audit: `artefact_watched` / `artefact_unwatched` (00042). Rows written before
 * that migration used `link_confirmed` / `link_dismissed` with
 * `evidence_snapshot.kind` = watch / unwatch; the log is append-only, so they
 * stay as written.
 */

const fail = (error: unknown): ActionOutcome => ({
  ok: false,
  error: error instanceof Error ? error.message : String(error),
});

async function watchContext(nodeId: string) {
  const client = await getSessionClient();
  const user = await requireUser(client);
  const ws = await client.rpc("node_workspace", { n: nodeId });
  if (ws.error) throw new Error(`node_workspace: ${ws.error.message}`);
  const workspaceId = ws.data as string | null;
  if (!workspaceId) throw new Error("Unknown artefact.");
  const actorId = await ensureActorNode(client, workspaceId, user);
  return { client, user, actorId };
}

export async function watchArtefactAction(nodeId: string): Promise<ActionOutcome> {
  try {
    const { client, user, actorId } = await watchContext(nodeId);
    const res = await client
      .from("edges")
      .insert({
        from_id: actorId,
        to_id: nodeId,
        type: "WATCHES",
        source_class: "observed",
        confidence: 1.0,
        resolver: `user:${user.id}`,
        link_state: "active",
      })
      .select("id")
      .single();
    if (res.error) {
      if (res.error.code !== "23505") throw new Error(`edges: ${res.error.message}`);
      // Something holds the slot: already watching is success, anything else is not ours to overwrite.
      const held = await client.from("edges").select("id")
        .eq("from_id", actorId).eq("to_id", nodeId).eq("type", "WATCHES").eq("link_state", "active").maybeSingle();
      if (held.error) throw new Error(`edges: ${held.error.message}`);
      if (!held.data) return { ok: false, error: "A previous decision about this watch is still on record." };
      return { ok: true };
    }
    await recordAudit(client, {
      actorId,
      action: "artefact_watched",
      reason: "watching this artefact",
      snapshot: { kind: "watch", edgeId: (res.data as { id: string }).id, nodeId },
    });
    revalidatePath("/conflicts");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function unwatchArtefactAction(nodeId: string): Promise<ActionOutcome> {
  try {
    const { client, actorId } = await watchContext(nodeId);
    const now = new Date().toISOString();
    const res = await client
      .from("edges")
      .update({ link_state: "revoked", valid_to: now, resolved_at: now, resolution_reason: "unwatched by member" })
      // The caller's own edge only: from_id is their Person node, never taken from input.
      .eq("from_id", actorId).eq("to_id", nodeId).eq("type", "WATCHES").eq("link_state", "active")
      .select("id");
    if (res.error) throw new Error(`edges: ${res.error.message}`);
    const rows = (res.data ?? []) as { id: string }[];
    if (rows.length === 0) return { ok: false, error: "You are not watching this artefact." };
    await recordAudit(client, {
      actorId,
      action: "artefact_unwatched",
      reason: "stopped watching this artefact",
      snapshot: { kind: "unwatch", edgeId: rows[0]!.id, nodeId },
    });
    revalidatePath("/conflicts");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

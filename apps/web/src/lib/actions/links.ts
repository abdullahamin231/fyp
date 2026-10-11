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

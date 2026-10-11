import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/** The `audit_action` enum as written by `00001_enums.sql`. */
export type AuditAction =
  | "finding_acknowledged"
  | "finding_resolved"
  | "finding_disputed"
  | "finding_suppressed"
  | "finding_reopened"
  | "link_confirmed"
  | "link_dismissed"
  | "rule_activated"
  | "rule_deactivated";

/**
 * Shared plumbing for the reviewer's write path.
 *
 * Every server action here follows the same four steps — auth as the caller,
 * resolve the workspace through the same helpers RLS uses, attribute the act
 * to the reviewer's `Person` node, append an `audit_log` row — because a
 * transition nobody can attribute is a transition nobody can trust.
 */

/** The signed-in user, or a thrown error. Never inferred from the request. */
export async function requireUser(client: SupabaseClient) {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new Error("Not signed in.");
  return data.user;
}

export async function getSessionClient(): Promise<SupabaseClient> {
  return (await createClient()) as unknown as SupabaseClient;
}

/**
 * The reviewer's `Person` node in `workspaceId`, created on first action.
 *
 * `audit_log.actor_id` is `NOT NULL` and references `nodes(id)`, so a reviewer
 * who has never acted in a workspace has no node yet — and a review trail that
 * cannot name its reviewer is worthless. The node is keyed on `user:<auth uid>`
 * as `external_id` so a retry after a lost race finds the existing row instead
 * of creating a second persona.
 */
export async function ensureActorNode(
  client: SupabaseClient,
  workspaceId: string,
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> },
): Promise<string> {
  const externalId = `user:${user.id}`;
  const find = async () => {
    const res = await client
      .from("nodes")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("type", "Person")
      .eq("external_id", externalId)
      .limit(1);
    if (res.error) throw new Error(`nodes: ${res.error.message}`);
    return ((res.data ?? []) as { id: string }[])[0]?.id ?? null;
  };

  const existing = await find();
  if (existing) return existing;

  const name =
    (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Reviewer";
  const inserted = await client
    .from("nodes")
    .insert({
      workspace_id: workspaceId,
      type: "Person",
      external_id: externalId,
      payload: { name, email: user.email ?? null, userId: user.id },
    })
    .select("id")
    .single();
  if (inserted.error) {
    // A concurrent action may have inserted first — re-read before failing.
    const raced = await find();
    if (raced) return raced;
    throw new Error(`nodes: ${inserted.error.message}`);
  }
  return (inserted.data as { id: string }).id;
}

/**
 * Append the audit row for a reviewer action (FR-18 / UC-02).
 *
 * Appends only — `audit_log` is append-only, so the trail is the record of
 * what happened, not a state someone can edit afterwards.
 */
export async function recordAudit(
  client: SupabaseClient,
  params: {
    actorId: string;
    action: AuditAction;
    reason: string;
    findingId?: string | null;
    snapshot?: Record<string, unknown>;
  },
): Promise<void> {
  const res = await client.from("audit_log").insert({
    actor_id: params.actorId,
    action: params.action,
    reason: params.reason,
    ...(params.findingId ? { finding_id: params.findingId } : {}),
    ...(params.snapshot ? { evidence_snapshot: params.snapshot } : {}),
  });
  if (res.error) throw new Error(`audit_log: ${res.error.message}`);
}

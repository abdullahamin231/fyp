"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { personRoleSchema } from "@unify/contracts";
import { revalidatePath } from "next/cache";
import { rerouteUnroutableAround } from "@/lib/data/route-finding";
import { mergePersonIdentity, setPersonRole } from "@/lib/integrations/people";
import { requireWorkspaceAdmin } from "@/lib/integrations/server";
import { admin } from "@/lib/supabase/admin";
import { ensureActorNode, getSessionClient, recordAudit, requireUser } from "./audit";
import type { ActionOutcome } from "./links";

/**
 * The workspace admin's two decisions about who routing can reach (FR-14): what
 * role a Person has, and which member a provider account belongs to.
 *
 * Both are gated by `requireWorkspaceAdmin` before anything is read. Writes use
 * the service-role client because re-routing clears `routing_outcomes`, which
 * members cannot delete under RLS. The audit row is written on the admin's own
 * session and attributed to their Person node.
 */

const fail = (error: unknown): ActionOutcome => ({
  ok: false,
  error: error instanceof Error ? error.message : String(error),
});

async function adminContext(workspaceSlug: string) {
  const { userId, workspaceId } = await requireWorkspaceAdmin(workspaceSlug);
  const client = await getSessionClient();
  const actorId = await ensureActorNode(client, workspaceId, await requireUser(client));
  return { userId, workspaceId, client, actorId, db: admin() as SupabaseClient };
}

/** The artefacts a Person holds a live role edge on. */
async function artefactsOf(db: SupabaseClient, personNodeId: string): Promise<string[]> {
  const { data, error } = await db.from("edges").select("to_id").eq("from_id", personNodeId)
    .in("type", ["OWNS", "ASSIGNED_TO", "WATCHES"]).eq("link_state", "active").is("valid_to", null);
  if (error) throw new Error(`edges: ${error.message}`);
  return [...new Set(((data ?? []) as { to_id: string }[]).map((edge) => edge.to_id))];
}

/** Someone just became reachable (or changed role): retry the findings recorded as unroutable near them. */
async function reroute(db: SupabaseClient, artefactIds: string[]): Promise<void> {
  try {
    for (const id of artefactIds) await rerouteUnroutableAround(db, id);
  } catch (error) {
    throw new Error(`Saved, but unroutable findings could not be re-routed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function setPersonRoleAction(workspaceSlug: string, personNodeId: string, role: string): Promise<ActionOutcome> {
  try {
    const parsed = personRoleSchema.safeParse(role);
    if (!parsed.success) return { ok: false, error: "Unknown role." };
    const { userId, workspaceId, client, actorId, db } = await adminContext(workspaceSlug);
    const previous = await setPersonRole(db, workspaceId, personNodeId, parsed.data, userId);
    await recordAudit(client, {
      actorId,
      action: "person_role_changed",
      reason: `role set to ${parsed.data}`,
      snapshot: { personNodeId, fromRole: previous.role, fromRoleSource: previous.roleSource, toRole: parsed.data },
    });
    await reroute(db, await artefactsOf(db, personNodeId));
    revalidatePath("/settings/workspace");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/**
 * Say that an unresolved provider account is a workspace member. The target is
 * always a member: merging into another unbound Person would mark the identity
 * resolved while still leaving nobody to read the notification.
 */
export async function mergePersonAction(workspaceSlug: string, identityId: string, targetUserId: string): Promise<ActionOutcome> {
  try {
    const { workspaceId, client, actorId, db } = await adminContext(workspaceSlug);

    const member = await db.from("workspace_members").select("user_id")
      .eq("workspace_id", workspaceId).eq("user_id", targetUserId).maybeSingle();
    if (member.error) throw new Error(`workspace_members: ${member.error.message}`);
    if (!member.data) return { ok: false, error: "That person is not a member of this workspace." };

    const identity = await db.from("person_identities").select("person_node_id, tool, external_account_id, source_class")
      .eq("workspace_id", workspaceId).eq("id", identityId).maybeSingle();
    if (identity.error) throw new Error(`person_identities: ${identity.error.message}`);
    const found = identity.data as { person_node_id: string; tool: string; external_account_id: string; source_class: string } | null;
    if (!found || found.source_class !== "unresolved") return { ok: false, error: "That account is no longer unresolved." };

    const profile = await db.from("profiles").select("email, full_name").eq("id", targetUserId).maybeSingle();
    if (profile.error) throw new Error(`profiles: ${profile.error.message}`);
    const known = profile.data as { email: string | null; full_name: string | null } | null;
    // A member who has never acted has no Person node yet.
    const targetNodeId = await ensureActorNode(client, workspaceId, {
      id: targetUserId,
      email: known?.email ?? undefined,
      user_metadata: known?.full_name ? { full_name: known.full_name } : {},
    });

    const fromPersonNodeId = found.person_node_id;
    const artefacts = await artefactsOf(db, fromPersonNodeId);
    await mergePersonIdentity(db, workspaceId, identityId, targetNodeId);
    await recordAudit(client, {
      actorId,
      action: "person_identity_merged",
      reason: `${found.tool} account assigned to a member`,
      snapshot: {
        identityId,
        tool: found.tool,
        accountId: found.external_account_id,
        fromPersonNodeId,
        toPersonNodeId: targetNodeId,
      },
    });
    await reroute(db, artefacts);
    revalidatePath("/settings/workspace");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

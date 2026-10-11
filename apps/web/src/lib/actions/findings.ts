"use server";

import { revalidatePath } from "next/cache";
import {
  canTransitionFinding,
  type FindingState,
} from "@unify/contracts";
import type { AuditAction } from "./audit";
import {
  ensureActorNode,
  getSessionClient,
  recordAudit,
  requireUser,
} from "./audit";

/**
 * Finding lifecycle actions (FR-18): acknowledge, resolve, dispute, suppress,
 * reopen — each with a reason, each audited, each guarded by the *same*
 * `canTransitionFinding` the contracts export, so the UI cannot offer an action
 * the model of the lifecycle would reject.
 */

export interface ActionOutcome {
  ok: boolean;
  error?: string;
  /** The state the finding is in after the call, when it succeeded. */
  state?: FindingState;
}

export type ReviewerAction = "acknowledge" | "resolve" | "dispute" | "suppress" | "reopen";

const TARGET: Record<ReviewerAction, FindingState> = {
  acknowledge: "acknowledged",
  resolve: "resolved",
  dispute: "disputed",
  suppress: "suppressed",
  reopen: "open",
};

const AUDIT: Record<ReviewerAction, AuditAction> = {
  acknowledge: "finding_acknowledged",
  resolve: "finding_resolved",
  dispute: "finding_disputed",
  suppress: "finding_suppressed",
  reopen: "finding_reopened",
};

const fail = (error: unknown): ActionOutcome => ({
  ok: false,
  error: error instanceof Error ? error.message : String(error),
});

/**
 * Move a finding to the state the action names.
 *
 * The read and the write both run as the caller under RLS: the guard reads the
 * state *the caller can see*, so a stale tab acting on an old state gets a
 * refusal rather than overwriting a reviewer's newer decision.
 */
export async function transitionFindingAction(
  findingId: string,
  action: ReviewerAction,
  reason: string,
): Promise<ActionOutcome> {
  try {
    const why = reason.trim();
    if (!why) return { ok: false, error: "A reason is required." };

    const client = await getSessionClient();
    const user = await requireUser(client);

    const current = await client
      .from("findings")
      .select("id, state, annotation, severity, verdict_id, superseded_by_id")
      .eq("id", findingId)
      .maybeSingle();
    if (current.error) throw new Error(`findings: ${current.error.message}`);
    const row = current.data as
      | {
          id: string;
          state: FindingState;
          annotation: string;
          severity: string;
          verdict_id: string | null;
          superseded_by_id: string | null;
        }
      | null;
    if (!row) return { ok: false, error: "Finding not found." };

    const to = TARGET[action];
    if (!canTransitionFinding(row.state, to)) {
      return {
        ok: false,
        error: `Cannot ${action} a finding that is "${row.state}".`,
      };
    }

    const ws = await client.rpc("finding_workspace", { f: findingId });
    if (ws.error) throw new Error(`finding_workspace: ${ws.error.message}`);
    const workspaceId = ws.data as string | null;
    if (!workspaceId) return { ok: false, error: "Unknown finding." };

    const actorId = await ensureActorNode(client, workspaceId, user);

    const updated = await client
      .from("findings")
      .update({ state: to })
      .eq("id", findingId)
      .select("id, state")
      .maybeSingle();
    if (updated.error) throw new Error(`findings: ${updated.error.message}`);
    if (!updated.data) return { ok: false, error: "Finding not found." };

    await recordAudit(client, {
      actorId,
      action: AUDIT[action],
      reason: why,
      findingId,
      // What the decision was *about*, kept with the decision: a dispute
      // recorded without the verdict it disputes cannot be adjudicated later.
      snapshot: {
        from: row.state,
        to,
        annotation: row.annotation,
        severity: row.severity,
        verdictId: row.verdict_id,
      },
    });

    revalidatePath(`/conflicts/${findingId}`);
    revalidatePath("/conflicts");
    return { ok: true, state: to };
  } catch (error) {
    return fail(error);
  }
}

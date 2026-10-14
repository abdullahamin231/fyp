/**
 * Ingestion checkpoints (§8.4, FR-10).
 *
 * One row per (workspace, source tool, resource) recording the last event
 * id that was processed for it. This is what makes `loadFreshness` honest:
 * without any row the state is UNKNOWN — nobody can claim freshness that was
 * never observed — and a row whose `source_stale` is set flips affected
 * criteria to SOURCE_STALE in the verdict gate.
 *
 * Written from the webhook path with the service-role client, after the
 * delivery has been fully processed (never before: a checkpoint is a promise
 * that everything up to it was applied).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { IntegrationProvider } from "./types";

export type CheckpointResource =
  | { provider: "github"; repositoryFullName: string }
  | { provider: "jira"; projectKey: string }
  | { provider: "figma"; fileKey: string };

/** Jira "UNI-42" → project key "UNI". */
export function projectKeyOf(ticketKey: string): string {
  return ticketKey.split("-")[0] ?? ticketKey;
}

export async function recordCheckpoint(
  db: SupabaseClient,
  input: {
    workspaceId: string;
    provider: IntegrationProvider;
    resource: CheckpointResource;
    eventId: string;
    eventTime: string;
  },
): Promise<void> {
  const resourceId =
    input.resource.provider === "github"
      ? input.resource.repositoryFullName
      : input.resource.provider === "jira"
        ? input.resource.projectKey
        : input.resource.fileKey;
  if (!resourceId) return;

  const { error } = await db.from("checkpoints").upsert(
    {
      workspace_id: input.workspaceId,
      source_tool: input.provider,
      resource_id: resourceId,
      last_event_id: input.eventId,
      last_state_at: input.eventTime,
      last_success_at: new Date().toISOString(),
      source_stale: false,
    },
    { onConflict: "workspace_id,source_tool,resource_id" },
  );
  if (error) throw new Error(`Could not record checkpoint: ${error.message}`);
}

/**
 * Live-pipeline settings — the two knobs the ingestion path reads.
 *
 *   Jira criteria field (integration_apps.criteria_field, 00019)
 *       Which custom field holds a ticket's acceptance criteria. Set after the
 *       Jira app is registered (the row owns the workspace+provider);
 *       null means "no field configured" and ingestion falls back to the
 *       strict description-section parse.
 *
 *   Analysis targets (analysis_targets, 00019)
 *       Which repositories the worker may analyse, and the test command it may
 *       run at head. A delivery for an unregistered repository produces no
 *       code evidence — the abstention path, never an un-audited run.
 *
 * Writes go through the service-role client and are gated by
 * `requireWorkspaceAdmin` at the action layer (see the settings page), same as
 * the provider app registrations.
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

function admin(): SupabaseClient {
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) is required");
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Jira field key holding acceptance criteria, or null when not configured. */
export async function loadJiraCriteriaField(workspaceId: string): Promise<string | null> {
  const { data, error } = await admin()
    .from("integration_apps")
    .select("criteria_field")
    .eq("workspace_id", workspaceId)
    .eq("provider", "jira")
    .maybeSingle();
  if (error) throw new Error(`Could not load Jira criteria field: ${error.message}`);
  const field = (data as { criteria_field?: string | null } | null)?.criteria_field;
  return typeof field === "string" && field.trim() ? field.trim() : null;
}

export async function saveJiraCriteriaField(
  workspaceId: string,
  fieldKey: string | null,
): Promise<void> {
  const db = admin();
  // The row exists once the Jira app is registered; updating a missing row
  // would silently create a half-registered app, so it is an error instead.
  const { data, error } = await db
    .from("integration_apps")
    .update({ criteria_field: fieldKey && fieldKey.trim() ? fieldKey.trim() : null })
    .eq("workspace_id", workspaceId)
    .eq("provider", "jira")
    .select("id");
  if (error) throw new Error(`Could not save Jira criteria field: ${error.message}`);
  if (!data || data.length === 0) {
    throw new Error("Register the Jira app for this workspace first (Settings / Integrations).");
  }
}

export interface AnalysisTargetRow {
  repoFullName: string;
  testCommand: string | null;
  updatedAt: string;
}

export async function listAnalysisTargets(workspaceId: string): Promise<AnalysisTargetRow[]> {
  const { data, error } = await admin()
    .from("analysis_targets")
    .select("repo_full_name, test_command, updated_at")
    .eq("workspace_id", workspaceId)
    .order("repo_full_name");
  if (error) throw new Error(`Could not load analysis targets: ${error.message}`);
  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    repoFullName: String(row.repo_full_name),
    testCommand: typeof row.test_command === "string" ? row.test_command : null,
    updatedAt: String(row.updated_at),
  }));
}

const REPO_FULL_NAME = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

export async function saveAnalysisTarget(
  workspaceId: string,
  repoFullName: string,
  testCommand: string | null,
): Promise<void> {
  const repo = repoFullName.trim();
  if (!REPO_FULL_NAME.test(repo)) {
    throw new Error("Repository must be full name `owner/repo`.");
  }
  const command = testCommand?.trim() || null;
  const { error } = await admin().from("analysis_targets").upsert(
    {
      workspace_id: workspaceId,
      repo_full_name: repo,
      test_command: command,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "workspace_id,repo_full_name" },
  );
  if (error) throw new Error(`Could not save analysis target: ${error.message}`);
}

export async function deleteAnalysisTarget(workspaceId: string, repoFullName: string): Promise<void> {
  const { error } = await admin()
    .from("analysis_targets")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("repo_full_name", repoFullName.trim());
  if (error) throw new Error(`Could not delete analysis target: ${error.message}`);
}

import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/layout/app-shell";
import { Icon } from "@/components/ui/icon";
import { WorkspaceAdmin } from "@/components/settings/workspace-admin";
import { PipelineSettings } from "@/components/settings/pipeline-settings";
import { AdminRequired, ChooseWorkspace } from "@/components/settings/workspace-gate";
import { listMyWorkspaces, workspaceAccess } from "@/lib/data/workspaces";
import {
  deleteAnalysisTarget,
  listAnalysisTargets,
  loadJiraCriteriaField,
  saveAnalysisTarget,
  saveJiraCriteriaField,
} from "@/lib/integrations/pipeline-settings";

export const metadata: Metadata = {
  title: "Workspace Administration",
};

export default async function WorkspaceAdministrationPage({
  searchParams,
}: {
  searchParams: Promise<{ workspace?: string }>;
}) {
  const { workspace: workspaceSlug } = await searchParams;
  const access = workspaceSlug ? await workspaceAccess(workspaceSlug) : null;

  if (access?.status !== "admin") {
    return (
      <AppShell>
        <h1 className="font-headline-md text-headline-md font-semibold text-on-surface tracking-tight pt-2">
          Workspace Governance &amp; Security
        </h1>
        {workspaceSlug ? (
          <AdminRequired slug={workspaceSlug} />
        ) : (
          <ChooseWorkspace
            title="Which workspace?"
            path="/settings/workspace"
            workspaces={(await listMyWorkspaces()).filter((ws) => ws.role !== "member")}
          />
        )}
      </AppShell>
    );
  }

  const workspaceId = access.workspace.id;
  const [criteriaField, targets] = await Promise.all([
    loadJiraCriteriaField(workspaceId),
    listAnalysisTargets(workspaceId),
  ]);

  async function saveCriteria(_previous: { error?: string; saved?: string }, formData: FormData) {
    "use server";
    try {
      const raw = formData.get("criteriaField");
      const field = typeof raw === "string" ? raw.trim() : "";
      await saveJiraCriteriaField(workspaceId, field || null);
      revalidatePath("/settings/workspace");
      return { saved: "Criteria field saved." };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Could not save criteria field." };
    }
  }

  async function saveTarget(_previous: { error?: string; saved?: string }, formData: FormData) {
    "use server";
    try {
      const repo = String(formData.get("repoFullName") ?? "");
      const command = String(formData.get("testCommand") ?? "");
      await saveAnalysisTarget(workspaceId, repo, command || null);
      revalidatePath("/settings/workspace");
      return { saved: "Analysis target saved." };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Could not save analysis target." };
    }
  }

  async function removeTarget(_previous: { error?: string; saved?: string }, formData: FormData) {
    "use server";
    try {
      const repo = String(formData.get("repoFullName") ?? "");
      await deleteAnalysisTarget(workspaceId, repo);
      revalidatePath("/settings/workspace");
      return { saved: "Analysis target removed." };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Could not remove analysis target." };
    }
  }

  const pipeline = (
    <PipelineSettings
      workspaceId={workspaceId}
      criteriaField={criteriaField}
      targets={targets}
      saveCriteria={saveCriteria}
      saveTarget={saveTarget}
      deleteTarget={removeTarget}
    />
  );

  return (
    <AppShell>
      {/* Context header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
        <h1 className="font-headline-md text-headline-md font-semibold text-on-surface tracking-tight">
          Workspace Governance &amp; Security
        </h1>
        <div className="flex items-center gap-stack-compact">
          <Link href={`/settings/integrations?workspace=${encodeURIComponent(access.workspace.slug)}`} className="flex items-center gap-2 px-3 py-2 rounded bg-primary-container hover:bg-primary-container/80 text-on-primary font-body-sm font-medium transition-all shadow-sm">
            <Icon name="add" className="text-[16px]" />
            <span>Connect Provider</span>
          </Link>
        </div>
      </div>

      <WorkspaceAdmin telemetry={null} />

      {pipeline}
    </AppShell>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/layout/app-shell";
import { Icon } from "@/components/ui/icon";
import { WorkspaceAdmin } from "@/components/settings/workspace-admin";
import { PipelineSettings } from "@/components/settings/pipeline-settings";
import { requireWorkspaceAdmin } from "@/lib/integrations/server";
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

  let pipeline: ReactNode = null;
  if (workspaceSlug) {
    const { workspaceId } = await requireWorkspaceAdmin(workspaceSlug);
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

    pipeline = (
      <PipelineSettings
        workspaceId={workspaceId}
        criteriaField={criteriaField}
        targets={targets}
        saveCriteria={saveCriteria}
        saveTarget={saveTarget}
        deleteTarget={removeTarget}
      />
    );
  }

  return (
    <AppShell>
      {/* Context header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
        <h1 className="font-headline-md text-headline-md font-semibold text-on-surface tracking-tight">
          Workspace Governance &amp; Security
        </h1>
        <div className="flex items-center gap-stack-compact">
          <button className="flex items-center gap-2 px-3 py-2 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-sm transition-all shadow-sm">
            <Icon name="download" className="text-[16px] text-primary" />
            <span>Compliance Audit (SOC2/ISO)</span>
          </button>
          <Link href="/settings/integrations" className="flex items-center gap-2 px-3 py-2 rounded bg-primary-container hover:bg-primary-container/80 text-on-primary font-body-sm font-medium transition-all shadow-sm">
            <Icon name="add" className="text-[16px]" />
            <span>Connect Provider</span>
          </Link>
        </div>
      </div>

      <WorkspaceAdmin telemetry={null} />

      {pipeline ?? (
        <p className="mt-6 text-body-sm text-on-surface-variant">
          Live-pipeline settings need a workspace, for example{" "}
          <code className="font-mono-code text-micro-label">/settings/workspace?workspace=your-workspace</code>.
        </p>
      )}
    </AppShell>
  );
}

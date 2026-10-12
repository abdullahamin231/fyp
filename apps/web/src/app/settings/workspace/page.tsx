import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { Icon } from "@/components/ui/icon";
import { WorkspaceAdmin } from "@/components/settings/workspace-admin";

export const metadata: Metadata = {
  title: "Workspace Administration",
};

export default function WorkspaceAdministrationPage() {
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
          <button className="flex items-center gap-2 px-3 py-2 rounded bg-primary-container hover:bg-primary-container/80 text-on-primary font-body-sm font-medium transition-all shadow-sm">
            <Icon name="add" className="text-[16px]" />
            <span>Connect Provider</span>
          </button>
        </div>
      </div>

      <WorkspaceAdmin telemetry={null} />
    </AppShell>
  );
}

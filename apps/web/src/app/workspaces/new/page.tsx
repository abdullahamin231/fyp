import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { CreateWorkspace } from "@/components/workspaces/create-workspace";

export const metadata: Metadata = {
  title: "Create Workspace",
  description:
    "Create a UNIFY workspace for your team and invite teammates by email.",
};

export default function NewWorkspacePage() {
  return (
    <AppShell>
      <CreateWorkspace />
    </AppShell>
  );
}

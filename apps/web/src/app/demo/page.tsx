import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { DemoConsole } from "@/components/demo/demo-console";
import { requireWorkspaceAdmin } from "@/lib/integrations/server";

export const metadata: Metadata = {
  title: "Demo Control",
  description: "The full live walkthrough as buttons, with the pipeline monitored live.",
};

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ workspace?: string }>;
}) {
  const { workspace } = await searchParams;
  const slug = workspace ?? "mishals-workspace";
  // Owner/admin only: every step here sends signed deliveries for the workspace.
  await requireWorkspaceAdmin(slug);

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Demo Control</h2>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Workspace <span className="font-mono-code text-on-surface">{slug}</span> · every step drives
            the real pipeline; open the linked screens in new tabs as you go.
          </p>
        </div>
      </div>
      <DemoConsole slug={slug} />
    </AppShell>
  );
}

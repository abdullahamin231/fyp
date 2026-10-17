import type { Metadata } from "next";
import { headers } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getWorkspaceIntegrations } from "@/lib/data/integrations";
import { listRules } from "@/lib/data/rules";

export const metadata: Metadata = {
  title: "Workspace Onboarding",
  description:
    "UNIFY setup wizard — create a workspace, connect Figma, GitHub and Jira, and review the policies that will run.",
};

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ workspace?: string }>;
}) {
  const { workspace: slug } = await searchParams;
  const [integrations, rules] = await Promise.all([
    slug ? getWorkspaceIntegrations(slug) : Promise.resolve(null),
    listRules(),
  ]);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  return (
    <AppShell>
      <OnboardingWizard
        key={integrations?.workspace.id ?? "new"}
        origin={`${proto}://${host}`}
        workspace={integrations ? integrations.workspace : null}
        providers={integrations?.providers ?? []}
        rules={rules}
      />
    </AppShell>
  );
}

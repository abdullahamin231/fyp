import type { Metadata } from "next";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/layout/app-shell";
import { ProviderAppRegistration } from "@/components/settings/provider-app-registration";
import { AdminRequired, ChooseWorkspace } from "@/components/settings/workspace-gate";
import { listMyWorkspaces, workspaceAccess } from "@/lib/data/workspaces";
import { providerAppStatus, saveProviderApp } from "@/lib/integrations/server";
import type { IntegrationProvider } from "@/lib/integrations/types";

export const metadata: Metadata = {
  title: "Provider App Registrations",
};

const providers: IntegrationProvider[] = ["github", "jira", "figma"];

export default async function ProviderIntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ workspace?: string }>;
}) {
  const { workspace: workspaceSlug } = await searchParams;
  const access = workspaceSlug ? await workspaceAccess(workspaceSlug) : null;
  if (access?.status !== "admin") {
    return (
      <AppShell>
        <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">
          Provider App Registrations
        </h1>
        {workspaceSlug ? (
          <AdminRequired slug={workspaceSlug} />
        ) : (
          <ChooseWorkspace
            title="Which workspace's apps?"
            path="/settings/integrations"
            workspaces={(await listMyWorkspaces()).filter((ws) => ws.role !== "member")}
          />
        )}
      </AppShell>
    );
  }

  const { userId } = access;
  const workspaceId = access.workspace.id;
  const registrations = await providerAppStatus(workspaceId);
  const requestHeaders = await headers();
  const origin = `${requestHeaders.get("x-forwarded-proto") ?? "http"}://${requestHeaders.get("host") ?? "localhost"}`;

  async function registerProvider(
    _previous: { error?: string; oneTimeValue?: string },
    formData: FormData,
  ) {
    "use server";
    const provider = formData.get("provider");
    const clientId = formData.get("clientId");
    const secret = formData.get("secret");
    if (
      typeof provider !== "string" ||
      !providers.includes(provider as IntegrationProvider) ||
      typeof clientId !== "string" ||
      typeof secret !== "string" ||
      !clientId.trim() ||
      !secret.trim()
    ) {
      return { error: "Provider, client ID and client secret are required." };
    }
    try {
      const result = await saveProviderApp({
        workspaceId,
        provider: provider as IntegrationProvider,
        userId,
        clientId,
        clientSecret: secret,
      });
      // Refresh the server-rendered status ("Registered as ...") right away.
      revalidatePath("/settings/integrations");
      return { oneTimeValue: result.webhookSecret };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Could not save provider registration." };
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-2 pt-2">
        <span className="font-mono-code text-eyebrow text-muted uppercase tracking-wider">
          Settings / Integrations
        </span>
        <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">
          Provider App Registrations
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Register OAuth apps here before connecting them. Secrets are encrypted server-side and never shown again.
        </p>
      </div>
      <div className="mt-6 grid gap-4">
        {providers.map((provider) => (
          <ProviderAppRegistration
            key={provider}
            provider={provider}
            workspaceId={workspaceId}
            origin={origin}
            registration={registrations.find((item) => item.provider === provider)}
            action={registerProvider}
          />
        ))}
      </div>
    </AppShell>
  );
}

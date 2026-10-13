import type { Metadata } from "next";
import { headers } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";
import { ProviderAppRegistration } from "@/components/settings/provider-app-registration";
import {
  providerAppStatus,
  requireWorkspaceAdmin,
  saveProviderApp,
} from "@/lib/integrations/server";
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
  if (!workspaceSlug) {
    return (
      <AppShell>
        <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">
          Provider App Registrations
        </h1>
        <p className="mt-3 text-on-surface-variant">
          Open this page with the workspace slug, for example{" "}
          <code>/settings/integrations?workspace=your-workspace</code>.
        </p>
      </AppShell>
    );
  }

  const { userId, workspaceId } = await requireWorkspaceAdmin(workspaceSlug);
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

import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceIntegrationsSection } from "@/components/workspaces/workspace-integrations";
import { getWorkspaceIntegrations } from "@/lib/data/integrations";

export const metadata: Metadata = {
  title: "Workspace Integrations",
  description: "Connect GitHub, Jira and Figma to a UNIFY workspace.",
};

export const dynamic = "force-dynamic";

export default async function WorkspaceIntegrationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const data = await getWorkspaceIntegrations(slug);
  if (!data) notFound();

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  return (
    <AppShell>
      <div className="pt-2">
        <h1 className="font-headline-md text-headline-md font-semibold text-on-surface tracking-tight">
          {data.workspace.name}
        </h1>
        <p className="font-mono-code text-micro-label text-muted mt-0.5">unify.dev/org/{data.workspace.slug}</p>
      </div>
      <WorkspaceIntegrationsSection
        data={data}
        origin={`${proto}://${host}`}
        flash={{
          provider: one(query.integration),
          connected: one(query.connected) === "1",
          error: one(query.error),
        }}
      />
    </AppShell>
  );
}

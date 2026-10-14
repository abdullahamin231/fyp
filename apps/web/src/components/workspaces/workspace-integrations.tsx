import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { FigmaPoller } from "@/components/workspaces/figma-poller";
import type { IntegrationProvider } from "@/lib/integrations/types";
import type { ProviderStatus, WorkspaceIntegrations } from "@/lib/data/integrations";

/**
 * "Connect your tools" section for one workspace.
 *
 * Connect sends the browser to /api/integrations/<provider>/authorize, which
 * redirects to the provider's consent screen; the provider redirects back to
 * /api/integrations/<provider>/callback, which exchanges the code for a token,
 * stores it encrypted, and returns here with ?integration=<p>&connected=1 (or
 * &error=...). Status below is read from the database, so it survives reloads.
 */

const META: Record<IntegrationProvider, { name: string; icon: string; reads: string; webhookHint: string }> = {
  github: {
    name: "GitHub",
    icon: "code",
    reads: "Pull requests, pushes and commits (read-only).",
    webhookHint: "Repository → Settings → Webhooks → Add webhook. Content type application/json; events: Pull requests, Pushes.",
  },
  jira: {
    name: "Jira Cloud",
    icon: "view_kanban",
    reads: "Issues, status transitions and acceptance criteria (read-only).",
    webhookHint: "Jira settings → System → WebHooks. Events: issue created, updated, deleted.",
  },
  figma: {
    name: "Figma",
    icon: "palette",
    reads: "File versions (read-only, polled on an interval).",
    webhookHint: "Version polling works on Starter teams; Dev Mode status and file deletion remain webhook-only or unavailable.",
  },
};

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString();
}

function ProviderCard({
  status,
  slug,
  workspaceId,
  origin,
  canConnect,
  highlight,
}: {
  status: ProviderStatus;
  slug: string;
  workspaceId: string;
  origin: string;
  canConnect: boolean;
  highlight: boolean;
}) {
  const meta = META[status.provider];
  const authorizeHref = `/api/integrations/${status.provider}/authorize?workspace=${encodeURIComponent(slug)}`;
  const webhookUrl = `${origin}/api/webhooks/${status.provider}/${workspaceId}`;

  return (
    <div
      className={`rounded-xl bg-surface-container-low shadow-sm p-5 flex flex-col gap-4 ${highlight ? "ring-2 ring-primary" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
          <Icon name={meta.icon} className="text-primary text-[22px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-body-md font-semibold text-on-surface">{meta.name}</span>
            {status.connected ? (
              <span className="px-1.5 py-0.5 rounded font-mono-code text-eyebrow font-bold uppercase bg-primary-container text-on-primary-container flex items-center gap-1">
                <Icon name="check_circle" className="text-[12px]" /> Connected
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded font-mono-code text-eyebrow font-bold uppercase bg-surface-container-highest text-on-surface-variant">
                Not connected
              </span>
            )}
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{meta.reads}</p>
        </div>
      </div>

      {status.connected && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono-code text-micro-label">
          {status.accountName && (
            <>
              <dt className="text-muted">Account</dt>
              <dd className="text-on-surface truncate">{status.accountName}</dd>
            </>
          )}
          <dt className="text-muted">Scopes</dt>
          <dd className="text-on-surface break-words">{status.scopes.length ? status.scopes.join(", ") : "—"}</dd>
          <dt className="text-muted">Connected</dt>
          <dd className="text-on-surface">{timeAgo(status.connectedAt)}</dd>
          <dt className="text-muted">Last event</dt>
          <dd className="text-on-surface">
            {timeAgo(status.lastDeliveryAt)}
            {status.deliveryCount > 0 && <span className="text-muted"> · {status.deliveryCount} received</span>}
          </dd>
        </dl>
      )}

      {status.connected && (
        <div className="rounded-lg bg-surface-container p-3 flex flex-col gap-1">
          <span className="font-mono-code text-eyebrow uppercase text-muted">Webhook URL</span>
          <code className="font-mono-code text-micro-label text-on-surface break-all select-all">{webhookUrl}</code>
          <span className="font-body-sm text-micro-label text-on-surface-variant">{meta.webhookHint}</span>
        </div>
      )}

      {!status.appRegistered && canConnect && (
        <p className="font-body-sm text-micro-label text-on-surface-variant">
          Connecting needs this workspace&apos;s {meta.name} OAuth app (client ID and secret) registered once under Provider Apps.
        </p>
      )}

      <div className="flex items-center justify-end mt-auto">
        {canConnect && !status.appRegistered ? (
          <Link
            href={`/settings/integrations?workspace=${encodeURIComponent(slug)}`}
            className="flex items-center gap-2 px-3 py-2 rounded bg-surface-container-highest hover:bg-surface-container text-on-surface font-body-sm font-medium transition-all"
          >
            <Icon name="key" className="text-[16px]" />
            Register {meta.name} app first
          </Link>
        ) : canConnect ? (
          <a
            href={authorizeHref}
            className={
              status.connected
                ? "flex items-center gap-2 px-3 py-2 rounded bg-surface-container-highest hover:bg-surface-container text-on-surface font-body-sm font-medium transition-all"
                : "flex items-center gap-2 px-3 py-2 rounded bg-primary-container hover:bg-primary-container/80 text-on-primary-container font-body-sm font-medium transition-all shadow-sm"
            }
          >
            <Icon name={status.connected ? "sync" : "link"} className="text-[16px]" />
            {status.connected ? "Reconnect" : `Connect ${meta.name}`}
          </a>
        ) : (
          <span className="font-body-sm text-micro-label text-muted">Only owners and admins can connect tools.</span>
        )}
      </div>
    </div>
  );
}

export function WorkspaceIntegrationsSection({
  data,
  origin,
  flash,
}: {
  data: WorkspaceIntegrations;
  origin: string;
  flash?: { provider?: string; connected?: boolean; error?: string };
}) {
  const { workspace, providers } = data;
  const canConnect = workspace.role === "owner" || workspace.role === "admin";
  const connectedCount = providers.filter((p) => p.connected).length;
  const flashName = flash?.provider && flash.provider in META ? META[flash.provider as IntegrationProvider].name : null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Connected tools</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Connect GitHub, Jira and Figma for <span className="text-on-surface">{workspace.name}</span>. UNIFY only asks
            for read access; tokens are stored encrypted and never shown.
          </p>
        </div>
        <span className="font-mono-code text-micro-label text-on-surface-variant">
          {connectedCount} of {providers.length} connected
        </span>
      </div>

      {flash?.connected && flashName && (
        <div className="rounded-lg bg-primary-container text-on-primary-container px-4 py-3 font-body-sm flex items-center gap-2">
          <Icon name="check_circle" className="text-[18px]" /> {flashName} connected.
        </div>
      )}
      {flash?.error && (
        <div className="rounded-lg bg-error-container text-on-error-container px-4 py-3 font-body-sm flex items-start gap-2">
          <Icon name="error" className="text-[18px] shrink-0" />
          <span>
            {flashName ? `${flashName}: ` : ""}
            {flash.error}
          </span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {providers.map((status) => (
          <ProviderCard
            key={status.provider}
            status={status}
            slug={workspace.slug}
            workspaceId={workspace.id}
            origin={origin}
            canConnect={canConnect}
            highlight={flash?.provider === status.provider}
          />
        ))}
      </div>

      {providers.some((provider) => provider.provider === "figma" && provider.connected) && (
        <FigmaPoller slug={workspace.slug} canManage={canConnect} />
      )}

      <p className="font-body-sm text-micro-label text-muted">
        Back to <Link href="/workspaces" className="underline">all workspaces</Link>.
      </p>
    </section>
  );
}

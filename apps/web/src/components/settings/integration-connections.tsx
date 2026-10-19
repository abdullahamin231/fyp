import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { ProviderStatus } from "@/lib/data/integrations";

const providerMeta: Record<ProviderStatus["provider"], { name: string; icon: string; iconClass: string }> = {
  github: { name: "GitHub", icon: "code", iconClass: "text-primary" },
  jira: { name: "Jira Cloud", icon: "confirmation_number", iconClass: "text-secondary" },
  figma: { name: "Figma", icon: "palette", iconClass: "text-tertiary" },
};

const day = (iso: string | null) => (iso ? iso.slice(0, 16).replace("T", " ") : "never");

/** Connection state per provider, read from integration_connections and integration_deliveries. */
export function IntegrationConnections({ slug, providers }: { slug: string; providers: ProviderStatus[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
      {providers.map((status) => {
        const meta = providerMeta[status.provider];
        return (
          <div key={status.provider} className="rounded-lg bg-surface-container p-stack-comfortable shadow-md flex flex-col gap-stack-comfortable">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center shadow-inner">
                  <Icon name={meta.icon} className={`text-[24px] ${meta.iconClass}`} />
                </div>
                <div>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">{meta.name}</span>
                  <p className="font-mono-code text-micro-label text-muted">{status.accountName && status.connected ? status.accountName : status.connected ? "account unnamed" : status.webhookOnly ? "webhooks verify; connect OAuth to read" : "not connected"}</p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded font-label-caps text-label-caps tracking-wider uppercase ${
                  status.connected ? "bg-secondary/10 text-secondary" : "bg-surface-container-high text-muted"
                }`}
              >
                {status.connected ? "Connected" : status.webhookOnly ? "Webhook only" : status.appRegistered ? "App registered" : "Not set up"}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-2 font-mono-code text-micro-label">
              <dt className="text-muted">Connected</dt>
              <dd className="text-on-surface text-right">{day(status.connectedAt)}</dd>
              <dt className="text-muted">Last delivery</dt>
              <dd className="text-on-surface text-right">{day(status.lastDeliveryAt)}</dd>
              <dt className="text-muted">Deliveries</dt>
              <dd className="text-on-surface text-right">{status.deliveryCount.toLocaleString("en-US")}</dd>
            </dl>
            {status.scopes.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {status.scopes.map((scope) => (
                  <span key={scope} className="px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-mono-code text-micro-label">
                    {scope}
                  </span>
                ))}
              </div>
            ) : null}
            <Link
              href={`/workspaces/${encodeURIComponent(slug)}/integrations`}
              className="mt-auto self-start flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-primary font-body-sm text-body-sm transition-colors"
            >
              <Icon name="settings" className="text-[16px]" />
              {status.connected ? "Manage" : "Connect"}
            </Link>
          </div>
        );
      })}
    </div>
  );
}

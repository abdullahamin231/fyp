"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { AuthState, ConnectKey, ProviderKey } from "@/components/onboarding/step-panels";
import type { ProviderStatus } from "@/lib/data/integrations";

const sources: { key: ProviderKey; name: string; icon: string }[] = [
  { key: "figma", name: "Figma", icon: "palette" },
  { key: "github", name: "GitHub Organization", icon: "code" },
  { key: "jira", name: "Atlassian Jira", icon: "view_kanban" },
];

const nextStepCopy: Record<number, { label: string; title: string }> = {
  1: { label: "Up Next: Step 1", title: "Name Your Workspace" },
  2: { label: "Up Next: Step 2", title: "Connect Figma" },
  3: { label: "Up Next: Step 3", title: "Connect GitHub" },
  4: { label: "Up Next: Step 4", title: "Connect Jira Cloud" },
  5: { label: "Up Next: Step 5", title: "Review Active Policies" },
  6: { label: "Up Next: Finish", title: "Workspace Ready" },
};

function lastDelivery(iso: string | null): string {
  return iso ? `Last event ${new Date(iso).toLocaleString()}` : "No events yet";
}

/** Right-hand recap column: workspace profile, connected sources, next step. */
export function SideRecap({
  auth,
  workspace,
  providers,
  onEdit,
  step,
}: {
  auth: Record<ConnectKey, AuthState>;
  workspace: { name: string; slug: string; created: boolean };
  providers: ProviderStatus[];
  onEdit: () => void;
  step: number;
}) {
  const linked = sources.filter((source) => auth[source.key] === "connected").length;
  const next = nextStepCopy[Math.min(step + 1, 6)];

  return (
    <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
      {/* Workspace profile recap */}
      <div className="bg-surface-container-low rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 bg-surface-container-lowest/40 -m-5 mb-3 p-4 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Icon name="verified" className="text-secondary text-[18px]" />
            <span className="font-headline-sm text-[16px] text-on-surface font-semibold">
              Workspace Profile
            </span>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="font-mono-code text-micro-label text-primary hover:underline"
          >
            {workspace.created ? "View" : "Edit"}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center flex-shrink-0">
            <Icon name="corporate_fare" className="text-primary text-[24px]" />
          </div>
          <div className="overflow-hidden">
            <div className="font-body-md font-semibold text-on-surface truncate">
              {workspace.name || "Untitled Workspace"}
            </div>
            <div className="font-mono-code text-[12px] text-muted">
              {workspace.slug ? `unify.dev/org/${workspace.slug}` : "unify.dev/org/—"}
            </div>
          </div>
        </div>
      </div>

      {/* Connected upstream sources */}
      <div className="bg-surface-container rounded-xl p-4 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2">
          <span className="font-label-caps text-label-caps uppercase text-muted">
            Connected Upstream Sources
          </span>
          <span className="px-2 py-0.5 rounded bg-surface-container-highest font-mono-code text-micro-label text-on-surface">
            {linked} of 3 linked
          </span>
        </div>
        {sources.map((source) => {
          const isConnected = auth[source.key] === "connected";
          const status = providers.find((p) => p.provider === source.key);
          return (
            <div
              key={source.key}
              className="bg-surface-container-low p-3.5 rounded-lg flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center">
                    <Icon
                      name={source.icon}
                      className={`text-[20px] ${isConnected ? "text-secondary" : "text-muted"}`}
                    />
                  </div>
                  <div>
                    <div className="font-body-sm font-semibold text-on-surface">{source.name}</div>
                    <div className="font-mono-code text-micro-label text-muted">
                      {isConnected ? "Connected" : "Not connected"}
                      {isConnected && status?.accountName ? (
                        <>
                          {" to "}
                          <span className="text-on-surface">{status.accountName}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
                {isConnected ? (
                  <div className="flex items-center gap-1 text-secondary font-mono-code text-micro-label">
                    <Icon name="check_circle" className="text-[14px]" /> Active
                  </div>
                ) : (
                  <span className="font-mono-code text-micro-label text-muted">Pending</span>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 text-micro-label font-mono-code text-on-surface-variant bg-surface-container-lowest/40 px-2.5 py-1.5 rounded">
                <span>{isConnected ? `Scopes: ${status?.scopes.length ?? 0}` : "Awaiting OAuth consent"}</span>
                <span className={isConnected ? "text-secondary" : "text-muted"}>
                  {isConnected ? lastDelivery(status?.lastDeliveryAt ?? null) : "—"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview of the next step */}
      <div className="bg-surface-container-low rounded-xl p-4 shadow-sm opacity-70">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon name={step >= 5 ? "flag" : "group_add"} className="text-muted text-[18px]" />
            <span className="font-label-caps text-label-caps uppercase text-muted">
              {next.label}
            </span>
          </div>
          <span className="font-mono-code text-micro-label text-muted">
            {step >= 5 ? "Handoff" : "Team Permissions"}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="font-body-sm text-on-surface font-semibold">{next.title}</div>
        </div>
        {workspace.created ? (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Link
              href={`/settings/workspace?workspace=${encodeURIComponent(workspace.slug)}`}
              className="px-2 py-1 rounded bg-surface-container font-mono-code text-micro-label text-primary hover:underline"
            >
              + invite by email...
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

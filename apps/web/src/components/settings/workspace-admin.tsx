"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { IntegrationConnections } from "@/components/settings/integration-connections";
import { MembersRbac } from "@/components/settings/members-rbac";

type TabId = "sources" | "members" | "danger";

const tabs: {
  id: TabId;
  label: string;
  icon: string;
  danger?: boolean;
}[] = [
  { id: "sources", label: "Connected Sources", icon: "hub" },
  { id: "members", label: "Members & RBAC", icon: "badge" },
  { id: "danger", label: "Danger Zone", icon: "warning", danger: true },
];

const dangerActions = [
  {
    id: "revoke",
    icon: "link_off",
    title: "Revoke all integration connections",
    confirm: "revoke",
    button: "Revoke Connections",
  },
  {
    id: "purge",
    icon: "delete_sweep",
    title: "Purge evidence packets",
    confirm: "purge",
    button: "Purge Evidence",
  },
  {
    id: "delete",
    icon: "domain_disabled",
    title: "Delete this workspace",
    confirm: "delete",
    button: "Delete Workspace",
  },
];

function DangerZone() {
  const [typed, setTyped] = useState<Record<string, string>>({});

  return (
    <section className="rounded-xl bg-error-container/10 border border-error/30 p-4 shadow-md flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <Icon name="warning" className="text-error text-[22px]" fill />
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Danger Zone
          </h2>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {dangerActions.map((action) => {
          const enabled = (typed[action.id] ?? "") === action.confirm;
          return (
            <div
              key={action.id}
              className="p-4 rounded-xl bg-surface-container flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-error-container/30 text-error shrink-0 mt-0.5">
                  <Icon name={action.icon} className="text-[20px]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-body-md text-body-md font-semibold text-on-surface">
                    {action.title}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  aria-label={`Type ${action.confirm} to confirm`}
                  placeholder={action.confirm}
                  value={typed[action.id] ?? ""}
                  onChange={(e) =>
                    setTyped((prev) => ({ ...prev, [action.id]: e.target.value }))
                  }
                  className="w-28 px-2.5 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface font-mono-code text-[12px] focus:outline-none focus:border-error placeholder:text-muted"
                />
                <button
                  disabled={!enabled}
                  className="px-3 py-1.5 rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                >
                  {action.button}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Tab shell for `/settings/workspace`. The telemetry ribbon is rendered on the
 * server and passed in as `telemetry` so the header stays a server component.
 */
export function WorkspaceAdmin({ telemetry }: { telemetry: ReactNode }) {
  const [active, setActive] = useState<TabId>("sources");

  return (
    <>
      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg overflow-x-auto shadow-inner">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={[
                "flex items-center gap-2 px-4 py-2 rounded font-body-sm text-body-sm font-semibold transition-all whitespace-nowrap",
                tab.danger
                  ? `ml-auto transition-all ${
                      isActive
                        ? "bg-error-container/30 text-error"
                        : "text-error/80 hover:text-error hover:bg-error-container/20"
                    }`
                  : isActive
                    ? "bg-primary-container text-on-primary-container"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container",
              ].join(" ")}
            >
              <Icon name={tab.icon} className="text-[18px]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {active === "sources" ? (
        <div className="flex flex-col gap-gutter">
          {telemetry}
          <IntegrationConnections />
        </div>
      ) : null}
      {active === "members" ? <MembersRbac /> : null}
      {active === "danger" ? <DangerZone /> : null}
    </>
  );
}

"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { IntegrationConnections } from "@/components/settings/integration-connections";
import { MembersRbac } from "@/components/settings/members-rbac";
import type { ProviderStatus } from "@/lib/data/integrations";
import type { WorkspaceRole } from "@/lib/types";

type TabId = "sources" | "members";

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: "sources", label: "Connected Sources", icon: "hub" },
  { id: "members", label: "Members & Roles", icon: "badge" },
];

/** Tab shell for `/settings/workspace`. */
export function WorkspaceAdmin({
  slug,
  workspaceId,
  me,
  providers,
}: {
  slug: string;
  workspaceId: string;
  me: { userId: string; role: WorkspaceRole };
  providers: ProviderStatus[];
}) {
  const [active, setActive] = useState<TabId>("sources");

  return (
    <>
      <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg overflow-x-auto shadow-inner">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded font-body-sm text-body-sm font-semibold transition-all whitespace-nowrap ${
              tab.id === active
                ? "bg-primary-container text-on-primary-container"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            <Icon name={tab.icon} className="text-[18px]" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {active === "sources" ? <IntegrationConnections slug={slug} providers={providers} /> : null}
      {active === "members" ? <MembersRbac workspaceId={workspaceId} me={me} /> : null}
    </>
  );
}

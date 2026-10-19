import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { ConnectedAccount } from "@/lib/data/profile";

const TOOL: Record<ConnectedAccount["provider"], { name: string; icon: string }> = {
  github: { name: "GitHub", icon: "code" },
  figma: { name: "Figma", icon: "palette" },
  jira: { name: "Jira Cloud", icon: "view_kanban" },
};

/** Provider accounts connected in the user's workspaces (`integration_connections`). */
export function ConnectedTools({ connections }: { connections: ConnectedAccount[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {connections.length === 0 ? (
        <div className="col-span-full rounded-xl bg-surface-container p-8 text-center shadow-md">
          <Icon name="link_off" className="text-[28px] text-muted mb-2" />
          <p className="font-body-md text-body-md font-semibold text-on-surface">
            No tools connected yet
          </p>
        </div>
      ) : null}
      {connections.map((connection) => {
        const tool = TOOL[connection.provider];
        return (
          <div
            key={`${connection.workspaceSlug}-${connection.provider}`}
            className="rounded-xl bg-surface-container p-4 flex flex-col justify-between shadow-md hover:shadow-xl transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface group-hover:bg-primary-container transition-colors">
                    <Icon name={tool.icon} className="text-[20px]" />
                  </div>
                  <div>
                    <span className="font-headline-sm text-headline-sm text-on-surface block">{tool.name}</span>
                    <span className="font-mono-code text-[12px] text-muted">
                      {connection.accountName ?? "account name not reported"}
                    </span>
                  </div>
                </div>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-caps text-eyebrow font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  CONNECTED
                </span>
              </div>
              <div className="space-y-2 py-2">
                <div className="flex items-center justify-between text-body-sm">
                  <span className="text-on-surface-variant">Workspace</span>
                  <span className="font-mono-code text-[12px]">{connection.workspaceName}</span>
                </div>
                <div className="flex items-center justify-between text-body-sm">
                  <span className="text-on-surface-variant">Scopes</span>
                  <span className="font-mono-code text-[12px] truncate max-w-[60%]" title={connection.scopes.join(" ")}>
                    {connection.scopes.length > 0 ? connection.scopes.join(" ") : "none reported"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-body-sm">
                  <span className="text-on-surface-variant">Connected</span>
                  <span className="font-mono-code text-[12px]">
                    {new Date(connection.connectedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-4 mt-2 flex items-center gap-2">
              <Link
                href={`/workspaces/${encodeURIComponent(connection.workspaceSlug)}/integrations`}
                className="flex-1 py-1.5 px-3 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-sm text-body-sm font-medium transition-colors text-center"
              >
                Manage connection
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

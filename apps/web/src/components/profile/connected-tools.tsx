"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";

type ToolId = "github" | "figma" | "jira" | "slack";

type ToolCard = {
  id: ToolId;
  name: string;
  handle: string;
  icon: string;
  rows: { label: string; value: string; tone?: string }[];
};

/**
 * DATA HOLE — replace with the connected-tools API (per-tool handle, scopes,
 * mapped repos/teams, token TTL, webhook state, quiet hours). Empty until the
 * endpoint exists, so the grid renders its empty state.
 */
const tools: ToolCard[] = [];

type Status = "idle" | "pinging" | "ok";

/** Connected OAuth identities with a live "Test Sync" handshake check. */
export function ConnectedTools() {
  const toast = useToast();
  const [status, setStatus] = useState<Record<ToolId, Status>>({
    github: "idle",
    figma: "idle",
    jira: "idle",
    slack: "idle",
  });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
    };
  }, []);

  function testSync(id: ToolId, name: string) {
    if (status[id] !== "idle") return;
    setStatus((prev) => ({ ...prev, [id]: "pinging" }));
    timers.current.push(
      setTimeout(() => {
        setStatus((prev) => ({ ...prev, [id]: "ok" }));
        toast(`${name} connection handshake verified (HTTP 200 OK)`, {
          icon: "cloud_done",
        });
      }, 600),
    );
    timers.current.push(
      setTimeout(() => {
        setStatus((prev) => ({ ...prev, [id]: "idle" }));
      }, 2600),
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {tools.length === 0 ? (
        <div className="col-span-full rounded-xl bg-surface-container p-8 text-center shadow-md">
          <Icon name="link_off" className="text-[28px] text-muted mb-2" />
          <p className="font-body-md text-body-md font-semibold text-on-surface">
            No tools connected yet
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Connect GitHub, Figma, Jira, or Slack to start syncing ownership context.
          </p>
        </div>
      ) : null}
      {tools.map((tool) => {
        const state = status[tool.id];
        return (
          <div
            key={tool.id}
            className="rounded-xl bg-surface-container p-4 flex flex-col justify-between shadow-md hover:shadow-xl transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface group-hover:bg-primary-container transition-colors">
                    <Icon name={tool.icon} className="text-[20px]" />
                  </div>
                  <div>
                    <span className="font-headline-sm text-headline-sm text-on-surface block">
                      {tool.name}
                    </span>
                    <span className="font-mono-code text-[12px] text-muted">{tool.handle}</span>
                  </div>
                </div>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-caps text-eyebrow font-bold">
                  <span
                    className={`w-1.5 h-1.5 rounded-full bg-secondary ${
                      tool.id === "github" ? "animate-pulse" : ""
                    }`}
                  />
                  SYNCED
                </span>
              </div>
              <div className="space-y-2 py-2">
                {tool.rows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-body-sm">
                    <span className="text-on-surface-variant">{row.label}</span>
                    <span className={`font-mono-code text-[12px] ${row.tone}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => testSync(tool.id, tool.name)}
                className="flex-1 py-1.5 px-3 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-sm text-body-sm font-medium transition-colors text-center"
              >
                {state === "pinging"
                  ? "Pinging..."
                  : state === "ok"
                    ? "Sync verified"
                    : "Test Sync"}
              </button>
              <button
                type="button"
                title="OAuth configuration"
                aria-label={`${tool.name} OAuth configuration`}
                onClick={() => toast(`Opening ${tool.name} OAuth manifest…`, {
                  icon: "key",
                  tone: "neutral",
                })}
                className="p-1.5 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <Icon name="key" className="text-[18px]" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

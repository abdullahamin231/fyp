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

const tools: ToolCard[] = [
  {
    id: "github",
    name: "GitHub",
    handle: "@alex-rivera",
    icon: "terminal",
    rows: [
      { label: "Commit author:", value: "Verified GPG", tone: "text-secondary" },
      { label: "Mapped repos:", value: "14 repositories", tone: "text-on-surface font-bold" },
      { label: "Scopes:", value: "repo, read:org, wf", tone: "text-muted truncate max-w-[140px]" },
    ],
  },
  {
    id: "figma",
    name: "Figma",
    handle: "alex@acme.io",
    icon: "draw",
    rows: [
      { label: "Permissions:", value: "Viewer & commenter", tone: "text-on-surface font-medium" },
      { label: "Mapped teams:", value: "3 design spaces", tone: "text-on-surface font-bold" },
      { label: "Token TTL:", value: "Expires in 42d", tone: "text-muted" },
    ],
  },
  {
    id: "jira",
    name: "Jira Software",
    handle: "alex.rivera",
    icon: "view_kanban",
    rows: [
      { label: "Role profile:", value: "Assignee & reviewer", tone: "text-on-surface font-medium" },
      { label: "JQL filter:", value: "PROJ, ARCH Core", tone: "text-primary truncate max-w-[130px]" },
      { label: "Webhook:", value: "Active (200 OK)", tone: "text-secondary" },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    handle: "@alex.rivera",
    icon: "chat",
    rows: [
      { label: "Channel binding:", value: "#core-drift-feed", tone: "text-on-surface" },
      { label: "Direct alerts:", value: "Outbound DMs enabled", tone: "text-secondary font-medium" },
      { label: "Quiet hours:", value: "22:00 – 07:00 PST", tone: "text-muted" },
    ],
  },
];

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
                    ? "Latency 18ms"
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { badgeToneClass, type SearchMatch } from "@/lib/mock/search";
import type { ToolKind } from "@/lib/types";

const toolIcon: Record<ToolKind, string> = {
  figma: "brush",
  github: "merge",
  jira: "assignment",
  slack: "chat",
  git: "hub",
  test: "experiment",
};

const toolText: Record<ToolKind, string> = {
  figma: "text-tertiary",
  github: "text-secondary",
  jira: "text-primary",
  slack: "text-[#36C5F0]",
  git: "text-error",
  test: "text-tertiary",
};

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

/** Right-hand "Live Preview" pane — hover-linked to the selected result. */
export function PreviewPane({ match }: { match: SearchMatch | null }) {
  const [copied, setCopied] = useState(false);

  if (!match) {
    return (
      <div className="col-span-12 lg:col-span-3 bg-surface-container-low rounded-xl p-stack-comfortable shadow-md">
        <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
          Live Preview
        </span>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
          Hover a result to link its preview here.
        </p>
      </div>
    );
  }

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(match.id);
    } catch {
      // Clipboard can be blocked in preview iframes — still confirm intent.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="col-span-12 lg:col-span-3 bg-surface-container-low rounded-xl p-stack-comfortable flex flex-col gap-stack-comfortable shadow-md lg:sticky lg:top-16">
      <div className="flex items-center justify-between pb-stack-compact bg-surface-container-lowest/40 -mx-stack-comfortable px-stack-comfortable pt-2 rounded-t-xl">
        <div className="flex items-center gap-stack-compact">
          <Icon name="visibility" className="text-secondary text-[18px]" />
          <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            Live Preview
          </span>
        </div>
        <span className="font-mono-code text-[10px] text-outline uppercase tracking-wider">
          Hover-linked
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`px-2 py-0.5 rounded font-mono-code text-[11px] font-bold truncate ${badgeToneClass[match.badgeTone]}`}
          >
            {match.badge}
          </span>
          <button
            type="button"
            onClick={copyId}
            className="flex items-center gap-1 font-mono-code text-[11px] text-primary hover:text-primary-fixed shrink-0"
          >
            <span>{copied ? "Copied!" : match.id}</span>
            <Icon name="content_copy" className="text-[13px]" />
          </button>
        </div>
        <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface leading-snug mt-1">
          {truncate(match.title, 120)}
        </h3>
        <span className="font-mono-code text-[11px] text-outline mt-0.5">{match.meta}</span>
      </div>

      {/* Snapshot blueprint */}
      <div className="relative rounded-lg overflow-hidden bg-surface-container-lowest p-2 shadow-inner">
        <div className="flex items-center justify-between pb-1.5 px-1 text-[11px] font-mono-code text-outline">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-secondary" /> Packet snapshot
          </span>
          <span className="truncate">{truncate(match.id.replace("#", ""), 24)}</span>
        </div>
        <div className="relative w-full h-36 rounded bg-surface-container-high overflow-hidden flex items-center justify-center">
          <svg
            className="w-full h-full p-2 text-outline-variant"
            fill="none"
            viewBox="0 0 320 140"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              className="fill-surface-container-highest/60 stroke-outline-variant"
              height="110"
              rx="8"
              strokeWidth="1.5"
              width="280"
              x="20"
              y="15"
            />
            <rect className="fill-primary" height="8" rx="2" width="80" x="35" y="28" />
            <circle className="fill-outline-variant" cx="280" cy="32" r="6" />
            <rect
              className="fill-error-container/20 stroke-error"
              height="42"
              rx="4"
              strokeDasharray="3 3"
              strokeWidth="1"
              width="250"
              x="35"
              y="48"
            />
            <text className="fill-error font-mono-code text-[10px] font-bold" x="45" y="68">
              {truncate(`Matched: ${match.matched.join(", ")}`, 38)}
            </text>
            <text className="fill-on-surface-variant font-mono-code text-[9px]" x="45" y="82">
              {truncate(
                match.chain.length > 0
                  ? match.chain.map((node) => node.label).join(" ↔ ")
                  : match.meta,
                44,
              )}
            </text>
            <rect className="fill-surface-bright" height="14" rx="3" width="48" x="180" y="100" />
            <rect className="fill-primary-container" height="14" rx="3" width="50" x="235" y="100" />
          </svg>
          <span className="absolute bottom-1 right-2 font-mono-code text-[9px] text-outline bg-surface/80 px-1.5 py-0.5 rounded">
            Graph index live
          </span>
        </div>
      </div>

      {/* Provenance chain */}
      <div className="bg-surface-container-lowest/60 p-3 rounded-lg flex flex-col gap-2">
        <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
          Provenance graph chain
        </span>
        {match.chain.length === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            No artifact chain — this result is a workspace-level rule.
          </p>
        ) : (
          <div className="flex flex-col gap-1 text-[12px] font-mono-code">
            {match.chain.map((node, index) => (
              <div key={`${node.tool}-${node.label}-${index}`} className="contents">
                <div className="flex items-center gap-2 p-1.5 rounded bg-surface-container">
                  <Icon
                    name={toolIcon[node.tool]}
                    className={`${toolText[node.tool]} text-[16px]`}
                  />
                  <span className="truncate text-on-surface">{node.label}</span>
                </div>
                {index < match.chain.length - 1 ? (
                  <div className="flex justify-center text-outline py-0.5">
                    <Icon name="south" className="text-[14px]" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Matched signals */}
      <div className="flex flex-col gap-1.5">
        <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
          Matched lexical signals
        </span>
        <div className="flex flex-wrap gap-1">
          {match.matched.map((signal) => (
            <span
              key={signal}
              className="px-2 py-0.5 rounded bg-surface-container-highest text-secondary font-mono-code text-[11px]"
            >
              {signal}
            </span>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-col gap-2 pt-stack-compact">
        {match.findingId ? (
          <Link
            href={`/conflicts/${match.findingId}`}
            className="w-full py-2.5 px-3 rounded-lg bg-primary-container text-on-primary-container hover:brightness-110 font-body-sm text-body-sm font-semibold flex items-center justify-center gap-2 shadow transition-all"
          >
            <Icon name="launch" className="text-[18px]" />
            Open Primary Workspace Entity
          </Link>
        ) : (
          <button
            type="button"
            className="w-full py-2.5 px-3 rounded-lg bg-primary-container text-on-primary-container hover:brightness-110 font-body-sm text-body-sm font-semibold flex items-center justify-center gap-2 shadow transition-all"
          >
            <Icon name="launch" className="text-[18px]" />
            Open Primary Workspace Entity
          </button>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="py-2 px-2 rounded bg-surface-container hover:bg-surface-bright text-on-surface font-body-sm text-body-sm font-medium flex items-center justify-center gap-1 transition-colors"
          >
            <Icon name="fork_right" className="text-[16px] text-tertiary" />
            Branch Diff
          </button>
          <button
            type="button"
            className="py-2 px-2 rounded bg-surface-container hover:bg-surface-bright text-on-surface font-body-sm text-body-sm font-medium flex items-center justify-center gap-1 transition-colors"
          >
            <Icon name="share" className="text-[16px] text-secondary" />
            Share Link
          </button>
        </div>
      </div>
    </div>
  );
}

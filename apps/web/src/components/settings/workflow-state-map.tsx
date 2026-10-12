"use client";

import { useState, type ChangeEvent } from "react";
import { Icon } from "@/components/ui/icon";
import type { Policy, PolicyId, Severity, ToolKind } from "@/lib/types";

/**
 * DATA HOLE — replace with the policies API.
 * Empty until the endpoint exists; the state map renders its empty state.
 */
const policies: Policy[] = [];

type StateMapping = {
  tool: ToolKind;
  source: string;
  canonical: string;
  drives: PolicyId[];
};

const toolMeta: Record<ToolKind, { label: string; color: string }> = {
  jira: { label: "Jira", color: "#c3c0ff" },
  github: { label: "GitHub", color: "#4fdbc8" },
  figma: { label: "Figma", color: "#f24e1e" },
  slack: { label: "Slack", color: "#e01e5a" },
  git: { label: "Commit", color: "#f05033" },
  test: { label: "Test", color: "#ffb95f" },
};

const stateMappings: StateMapping[] = [
  { tool: "jira", source: "Backlog / To Do", canonical: "BACKLOG", drives: [] },
  { tool: "jira", source: "In Progress", canonical: "IN_PROGRESS", drives: ["P2"] },
  { tool: "jira", source: "In Review", canonical: "IN_REVIEW", drives: ["P2", "P4"] },
  { tool: "jira", source: "Blocked", canonical: "BLOCKED", drives: ["P2"] },
  { tool: "jira", source: "Done", canonical: "DONE", drives: ["P4"] },
  { tool: "github", source: "Draft pull request", canonical: "IN_PROGRESS", drives: ["P1"] },
  { tool: "github", source: "Open PR, checks green", canonical: "IN_REVIEW", drives: ["P1", "P4"] },
  { tool: "github", source: "Checks failing", canonical: "BLOCKED", drives: ["P1"] },
  { tool: "github", source: "Merged", canonical: "DONE", drives: ["P1"] },
  { tool: "figma", source: "Exploring (draft)", canonical: "IN_PROGRESS", drives: ["P3"] },
  { tool: "figma", source: "Ready for dev", canonical: "IN_REVIEW", drives: ["P3"] },
  { tool: "figma", source: "Approved", canonical: "DONE", drives: ["P3"] },
];

const canonicalTone: Record<string, string> = {
  BACKLOG: "bg-surface-container-highest text-on-surface-variant",
  IN_PROGRESS: "bg-primary-container/25 text-primary",
  IN_REVIEW: "bg-tertiary-container/40 text-on-tertiary-container",
  BLOCKED: "bg-error-container/40 text-error",
  DONE: "bg-secondary/15 text-secondary",
};

const severityTone: Record<Severity, string> = {
  critical: "bg-error",
  warning: "bg-tertiary",
  info: "bg-secondary",
};

export function WorkflowStateMap() {
  const [grace, setGrace] = useState<Record<string, number>>(() =>
    Object.fromEntries(policies.map((policy) => [policy.id, policy.graceMinutes])),
  );

  function setPolicyGrace(id: PolicyId, value: number) {
    setGrace((prev) => ({ ...prev, [id]: value }));
  }

  return (
    <>
      {/* Canonical workflow state map */}
      <section className="rounded-xl bg-surface-container-low shadow-sm overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 pb-4 border-b border-outline-variant">
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-primary-container/20 text-primary flex items-center justify-center">
                <Icon name="account_tree" className="text-[20px]" />
              </div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Canonical Workflow State Map
              </h2>
            </div>
          </div>
          <span className="font-mono-code text-[12px] px-2.5 py-1 rounded bg-surface-container text-secondary font-medium self-start">
            {stateMappings.length} mappings
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest/80 text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider">
                <th className="py-3 px-4 w-36">Tool</th>
                <th className="py-3 px-4">Source State</th>
                <th className="py-3 px-4 w-44">Canonical State</th>
                <th className="py-3 px-4 w-44">Drives Policies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 text-on-surface font-body-md text-body-md">
              {stateMappings.map((mapping) => (
                <tr
                  key={`${mapping.tool}-${mapping.source}`}
                  className="hover:bg-surface-container transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 font-mono-code text-[12px] text-on-surface">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: toolMeta[mapping.tool].color }}
                      />
                      {toolMeta[mapping.tool].label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-body-sm text-on-surface-variant">
                    {mapping.source}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded font-mono-code text-micro-label font-semibold ${canonicalTone[mapping.canonical]}`}
                    >
                      {mapping.canonical}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1.5">
                      {mapping.drives.length > 0 ? (
                        mapping.drives.map((policy) => (
                          <span
                            key={policy}
                            className="px-1.5 py-0.5 rounded bg-surface-container-highest font-mono-code text-micro-label text-on-surface"
                          >
                            {policy}
                          </span>
                        ))
                      ) : (
                        <span className="font-mono-code text-micro-label text-muted">—</span>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Grace-period defaults */}
      <section className="rounded-xl bg-surface-container-low p-4 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-secondary/15 text-secondary flex items-center justify-center">
                <Icon name="hourglass_top" className="text-[20px]" />
              </div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Grace-Period Defaults
              </h2>
            </div>
          </div>
        </div>
        {policies.length === 0 ? (
          <p className="text-body-sm text-muted py-2">
            No policies yet
          </p>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="p-4 rounded-lg bg-surface-container flex flex-col gap-2.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${severityTone[policy.severity]}`} />
                  <span className="font-mono-code text-[12px] font-bold text-on-surface">
                    {policy.id}
                  </span>
                </span>
                <span className="font-label-caps text-label-caps text-muted uppercase tracking-wider">
                  Grace
                </span>
              </div>
              <span className="font-body-md text-body-md font-semibold text-on-surface leading-tight">
                {policy.name}
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {policy.description}
              </p>
              <div className="flex items-center gap-2 mt-auto pt-1">
                <input
                  type="number"
                  min={0}
                  aria-label={`Grace period for ${policy.id} in minutes`}
                  value={grace[policy.id]}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setPolicyGrace(policy.id, Number(e.target.value))
                  }
                  className="w-20 px-2 py-1.5 rounded bg-surface-container-lowest border border-outline-variant font-mono-code text-[13px] text-on-surface focus:outline-none focus:border-primary"
                />
                <span className="font-mono-code text-micro-label text-muted">
                  minutes · default {policy.graceMinutes}
                </span>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>
    </>
  );
}

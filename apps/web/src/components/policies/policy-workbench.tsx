"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import type { Policy, PolicyId, Severity } from "@/lib/types";

/**
 * DATA HOLE — replace with the policies API.
 * Empty until the endpoint exists; the workbench renders its empty state.
 */
const policies: Policy[] = [];

/**
 * DATA HOLE — replace with the consistency-engine health API.
 * Null until the endpoint exists; the health card renders its empty copy.
 */
interface EngineHealth {
  evaluations24h: string;
  sparkline: number[];
  autoResolvedPct: number;
  escalatedPct: number;
  errorPct: number;
}
const health: EngineHealth | null = null;

/** Maps normalised 0–1 samples onto the 120×40 sparkline viewBox. */
function sparklinePoints(samples: number[]): string {
  const max = Math.max(...samples, 1);
  return samples
    .map((value, index) => {
      const x = (index / (samples.length - 1)) * 120;
      const y = 40 - (value / max) * 32;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

/* ------------------------------------------------------------------ static */

type EventChip = { name: string; source: "figma" | "github" | "jira" };

interface PolicyExtra {
  code: string;
  namespace: string;
  version: string;
  stateRule: string;
  triggers: EventChip[];
  relations: string[];
  recipients: string[];
  template: string;
  suppression: string;
}

const relationOptions = ["SATISFIES", "REFERENCES", "IMPLEMENTS", "VERIFIES", "BLOCKS"];

const recipientOptions = [
  "Artifact Owner",
  "PR Assignee",
  "Ticket Watcher",
  "Escalation Lead",
];

const stateRuleOptions = [
  "Target Version > Implemented Version",
  "Source Last Modified > Target Merge Timestamp",
  "Hash Checksum Mismatch (Strict AST)",
  "Explicit Deviation Delta (Figma Inspect Diff)",
  "No Confirmed SATISFIES Edge (Graph Empty)",
  "Requirement Text Delta > Threshold",
];

const unitOptions = ["Minutes", "Hours", "Days"];

const payloadPool = [
  "reconciliation.pass.completed",
  "test.run.completed",
  "pull_request.review_requested",
];

const tokenList = [
  "{figma_node}",
  "{pr_id}",
  "{jira_key}",
  "{merge_timestamp}",
  "{grace_minutes}",
  "{author_slack}",
];

const registry: Record<PolicyId, PolicyExtra> = {
  P1: {
    code: "POL-P1-CORE",
    namespace: "sync.graph.core",
    version: "v2.1",
    stateRule: "Target Version > Implemented Version",
    triggers: [
      { name: "github.pull_request.merged", source: "github" },
      { name: "figma.asset.updated", source: "figma" },
    ],
    relations: ["SATISFIES", "REFERENCES", "IMPLEMENTS"],
    recipients: ["Artifact Owner", "PR Assignee", "Escalation Lead"],
    template:
      '{figma_node} updated after {pr_id} merged with no corresponding {jira_key} update. Drift exceeds the {grace_minutes}m grace window.',
    suppression:
      'Auto-suppress when the commit label is "wip-experimental" or the linked requirement sits in status "Backlog".',
  },
  P2: {
    code: "POL-P2-GHST",
    namespace: "sync.graph.orphan",
    version: "v1.4",
    stateRule: "No Confirmed SATISFIES Edge (Graph Empty)",
    triggers: [
      { name: "jira.issue.updated", source: "jira" },
      { name: "github.pull_request.merged", source: "github" },
    ],
    relations: ["SATISFIES", "REFERENCES"],
    recipients: ["Artifact Owner", "Ticket Watcher"],
    template:
      '{jira_key} entered {canonical_state} with no confirmed SATISFIES edge after {grace_minutes}m. No anchored code unit references this ticket.',
    suppression:
      'Auto-suppress tickets labeled "exempt-sync" or moved back to "Backlog" before the grace window closes.',
  },
  P3: {
    code: "POL-P3-SPEC",
    namespace: "sync.graph.spec",
    version: "v1.0",
    stateRule: "Hash Checksum Mismatch (Strict AST)",
    triggers: [
      { name: "figma.asset.updated", source: "figma" },
      { name: "github.pull_request.merged", source: "github" },
    ],
    relations: ["IMPLEMENTS", "REFERENCES"],
    recipients: ["Artifact Owner", "PR Assignee"],
    template:
      "{figma_node} content hash changed while anchored code still resolves the previous value. Divergence persists past {grace_minutes}m.",
    suppression:
      "Auto-suppress generated and vendor files (path matches /generated/ or *.tokens.min.css).",
  },
  P4: {
    code: "POL-P4-DIVER",
    namespace: "sync.graph.refx",
    version: "v0.8",
    stateRule: "Requirement Text Delta > Threshold",
    triggers: [
      { name: "jira.issue.updated", source: "jira" },
      { name: "github.pull_request.merged", source: "github" },
    ],
    relations: ["SATISFIES", "REFERENCES", "VERIFIES", "BLOCKS"],
    recipients: ["Artifact Owner", "Escalation Lead"],
    template:
      "{jira_key} requirement text changed while anchored code at {code_locator} is untouched (or the reverse). Both sides evaluated at {merge_timestamp}.",
    suppression:
      'Auto-suppress formatting-only edits (AST-equal) and tickets labeled "docs-only".',
  },
};

const severityBar: Record<Severity, string> = {
  critical: "bg-error",
  warning: "bg-tertiary",
  info: "bg-secondary",
};

const severityDot: Record<Severity, string> = {
  critical: "bg-error",
  warning: "bg-tertiary",
  info: "bg-secondary",
};

const severityIdChip: Record<Severity, string> = {
  critical: "text-error bg-error-container/40",
  warning: "text-tertiary bg-tertiary-container/40",
  info: "text-secondary bg-secondary/10",
};

const severityLabel: Record<Severity, string> = {
  critical: "Critical",
  warning: "Warning",
  info: "Info",
};

const sourceDot: Record<EventChip["source"], string> = {
  figma: "bg-tertiary",
  github: "bg-primary",
  jira: "bg-secondary",
};

function graceParts(minutes: number): { value: number; unit: string } {
  if (minutes >= 1440 && minutes % 1440 === 0) return { value: minutes / 1440, unit: "Days" };
  if (minutes >= 60 && minutes % 60 === 0) return { value: minutes / 60, unit: "Hours" };
  return { value: minutes, unit: "Minutes" };
}

/* --------------------------------------------------------------- master list */

function PolicyCard({
  policy,
  selected,
  enabled,
  onSelect,
}: {
  policy: Policy;
  selected: boolean;
  enabled: boolean;
  onSelect: () => void;
}) {
  const extra = registry[policy.id];
  const grace = graceParts(policy.graceMinutes);
  const graceLabel = `${grace.value}${grace.unit === "Minutes" ? "m" : grace.unit === "Hours" ? "h" : "d"} Grace`;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group cursor-pointer p-3.5 rounded-lg text-left transition-all relative overflow-hidden ${
        selected
          ? "bg-surface-container-high shadow-md"
          : "bg-surface-container-low hover:bg-surface-container shadow-sm"
      } ${enabled ? "" : "opacity-70 hover:opacity-100"}`}
    >
      <span
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          enabled ? severityBar[policy.severity] : "bg-outline-variant"
        }`}
      />
      <span className="flex items-start justify-between gap-2 mb-1.5 pl-1.5">
        <span className="flex items-center gap-2">
          <span
            className={`font-mono-code text-micro-label font-bold px-1.5 py-0.5 rounded ${
              enabled ? severityIdChip[policy.severity] : "text-on-surface-variant bg-surface-container-highest"
            }`}
          >
            {policy.id}
          </span>
          <span className="font-mono-code text-micro-label text-muted">{extra.code}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="font-label-caps text-eyebrow text-on-surface-variant bg-surface-container-highest px-1.5 py-0.2 rounded">
            {extra.version}
          </span>
          <span
            className={`font-label-caps text-eyebrow px-1.5 py-0.2 rounded font-bold ${
              enabled ? "text-secondary bg-secondary/10" : "text-muted bg-surface-container"
            }`}
          >
            {enabled ? "ACTIVE" : "PAUSED"}
          </span>
        </span>
      </span>
      <span className="block font-headline-sm text-body-lg text-on-surface font-semibold pl-1.5 leading-snug">
        {policy.name}
      </span>
      <span className="block font-body-sm text-body-sm text-on-surface-variant line-clamp-1 pl-1.5 mt-0.5">
        {policy.description}
      </span>
      <span className="flex items-center gap-3 pl-1.5 mt-3 pt-2 text-[12px] text-muted font-mono-code">
        <span className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${severityDot[policy.severity]}`} />
          {severityLabel[policy.severity]}
        </span>
        <span>{graceLabel}</span>
        <span className={policy.firedLast7d > 0 ? "text-secondary" : ""}>
          {policy.firedLast7d} fired / 7d
        </span>
      </span>
    </button>
  );
}

/* -------------------------------------------------------------------- editor */

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="relative inline-flex items-center cursor-pointer select-none">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="inline-block w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-primary-container after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-container" />
      <span
        className={`ml-2 font-mono-code text-body-sm font-semibold ${
          checked ? "text-secondary" : "text-muted"
        }`}
      >
        {checked ? "Active" : "Paused"}
      </span>
    </label>
  );
}

function FieldLabel({
  children,
  icon,
  iconClass,
}: {
  children: ReactNode;
  icon?: string;
  iconClass?: string;
}) {
  return (
    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
      {icon ? <Icon name={icon} className={`text-[16px] ${iconClass ?? "text-primary"}`} /> : null}
      {children}
    </span>
  );
}

function PolicyEditor({
  policy,
  enabled,
  onToggleEnabled,
}: {
  policy: Policy;
  enabled: boolean;
  onToggleEnabled: (next: boolean) => void;
}) {
  const extra = registry[policy.id];
  const initialGrace = graceParts(policy.graceMinutes);

  const [name, setName] = useState(policy.name);
  const [graceValue, setGraceValue] = useState(String(initialGrace.value));
  const [graceUnit, setGraceUnit] = useState(initialGrace.unit);
  const [relations, setRelations] = useState<string[]>(extra.relations);
  const [events, setEvents] = useState<EventChip[]>(extra.triggers);
  const [stateRule, setStateRule] = useState(extra.stateRule);
  const [clauses, setClauses] = useState<string[]>(policy.guards);
  const [severity, setSeverity] = useState<Severity>(policy.severity);
  const [recipients, setRecipients] = useState<string[]>(extra.recipients);
  const [template, setTemplate] = useState(extra.template);
  const [suppression, setSuppression] = useState(extra.suppression);
  const [editingSuppression, setEditingSuppression] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleFrom = (list: string[], value: string) =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  const attachPayload = () => {
    const next = payloadPool.find((name_) => !events.some((event) => event.name === name_));
    if (next) setEvents([...events, { name: next, source: "github" }]);
  };

  return (
    <div className="bg-surface-container rounded-xl shadow-lg p-4 flex flex-col gap-4 relative">
      {/* SECTION 1 — metadata */}
      <div className="flex flex-col gap-4 pb-6 bg-surface-container-high/40 p-4 rounded-lg">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-label-caps text-label-caps px-2 py-0.5 rounded font-mono-code font-bold uppercase tracking-wider ${
                severity === "critical"
                  ? "bg-error/20 text-error"
                  : severity === "warning"
                    ? "bg-tertiary/20 text-tertiary"
                    : "bg-secondary/15 text-secondary"
              }`}
            >
              {severityLabel[severity]} Rule
            </span>
            <span className="font-mono-code text-mono-code text-muted">{extra.code}</span>
            <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-mono-code text-micro-label font-bold">
              {extra.version} ({enabled ? "Active" : "Paused"})
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-mono-code text-micro-label">
              fired {policy.firedLast7d}× / 7d
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
              Policy Engine Status:
            </span>
            <Toggle checked={enabled} onChange={onToggleEnabled} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1.5">
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <FieldLabel>Policy Canonical Name</FieldLabel>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="px-3.5 py-2 rounded bg-surface-container-lowest text-on-surface font-headline-sm text-body-lg focus:bg-surface-container-highest transition-colors focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Registry Namespace</FieldLabel>
            <input
              type="text"
              readOnly
              value={extra.namespace}
              className="px-3.5 py-2 rounded bg-surface-container-lowest/60 text-muted font-mono-code text-mono-code cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Badge tone="accent">L0 deterministic gate</Badge>
        </div>
      </div>

      {/* SECTION 2 — knowledge-graph relations */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <FieldLabel icon="hub">Applicable Knowledge Graph Relations</FieldLabel>
          <span className="font-mono-code text-micro-label text-muted">
            Target Link Traversal: Depth 1
          </span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {relationOptions.map((relation) => {
            const checked = relations.includes(relation);
            return (
              <label
                key={relation}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all shadow-sm ${
                  checked
                    ? "bg-primary-container text-on-primary-container hover:brightness-110"
                    : "bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant"
                }`}
              >
                <input
                  type="checkbox"
                  className="rounded accent-secondary"
                  checked={checked}
                  onChange={() => setRelations(toggleFrom(relations, relation))}
                />
                <span
                  className={`font-mono-code text-body-sm ${checked ? "font-semibold" : ""}`}
                >
                  {relation}
                </span>
                {checked ? <Icon name="check" className="text-[14px]" /> : null}
              </label>
            );
          })}
          <button
            type="button"
            className="px-2.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-muted hover:text-on-surface flex items-center gap-1 font-mono-code text-[12px] transition-colors"
          >
            <Icon name="add" className="text-[14px]" />
            Custom Edge
          </button>
        </div>
      </div>

      {/* SECTION 3 — trigger events */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <FieldLabel icon="bolt" iconClass="text-secondary">
            Webhook Trigger Conditions &amp; Event Payloads
          </FieldLabel>
          <span className="font-mono-code text-micro-label text-muted">
            Multi-Event Subscriptions ({events.length} active)
          </span>
        </div>
        <div className="p-3.5 rounded-lg bg-surface-container-low flex flex-wrap items-center gap-3">
          {events.map((event) => (
            <span
              key={event.name}
              className="flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container-highest text-on-surface text-body-sm font-mono-code"
            >
              <span className={`w-2 h-2 rounded-full ${sourceDot[event.source]}`} />
              <span>{event.name}</span>
              <button
                type="button"
                aria-label={`Remove ${event.name}`}
                className="hover:text-error transition-colors"
                onClick={() => setEvents(events.filter((item) => item.name !== event.name))}
              >
                <Icon name="close" className="text-[14px] leading-none" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={attachPayload}
            className="flex items-center gap-1 px-3 py-1 rounded bg-surface-container hover:bg-surface-container-high text-muted hover:text-on-surface font-body-sm text-body-sm transition-colors"
          >
            <Icon name="add_circle" className="text-[16px]" />
            <span>Attach Event Payload...</span>
          </button>
        </div>
      </div>

      {/* SECTION 4 — temporal condition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-lg">
        <div className="flex flex-col gap-1.5">
          <FieldLabel icon="schedule" iconClass="text-tertiary">
            Grace Period Allowed
          </FieldLabel>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              aria-label="Grace period value"
              value={graceValue}
              onChange={(event) => setGraceValue(event.target.value)}
              className="w-24 px-3 py-2 rounded bg-surface-container text-on-surface font-mono-code text-body-lg text-center focus:outline-none"
            />
            <select
              aria-label="Grace period unit"
              value={graceUnit}
              onChange={(event) => setGraceUnit(event.target.value)}
              className="px-3.5 py-2 rounded bg-surface-container text-on-surface font-body-sm text-body-sm focus:outline-none cursor-pointer flex-1"
            >
              {unitOptions.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel icon="compare_arrows" iconClass="text-secondary">
            State Comparison Rule
          </FieldLabel>
          <select
            aria-label="State comparison rule"
            value={stateRule}
            onChange={(event) => setStateRule(event.target.value)}
            className="w-full px-3.5 py-2 rounded bg-surface-container text-on-surface font-mono-code text-body-sm focus:outline-none cursor-pointer"
          >
            {stateRuleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SECTION 5 — guards */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <FieldLabel icon="shield" iconClass="text-error">
            Guards &amp; Exclusion Criteria
          </FieldLabel>
          <button
            type="button"
            onClick={() => setClauses([...clauses, 'Ignore changes authored by "dependabot[bot]"'])}
            className="font-label-caps text-label-caps text-primary hover:text-on-surface flex items-center gap-1 transition-colors"
          >
            <Icon name="add" className="text-[14px]" />
            Add Guard Clause
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {clauses.map((clause, index) => (
            <div
              key={`${index}-${clause}`}
              className="flex items-center justify-between gap-3 p-3.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="font-mono-code text-eyebrow text-muted uppercase px-2 py-0.5 rounded bg-surface-container shrink-0">
                  {index === 0 ? "IF" : "AND"}
                </span>
                <span className="font-mono-code text-body-sm text-on-surface truncate">
                  {clause}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-label-caps text-eyebrow text-secondary uppercase bg-secondary/10 px-2 py-0.5 rounded">
                  Bypass
                </span>
                <button
                  type="button"
                  aria-label={`Delete guard ${index + 1}`}
                  className="text-muted hover:text-error p-1 transition-colors"
                  onClick={() => setClauses(clauses.filter((_, i) => i !== index))}
                >
                  <Icon name="delete" className="text-[16px]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 6 — severity & routing */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-lg bg-surface-container-low">
        <div className="md:col-span-5 flex flex-col gap-2.5">
          <FieldLabel>Severity Classification</FieldLabel>
          <div className="grid grid-cols-3 gap-3">
            {(["critical", "warning", "info"] as Severity[]).map((option) => {
              const active = severity === option;
              const tone =
                option === "critical"
                  ? "bg-error-container/30 text-error"
                  : option === "warning"
                    ? "bg-tertiary-container/30 text-tertiary"
                    : "bg-secondary/10 text-secondary";
              const icon = option === "critical" ? "error" : option === "warning" ? "warning" : "info";
              return (
                <label
                  key={option}
                  className={`flex flex-col items-center justify-center p-3.5 rounded cursor-pointer shadow-sm transition-colors ${
                    active ? tone : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  <input
                    type="radio"
                    name={`severity-${policy.id}`}
                    className="sr-only"
                    checked={active}
                    onChange={() => setSeverity(option)}
                  />
                  <Icon name={icon} className="text-[20px] mb-1.5" />
                  <span className="font-mono-code text-label-caps font-bold">
                    {severityLabel[option]}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
        <div className="md:col-span-7 flex flex-col gap-2.5">
          <FieldLabel>Escalation &amp; Recipient Roles</FieldLabel>
          <div className="grid grid-cols-2 gap-3">
            {recipientOptions.map((role) => (
              <label
                key={role}
                className="flex items-center gap-2.5 p-3 rounded bg-surface-container text-on-surface font-body-sm text-body-sm cursor-pointer hover:bg-surface-container-high"
              >
                <input
                  type="checkbox"
                  className="accent-primary-container rounded"
                  checked={recipients.includes(role)}
                  onChange={() => setRecipients(toggleFrom(recipients, role))}
                />
                <span className={role === "Escalation Lead" ? "text-error font-medium" : ""}>
                  {role}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 7 — explanation template */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <FieldLabel icon="chat">Automated Incident Explanation Template</FieldLabel>
          <span className="font-mono-code text-micro-label text-muted">
            {policy.notifyTemplate} · supports interpolation tokens
          </span>
        </div>
        <textarea
          rows={3}
          aria-label="Notification template"
          value={template}
          onChange={(event) => setTemplate(event.target.value)}
          className="w-full p-3.5 rounded bg-surface-container-low text-on-surface font-mono-code text-mono-code focus:outline-none leading-relaxed resize-none"
        />
        <div className="flex items-center gap-3 flex-wrap pt-1">
          <span className="font-label-caps text-eyebrow text-muted uppercase">Insert Token:</span>
          {tokenList.map((token) => (
            <button
              key={token}
              type="button"
              onClick={() => setTemplate(`${template} ${token}`.trim())}
              className="px-2 py-0.5 rounded bg-surface-container-high hover:bg-primary/20 text-primary font-mono-code text-micro-label transition-colors"
            >
              {token}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 8 — suppression */}
      <div className="flex flex-col gap-3 p-4 rounded-lg bg-surface-container-low">
        <FieldLabel icon="do_not_disturb_on" iconClass="text-muted">
          Automated Suppression &amp; Noise Squelch
        </FieldLabel>
        <div className="flex items-center gap-3">
          <Icon name="rule_settings" className="text-muted text-[18px] shrink-0" />
          {editingSuppression ? (
            <textarea
              rows={2}
              aria-label="Suppression rule"
              value={suppression}
              onChange={(event) => setSuppression(event.target.value)}
              className="flex-1 px-3 py-2 rounded bg-surface-container-lowest text-on-surface font-mono-code text-body-sm focus:outline-none resize-none"
            />
          ) : (
            <p className="font-mono-code text-body-sm text-on-surface flex-1">{suppression}</p>
          )}
          <button
            type="button"
            onClick={() => setEditingSuppression(!editingSuppression)}
            className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-highest font-mono-code text-body-sm text-primary transition-colors shrink-0"
          >
            {editingSuppression ? "Done" : "Edit"}
          </button>
        </div>
      </div>

      {/* SECTION 9 — action footer */}
      <div className="pt-4 border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="flex items-center gap-1.5 font-mono-code text-body-sm text-primary">
          <Icon name="manage_history" className="text-[16px]" />
          <span>View Version History &amp; Diffs (4 versions recorded)</span>
        </span>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            type="button"
            className="px-3.5 py-2 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm transition-colors"
          >
            Discard Changes
          </button>
          <Link
            href="/policies/simulation"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-surface-container-high hover:bg-surface-container-highest text-secondary font-body-sm text-body-sm font-semibold transition-colors"
          >
            <Icon name="science" className="text-[16px]" />
            <span>Preview on Historical Events</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded bg-primary-container hover:bg-primary-container/90 text-on-primary-container font-body-sm text-body-sm font-semibold transition-all shadow-md active:scale-95"
          >
            <Icon name={saved ? "check" : "save"} className="text-[16px]" />
            <span>{saved ? `Saved ${extra.version}` : "Save as New Version"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- workbench */

export function PolicyWorkbench() {
  const [selectedId, setSelectedId] = useState<PolicyId>("P1");
  const [query, setQuery] = useState("");
  const [enabledMap, setEnabledMap] = useState<Record<PolicyId, boolean>>(() =>
    Object.fromEntries(policies.map((policy) => [policy.id, policy.enabled])) as Record<
      PolicyId,
      boolean
    >,
  );
  const [resetKey, setResetKey] = useState(0);

  const selected = policies.find((policy) => policy.id === selectedId) ?? policies[0];
  const visible = policies.filter((policy) => {
    const haystack = `${policy.id} ${policy.name} ${policy.trigger} ${policy.severity}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });
  const activeCount = policies.filter((policy) => enabledMap[policy.id]).length;

  return (
    <div className="grid grid-cols-12 gap-gutter items-start">
      {/* LEFT — policy list master pane */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-3">
        <div className="bg-surface-container-low p-4 rounded-lg shadow-sm flex flex-col gap-3">
          <div className="relative w-full">
            <Icon
              name="filter_list"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-[16px]"
            />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter policies (by ID, scope, state)..."
              className="w-full pl-8 pr-3 py-1.5 rounded bg-surface-container text-on-surface placeholder:text-muted font-mono-code text-body-sm focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between text-on-surface-variant px-1 pt-1 font-label-caps text-label-caps uppercase tracking-wider">
            <span>{policies.length} Registered Policies</span>
            <span className="text-secondary">{activeCount} Active</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {visible.map((policy) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              selected={policy.id === selectedId}
              enabled={enabledMap[policy.id]}
              onSelect={() => {
                setSelectedId(policy.id);
                setResetKey((key) => key + 1);
              }}
            />
          ))}
          {visible.length === 0 ? (
            <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/40 font-mono-code text-[12px] text-muted text-center">
              No policy matches “{query}”
            </div>
          ) : null}
        </div>

        {/* Consistency engine health */}
        <div className="bg-surface-container-low p-4 rounded-lg shadow-sm mt-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-muted">
              Consistency Engine Health
            </span>
            <span className="font-mono-code text-micro-label text-secondary">REALTIME</span>
          </div>
          {health ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="font-headline-md text-headline-md text-on-surface font-bold">
                    {health.evaluations24h}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Evaluations / 24h
                  </span>
                </div>
                {health.sparkline.length > 1 ? (
                  <div className="w-32 h-10 flex items-end">
                    <svg className="w-full h-full text-secondary" fill="none" viewBox="0 0 120 40">
                      <polyline
                        points={sparklinePoints(health.sparkline)}
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                      />
                    </svg>
                  </div>
                ) : null}
              </div>
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-secondary h-full"
                  style={{ width: `${health.autoResolvedPct}%` }}
                />
                <div className="bg-tertiary h-full" style={{ width: `${health.escalatedPct}%` }} />
                <div className="bg-error h-full" style={{ width: `${health.errorPct}%` }} />
              </div>
              <div className="flex items-center justify-between text-micro-label font-mono-code text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  Auto-resolved: {health.autoResolvedPct}%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-tertiary" />
                  Escalated: {health.escalatedPct}%
                </span>
              </div>
            </>
          ) : (
            <p className="font-body-sm text-body-sm text-muted">
              No evaluation telemetry yet
            </p>
          )}
        </div>
      </div>

      {/* RIGHT — rule builder detail pane */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
        {selected ? (
        <>
        <PolicyEditor
          key={`${selected.id}-${resetKey}`}
          policy={selected}
          enabled={enabledMap[selected.id]}
          onToggleEnabled={(next) =>
            setEnabledMap((map) => ({ ...map, [selected.id]: next }))
          }
        />

        {/* Simulation insight ribbon */}
        <div className="p-4 rounded-xl bg-surface-container flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
              <Icon name="verified" className="text-[18px]" />
            </div>
            <div>
              <span className="font-headline-sm text-body-sm font-semibold text-on-surface">
                Offline Replay Test
              </span>
            </div>
          </div>
          <Link
            href="/policies/simulation"
            className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-mono-code text-[12px] transition-colors shrink-0"
          >
            Inspect Replay Log
          </Link>
        </div>
        </>
        ) : (
          <div className="rounded-xl border border-dashed border-outline-variant p-10 text-center">
            <Icon name="gavel" className="text-muted text-[36px]" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface mt-3">
              No policies configured
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}

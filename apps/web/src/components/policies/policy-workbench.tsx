"use client";

import { useState, useTransition, type ReactNode } from "react";
import type { Severity as DbSeverity } from "@unify/contracts";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { saveRuleVersionAction } from "@/lib/actions/rules";
import type { RuleView } from "@/lib/data/rules";
import { RULE_SEVERITIES } from "@/lib/domain/rule-version";

const severityBar: Record<DbSeverity, string> = {
  critical: "bg-error",
  high: "bg-error/70",
  medium: "bg-tertiary",
  low: "bg-secondary",
};

const severityIdChip: Record<DbSeverity, string> = {
  critical: "text-error bg-error-container/40",
  high: "text-error bg-error-container/20",
  medium: "text-tertiary bg-tertiary-container/40",
  low: "text-secondary bg-secondary/10",
};

const severityLabel: Record<DbSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

function triggerLabel(rule: RuleView): string {
  return [rule.trigger.on, rule.trigger.entityType].filter(Boolean).join(" · ");
}

function PolicyCard({ rule, selected, onSelect }: { rule: RuleView; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group cursor-pointer p-3.5 rounded-lg text-left transition-all relative overflow-hidden ${
        selected ? "bg-surface-container-high shadow-md" : "bg-surface-container-low hover:bg-surface-container shadow-sm"
      } ${rule.active ? "" : "opacity-70 hover:opacity-100"}`}
    >
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${rule.active ? severityBar[rule.severity] : "bg-outline-variant"}`} />
      <span className="flex items-start justify-between gap-2 mb-1.5 pl-1.5">
        <span
          className={`font-mono-code text-micro-label font-bold px-1.5 py-0.5 rounded ${
            rule.active ? severityIdChip[rule.severity] : "text-on-surface-variant bg-surface-container-highest"
          }`}
        >
          {rule.id}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="font-label-caps text-eyebrow text-on-surface-variant bg-surface-container-highest px-1.5 py-0.2 rounded">
            v{rule.version}
          </span>
          <span
            className={`font-label-caps text-eyebrow px-1.5 py-0.2 rounded font-bold ${
              rule.active ? "text-secondary bg-secondary/10" : "text-muted bg-surface-container"
            }`}
          >
            {rule.active ? "ACTIVE" : "PAUSED"}
          </span>
        </span>
      </span>
      <span className="block font-headline-sm text-body-lg text-on-surface font-semibold pl-1.5 leading-snug">{rule.title}</span>
      <span className="block font-body-sm text-body-sm text-on-surface-variant line-clamp-1 pl-1.5 mt-0.5">{rule.description}</span>
      <span className="flex items-center gap-3 pl-1.5 mt-3 pt-2 text-[12px] text-muted font-mono-code">
        <span>{severityLabel[rule.severity]}</span>
        <span>{rule.gracePeriodHours}h Grace</span>
        <span className={rule.fired7d > 0 ? "text-secondary" : ""}>{rule.fired7d} fired / 7d</span>
      </span>
    </button>
  );
}

function FieldLabel({ children, icon }: { children: ReactNode; icon?: string }) {
  return (
    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
      {icon ? <Icon name={icon} className="text-[16px] text-primary" /> : null}
      {children}
    </span>
  );
}

function ReadOnly({ label, icon, children }: { label: string; icon: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel icon={icon}>{label}</FieldLabel>
      <div className="px-3.5 py-2 rounded bg-surface-container-lowest/60 text-on-surface-variant font-mono-code text-body-sm">{children}</div>
    </div>
  );
}

function PolicyEditor({ rule }: { rule: RuleView }) {
  const [grace, setGrace] = useState(String(rule.gracePeriodHours));
  const [severity, setSeverity] = useState<DbSeverity>(rule.severity);
  const [template, setTemplate] = useState(rule.notify.template);
  const [active, setActive] = useState(rule.active);
  const [outcome, setOutcome] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty =
    grace !== String(rule.gracePeriodHours) || severity !== rule.severity || template !== rule.notify.template || active !== rule.active;

  function discard() {
    setGrace(String(rule.gracePeriodHours));
    setSeverity(rule.severity);
    setTemplate(rule.notify.template);
    setActive(rule.active);
    setOutcome(null);
  }

  function save() {
    startTransition(async () => {
      const result = await saveRuleVersionAction(rule.id, {
        gracePeriodHours: Number(grace),
        severity,
        notifyTemplate: template,
        active,
      });
      setOutcome(result.ok ? { ok: true, text: `Saved as v${result.version}` } : { ok: false, text: result.error ?? "Save failed" });
    });
  }

  return (
    <div className="bg-surface-container rounded-xl shadow-lg p-4 flex flex-col gap-4 relative">
      <div className="flex flex-col gap-4 pb-6 bg-surface-container-high/40 p-4 rounded-lg">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-label-caps text-label-caps px-2 py-0.5 rounded font-mono-code font-bold uppercase tracking-wider ${severityIdChip[severity]}`}>
              {severityLabel[severity]} Rule
            </span>
            <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-mono-code text-micro-label font-bold">
              {rule.id} v{rule.version} of {rule.versionCount}
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-mono-code text-micro-label">
              fired {rule.fired7d}× / 7d
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input type="checkbox" className="sr-only peer" checked={active} onChange={(event) => setActive(event.target.checked)} />
            <span className="inline-block w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-primary-container after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-container" />
            <span className={`ml-2 font-mono-code text-body-sm font-semibold ${active ? "text-secondary" : "text-muted"}`}>{active ? "Active" : "Paused"}</span>
          </label>
        </div>
        <div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface">{rule.title}</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{rule.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="accent">L0 deterministic gate</Badge>
          <span className="font-mono-code text-micro-label text-muted">produces {rule.produces}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReadOnly label="Trigger" icon="bolt">{triggerLabel(rule)}</ReadOnly>
        <ReadOnly label="Edge Type" icon="hub">{rule.edgeType ?? "any"}</ReadOnly>
      </div>
      <ReadOnly label="Condition" icon="rule">{rule.condition}</ReadOnly>
      <div className="flex flex-col gap-1.5">
        <FieldLabel icon="filter_alt">Guards</FieldLabel>
        {rule.guards.length === 0 ? (
          <p className="font-mono-code text-body-sm text-muted">No guards</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {rule.guards.map((guard) => (
              <li key={`${guard.path}-${guard.op}`} className="px-3 py-2 rounded bg-surface-container-lowest/60 font-mono-code text-body-sm text-on-surface-variant">
                <span className="text-on-surface">{guard.path} {guard.op}</span> · {guard.description}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-outline-variant/30">
        <label className="flex flex-col gap-1.5">
          <FieldLabel icon="timer">Grace Period (hours)</FieldLabel>
          <input
            type="number"
            min={0}
            step={1}
            value={grace}
            onChange={(event) => setGrace(event.target.value)}
            className="px-3.5 py-2 rounded bg-surface-container-lowest text-on-surface font-mono-code text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <FieldLabel icon="priority_high">Severity</FieldLabel>
          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value as DbSeverity)}
            className="px-3.5 py-2 rounded bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {RULE_SEVERITIES.map((value) => (
              <option key={value} value={value}>
                {severityLabel[value]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <FieldLabel icon="notifications">Notification Template</FieldLabel>
        <textarea
          rows={3}
          value={template}
          onChange={(event) => setTemplate(event.target.value)}
          className="px-3 py-2 rounded bg-surface-container-lowest text-on-surface font-mono-code text-body-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
        <span className="font-mono-code text-micro-label text-muted">
          Routes to {rule.notify.channels.join(", ") || "no channel"} for {rule.notify.roles.join(", ") || "no role"}
        </span>
      </label>

      <div className="pt-4 border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <span aria-live="polite" className={`font-mono-code text-body-sm ${outcome ? (outcome.ok ? "text-secondary" : "text-error") : "text-muted"}`}>
          {outcome?.text ?? "Saving adds a new version; earlier versions stay on record."}
        </span>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={discard}
            disabled={!dirty || pending}
            className="px-3.5 py-2 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm transition-colors disabled:opacity-50"
          >
            Discard Changes
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || pending}
            className="flex items-center gap-1.5 px-4 py-2 rounded bg-primary-container hover:bg-primary-container/90 text-on-primary-container font-body-sm text-body-sm font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Icon name={pending ? "hourglass_top" : "save"} className="text-[16px]" />
            <span>{pending ? "Saving…" : "Save as New Version"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function PolicyWorkbench({ rules }: { rules: RuleView[] }) {
  const [selectedId, setSelectedId] = useState(rules[0]?.id ?? null);
  const [query, setQuery] = useState("");

  const selected = rules.find((rule) => rule.id === selectedId) ?? rules[0];
  const needle = query.trim().toLowerCase();
  const visible = rules.filter((rule) =>
    `${rule.id} ${rule.title} ${triggerLabel(rule)} ${rule.severity}`.toLowerCase().includes(needle),
  );
  const activeCount = rules.filter((rule) => rule.active).length;

  return (
    <div className="grid grid-cols-12 gap-gutter items-start">
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-3">
        <div className="bg-surface-container-low p-4 rounded-lg shadow-sm flex flex-col gap-3">
          <div className="relative w-full">
            <Icon name="filter_list" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-[16px]" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter rules (by ID, trigger, severity)..."
              className="w-full pl-8 pr-3 py-1.5 rounded bg-surface-container text-on-surface placeholder:text-muted font-mono-code text-body-sm focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between text-on-surface-variant px-1 pt-1 font-label-caps text-label-caps uppercase tracking-wider">
            <span>{rules.length} Registered Rules</span>
            <span className="text-secondary">{activeCount} Active</span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {visible.map((rule) => (
            <PolicyCard key={rule.id} rule={rule} selected={rule.id === selected?.id} onSelect={() => setSelectedId(rule.id)} />
          ))}
          {visible.length === 0 ? (
            <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/40 font-mono-code text-[12px] text-muted text-center">
              No rule matches “{query}”
            </div>
          ) : null}
        </div>
      </div>

      <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
        {selected ? (
          <PolicyEditor key={`${selected.id}-${selected.version}`} rule={selected} />
        ) : (
          <div className="rounded-xl border border-dashed border-outline-variant p-10 text-center">
            <Icon name="gavel" className="text-muted text-[36px]" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface mt-3">No rules configured</h3>
          </div>
        )}
      </div>
    </div>
  );
}

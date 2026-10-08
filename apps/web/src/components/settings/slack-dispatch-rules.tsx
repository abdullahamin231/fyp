"use client";

import { useState, type ChangeEvent } from "react";
import { Icon } from "@/components/ui/icon";

type Rule = {
  id: number;
  icon: string;
  iconClass: string;
  title: string;
  badge: string;
  badgeClass: string;
  desc: string;
  channels: string[];
  channel: string;
  mentions: string[];
  mention: string;
  editable?: boolean;
};

const initialRules: Rule[] = [
  {
    id: 1,
    icon: "crisis_alert",
    iconClass: "bg-error-container text-error",
    title: "Critical & SEV-1 Conflicts",
    badge: "P1",
    badgeClass: "bg-error-container text-error",
    desc: "Triggers instant push on schema breakages and dependency circularities",
    channels: ["#eng-alerts-critical", "#infra-oncall", "#security-ops"],
    channel: "#eng-alerts-critical",
    mentions: ["@here", "@channel", "@oncall-lead", "No mention"],
    mention: "@here",
  },
  {
    id: 2,
    icon: "palette",
    iconClass: "bg-secondary/15 text-secondary",
    title: "Design System & Token Drift",
    badge: "FIGMA SYNC",
    badgeClass: "bg-surface-container-highest text-secondary",
    desc: "Figma-to-Code token mismatch, color deprecation & component deviations",
    channels: ["#design-system-sync", "#core-ui-guild", "#tokens-beta"],
    channel: "#design-system-sync",
    mentions: ["No mention", "@here", "@design-leads"],
    mention: "No mention",
  },
  {
    id: 3,
    icon: "today",
    iconClass: "bg-primary/15 text-primary",
    title: "General Daily Standup Digest",
    badge: "SCHEDULED 09:00",
    badgeClass: "bg-surface-container-highest text-outline font-semibold",
    desc: "Aggregated summary of resolution velocity and unassigned graph links",
    channels: ["#dev-core-updates", "#general", "#all-engineering"],
    channel: "#dev-core-updates",
    mentions: ["No mention", "@here", "@team-leads"],
    mention: "No mention",
  },
];

const newRuleChannels = ["#alerts-general", "#eng-alerts-critical", "#feed-noisy"];
const newRuleMentions = ["No mention", "@here", "@channel"];

const selectClass =
  "w-full pl-3 pr-8 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-mono-code text-[12px] focus:outline-none appearance-none cursor-pointer";

function SelectRow({
  options,
  value,
  onChange,
  minWidth,
  valueClass = "text-on-surface",
  label,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  minWidth: string;
  valueClass?: string;
  label: string;
}) {
  return (
    <div className="relative" style={{ minWidth }}>
      <select
        aria-label={label}
        className={`${selectClass} ${valueClass}`}
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <Icon
        name="expand_more"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none"
      />
    </div>
  );
}

export function SlackDispatchRules() {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [nextId, setNextId] = useState(4);

  function update(id: number, patch: Partial<Rule>) {
    setRules((prev) => prev.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)));
  }

  function addRule() {
    setRules((prev) => [
      ...prev,
      {
        id: nextId,
        icon: "notifications_active",
        iconClass: "bg-tertiary-container/30 text-tertiary",
        title: "New Policy Dispatch Rule",
        badge: "CUSTOM",
        badgeClass: "bg-surface-container-highest text-outline font-bold",
        desc: "User-defined policy trigger",
        channels: newRuleChannels,
        channel: newRuleChannels[0],
        mentions: newRuleMentions,
        mention: newRuleMentions[0],
        editable: true,
      },
    ]);
    setNextId((value) => value + 1);
  }

  return (
    <section className="rounded-xl bg-surface-container-low p-6 shadow-md flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <span className="font-label-caps text-label-caps text-outline uppercase">
              Section 02
            </span>
            <span className="text-outline-variant font-mono-code">•</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Channel Dispatch Mapping
            </h2>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Direct system events and domain conflicts to target channels with calibrated broadcast
            mentions.
          </p>
        </div>
        <button
          onClick={addRule}
          className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-all self-start sm:self-center shadow-md"
        >
          <Icon name="add_circle" className="text-[16px]" />
          Add Channel Dispatch Rule
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="p-4 rounded-xl bg-surface-container hover:bg-surface-container-high/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={`p-2.5 rounded-lg shrink-0 ${rule.iconClass}`}>
                <Icon name={rule.icon} className="text-[20px]" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  {rule.editable ? (
                    <input
                      type="text"
                      value={rule.title}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        update(rule.id, { title: e.target.value })
                      }
                      className="bg-surface-container-lowest px-2 py-0.5 rounded font-body-md text-body-md font-semibold text-on-surface focus:outline-none min-w-0"
                    />
                  ) : (
                    <span className="font-body-md text-body-md font-semibold text-on-surface truncate">
                      {rule.title}
                    </span>
                  )}
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono-code text-[10px] uppercase whitespace-nowrap ${rule.badgeClass}`}
                  >
                    {rule.badge}
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  {rule.desc}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 justify-end">
              <SelectRow
                label={`${rule.title} target channel`}
                options={rule.channels}
                value={rule.channel}
                onChange={(value) => update(rule.id, { channel: value })}
                minWidth="170px"
              />
              <SelectRow
                label={`${rule.title} mention scope`}
                options={rule.mentions}
                value={rule.mention}
                onChange={(value) => update(rule.id, { mention: value })}
                minWidth="120px"
                valueClass={rule.mention === "No mention" ? "text-outline" : "text-tertiary"}
              />
              <div className="flex items-center gap-1">
                <button
                  title="Edit Rule Filter"
                  className="p-1.5 rounded text-outline hover:text-on-surface hover:bg-surface-container-highest transition-colors"
                >
                  <Icon name="tune" className="text-[18px]" />
                </button>
                <button
                  title="Delete Rule"
                  onClick={() => setRules((prev) => prev.filter((item) => item.id !== rule.id))}
                  className="p-1.5 rounded text-outline hover:text-error hover:bg-surface-container-highest transition-colors"
                >
                  <Icon name="delete" className="text-[18px]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

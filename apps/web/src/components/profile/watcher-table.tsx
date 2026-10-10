"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { useToast } from "@/components/ui/toast";
import type { Policy, Severity } from "@/lib/types";

/**
 * DATA HOLE — replace with the policies API.
 * Empty until the endpoint exists; the policy-derived watch rows render
 * nothing and only artifact watches (also empty below) would show.
 */
const policies: Policy[] = [];

type Delivery = "immediate" | "digest";

type WatchTarget = {
  id: string;
  kind: "artifact" | "policy";
  icon: string;
  iconTone: string;
  name: string;
  tag: string;
  tagTone: string;
  ref: string;
  triggers: { label: string; tone: string }[];
  note: string;
  policyOff?: boolean;
};

const severityTagTone: Record<Severity, string> = {
  critical: "bg-error-container/60 text-error font-bold",
  warning: "bg-tertiary-container/60 text-on-tertiary-container font-bold",
  info: "bg-surface-container-highest text-muted font-bold",
};

/** Policy-driven watch rows are derived from the shared policy definitions. */
const policyRows: WatchTarget[] = policies.map((policy) => ({
  id: `watch-${policy.id}`,
  kind: "policy" as const,
  icon: "gavel",
  iconTone:
    policy.severity === "critical"
      ? "text-error"
      : policy.severity === "warning"
        ? "text-tertiary"
        : "text-muted",
  name: `${policy.id}: ${policy.name}`,
  tag: policy.severity.toUpperCase(),
  tagTone: severityTagTone[policy.severity],
  ref: `Trigger: ${policy.trigger}`,
  triggers: [
    {
      label: policy.severity === "critical" ? "Critical findings" : "Warning findings",
      tone: "bg-surface-container-highest text-on-surface font-mono-code",
    },
    {
      label: `Grace ${policy.graceMinutes}m`,
      tone: "bg-surface-container-highest text-tertiary-fixed-dim font-mono-code",
    },
  ],
  note: `Escalation path: ${
    policy.id === "P1" || policy.id === "P4" ? "code owner / assignee" : "reviewer"
  } · ${policy.enabled ? "delivery only for watchers" : "policy disabled by admin"}`,
  policyOff: !policy.enabled,
}));

/**
 * DATA HOLE — replace with the watcher API's artifact watch list.
 * Empty until the endpoint exists; combined with the (empty) policy rows the
 * table renders its empty state.
 */
const initialTargets: WatchTarget[] = [...policyRows];

type RowState = { delivery: Delivery; muted: boolean };

const initialRowState: Record<string, RowState> = Object.fromEntries(
  initialTargets.map((target) => [
    target.id,
    {
      delivery: target.kind === "policy" && target.id !== "watch-P1" ? "digest" : "immediate",
      muted: Boolean(target.policyOff),
    },
  ]),
);

/**
 * Watched artifacts & domains table: per-target mute + immediate/digest
 * delivery, including the per-policy (P1–P4) watch settings.
 */
export function WatcherTable() {
  const toast = useToast();
  // DATA HOLE: the setter returns with the watcher API's create call.
  const [targets] = useState<WatchTarget[]>(initialTargets);
  const [rowState, setRowState] = useState<Record<string, RowState>>(initialRowState);
  const [filter, setFilter] = useState<string>("all");

  const counts = {
    all: targets.length,
    artifact: targets.filter((target) => target.kind === "artifact").length,
    policy: targets.filter((target) => target.kind === "policy").length,
  };

  const visible = targets.filter((target) =>
    filter === "all" ? true : target.kind === filter,
  );

  function toggleMute(target: WatchTarget) {
    const next = !rowState[target.id]?.muted;
    setRowState((prev) => ({ ...prev, [target.id]: { ...prev[target.id], muted: next } }));
    toast(
      next
        ? `${target.name} muted for 24 hours`
        : `${target.name} unmuted and monitoring live`,
      { icon: next ? "volume_off" : "notifications_active", tone: next ? "neutral" : "success" },
    );
  }

  function setDelivery(target: WatchTarget, delivery: Delivery) {
    setRowState((prev) => ({ ...prev, [target.id]: { ...prev[target.id], delivery } }));
    toast(
      delivery === "immediate"
        ? `${target.name}: immediate delivery enabled`
        : `${target.name}: rolled into the daily digest`,
      { icon: delivery === "immediate" ? "bolt" : "dynamic_feed" },
    );
  }

  /**
   * DATA HOLE — replace with the watcher API's create-subscription call.
   * The picker that chooses which artifact to watch isn't wired yet, so this
   * intentionally creates no record.
   */
  function addWatcher() {
    toast("Connect the watcher API to add a subscription", { icon: "add_alert" });
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
            Watched Artifacts &amp; Domains
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Active watcher subscriptions triggering smart notifications and triage assignments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SegmentedTabs
            initialId="all"
            onChange={setFilter}
            tabs={[
              { id: "all", label: "All", count: counts.all },
              { id: "artifact", label: "Artifacts", count: counts.artifact },
              { id: "policy", label: "Policies", count: counts.policy },
            ]}
          />
          <button
            type="button"
            onClick={addWatcher}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary-container hover:bg-inverse-primary text-on-primary font-body-sm text-body-sm font-semibold transition-colors shadow-sm"
          >
            <Icon name="add_alert" className="text-[18px]" />
            <span>Add Watcher</span>
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-surface-container overflow-hidden shadow-md">
        <div className="px-4 py-3 bg-surface-container-high grid grid-cols-12 gap-2 items-center text-on-surface-variant font-label-caps text-label-caps tracking-wider uppercase">
          <div className="col-span-5">Artifact / Target Entity</div>
          <div className="col-span-4">Watch Triggers &amp; Scope</div>
          <div className="col-span-3 text-right">Subscription Status</div>
        </div>

        <div>
          {visible.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Icon name="notifications_off" className="text-[28px] text-muted mb-2" />
              <p className="font-body-md text-body-md font-semibold text-on-surface">
                No watcher subscriptions
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Add a watcher to receive smart notifications and triage assignments.
              </p>
            </div>
          ) : null}
          {visible.map((target, index) => {
            const state = rowState[target.id] ?? { delivery: "immediate", muted: false };
            const chip = target.policyOff
              ? { label: "Policy off", className: "bg-surface-container-highest text-muted" }
              : state.muted
                ? { label: "Muted 24h", className: "bg-surface-container-highest text-muted" }
                : {
                    label: target.kind === "policy" ? "Lead Sub" : "Active Watch",
                    className: "bg-secondary/10 text-secondary",
                  };
            return (
              <div
                key={target.id}
                className={`px-4 py-3 hover:bg-surface-bright/50 transition-colors flex items-start justify-between gap-2 group ${
                  index % 2 === 1 ? "bg-surface-container-low/30" : ""
                }`}
              >
                <div className="w-5/12 flex items-start gap-3 min-w-0 pr-2">
                  <div
                    className={`w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center ${target.iconTone} flex-shrink-0 mt-0.5`}
                  >
                    <Icon name={target.icon} className="text-[18px]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-body-md text-body-md font-semibold text-on-surface truncate">
                        {target.name}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded font-mono-code text-micro-label ${target.tagTone}`}
                      >
                        {target.tag}
                      </span>
                    </div>
                    <span className="font-mono-code text-[12px] text-muted block truncate">
                      {target.ref}
                    </span>
                  </div>
                </div>

                <div className="w-4/12 pr-2">
                  <div className="flex flex-wrap gap-1.5">
                    {target.triggers.map((trigger) => (
                      <span
                        key={trigger.label}
                        className={`px-2 py-0.5 rounded text-micro-label ${trigger.tone}`}
                      >
                        {trigger.label}
                      </span>
                    ))}
                  </div>
                  <span className="font-body-sm text-micro-label text-on-surface-variant mt-1 block">
                    {target.note}
                  </span>
                </div>

                <div className="w-3/12 flex flex-col items-end gap-2">
                  <div className="flex items-center justify-end gap-2">
                    <span
                      className={`px-2 py-0.5 rounded font-label-caps text-eyebrow font-bold uppercase ${chip.className}`}
                    >
                      {chip.label}
                    </span>
                    <button
                      type="button"
                      title={state.muted ? "Unmute watcher" : "Mute temporarily"}
                      aria-label={state.muted ? "Unmute watcher" : "Mute watcher"}
                      disabled={target.policyOff}
                      onClick={() => toggleMute(target)}
                      className={`p-1 rounded transition-colors disabled:opacity-40 ${
                        state.muted
                          ? "text-muted hover:text-on-surface hover:bg-surface-container-highest"
                          : "text-secondary hover:text-on-surface hover:bg-surface-container-highest"
                      }`}
                    >
                      <Icon
                        name={state.muted ? "notifications_off" : "notifications_active"}
                        className="text-[18px]"
                      />
                    </button>
                  </div>
                  <label className="flex items-center gap-1.5">
                    <span className="sr-only">Delivery for {target.name}</span>
                    <select
                      value={state.delivery}
                      disabled={target.policyOff}
                      onChange={(event) =>
                        setDelivery(target, event.target.value as Delivery)
                      }
                      className="bg-surface-container-highest hover:bg-surface-bright text-on-surface font-mono-code text-micro-label px-2 py-0.5 pr-6 rounded focus:outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <option value="immediate">Immediate</option>
                      <option value="digest">Daily digest</option>
                    </select>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

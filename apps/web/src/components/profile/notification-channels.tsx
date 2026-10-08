"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";

type Cadence = "immediate" | "hourly" | "daily";

const cadences: { id: Cadence; label: string }[] = [
  { id: "immediate", label: "Immediate" },
  { id: "hourly", label: "Hourly digest" },
  { id: "daily", label: "Daily digest" },
];

const roles = [
  { id: "pm", label: "PM" },
  { id: "owner", label: "Code owner / assignee" },
  { id: "designer", label: "Designer" },
  { id: "reviewer", label: "Reviewer" },
];

const density = [
  { day: "Mon", height: "40%", alerts: 4 },
  { day: "Tue", height: "75%", alerts: 9 },
  { day: "Wed", height: "30%", alerts: 3 },
  { day: "Thu", height: "100%", alerts: 14, peak: true },
  { day: "Fri", height: "50%", alerts: 6 },
  { day: "Sat", height: "10%", alerts: 1 },
  { day: "Sun", height: "15%", alerts: 1 },
];

const toggles = [
  {
    id: "auto" as const,
    label: "Auto-watch authored PRs",
    description: "Automatically subscribe to drift alerts for code you author.",
    badge: null as string | null,
  },
  {
    id: "mute" as const,
    label: "Mute on Resolved",
    description: "Silence downstream conflict threads once a PR or token merge closes.",
    badge: null as string | null,
  },
  {
    id: "sev" as const,
    label: "SEV-1 Escalation Bridge",
    description: "Escalate critical conflicts past the grace window immediately.",
    badge: "URGENT",
  },
];

type ToggleId = (typeof toggles)[number]["id"];

/**
 * Personal notification routing: global toggles, immediate vs digest cadence,
 * the role the notification is addressed as, and a 7-day density histogram.
 */
export function NotificationChannels() {
  const toast = useToast();
  const [enabled, setEnabled] = useState<Record<ToggleId, boolean>>({
    auto: true,
    mute: true,
    sev: true,
  });
  const [cadence, setCadence] = useState<Cadence>("immediate");
  const [role, setRole] = useState<string>("owner");

  function flip(id: ToggleId, label: string) {
    const next = !enabled[id];
    setEnabled((prev) => ({ ...prev, [id]: next }));
    toast(next ? `${label} activated` : `${label} disabled`, {
      icon: next ? "toggle_on" : "toggle_off",
      tone: next ? "success" : "neutral",
    });
  }

  return (
    <div className="flex flex-col space-y-4">
      <div>
        <h3 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
          Notification Channels
        </h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Global routing behavior for personal alerts.
        </p>
      </div>

      <div className="rounded-xl bg-surface-container p-5 flex flex-col space-y-5 shadow-md">
        {toggles.map((toggle, index) => (
          <div key={toggle.id}>
            {index > 0 ? <div className="h-px bg-surface-container-highest mb-5" /> : null}
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-body-md text-body-md font-semibold text-on-surface">
                    {toggle.label}
                  </span>
                  {toggle.badge ? (
                    <span className="px-1 py-0.2 rounded bg-error-container text-error font-label-caps text-[9px] font-bold">
                      {toggle.badge}
                    </span>
                  ) : null}
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {toggle.description}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enabled[toggle.id]}
                aria-label={toggle.label}
                onClick={() => flip(toggle.id, toggle.label)}
                className={`w-11 h-6 rounded-full relative p-0.5 transition-colors focus:outline-none flex-shrink-0 cursor-pointer ${
                  enabled[toggle.id] ? "bg-secondary" : "bg-surface-container-highest"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full shadow block transition-transform ${
                    enabled[toggle.id] ? "translate-x-5 bg-on-secondary" : "translate-x-0 bg-outline"
                  }`}
                />
              </button>
            </div>
          </div>
        ))}

        {/* Digest vs immediate cadence */}
        <div className="h-px bg-surface-container-highest" />
        <div className="flex flex-col gap-2">
          <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider">
            Delivery Cadence
          </span>
          <div className="grid grid-cols-3 gap-1.5 bg-surface-container-lowest p-1 rounded-lg">
            {cadences.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setCadence(option.id);
                  toast(
                    option.id === "immediate"
                      ? "Alerts will be delivered immediately"
                      : `Alerts rolled into the ${option.label.toLowerCase()}`,
                    { icon: option.id === "immediate" ? "bolt" : "dynamic_feed" },
                  );
                }}
                className={`px-2 py-1.5 rounded font-body-sm text-body-sm transition ${
                  cadence === option.id
                    ? "bg-primary-container text-on-primary-container font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Role the delivery is addressed as */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider">
              Deliver Notifications As
            </span>
            <span className="font-mono-code text-[11px] text-secondary">delivery only</span>
          </div>
          <div className="relative">
            <select
              value={role}
              onChange={(event) => {
                setRole(event.target.value);
                const label = roles.find((option) => option.id === event.target.value)?.label;
                toast(`Delivery role set to ${label}`, { icon: "badge" });
              }}
              className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container cursor-pointer transition"
            >
              {roles.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <Icon
              name="expand_more"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none"
            />
          </div>
          <p className="font-body-sm text-[11px] text-on-surface-variant">
            Watchers receive delivery only — this role selects which notification template your
            inbox, Slack DMs and digests use.
          </p>
        </div>

        {/* Notification density sparkline */}
        <div className="p-3.5 rounded-lg bg-surface-container-high flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-outline">
              Notification Density (7 Days)
            </span>
            <span className="font-mono-code text-[11px] text-secondary">38 events</span>
          </div>
          <div className="w-full h-12 flex items-end gap-1.5 pt-2">
            {density.map((bar) => (
              <div
                key={bar.day}
                title={`${bar.day}: ${bar.alerts} alerts`}
                className={`flex-1 rounded-t transition-colors ${
                  bar.peak
                    ? "bg-secondary hover:bg-secondary-fixed"
                    : "bg-surface-container-highest hover:bg-primary"
                }`}
                style={{ height: bar.height }}
              />
            ))}
          </div>
          <div className="flex justify-between text-outline font-mono-code text-[10px]">
            <span>Mon</span>
            <span>Thu (Release)</span>
            <span>Sun</span>
          </div>
        </div>
      </div>
    </div>
  );
}

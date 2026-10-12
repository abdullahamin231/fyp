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

/**
 * DATA HOLE — replace with the notification-density API.
 * Empty until the endpoint exists; the histogram renders its empty state.
 */
interface DensityBar {
  day: string;
  height: string;
  alerts: number;
  peak?: boolean;
}
const density: DensityBar[] = [];

const toggles = [
  {
    id: "auto" as const,
    label: "Auto-watch authored PRs",
    badge: null as string | null,
  },
  {
    id: "mute" as const,
    label: "Mute on Resolved",
    badge: null as string | null,
  },
  {
    id: "sev" as const,
    label: "SEV-1 Escalation Bridge",
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
      </div>

      <div className="rounded-xl bg-surface-container p-4 flex flex-col space-y-4 shadow-md">
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
                    <span className="px-1 py-0.2 rounded bg-error-container text-error font-label-caps text-eyebrow font-bold">
                      {toggle.badge}
                    </span>
                  ) : null}
                </div>
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
            <span className="font-mono-code text-micro-label text-secondary">delivery only</span>
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
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted text-[18px] pointer-events-none"
            />
          </div>
        </div>

        {/* Notification density sparkline */}
        <div className="p-3.5 rounded-lg bg-surface-container-high flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-muted">
              Notification Density (7 Days)
            </span>
            <span className="font-mono-code text-micro-label text-secondary">
              {density.length === 0
                ? "no data"
                : `${density.reduce((sum, bar) => sum + bar.alerts, 0)} events`}
            </span>
          </div>
          {density.length === 0 ? (
            <p className="w-full h-12 flex items-center justify-center text-micro-label text-muted font-mono-code">
              No notifications delivered in the last 7 days.
            </p>
          ) : (
            <>
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
              <div className="flex justify-between text-muted font-mono-code text-micro-label">
                <span>{density[0]?.day}</span>
                <span>{density[Math.floor(density.length / 2)]?.day}</span>
                <span>{density[density.length - 1]?.day}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

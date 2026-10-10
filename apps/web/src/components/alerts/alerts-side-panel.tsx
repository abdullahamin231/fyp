import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { FrequencySeries, Integration, ResolutionLeader } from "@/lib/domain/alerts";

/**
 * DATA HOLE — replace with the alerts API.
 *
 * All three rails are empty until their endpoints exist: the sparkline shows
 * its placeholder baseline, and the resolution / integrations lists render
 * their empty copy.
 */
const frequency: FrequencySeries = { points: [], delta: "", axis: [] };
const resolutionLeaders: ResolutionLeader[] = [];
const integrations: Integration[] = [];

/** Right rail of the alerts screen: frequency trend, active resolution, integrations. */
export function AlertsSidePanel() {
  const hasSeries = frequency.points.length > 1;
  const max = hasSeries ? Math.max(...frequency.points) : 1;
  const points = frequency.points.map((value, index) => ({
    x: (index / (frequency.points.length - 1)) * 100,
    y: 36 - (value / max) * 30,
  }));
  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L100,40 L0,40 Z`;

  return (
    <aside className="w-full xl:w-[320px] flex flex-col gap-gutter shrink-0">
      {/* Conflict frequency */}
      <div className="bg-surface-container border border-outline-variant rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-body-md text-on-surface">Conflict Frequency</h3>
          {frequency.delta ? (
            <span className="text-tertiary text-body-sm font-bold">{frequency.delta}</span>
          ) : null}
        </div>
        {hasSeries ? (
          <>
            <div className="h-32 w-full relative group">
              <svg
                className="w-full h-full stroke-tertiary fill-none stroke-[2] overflow-visible"
                viewBox="0 0 100 40"
                preserveAspectRatio="none"
              >
                <path d={line} />
                <path className="fill-tertiary/10 stroke-none" d={area} />
              </svg>
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-t border-outline-variant w-full" />
                <div className="border-t border-outline-variant w-full" />
                <div className="border-t border-outline-variant w-full" />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-eyebrow text-on-surface-variant font-mono-code uppercase">
              {frequency.axis.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </>
        ) : (
          <p className="h-32 flex items-center justify-center text-body-sm text-muted text-center">
            No frequency history yet — the trend appears once the alerts API returns data.
          </p>
        )}
      </div>

      {/* Active resolution */}
      <div className="bg-surface-container border border-outline-variant rounded-xl p-4">
        <h3 className="font-bold text-body-md text-on-surface mb-4">Active Resolution</h3>
        <div className="space-y-4">
          {resolutionLeaders.length === 0 ? (
            <p className="text-body-sm text-muted">
              Nobody is assigned to an open conflict right now.
            </p>
          ) : (
            resolutionLeaders.map((leader) => (
              <div key={leader.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-mono-code text-[12px] font-bold shrink-0">
                    {leader.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-body-sm font-bold truncate">{leader.name}</p>
                    <p className="text-micro-label text-on-surface-variant">
                      {leader.resolved} resolved · {leader.open} open
                    </p>
                  </div>
                </div>
                <Icon
                  name={leader.verified ? "verified" : "pending"}
                  className={
                    leader.verified ? "text-secondary text-sm" : "text-on-surface-variant text-sm"
                  }
                />
              </div>
            ))
          )}
        </div>
        <Link
          href="/activity"
          className="block w-full mt-6 py-2 border border-outline-variant text-micro-label font-bold uppercase tracking-widest rounded-lg hover:bg-surface-container-high transition-colors text-center"
        >
          View All Activity
        </Link>
      </div>

      {/* Integrations */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2 text-on-surface-variant">
          <Icon name="sync" className="text-xs" />
          <span className="text-micro-label font-bold uppercase">Integrations</span>
        </div>
        <div className="space-y-2">
          {integrations.length === 0 ? (
            <p className="text-body-sm text-muted">
              No tools connected yet — connect GitHub, Figma or Jira to start ingesting.
            </p>
          ) : (
            integrations.map((integration) => (
              <div key={integration.name} className="flex justify-between text-body-sm">
                <span>{integration.name}</span>
                <span
                  className={`font-bold ${
                    integration.connected ? "text-secondary" : "text-tertiary"
                  }`}
                >
                  {integration.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}

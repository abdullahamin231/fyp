import type { ReactNode } from "react";

/** Label + value tile used in the dashboard / evaluation metric rows. */
export function StatCard({
  label,
  value,
  delta,
  deltaTone = "success",
  hint,
  icon,
  className = "",
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "success" | "critical" | "neutral";
  hint?: string;
  icon?: string;
  className?: string;
}) {
  const deltaClass =
    deltaTone === "success"
      ? "text-secondary"
      : deltaTone === "critical"
        ? "text-error"
        : "text-on-surface-variant";

  return (
    <div
      className={`p-4 rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between relative overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
          {label}
        </span>
        {icon ? (
          <span className="material-symbols-outlined text-outline text-[18px]">{icon}</span>
        ) : null}
      </div>
      <div className="flex items-end justify-between gap-2 mt-1">
        <div className="min-w-0">
          <div className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
            {value}
          </div>
          {hint ? (
            <div className="font-mono-code text-[11px] text-on-surface-variant truncate">{hint}</div>
          ) : null}
        </div>
        {delta ? (
          <span className={`font-mono-code text-[11px] font-bold ${deltaClass}`}>{delta}</span>
        ) : null}
      </div>
    </div>
  );
}

/** Page title row: headline + optional description + trailing actions. */
export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  meta,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumb?: string;
  /** Optional chip/pill row rendered under the description (status, sync state…). */
  meta?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {breadcrumb ? (
          <p className="font-mono-code text-[11px] text-on-surface-variant mb-1">{breadcrumb}</p>
        ) : null}
        <h2 className="font-headline-lg text-headline-lg text-on-surface">{title}</h2>
        {description ? (
          <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-3xl">
            {description}
          </p>
        ) : null}
        {meta ? <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div> : null}
      </div>
      {actions ? <div className="flex items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}

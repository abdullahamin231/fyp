import type { ReactNode } from "react";

/** Frosted/solid panel used as the base container on every screen. */
export function Panel({
  children,
  className = "",
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "aside" | "article";
}) {
  // `shadow-sm` is the default, but a caller-supplied `shadow-*` wins instead of
  // fighting it in the stylesheet.
  const shadow = /(^|\s)shadow/.test(className) ? "" : "shadow-sm";
  return (
    <Tag className={`rounded-xl bg-surface-container-low ${shadow} ${className}`}>{children}</Tag>
  );
}

/** Panel with a label-caps heading row and optional trailing content. */
export function PanelHeader({
  title,
  description,
  action,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 px-4 pt-4 pb-3 ${className}`}>
      <div className="min-w-0">
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
          {title}
        </h3>
        {description ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 flex items-center gap-2">{action}</div> : null}
    </div>
  );
}

/** Small uppercase kicker used above sections. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
      {children}
    </span>
  );
}

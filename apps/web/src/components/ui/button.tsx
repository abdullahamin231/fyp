import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary hover:opacity-90 active:scale-95 shadow-sm",
  outline:
    "border border-outline-variant text-on-surface hover:bg-surface-container-high active:scale-95",
  ghost: "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
  danger: "bg-error-container text-on-error-container hover:opacity-90 active:scale-95",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  leadingIcon,
  ...rest
}: {
  children: ReactNode;
  variant?: Variant;
  leadingIcon?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg font-bold text-body-sm transition-all ${variants[variant]} ${className}`}
      {...rest}
    >
      {leadingIcon ? (
        <span className="material-symbols-outlined text-[16px]">{leadingIcon}</span>
      ) : null}
      {children}
    </button>
  );
}

/** Icon-only square button used in toolbars. */
export function IconButton({
  icon,
  title,
  className = "",
  ...rest
}: {
  icon: string;
  title: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      title={title}
      aria-label={title}
      className={`p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition ${className}`}
      {...rest}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </button>
  );
}

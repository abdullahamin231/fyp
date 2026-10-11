import type { ReactNode } from "react";
import type { ToolKind } from "@/lib/types";

export type Tone = "critical" | "warning" | "info" | "success" | "neutral" | "accent";

const tones: Record<Tone, string> = {
  critical: "bg-error-container text-error",
  warning: "bg-tertiary-container text-on-tertiary-container",
  info: "bg-primary-container text-on-primary-container",
  success: "bg-secondary/15 text-secondary",
  neutral: "bg-surface-container-highest text-on-surface-variant",
  accent: "bg-primary/15 text-primary",
};

const dotColors: Record<Tone, string> = {
  critical: "bg-error",
  warning: "bg-tertiary",
  info: "bg-primary",
  success: "bg-secondary",
  neutral: "bg-outline",
  accent: "bg-primary",
};

/** Pill badge in the label-caps style used across the Stitch screens. */
export function Badge({
  children,
  tone = "neutral",
  pulse = false,
  className = "",
  icon,
}: {
  children: ReactNode;
  tone?: Tone;
  pulse?: boolean;
  className?: string;
  icon?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-label-caps text-label-caps uppercase tracking-wider font-bold ${tones[tone]} ${className}`}
    >
      {pulse ? <span className={`w-1.5 h-1.5 rounded-full animate-ping ${dotColors[tone]}`} /> : null}
      {icon ? <span className="msym text-[13px]">{icon}</span> : null}
      {children}
    </span>
  );
}

const toolMeta: Record<ToolKind, { color: string; icon?: string; label: string }> = {
  figma: { color: "#f24e1e", icon: "draw", label: "Figma" },
  github: { color: "#4fdbc8", icon: "merge_type", label: "GitHub" },
  jira: { color: "#c3c0ff", icon: "confirmation_number", label: "Jira" },
  slack: { color: "#e01e5a", icon: "chat", label: "Slack" },
  git: { color: "#f05033", icon: "hub", label: "Commit" },
  test: { color: "#ffb95f", icon: "experiment", label: "Test" },
};

/** Cross-tool artifact pill (Figma node, GitHub PR, Jira ticket…). */
export function ToolPill({
  tool,
  children,
  title,
  className = "",
}: {
  tool: ToolKind;
  children: ReactNode;
  title?: string;
  className?: string;
}) {
  const meta = toolMeta[tool];
  return (
    <span
      title={title ?? meta.label}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-highest hover:bg-surface-bright transition text-on-surface font-mono-code text-micro-label ${className}`}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: meta.color }}
        aria-hidden
      />
      {children}
    </span>
  );
}

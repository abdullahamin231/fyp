"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { ProviderStatus } from "@/lib/data/integrations";
import type { RuleView } from "@/lib/data/rules";

export type ConnectKey = "workspace" | "figma" | "github" | "jira";
export type ProviderKey = Exclude<ConnectKey, "workspace">;
export type AuthState = "idle" | "authorizing" | "connected";

const panelMeta: Record<ProviderKey, { title: string; icon: string; authLabel: string; vendor: string }> = {
  figma: {
    title: "Connect Figma",
    icon: "palette",
    authLabel: "Authorize with Figma",
    vendor: "Figma",
  },
  github: {
    title: "Connect GitHub Organization",
    icon: "code",
    authLabel: "Authorize with GitHub",
    vendor: "GitHub",
  },
  jira: {
    title: "Connect Atlassian Jira",
    icon: "task_alt",
    authLabel: "Authorize with Atlassian",
    vendor: "Atlassian",
  },
};

/** The scopes the provider actually granted, as stored on the connection. */
function ScopeMatrix({ scopes }: { scopes: string[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-label-caps text-label-caps uppercase text-muted">
          Granted Scopes
        </span>
        <span className="font-mono-code text-micro-label text-secondary flex items-center gap-1">
          <Icon name="lock_reset" className="text-[14px]" />
          Read-Only Requested
        </span>
      </div>
      {scopes.length === 0 ? (
        <p className="bg-surface-container-low p-3.5 rounded font-mono-code text-micro-label text-muted">
          Scopes appear here once the provider grants them.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {scopes.map((scope) => (
            <div
              key={scope}
              className="bg-surface-container-low p-3.5 rounded flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon name="visibility" className="text-secondary text-[18px] shrink-0" />
                <div className="font-mono-code text-[13px] text-on-surface font-medium">{scope}</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container-highest font-mono-code text-micro-label text-on-surface-variant shrink-0">
                Granted
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AuthBox({
  state,
  callback,
  buttonLabel,
  authorizingLabel = "Redirecting to the provider's consent screen...",
  connectedLabel,
  onAuthorize,
  disabled = false,
}: {
  state: AuthState;
  callback?: string;
  buttonLabel: string;
  authorizingLabel?: string;
  connectedLabel: string;
  onAuthorize: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="bg-surface-container-lowest p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            state === "connected" ? "bg-secondary/20" : "bg-surface-container-high"
          }`}
        >
          <Icon
            name={
              state === "connected"
                ? "check"
                : state === "authorizing"
                  ? "sync"
                  : "radio_button_unchecked"
            }
            className={`text-[18px] ${
              state === "connected" ? "text-secondary" : "text-muted"
            } ${state === "authorizing" ? "animate-spin" : ""}`}
          />
        </div>
        <div className="min-w-0">
          <div
            className={`font-body-sm font-semibold ${
              state === "connected" ? "text-secondary" : "text-on-surface"
            }`}
          >
            {state === "idle"
              ? "Awaiting consent"
              : state === "authorizing"
                ? authorizingLabel
                : connectedLabel}
          </div>
          {callback ? (
            <div className="font-mono-code text-micro-label text-muted truncate">Callback: {callback}</div>
          ) : null}
        </div>
      </div>
      <button
        type="button"
        disabled={state !== "idle" || disabled}
        onClick={onAuthorize}
        className={
          state === "connected"
            ? "px-4 py-2 rounded bg-secondary/20 text-secondary font-label-caps uppercase tracking-wider font-bold flex items-center gap-1.5"
            : state === "authorizing"
              ? "px-4 py-2 rounded bg-surface-container-highest text-muted font-label-caps uppercase tracking-wider font-bold cursor-not-allowed flex items-center gap-2"
              : "px-4 py-2 rounded bg-secondary text-on-secondary hover:bg-secondary-container transition-colors flex items-center gap-2 font-label-caps uppercase tracking-wider font-bold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        }
      >
        {state === "connected" ? (
          <>
            <Icon name="check_circle" className="text-[16px]" />
            Connected
          </>
        ) : state === "authorizing" ? (
          <>
            <Icon name="refresh" className="text-[16px] animate-spin" />
            Authorizing...
          </>
        ) : (
          <>
            <Icon name="open_in_new" className="text-[16px]" />
            {buttonLabel}
          </>
        )}
      </button>
    </div>
  );
}

function PanelFrame({ children }: { children: ReactNode }) {
  return <div className="bg-surface-container rounded-xl shadow-md flex flex-col gap-4 pb-5">{children}</div>;
}

function StepHeader({
  icon,
  title,
  chip,
}: {
  icon: string;
  title: string;
  chip: string;
}) {
  return (
    <div className="flex items-center justify-between bg-surface-container-lowest/50 p-4 rounded-t-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
          <Icon name={icon} className="text-primary text-[24px]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-headline-md text-headline-md text-on-surface">{title}</h2>
            <span className="px-2 py-0.5 rounded bg-tertiary-container text-on-tertiary-container font-mono-code text-eyebrow uppercase font-bold tracking-wider">
              Required
            </span>
          </div>
        </div>
      </div>
      <span className="px-2 py-1 rounded bg-surface-container-highest text-on-surface-variant font-mono-code text-micro-label">
        {chip}
      </span>
    </div>
  );
}

/* --------------------------------------------------------------- step panels */

function WorkspacePanel({
  name,
  slug,
  created,
  onName,
  onSlug,
  auth,
  onValidate,
}: {
  name: string;
  slug: string;
  created: boolean;
  onName: (value: string) => void;
  onSlug: (value: string) => void;
  auth: AuthState;
  onValidate: () => void;
}) {
  return (
    <PanelFrame>
      <StepHeader icon="corporate_fare" title="Name Your Workspace" chip={created ? "Created" : "Draft"} />
      <div className="flex flex-col gap-4 px-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="workspace-name"
            className="font-label-caps text-label-caps uppercase text-muted"
          >
            Workspace Display Name
          </label>
          <div className="flex items-center bg-surface-container-lowest rounded px-3 py-2">
            <Icon name="domain" className="text-muted text-[18px] mr-2" />
            <input
              id="workspace-name"
              value={name}
              readOnly={created}
              onChange={(event) => onName(event.target.value)}
              placeholder="Workspace display name"
              className="bg-transparent text-on-surface font-mono-code text-mono-code focus:outline-none flex-1 font-semibold"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="workspace-slug"
            className="font-label-caps text-label-caps uppercase text-muted"
          >
            Workspace Slug
          </label>
          <div className="flex items-center bg-surface-container-lowest rounded px-3 py-2">
            <span className="text-muted font-mono-code text-mono-code select-none mr-1">
              unify.dev/org/
            </span>
            <input
              id="workspace-slug"
              value={slug}
              readOnly={created}
              onChange={(event) => onSlug(event.target.value)}
              placeholder="workspace-slug"
              className="bg-transparent text-on-surface font-mono-code text-mono-code focus:outline-none flex-1 font-semibold"
            />
          </div>
          <span className="font-mono-code text-micro-label text-muted">
            Lowercase letters, numbers and hyphens.
          </span>
        </div>

        <AuthBox
          state={auth}
          buttonLabel="Validate & Create"
          authorizingLabel="Creating workspace..."
          connectedLabel={`Workspace ${slug} created`}
          onAuthorize={onValidate}
          disabled={!name.trim() || !slug}
        />
      </div>
    </PanelFrame>
  );
}

function ConnectPanel({
  tool,
  status,
  auth,
  origin,
  slug,
  onAuthorize,
}: {
  tool: ProviderKey;
  status: ProviderStatus | undefined;
  auth: AuthState;
  origin: string;
  slug: string;
  onAuthorize: () => void;
}) {
  const meta = panelMeta[tool];
  const registered = status?.appRegistered ?? false;

  return (
    <PanelFrame>
      <StepHeader icon={meta.icon} title={meta.title} chip={tool === "jira" ? "OAuth 2.0 (3LO)" : "OAuth 2.0"} />

      <div className="flex flex-col gap-4 px-4">
        {!registered && auth !== "connected" ? (
          <p className="bg-surface-container-low p-3.5 rounded text-body-sm text-on-surface-variant">
            Register this workspace&apos;s {meta.vendor} OAuth app before authorizing.{" "}
            <Link
              href={`/settings/integrations?workspace=${encodeURIComponent(slug)}`}
              className="text-primary hover:underline"
            >
              Open Provider Apps
            </Link>
          </p>
        ) : null}

        <ScopeMatrix scopes={status?.scopes ?? []} />

        <AuthBox
          state={auth}
          callback={`${origin}/api/integrations/${tool}/callback`}
          buttonLabel={meta.authLabel}
          connectedLabel={status?.accountName ? `Connected as ${status.accountName}` : "Connected"}
          onAuthorize={onAuthorize}
          disabled={!registered}
        />
      </div>
    </PanelFrame>
  );
}

const severityChip: Record<string, string> = {
  critical: "bg-error-container text-error",
  high: "bg-error-container text-error",
  medium: "bg-tertiary-container text-on-tertiary-container",
  low: "bg-surface-container-highest text-on-surface-variant",
};

function RulesPanel({ rules }: { rules: RuleView[] }) {
  const active = rules.filter((rule) => rule.active);

  return (
    <PanelFrame>
      <StepHeader icon="gavel" title="Active Policies" chip={`${active.length} active`} />
      <div className="flex flex-col gap-4 px-4">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-label-caps uppercase text-muted">
            Rules evaluated on incoming events
          </span>
          <span className="font-mono-code text-micro-label text-secondary flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Grace windows enforced
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {rules.length === 0 ? (
            <p className="bg-surface-container-low p-3.5 rounded font-mono-code text-micro-label text-muted">
              No rules are registered.
            </p>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className={`bg-surface-container-low p-3.5 rounded flex items-start gap-3 ${rule.active ? "" : "opacity-60"}`}
              >
                <Icon
                  name={rule.active ? "check_circle" : "pause_circle"}
                  className={`text-[18px] mt-0.5 ${rule.active ? "text-secondary" : "text-muted"}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono-code text-[13px] text-on-surface font-semibold">
                      {rule.id}: {rule.title}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-mono-code text-eyebrow font-bold uppercase ${severityChip[rule.severity]}`}
                    >
                      {rule.severity}
                    </span>
                    {!rule.active ? (
                      <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-muted font-mono-code text-eyebrow uppercase">
                        paused
                      </span>
                    ) : null}
                  </div>
                  <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">{rule.description}</p>
                  <span className="font-mono-code text-micro-label text-muted block mt-1.5">
                    trigger: {rule.trigger.on} · grace {rule.gracePeriodHours}h · v{rule.version}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <Link href="/policies" className="font-mono-code text-[12px] text-primary hover:underline">
            Configure policies →
          </Link>
          <Link href="/conflicts" className="font-mono-code text-[12px] text-primary hover:underline">
            Open Conflict Inbox →
          </Link>
        </div>
      </div>
    </PanelFrame>
  );
}

/* ------------------------------------------------------------------ exports */
export function ActiveStepPanel({
  step,
  auth,
  onAuthorize,
  origin,
  providers,
  workspace,
  rules,
}: {
  step: number;
  auth: Record<ConnectKey, AuthState>;
  onAuthorize: (key: ConnectKey) => void;
  origin: string;
  providers: ProviderStatus[];
  workspace: {
    name: string;
    slug: string;
    created: boolean;
    setName: (value: string) => void;
    setSlug: (value: string) => void;
  };
  rules: RuleView[];
}) {
  if (step === 1) {
    return (
      <WorkspacePanel
        name={workspace.name}
        slug={workspace.slug}
        created={workspace.created}
        onName={workspace.setName}
        onSlug={workspace.setSlug}
        auth={auth.workspace}
        onValidate={() => onAuthorize("workspace")}
      />
    );
  }
  if (step === 5) return <RulesPanel rules={rules} />;
  const tool = (["figma", "github", "jira"] as const)[step - 2];
  return (
    <ConnectPanel
      tool={tool}
      status={providers.find((p) => p.provider === tool)}
      auth={auth[tool]}
      origin={origin}
      slug={workspace.slug}
      onAuthorize={() => onAuthorize(tool)}
    />
  );
}

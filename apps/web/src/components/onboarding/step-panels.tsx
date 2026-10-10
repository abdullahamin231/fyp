"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import type { Policy, PolicyId } from "@/lib/types";

/**
 * DATA HOLE — replace with the policies API.
 * Empty until the endpoint exists; the policy checklist renders nothing and
 * the staged counter reads zero.
 */
const policies: Policy[] = [];

export type ConnectKey = "workspace" | "figma" | "github" | "jira";
export type AuthState = "idle" | "authorizing" | "connected";

type Scope = { name: string; description: string; tag: string };

const scopes: Record<Exclude<ConnectKey, "workspace">, Scope[]> = {
  figma: [
    {
      name: "files:read",
      description:
        "Ingest frames, components and prototype links for design ↔ code anchoring.",
      tag: "Non-destructive",
    },
    {
      name: "dev_mode:read",
      description: "Read inspect values (tokens, spacing, auto-layout) for drift comparison.",
      tag: "Read-only",
    },
    {
      name: "webhooks:figma",
      description: "Stream file update events without polling overhead or rate limits.",
      tag: "Event-driven",
    },
  ],
  github: [
    {
      name: "repo:read",
      description: "Ingest pull requests, diffs, checks and review threads for anchoring.",
      tag: "Read-only",
    },
    {
      name: "read:org",
      description: "Map teams and CODEOWNERS to UNIFY identities via verified membership.",
      tag: "Privacy safe",
    },
    {
      name: "workflow",
      description: "Re-run the reconciliation pass after a merge event lands.",
      tag: "Event-driven",
    },
  ],
  jira: [
    {
      name: "read:jira-work",
      description:
        "Ingest issue titles, priority fields, transitions, and epics for dependency tracking.",
      tag: "Non-destructive",
    },
    {
      name: "read:jira-user",
      description:
        "Map assignees & reporters to UNIFY developer identities via verified email hashes.",
      tag: "Privacy safe",
    },
    {
      name: "manage:jira-webhook",
      description: "Stream real-time status updates without polling overhead or rate limits.",
      tag: "Event-driven",
    },
  ],
};

const panelMeta: Record<
  Exclude<ConnectKey, "workspace">,
  { title: string; icon: string; blurb: string; authLabel: string }
> = {
  figma: {
    title: "Connect Figma",
    icon: "palette",
    blurb: "Sync design files, inspect values and design tokens for drift comparison.",
    authLabel: "Authorize with Figma",
  },
  github: {
    title: "Connect GitHub Organization",
    icon: "code",
    blurb: "Sync pull requests, review threads and CODEOWNERS for change assurance.",
    authLabel: "Authorize with GitHub",
  },
  jira: {
    title: "Connect Atlassian Jira",
    icon: "task_alt",
    blurb: "Sync sprint backlogs, release epics, and engineering issue resolutions.",
    authLabel: "Authorize with Atlassian",
  },
};

function ScopeMatrix({ tool }: { tool: Exclude<ConnectKey, "workspace"> }) {
  const icons = ["visibility", "badge", "webhook"];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-label-caps text-label-caps uppercase text-muted">
          Requested Granular Scopes
        </span>
        <span className="font-mono-code text-micro-label text-secondary flex items-center gap-1">
          <Icon name="lock_reset" className="text-[14px]" />
          Read-Only Enforced
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {scopes[tool].map((scope, index) => (
          <div
            key={scope.name}
            className="bg-surface-container-low p-3.5 rounded flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Icon name={icons[index]} className="text-secondary text-[18px] shrink-0" />
              <div className="min-w-0">
                <div className="font-mono-code text-[13px] text-on-surface font-medium">
                  {scope.name}
                </div>
                <div className="font-body-sm text-[12px] text-on-surface-variant">
                  {scope.description}
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-surface-container-highest font-mono-code text-micro-label text-on-surface-variant shrink-0">
              {scope.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuthBox({
  state,
  callback,
  buttonLabel,
  authorizingLabel = "Exchanging OAuth code with the identity service...",
  connectedLabel,
  onAuthorize,
}: {
  state: AuthState;
  callback: string;
  buttonLabel: string;
  authorizingLabel?: string;
  connectedLabel: string;
  onAuthorize: () => void;
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
          <div className="font-mono-code text-micro-label text-muted truncate">Callback: {callback}</div>
        </div>
      </div>
      <button
        type="button"
        disabled={state !== "idle"}
        onClick={onAuthorize}
        className={
          state === "connected"
            ? "px-4 py-2 rounded bg-secondary/20 text-secondary font-label-caps uppercase tracking-wider font-bold flex items-center gap-1.5"
            : state === "authorizing"
              ? "px-4 py-2 rounded bg-surface-container-highest text-muted font-label-caps uppercase tracking-wider font-bold cursor-not-allowed flex items-center gap-2"
              : "px-4 py-2 rounded bg-secondary text-on-secondary hover:bg-secondary-container transition-colors flex items-center gap-2 font-label-caps uppercase tracking-wider font-bold shadow-sm"
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

function PanelFrame({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="bg-surface-container rounded-xl shadow-md flex flex-col gap-4">
      {children}
      <div className="flex items-center justify-between text-muted text-body-sm px-4 pb-5 pt-2">
        <span className="font-mono-code text-[12px] flex items-center gap-1.5">
          <Icon name="info" className="text-[16px]" />
          You can modify repository access and scope permissions anytime in Settings.
        </span>
        <button type="button" className="font-mono-code text-[12px] text-primary hover:underline">
          View OAuth Manifest
        </button>
      </div>
      {footer}
    </div>
  );
}

function StepHeader({
  icon,
  title,
  blurb,
  chip,
}: {
  icon: string;
  title: string;
  blurb: string;
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
          <p className="font-body-sm text-body-sm text-on-surface-variant">{blurb}</p>
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
  imported,
  onName,
  onSlug,
  onImported,
  auth,
  onValidate,
}: {
  name: string;
  slug: string;
  imported: boolean;
  onName: (value: string) => void;
  onSlug: (value: string) => void;
  onImported: (value: boolean) => void;
  auth: AuthState;
  onValidate: () => void;
}) {
  return (
    <PanelFrame footer={null}>
      <StepHeader
        icon="corporate_fare"
        title="Name Your Workspace"
        blurb="Bind your cross-functional toolchain to populate continuous synchronization graphs."
        chip="Draft"
      />
      <div className="flex flex-col gap-4 px-4 pb-2">
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
              onChange={(event) => onSlug(event.target.value)}
              placeholder="workspace-slug"
              className="bg-transparent text-on-surface font-mono-code text-mono-code focus:outline-none flex-1 font-semibold"
            />
          </div>
          <span className="font-body-sm text-[12px] text-on-surface-variant">
            Slugs are immutable after the first policy run — they prefix every evidence packet.
          </span>
        </div>

        <div className="flex items-start justify-between gap-3 bg-surface-container-low p-4 rounded">
          <div className="flex flex-col">
            <span className="font-body-md text-body-md font-semibold text-on-surface">
              Import existing workspace
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Pull repositories, Jira projects and Figma files from a previous UNIFY export.
            </span>
            {imported ? (
              <span className="font-mono-code text-micro-label text-secondary mt-1.5">
                {/* DATA HOLE — replace with the import API's staged export filename and counts. */}
                Source: — · staged for import
              </span>
            ) : null}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={imported}
            aria-label="Import existing workspace"
            onClick={() => onImported(!imported)}
            className={`w-11 h-6 rounded-full relative p-0.5 transition-colors focus:outline-none flex-shrink-0 cursor-pointer ${
              imported ? "bg-secondary" : "bg-surface-container-highest"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full shadow block transition-transform ${
                imported ? "translate-x-5 bg-on-secondary" : "translate-x-0 bg-outline"
              }`}
            />
          </button>
        </div>

        <AuthBox
          state={auth}
          callback={`https://api.unify.dev/v1/workspaces/${slug || "new"}`}
          buttonLabel="Validate & Create"
          connectedLabel={`Workspace ${slug || "created"} ready (200 OK)`}
          onAuthorize={onValidate}
        />
      </div>
    </PanelFrame>
  );
}

function ConnectPanel({
  tool,
  auth,
  onAuthorize,
}: {
  tool: Exclude<ConnectKey, "workspace">;
  auth: AuthState;
  onAuthorize: () => void;
}) {
  const meta = panelMeta[tool];
  const input =
    tool === "figma"
      ? { label: "Figma Team Handle", prefix: "@", placeholder: "your-team" }
      : tool === "github"
        ? { label: "GitHub Organization", prefix: "github.com/", placeholder: "your-org" }
        : { label: "Atlassian Cloud Site / Domain", prefix: "", placeholder: "your-site" };

  return (
    <PanelFrame footer={null}>
      <StepHeader
        icon={meta.icon}
        title={meta.title}
        blurb={meta.blurb}
        chip={tool === "jira" ? "OAuth 2.0 (3LO)" : "OAuth 2.0"}
      />

      <div className="flex flex-col gap-4 px-4 pb-2">
        <div className="flex flex-col gap-2">
          <label
            htmlFor={`${tool}-target`}
            className="font-label-caps text-label-caps uppercase text-muted"
          >
            {input.label}
          </label>
          <div className="flex items-center bg-surface-container-lowest rounded px-3 py-2">
            <Icon name="dns" className="text-muted text-[18px] mr-2" />
            <span className="text-muted font-mono-code text-mono-code select-none">
              {input.prefix}
            </span>
            <input
              id={`${tool}-target`}
              placeholder={input.placeholder}
              className="bg-transparent text-on-surface font-mono-code text-mono-code focus:outline-none flex-1 font-semibold"
            />
            {tool === "jira" ? (
              <span className="text-muted font-mono-code text-mono-code select-none">
                .atlassian.net
              </span>
            ) : null}
          </div>
          <span className="font-body-sm text-[12px] text-on-surface-variant">
            {tool === "jira"
              ? "Verify this domain has active Jira Software or Jira Work Management instances."
              : tool === "github"
                ? "Only repositories you select are ingested; scopes are re-checkable at any time."
                : "UNIFY reads inspect values — design files are never modified."}
          </span>
        </div>

        <ScopeMatrix tool={tool} />

        <AuthBox
          state={auth}
          callback={`https://api.unify.dev/v1/auth/${tool}/callback`}
          buttonLabel={meta.authLabel}
          connectedLabel="Connected (Read-Only Granted)"
          onAuthorize={onAuthorize}
        />
      </div>
    </PanelFrame>
  );
}

function PolicyRunPanel({
  selected,
  onToggle,
  run,
  onRun,
}: {
  selected: Record<PolicyId, boolean>;
  onToggle: (id: PolicyId) => void;
  run: "idle" | "running" | "done";
  onRun: () => void;
}) {
  const toast = useToast();
  const staged = policies.filter((policy) => selected[policy.id]).length;

  return (
    <PanelFrame footer={null}>
      <StepHeader
        icon="gavel"
        title="First Policy Run"
        blurb="Evaluate the imported graph against P1–P4 and stage the first findings for triage."
        chip={`${staged} staged`}
      />
      <div className="flex flex-col gap-4 px-4 pb-2">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-label-caps uppercase text-muted">
            Policies to Evaluate
          </span>
          <span className="font-mono-code text-micro-label text-secondary flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Grace windows enforced
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {policies.map((policy) => (
            <label
              key={policy.id}
              className={`bg-surface-container-low p-3.5 rounded flex items-start gap-3 cursor-pointer transition-colors hover:bg-surface-container-high ${
                selected[policy.id] ? "" : "opacity-60"
              }`}
            >
              <input
                type="checkbox"
                checked={selected[policy.id]}
                onChange={() => onToggle(policy.id)}
                className="accent-secondary mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono-code text-[13px] text-on-surface font-semibold">
                    {policy.id}: {policy.name}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded font-mono-code text-eyebrow font-bold uppercase ${
                      policy.severity === "critical"
                        ? "bg-error-container text-error"
                        : "bg-tertiary-container text-on-tertiary-container"
                    }`}
                  >
                    {policy.severity}
                  </span>
                  {!policy.enabled ? (
                    <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-muted font-mono-code text-eyebrow uppercase">
                      disabled by admin
                    </span>
                  ) : null}
                </div>
                <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
                  {policy.description}
                </p>
                <span className="font-mono-code text-micro-label text-muted block mt-1.5">
                  trigger: {policy.trigger} · grace {policy.graceMinutes}m
                </span>
              </div>
            </label>
          ))}
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                run === "done" ? "bg-secondary/20" : "bg-surface-container-high"
              }`}
            >
              <Icon
                name={run === "done" ? "check" : run === "running" ? "sync" : "policy"}
                className={`text-[18px] ${
                  run === "done" ? "text-secondary" : "text-muted"
                } ${run === "running" ? "animate-spin" : ""}`}
              />
            </div>
            <div className="min-w-0">
              <div
                className={`font-body-sm font-semibold ${
                  run === "done" ? "text-secondary" : "text-on-surface"
                }`}
              >
                {run === "idle"
                  ? `${staged} policies staged for the first run`
                  : run === "running"
                    ? "Reconciling links and evaluating evidence…"
                    : // DATA HOLE — the staged-finding count comes from the policy-run API.
                      "Run complete — no candidate findings staged for triage"}
              </div>
              <div className="font-mono-code text-micro-label text-muted truncate">
                {/* DATA HOLE — replace with the policy-run API's packet URI and resolved citation count. */}
                packet: —
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled={run !== "idle" || staged === 0}
            onClick={onRun}
            className={
              run === "done"
                ? "px-4 py-2 rounded bg-secondary/20 text-secondary font-label-caps uppercase tracking-wider font-bold flex items-center gap-1.5"
                : "px-4 py-2 rounded bg-secondary text-on-secondary hover:bg-secondary-container transition-colors flex items-center gap-2 font-label-caps uppercase tracking-wider font-bold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            }
          >
            {run === "done" ? (
              <>
                <Icon name="check_circle" className="text-[16px]" />
                View Findings
              </>
            ) : run === "running" ? (
              <>
                <Icon name="refresh" className="text-[16px] animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Icon name="play_arrow" className="text-[16px]" />
                Run First Policy Check
              </>
            )}
          </button>
        </div>

        <p className="font-body-sm text-[12px] text-on-surface-variant">
          Findings only surface when both artifacts are CURRENT and the link is at least{" "}
          <span className="font-mono-code text-micro-label text-primary">confirmed</span>. Run again
          anytime from Policy Simulation.
        </p>
        {run === "done" ? (
          <button
            type="button"
            onClick={() => toast("Opening Conflict Inbox for the staged findings…", {
              icon: "warning",
              tone: "neutral",
            })}
            className="self-start font-mono-code text-[12px] text-primary hover:underline"
          >
            Open Conflict Inbox →
          </button>
        ) : null}
      </div>
    </PanelFrame>
  );
}

/* ------------------------------------------------------------------ exports */
export function ActiveStepPanel({
  step,
  auth,
  onAuthorize,
  workspace,
  policyRun,
}: {
  step: number;
  auth: Record<ConnectKey, AuthState>;
  onAuthorize: (key: ConnectKey) => void;
  workspace: {
    name: string;
    slug: string;
    imported: boolean;
    setName: (value: string) => void;
    setSlug: (value: string) => void;
    setImported: (value: boolean) => void;
  };
  policyRun: {
    selected: Record<PolicyId, boolean>;
    onToggle: (id: PolicyId) => void;
    run: "idle" | "running" | "done";
    onRun: () => void;
  };
}) {
  if (step === 1) {
    return (
      <WorkspacePanel
        name={workspace.name}
        slug={workspace.slug}
        imported={workspace.imported}
        onName={workspace.setName}
        onSlug={workspace.setSlug}
        onImported={workspace.setImported}
        auth={auth.workspace}
        onValidate={() => onAuthorize("workspace")}
      />
    );
  }
  if (step === 5) {
    return (
      <PolicyRunPanel
        selected={policyRun.selected}
        onToggle={policyRun.onToggle}
        run={policyRun.run}
        onRun={policyRun.onRun}
      />
    );
  }
  const tool = (["figma", "github", "jira"] as const)[step - 2];
  return <ConnectPanel tool={tool} auth={auth[tool]} onAuthorize={() => onAuthorize(tool)} />;
}

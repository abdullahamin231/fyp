"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import {
  ActiveStepPanel,
  type AuthState,
  type ConnectKey,
} from "@/components/onboarding/step-panels";
import { SideRecap } from "@/components/onboarding/side-recap";
import type { Policy, PolicyId } from "@/lib/types";

/**
 * DATA HOLE — replace with the policies API.
 * Empty until the endpoint exists; the policy checklist renders nothing and
 * the staged counter reads zero.
 */
const policies: Policy[] = [];

type StepDef = {
  key: ConnectKey | "policy";
  label: string;
  value: () => string;
};

/**
 * DATA HOLE — replace with each connector's live account/org handle from its
 * API. Idle copy until then; `stepValue` overrides once wizard state says
 * otherwise.
 */
const steps: StepDef[] = [
  { key: "workspace", label: "Workspace", value: () => "Not created" },
  { key: "figma", label: "Figma", value: () => "Not connected" },
  { key: "github", label: "GitHub", value: () => "Not connected" },
  { key: "jira", label: "Jira Cloud", value: () => "Not connected" },
  { key: "policy", label: "Policy Run", value: () => "Not staged" },
];

const initialPolicies = Object.fromEntries(
  policies.map((policy) => [policy.id, policy.enabled]),
) as Record<PolicyId, boolean>;

/** Mono sub-label under each stepper item, reflecting live wizard state. */
function isStepConnected(key: ConnectKey | "policy", auth: Record<ConnectKey, AuthState>) {
  return key !== "policy" && auth[key] === "connected";
}

function stepValue(
  definition: StepDef,
  state: { auth: Record<ConnectKey, AuthState>; run: "idle" | "running" | "done"; slug: string },
): string {
  if (definition.key === "workspace") return state.slug || "—";
  if (definition.key === "jira") {
    return state.auth.jira === "connected" ? "Connected" : definition.value();
  }
  if (definition.key === "policy") {
    return state.run === "done"
      ? "Run complete"
      : state.run === "running"
        ? "Reconciling…"
        : definition.value();
  }
  return definition.value();
}

/**
 * Multi-step workspace onboarding wizard: connect Figma / GitHub / Jira,
 * import the workspace and run the first policy check.
 */
export function OnboardingWizard() {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [maxReached, setMaxReached] = useState(1);
  const [auth, setAuth] = useState<Record<ConnectKey, AuthState>>({
    workspace: "idle",
    figma: "idle",
    github: "idle",
    jira: "idle",
  });
  /**
   * DATA HOLE — replace with the workspace API's created-workspace record
   * (name, slug, import status). The wizard starts with nothing created.
   */
  const [workspace, setWorkspace] = useState({
    name: "",
    slug: "",
    imported: false,
  });
  const [selectedPolicies, setSelectedPolicies] = useState<Record<PolicyId, boolean>>(
    initialPolicies,
  );
  const [run, setRun] = useState<"idle" | "running" | "done">("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
    };
  }, []);

  const current = steps[step - 1];
  const pct = Math.round((step / steps.length) * 100);

  function authorize(key: ConnectKey) {
    if (auth[key] !== "idle") return;
    setAuth((prev) => ({ ...prev, [key]: "authorizing" }));
    timers.current.push(
      setTimeout(() => {
        setAuth((prev) => ({ ...prev, [key]: "connected" }));
        const label =
          key === "workspace"
            ? `Workspace ${workspace.slug || "created"} created (200 OK)`
            : `${key[0].toUpperCase()}${key.slice(1)} connected — read-only scopes granted`;
        toast(label, { icon: "cloud_done" });
      }, 1500),
    );
  }

  function goTo(next: number) {
    setStep(next);
    setMaxReached((prev) => Math.max(prev, next));
  }

  function next() {
    if (step === 5) {
      if (run !== "done") {
        toast("Run the first policy check before finishing setup", {
          icon: "gavel",
          tone: "neutral",
        });
        if (run === "idle") runFirstPolicy();
        return;
      }
      toast("Workspace ready — opening the Conflict Inbox", { icon: "rocket_launch" });
      return;
    }
    if (current.key !== "policy" && auth[current.key] !== "connected") {
      authorize(current.key);
      toast("Awaiting OAuth consent — the step unlocks once authorization returns", {
        icon: "lock_reset",
        tone: "neutral",
      });
      return;
    }
    goTo(step + 1);
  }

  function back() {
    if (step > 1) setStep(step - 1);
  }

  function skip() {
    if (step >= 5) {
      toast("Setup finished — the first policy run stays available in Policy Simulation", {
        icon: "skip_next",
        tone: "neutral",
      });
      return;
    }
    toast("Step skipped — connect it later from Link Management", {
      icon: "skip_next",
      tone: "neutral",
    });
    goTo(step + 1);
  }

  function runFirstPolicy() {
    if (run !== "idle") return;
    setRun("running");
    timers.current.push(
      setTimeout(() => {
        setRun("done");
        // DATA HOLE — the staged finding count comes from the policy-run API.
        toast("First run complete — no candidate findings staged yet", { icon: "fact_check" });
      }, 1800),
    );
  }

  function togglePolicy(id: PolicyId) {
    setSelectedPolicies((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="relative">
      {/* Top ambient glow */}
      <div className="absolute -top-6 left-1/4 w-96 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 right-1/4 w-96 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Wizard breadcrumb / setup timeline */}
      <section className="w-full relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-surface-container-highest font-mono-code text-eyebrow text-primary tracking-wider uppercase">
                Pipeline Provisioning
              </span>
              <span className="text-muted text-body-sm font-mono-code">/</span>
              <span className="font-mono-code text-micro-label text-on-surface-variant">
                {/* DATA HOLE — replace with the onboarding session's id once the API mints one. */}
                Setup Wizard ID: —
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Connect Workspace Ecosystem
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Bind your cross-functional toolchain to populate continuous synchronization graphs
              across specs, code, and tickets.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-lg self-start md:self-auto">
            <div className="text-right">
              <div className="font-label-caps text-label-caps uppercase text-muted">Progress</div>
              <div className="font-mono-code text-[15px] font-semibold text-secondary">
                Step {step} of {steps.length} ({pct}%)
              </div>
            </div>
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-container-highest"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-secondary"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${pct}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <span className="absolute font-mono-code text-micro-label text-on-surface font-bold">
                {step}/5
              </span>
            </div>
          </div>
        </div>

        {/* Stepper navigation bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-surface-container-lowest p-2 rounded-xl">
          {steps.map((definition, index) => {
            const position = index + 1;
            const isActive = position === step;
            const isDone = position < step;
            const isLocked = position > maxReached;
            const accessible = !isLocked;
            return (
              <button
                key={definition.key}
                type="button"
                disabled={!accessible}
                onClick={() => accessible && setStep(position)}
                className={[
                  "flex flex-col gap-1 p-2.5 rounded text-left transition-all group",
                  isActive
                    ? "bg-primary-container text-on-primary-container shadow-md"
                    : isLocked
                      ? "bg-surface-container-lowest text-left opacity-60 cursor-not-allowed"
                      : "bg-surface-container-low hover:bg-surface-container-high",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono-code text-micro-label ${
                      isActive ? "text-on-primary-container/80" : "text-muted"
                    }`}
                  >
                    0{position}
                  </span>
                  {isActive ? (
                    <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                  ) : isDone || (!isLocked && isStepConnected(definition.key, auth)) ? (
                    <Icon name="check_circle" className="text-secondary text-[16px]" />
                  ) : isLocked ? (
                    <Icon name="lock" className="text-muted text-[16px]" />
                  ) : (
                    <Icon name="radio_button_unchecked" className="text-muted text-[16px]" />
                  )}
                </div>
                <span
                  className={`font-label-caps text-label-caps uppercase tracking-wider ${
                    isActive
                      ? "text-on-primary-container"
                      : isLocked
                        ? "text-muted"
                        : "text-on-surface"
                  }`}
                >
                  {definition.label}
                </span>
                <span
                  className={`font-mono-code text-micro-label truncate ${
                    isActive
                      ? "text-on-primary-container"
                      : isDone
                        ? "text-secondary"
                        : isLocked
                          ? "text-muted"
                          : "text-on-surface-variant"
                  }`}
                >
                  {stepValue(definition, { auth, run, slug: workspace.slug })}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Security protocol architecture banner */}
      <section className="w-full mt-8 bg-surface-container-low rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center flex-shrink-0">
              <Icon name="shield_lock" className="text-secondary text-[22px]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  Enterprise Zero-Knowledge Token Vault
                </span>
                <span className="px-2 py-0.2 rounded-full bg-secondary/10 text-secondary font-mono-code text-eyebrow uppercase font-semibold">
                  AES-256-GCM Active
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-4xl mt-1">
                All third-party OAuth access tokens are encrypted at rest using envelope-encrypted
                HSM keys. Raw credentials, tokens, or personal access tokens are never displayed,
                logged, or exposed client-side. Webhook signatures are verified asynchronously on
                dedicated egress nodes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end lg:self-center flex-shrink-0 bg-surface-container px-3 py-1.5 rounded">
            <Icon name="verified_user" className="text-muted text-[16px]" />
            <span className="font-mono-code text-micro-label text-muted">SOC2 Type II Compliant</span>
          </div>
        </div>
      </section>

      {/* Main asymmetric bento workspace */}
      <div className="grid grid-cols-12 gap-4 items-start mt-8">
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
          <ActiveStepPanel
            step={step}
            auth={auth}
            onAuthorize={authorize}
            workspace={{
              name: workspace.name,
              slug: workspace.slug,
              imported: workspace.imported,
              setName: (value) => setWorkspace((prev) => ({ ...prev, name: value })),
              setSlug: (value) => setWorkspace((prev) => ({ ...prev, slug: value })),
              setImported: (value) => setWorkspace((prev) => ({ ...prev, imported: value })),
            }}
            policyRun={{
              selected: selectedPolicies,
              onToggle: togglePolicy,
              run,
              onRun: runFirstPolicy,
            }}
          />

          {/* Live sync diagnostic preview */}
          <div className="bg-surface-container-low rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="font-label-caps text-label-caps uppercase text-muted">
                Ecosystem Pipeline Telemetry
              </span>
              <span className="font-mono-code text-micro-label text-secondary">
                {["figma", "github", "jira"].filter((key) => auth[key as ConnectKey] === "connected")
                  .length === 3
                  ? "All systems operational"
                  : "Provisioning sources"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface-container p-3 rounded">
                <div className="font-mono-code text-eyebrow text-muted uppercase">
                  Egress Region
                </div>
                <div className="font-mono-code text-on-surface font-semibold mt-0.5">
                  {/* DATA HOLE — replace with the provisioning API's egress region. */}
                  —
                </div>
              </div>
              <div className="bg-surface-container p-3 rounded">
                <div className="font-mono-code text-eyebrow text-muted uppercase">
                  Handshake Latency
                </div>
                <div className="font-mono-code text-secondary font-semibold mt-0.5">
                  {/* DATA HOLE — replace with measured handshake latency from the connector API. */}
                  —
                </div>
              </div>
              <div className="bg-surface-container p-3 rounded">
                <div className="font-mono-code text-eyebrow text-muted uppercase">Rate Reserve</div>
                <div className="font-mono-code text-on-surface font-semibold mt-0.5">
                  {/* DATA HOLE — replace with the connector API's remaining rate budget. */}
                  —
                </div>
              </div>
            </div>
          </div>
        </div>

        <SideRecap
          auth={auth}
          workspace={workspace}
          onEdit={() => setStep(1)}
          step={step}
        />
      </div>

      {/* Persistent setup action bar */}
      <footer className="mt-8 bg-surface-container-lowest rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={skip}
            className="px-3.5 py-2 rounded text-muted hover:text-on-surface font-body-sm transition-colors"
          >
            Skip {current.label} for now
          </button>
          <span className="text-muted/40">|</span>
          <span className="font-mono-code text-[12px] text-muted">
            Step {step} of {steps.length} ({pct}% complete)
          </span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="px-4 py-2 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-body-sm transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="arrow_back" className="text-[16px]" /> Back
          </button>
          <button
            type="button"
            onClick={next}
            className="px-4 py-2 rounded bg-primary-container hover:bg-inverse-primary text-on-primary-container font-body-sm font-semibold transition-colors flex items-center gap-2 shadow-md"
          >
            <span>{step === 5 ? "Finish Setup" : "Save & Continue to Next Step"}</span>
            <Icon name="arrow_forward" className="text-[16px]" />
          </button>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import {
  ActiveStepPanel,
  type AuthState,
  type ConnectKey,
} from "@/components/onboarding/step-panels";
import { SideRecap } from "@/components/onboarding/side-recap";
import { createWorkspace, slugify } from "@/lib/data/create-workspace";
import { authorizePath, resumeStep } from "@/lib/domain/onboarding";
import type { ProviderStatus } from "@/lib/data/integrations";
import type { RuleView } from "@/lib/data/rules";
import { createClient } from "@/lib/supabase/client";

const STEPS: { key: ConnectKey | "policy"; label: string }[] = [
  { key: "workspace", label: "Workspace" },
  { key: "figma", label: "Figma" },
  { key: "github", label: "GitHub" },
  { key: "jira", label: "Jira Cloud" },
  { key: "policy", label: "Policies" },
];

export interface OnboardingWorkspace {
  id: string;
  name: string;
  slug: string;
}

/**
 * Workspace onboarding: create the workspace (`create_workspace` RPC), connect
 * Figma / GitHub / Jira through the real OAuth routes, then review the rules
 * that will run. Connection state comes from the server (`?workspace=<slug>`),
 * so a reload shows what is actually stored.
 */
export function OnboardingWizard({
  origin,
  workspace,
  providers,
  rules,
}: {
  origin: string;
  workspace: OnboardingWorkspace | null;
  providers: ProviderStatus[];
  rules: RuleView[];
}) {
  const toast = useToast();
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(() => resumeStep(workspace, providers));
  const [maxReached, setMaxReached] = useState(() => (workspace ? STEPS.length : 1));
  const [draft, setDraft] = useState({ name: "", slug: "", slugTouched: false });
  const [pending, setPending] = useState<ConnectKey | null>(null);

  const name = workspace?.name ?? draft.name;
  const slug = workspace?.slug ?? (draft.slugTouched ? draft.slug : slugify(draft.name));

  const stateOf = (key: ConnectKey): AuthState => {
    const done = key === "workspace" ? !!workspace : !!providers.find((p) => p.provider === key)?.connected;
    if (done) return "connected";
    return pending === key ? "authorizing" : "idle";
  };
  const auth: Record<ConnectKey, AuthState> = {
    workspace: stateOf("workspace"),
    figma: stateOf("figma"),
    github: stateOf("github"),
    jira: stateOf("jira"),
  };

  const current = STEPS[step - 1];
  const pct = Math.round((step / STEPS.length) * 100);

  function stepValue(key: ConnectKey | "policy"): string {
    if (key === "workspace") return slug || "Not created";
    if (key === "policy") return `${rules.filter((rule) => rule.active).length} active`;
    const status = providers.find((p) => p.provider === key);
    return status?.connected ? (status.accountName ?? "Connected") : "Not connected";
  }

  function goTo(next: number) {
    setStep(next);
    setMaxReached((prev) => Math.max(prev, next));
  }

  async function create() {
    if (pending || !name.trim() || !slug) return;
    setPending("workspace");
    const result = await createWorkspace(supabase, name, slug);
    if (!result.ok) {
      setPending(null);
      toast(result.error, { icon: "error", tone: "error" });
      return;
    }
    toast(`Workspace ${result.workspace.name} created`, { icon: "cloud_done" });
    // The page re-renders with the stored workspace and remounts the wizard
    // (keyed by workspace id) on the first connect step.
    router.replace(`/onboarding?workspace=${encodeURIComponent(result.workspace.slug)}`);
  }

  function authorize(key: ConnectKey) {
    if (key === "workspace") {
      void create();
      return;
    }
    if (!workspace || auth[key] !== "idle") return;
    if (!providers.find((p) => p.provider === key)?.appRegistered) {
      toast(`Register the ${key} OAuth app first`, { icon: "key", tone: "neutral" });
      router.push(`/settings/integrations?workspace=${encodeURIComponent(workspace.slug)}`);
      return;
    }
    setPending(key);
    window.location.assign(authorizePath(key, workspace.slug));
  }

  function next() {
    if (step === STEPS.length) {
      router.push("/conflicts");
      return;
    }
    if (current.key !== "policy" && auth[current.key] !== "connected") {
      authorize(current.key);
      return;
    }
    goTo(step + 1);
  }

  function back() {
    if (step > 1) setStep(step - 1);
  }

  function skip() {
    if (step === STEPS.length) {
      router.push("/conflicts");
      return;
    }
    goTo(step + 1);
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
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Connect Workspace Ecosystem
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-lg self-start md:self-auto">
            <div className="text-right">
              <div className="font-label-caps text-label-caps uppercase text-muted">Progress</div>
              <div className="font-mono-code text-[15px] font-semibold text-secondary">
                Step {step} of {STEPS.length} ({pct}%)
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
                {step}/{STEPS.length}
              </span>
            </div>
          </div>
        </div>

        {/* Stepper navigation bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-surface-container-lowest p-2 rounded-xl">
          {STEPS.map((definition, index) => {
            const position = index + 1;
            const isActive = position === step;
            const isDone = position < step;
            const isLocked = position > maxReached;
            const connected = definition.key !== "policy" && auth[definition.key] === "connected";
            return (
              <button
                key={definition.key}
                type="button"
                disabled={isLocked}
                onClick={() => setStep(position)}
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
                  ) : connected ? (
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
                  {stepValue(definition.key)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main asymmetric bento workspace */}
      <div className="grid grid-cols-12 gap-4 items-start mt-8">
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
          <ActiveStepPanel
            step={step}
            auth={auth}
            onAuthorize={authorize}
            origin={origin}
            providers={providers}
            workspace={{
              name,
              slug,
              created: !!workspace,
              setName: (value) => setDraft((prev) => ({ ...prev, name: value })),
              setSlug: (value) => setDraft((prev) => ({ ...prev, slug: value, slugTouched: true })),
            }}
            rules={rules}
          />
        </div>

        <SideRecap
          auth={auth}
          workspace={{ name, slug, created: !!workspace }}
          providers={providers}
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
            disabled={!workspace}
            className="px-3.5 py-2 rounded text-muted hover:text-on-surface font-body-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Skip {current.label} for now
          </button>
          <span className="text-muted/40">|</span>
          <span className="font-mono-code text-[12px] text-muted">
            Step {step} of {STEPS.length} ({pct}% complete)
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
            <span>{step === STEPS.length ? "Finish Setup" : "Save & Continue to Next Step"}</span>
            <Icon name="arrow_forward" className="text-[16px]" />
          </button>
        </div>
      </footer>
    </div>
  );
}

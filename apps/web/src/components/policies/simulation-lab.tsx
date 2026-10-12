"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import {
  defaultStep,
  graceSteps,
  type NotifyMeta,
  type SimEventClass,
  type SimHorizon,
  type SimScenario,
} from "@/lib/domain/policy-simulation";
import type { Policy, PolicyId, Severity, ToolKind } from "@/lib/types";

/**
 * DATA HOLE — replace with the policy-simulation API.
 *
 * Policies, replay horizons, scenarios and the historical event classes are
 * all empty until their endpoints exist. The lab bails to its empty state
 * below rather than simulating against nothing.
 */
const policies: Policy[] = [];
const simHorizons: SimHorizon[] = [];
const simScenarios: SimScenario[] = [];
const simEvents: Partial<Record<PolicyId, SimEventClass[]>> = {};
const notifyMeta: Partial<Record<PolicyId, NotifyMeta>> = {};

/* ------------------------------------------------------------------ helpers */

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function fmtDate(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${MONTHS[date.getUTCMonth()]} ${pad(date.getUTCDate())}, ${date.getUTCFullYear()} ${pad(
    date.getUTCHours(),
  )}:${pad(date.getUTCMinutes())} UTC`;
}

function fmtMinutes(minutes: number): string {
  if (minutes >= 1440 && minutes % 1440 === 0) return `${minutes / 1440}d`;
  if (minutes >= 60 && minutes % 60 === 0) return `${minutes / 60}h`;
  return `${minutes}m`;
}

function scaleOccurrences(occurrences: number, days: number): number {
  return days === 30 ? occurrences : Math.max(1, Math.round((occurrences * days) / 30));
}

const toolIcon: Record<ToolKind, string> = {
  figma: "draw",
  github: "merge_type",
  jira: "confirmation_number",
  slack: "chat",
  git: "hub",
  test: "experiment",
};

const toolTone: Record<ToolKind, string> = {
  figma: "text-on-surface",
  github: "text-primary",
  jira: "text-tertiary",
  slack: "text-secondary",
  git: "text-secondary",
  test: "text-tertiary",
};

const severityTone: Record<
  Severity,
  { icon: string; box: string; text: string; dot: string; label: string }
> = {
  critical: {
    icon: "error",
    box: "bg-error-container/30 text-error",
    text: "text-error",
    dot: "bg-error",
    label: "Critical",
  },
  warning: {
    icon: "warning",
    box: "bg-tertiary-container/30 text-tertiary",
    text: "text-tertiary",
    dot: "bg-tertiary",
    label: "Warning",
  },
  info: {
    icon: "info",
    box: "bg-secondary/10 text-secondary",
    text: "text-secondary",
    dot: "bg-secondary",
    label: "Info",
  },
};

/* --------------------------------------------------------------- simulation */

type FilterId = "all" | "triggered" | "passed" | "suppressed";
type Outcome = FilterId;

interface SimParams {
  policyId: PolicyId;
  stepIndex: number;
  guards: boolean;
  horizonId: string;
}

interface ResultRow {
  cls: SimEventClass;
  outcome: Outcome;
  occurrences: number;
  fpExpected: number;
}

interface SimResult {
  signature: string;
  params: SimParams;
  policy: Policy;
  grace: number;
  horizon: SimHorizon;
  rows: ResultRow[];
  counts: { evaluated: number; triggered: number; passed: number; suppressed: number };
  rate: number;
  perDay: number;
  fpExpected: number;
  fpPct: number;
  baselineTriggers: number;
}

function signatureOf(params: SimParams): string {
  return `${params.policyId}|${params.stepIndex}|${params.guards ? 1 : 0}|${params.horizonId}`;
}

function findPolicy(policyId: PolicyId): Policy | undefined {
  return policies.find((policy) => policy.id === policyId) ?? policies[0];
}

function eventsFor(policyId: PolicyId): SimEventClass[] {
  return simEvents[policyId] ?? [];
}

function triggersAt(params: SimParams): number {
  const steps = graceSteps[params.policyId];
  const grace = steps[params.stepIndex] ?? steps[0];
  const horizon = horizonOf(params.horizonId);
  if (!horizon) return 0;
  return eventsFor(params.policyId).reduce((total, cls) => {
    const blocked = Boolean(cls.guard) && params.guards;
    if (blocked) return total;
    return cls.elapsedMinutes > grace
      ? total + scaleOccurrences(cls.occurrences30d, horizon.days)
      : total;
  }, 0);
}

function horizonOf(horizonId: string): SimHorizon | undefined {
  return simHorizons.find((horizon) => horizon.id === horizonId) ?? simHorizons[0];
}

function simulate(params: SimParams): SimResult | null {
  const policy = findPolicy(params.policyId);
  const steps = graceSteps[params.policyId];
  const grace = steps[params.stepIndex] ?? steps[0];
  const horizon = horizonOf(params.horizonId);
  if (!policy || !horizon) return null;

  const rows: ResultRow[] = eventsFor(params.policyId).map((cls) => {
    const blocked = Boolean(cls.guard) && params.guards;
    const outcome: Outcome = blocked
      ? "suppressed"
      : cls.elapsedMinutes > grace
        ? "triggered"
        : "passed";
    const occurrences = scaleOccurrences(cls.occurrences30d, horizon.days);
    return {
      cls,
      outcome,
      occurrences,
      fpExpected: outcome === "triggered" ? occurrences * cls.fpRate : 0,
    };
  });

  const sumFor = (outcome: Outcome) =>
    rows
      .filter((row) => row.outcome === outcome)
      .reduce((total, row) => total + row.occurrences, 0);

  const triggered = sumFor("triggered");
  const fpExpected = rows.reduce((total, row) => total + row.fpExpected, 0);

  return {
    signature: signatureOf(params),
    params,
    policy,
    grace,
    horizon,
    rows,
    counts: {
      evaluated: horizon.events,
      triggered,
      passed: sumFor("passed"),
      suppressed: sumFor("suppressed"),
    },
    rate: horizon.events > 0 ? triggered / horizon.events : 0,
    perDay: triggered / horizon.days,
    fpExpected,
    fpPct: triggered > 0 ? (fpExpected / triggered) * 100 : 0,
    baselineTriggers: triggersAt({ ...params, stepIndex: defaultStep[params.policyId] }),
  };
}

function curveFor(params: SimParams): number[] {
  return graceSteps[params.policyId].map((_, index) =>
    triggersAt({ ...params, stepIndex: index }),
  );
}

function scenarioStep(scenarioId: string, policyId: PolicyId): number {
  const scenario = simScenarios.find((item) => item.id === scenarioId);
  if (!scenario) return defaultStep[policyId];
  const steps = graceSteps[policyId];
  if (scenario.step === "default") return defaultStep[policyId];
  if (scenario.step === "last") return steps.length - 1;
  return Math.min(scenario.step, steps.length - 1);
}

/* -------------------------------------------------------------- small parts */

function MetricCard({
  label,
  value,
  unit,
  unitTone = "text-muted",
  valueTone = "text-on-surface",
  footnote,
  footnoteTone = "text-muted",
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  unitTone?: string;
  valueTone?: string;
  footnote?: ReactNode;
  footnoteTone?: string;
}) {
  return (
    <div className="p-stack-comfortable rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between">
      <span className="font-label-caps text-label-caps text-muted uppercase">{label}</span>
      <div className="flex items-baseline gap-1 mt-1.5">
        <span className={`font-headline-md text-headline-md font-bold font-mono-code ${valueTone}`}>
          {value}
        </span>
        {unit ? <span className={`font-mono-code text-micro-label ${unitTone}`}>{unit}</span> : null}
      </div>
      <span className={`font-mono-code text-micro-label mt-1.5 ${footnoteTone}`}>{footnote}</span>
    </div>
  );
}

function EventRow({
  row,
  policy,
  grace,
}: {
  row: ResultRow;
  policy: Policy;
  grace: number;
}) {
  const { cls, outcome, occurrences } = row;
  const overBy = cls.elapsedMinutes - grace;
  const meta: NotifyMeta =
    notifyMeta[policy.id] ?? { channel: "—", recipients: [], escalation: "—" };

  const presentation =
    outcome === "triggered"
      ? {
          tag: "TRIGGERED",
          tagClass: "bg-error-container/60 text-error font-bold",
          icon: cls.icon,
          iconClass: "bg-error-container/40 text-error",
          cardClass: "bg-surface-container hover:bg-surface-container",
        }
      : outcome === "passed"
        ? {
            tag: "WITHIN GRACE",
            tagClass: "bg-secondary/20 text-secondary font-semibold",
            icon: cls.icon,
            iconClass: "bg-secondary/10 text-secondary",
            cardClass: "bg-surface-container-low hover:bg-surface-container opacity-90",
          }
        : {
            tag: "SUPPRESSED",
            tagClass: "bg-surface-container-highest text-on-surface-variant font-semibold",
            icon: cls.icon,
            iconClass: "bg-surface-container-highest text-muted",
            cardClass: "bg-surface-container-low hover:bg-surface-container opacity-80",
          };

  const rightMeta =
    outcome === "triggered"
      ? `+${overBy > 0 ? overBy : 0}m over ${grace}m limit`
      : outcome === "passed"
        ? `${cls.elapsedMinutes}m elapsed (≤ ${grace}m)`
        : "Matched guard rule";

  return (
    <article
      className={`group p-stack-comfortable rounded-xl transition-all shadow-sm flex flex-col gap-stack-compact ${presentation.cardClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${presentation.iconClass}`}
          >
            <Icon name={presentation.icon} className="text-[18px]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-1.5 py-0.5 rounded font-mono-code text-micro-label ${presentation.tagClass}`}
              >
                {presentation.tag}
              </span>
              <span className="font-body-md text-body-md font-semibold text-on-surface">
                {cls.title}
              </span>
            </div>
            <span className="font-mono-code text-micro-label text-muted mt-0.5">
              Event UUID: {cls.uuid} · ×{occurrences} occurrences
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="font-mono-code text-mono-code text-on-surface-variant font-medium">
            {fmtDate(cls.iso)}
          </span>
          <span
            className={`font-mono-code text-micro-label font-semibold ${
              outcome === "triggered"
                ? "text-error"
                : outcome === "passed"
                  ? "text-secondary"
                  : "text-muted"
            }`}
          >
            {rightMeta}
          </span>
        </div>
      </div>

      {/* Artifact chain */}
      <div className="p-3.5 rounded bg-surface-container-lowest/80 flex items-center gap-3 flex-wrap font-mono-code text-micro-label">
        {cls.artifacts.map((artifact, index) => (
          <span key={artifact.text} className="flex items-center gap-2">
            {index > 0 ? <span className="text-muted">↔</span> : null}
            <span className={`flex items-center gap-1 ${toolTone[artifact.tool]}`}>
              <Icon name={toolIcon[artifact.tool]} className="text-muted text-[14px]" />
              <span>{artifact.text}</span>
            </span>
          </span>
        ))}
      </div>

      {/* Guard evaluation */}
      <div className="flex flex-wrap items-center gap-1.5">
        {row.outcome === "suppressed" && cls.guard ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-error-container/30 text-error font-mono-code text-micro-label">
            <Icon name="block" className="text-[12px]" />
            blocked: {cls.guard.text}
          </span>
        ) : null}
        {policy.guards.map((guard) => (
          <span
            key={guard}
            title="Guard evaluated and passed"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-highest text-secondary font-mono-code text-micro-label"
          >
            <Icon name="check" className="text-[12px]" />
            {guard}
          </span>
        ))}
      </div>

      {/* Decision trace */}
      {outcome === "triggered" ? (
        <div className="p-3.5 rounded bg-error-container/20 text-on-error-container font-mono-code text-micro-label flex items-start gap-2.5">
          <Icon name="report_problem" className="text-error text-[16px] shrink-0 mt-0.5" />
          <span>
            <span className="font-bold text-error">VIOLATION DETECTED:</span> {cls.detail} Exceeds
            the {grace}m grace window by {overBy > 0 ? overBy : 0}m — would open a{" "}
            {policy.severity} finding and deliver{" "}
            <span className="text-on-error-container font-bold">{policy.notifyTemplate}</span> to{" "}
            {meta.recipients.join(", ")} via {meta.channel} (delivery-only).
          </span>
        </div>
      ) : outcome === "passed" ? (
        <div className="p-3.5 rounded bg-surface-container font-mono-code text-micro-label flex items-start gap-2.5 text-on-surface-variant">
          <Icon name="check_circle" className="text-secondary text-[16px] shrink-0 mt-0.5" />
          <span>
            <span className="font-bold text-on-surface">NO VIOLATION CREATED:</span>{" "}
            {cls.elapsedMinutes}m elapsed (≤ {grace}m grace) — {cls.detail}
          </span>
        </div>
      ) : (
        <div className="p-3.5 rounded bg-surface-container font-mono-code text-micro-label flex items-start gap-2.5 text-on-surface-variant">
          <Icon name="shield" className="text-muted text-[16px] shrink-0 mt-0.5" />
          <span>
            <span className="font-bold text-on-surface">GUARD EXCLUSION:</span>{" "}
            {cls.guard ? `${cls.guard.text} (${cls.guard.clause}). ` : ""}
            {cls.detail} No notification is composed.
          </span>
        </div>
      )}
    </article>
  );
}

/* --------------------------------------------------------------------- lab */

export function SimulationLab() {
  const [params, setParams] = useState<SimParams>({
    policyId: "P1",
    stepIndex: defaultStep.P1,
    guards: true,
    horizonId: "30d",
  });
  const [result, setResult] = useState<SimResult | null>(() =>
    simulate({ policyId: "P1", stepIndex: defaultStep.P1, guards: true, horizonId: "30d" }),
  );
  const [runNumber, setRunNumber] = useState(1);
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState<FilterId>("all");
  const [sortNewest, setSortNewest] = useState(true);
  const [comparison, setComparison] = useState(false);
  const [flash, setFlash] = useState<"export" | null>(null);

  const policy = findPolicy(params.policyId);
  const steps = graceSteps[params.policyId];
  const horizon = horizonOf(params.horizonId);
  const grace = steps[params.stepIndex];
  const curve = curveFor(params);
  const curveMax = Math.max(...curve, 1);

  /**
   * No policy or replay horizon yet — the endpoints behind the data holes
   * above have not been wired. Render the empty state instead of simulating
   * against nothing.
   */
  if (!policy || !horizon || !result) {
    return (
      <div className="rounded-xl border border-dashed border-outline-variant p-10 text-center">
        <Icon name="experiment" className="text-muted text-[36px]" />
        <h2 className="font-headline-sm text-headline-sm text-on-surface mt-3">
          No replay data yet
        </h2>
      </div>
    );
  }

  const stale = signatureOf(params) !== result.signature;

  const scenarioId =
    simScenarios.find(
      (scenario) =>
        scenarioStep(scenario.id, params.policyId) === params.stepIndex &&
        scenario.guards === params.guards,
    )?.id ?? "custom";

  const visibleRows = result.rows
    .filter((row) => filter === "all" || row.outcome === filter)
    .sort((a, b) =>
      sortNewest
        ? b.cls.iso.localeCompare(a.cls.iso)
        : a.cls.iso.localeCompare(b.cls.iso),
    );

  const severity = severityTone[policy.severity];
  const meta: NotifyMeta = notifyMeta[result.policy.id] ?? {
    channel: "—",
    recipients: [],
    escalation: "—",
  };
  const wouldDeliver = result.counts.triggered;
  const baselineDelta = result.counts.triggered - result.baselineTriggers;
  const configuredGrace = graceSteps[params.policyId][defaultStep[params.policyId]];
  const resultConfiguredGrace =
    graceSteps[result.params.policyId][defaultStep[result.params.policyId]];

  const run = () => {
    if (running) return;
    setRunning(true);
    setTimeout(() => {
      setResult(simulate(params));
      setRunNumber((number) => number + 1);
      setRunning(false);
    }, 700);
  };

  const flashExport = () => {
    setFlash("export");
    setTimeout(() => setFlash(null), 2200);
  };

  const setScenario = (id: string) => {
    const step = scenarioStep(id, params.policyId);
    const scenario = simScenarios.find((item) => item.id === id);
    setParams((current) => ({ ...current, stepIndex: step, guards: scenario?.guards ?? true }));
  };

  return (
    <>
      {/* Sub-header: breadcrumb + title + actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/policies" className="font-body-sm text-body-sm text-muted hover:text-on-surface transition-colors">
              Policy Configuration
            </Link>
            <Icon name="chevron_right" className="text-muted text-[14px]" />
            <Link href="/policies" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
              {policy.id}: {policy.name}
            </Link>
            <Icon name="chevron_right" className="text-muted text-[14px]" />
            <span className="font-mono-code text-mono-code font-semibold text-primary">
              Simulation &amp; Historical Test
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">
              Policy Test Lab
            </h1>
            <div className="px-2 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary font-label-caps text-label-caps uppercase flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping" />
              <span>Simulation Environment • Read-Only (No Alerts Fired)</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setComparison((value) => !value)}
            className={`px-3 py-1.5 rounded font-body-sm text-body-sm transition-colors flex items-center gap-1.5 shadow-sm ${
              comparison
                ? "bg-primary-container text-on-primary-container font-semibold"
                : "bg-surface-container hover:bg-surface-container-high text-on-surface"
            }`}
          >
            <Icon name="tune" className="text-[16px]" />
            <span>Comparison Mode</span>
          </button>
          <button
            type="button"
            onClick={run}
            disabled={running}
            className="px-4 py-1.5 rounded bg-primary-container hover:bg-inverse-primary text-on-primary-container font-body-sm text-body-sm font-semibold transition-all shadow-md flex items-center gap-2 disabled:opacity-70"
          >
            <Icon
              name={running ? "sync" : "play_arrow"}
              className={`text-[18px] ${running ? "animate-spin" : ""}`}
            />
            <span>{running ? "Running Simulation..." : "Run Simulation"}</span>
          </button>
        </div>
      </div>

      {/* Workspace split: config (5) / results (7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start pb-24">
        {/* LEFT — parameters */}
        <div className="lg:col-span-5 flex flex-col gap-gutter">
          <div className="rounded-xl bg-surface-container-low p-margin-page shadow-md flex flex-col gap-4 relative overflow-hidden">

            <div className="flex flex-col gap-1.5 relative">
              <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                Target Policy
              </span>
              <select
                aria-label="Target policy"
                value={params.policyId}
                onChange={(event) => {
                  const policyId = event.target.value as PolicyId;
                  setParams((current) => ({
                    ...current,
                    policyId,
                    stepIndex: defaultStep[policyId],
                  }));
                }}
                className="w-full appearance-none px-3 py-2 pr-8 rounded bg-surface-container-lowest text-on-surface font-headline-sm text-headline-sm focus:outline-none focus:bg-surface-container-highest cursor-pointer transition"
              >
                {policies.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.id}: {item.name}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-primary font-mono-code text-micro-label font-semibold">
                  Draft parameters
                </span>
                <span className="font-mono-code text-micro-label text-muted">
                  {policy.firedLast7d} fired / 7d in production
                </span>
              </div>
            </div>

            <div className="h-px w-full bg-surface-container-highest" />

            {/* Scenario selector */}
            <div className="flex flex-col gap-1.5">
              <span className="font-label-caps text-label-caps text-muted uppercase tracking-wider">
                What-if Scenario
              </span>
              <select
                aria-label="What-if scenario"
                value={scenarioId}
                onChange={(event) => {
                  if (event.target.value !== "custom") setScenario(event.target.value);
                }}
                className="w-full appearance-none px-3.5 py-2 pr-8 rounded bg-surface-container text-on-surface font-body-sm text-body-sm focus:outline-none cursor-pointer"
              >
                {simScenarios.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.label}
                  </option>
                ))}
                {scenarioId === "custom" ? (
                  <option value="custom">Custom parameters (unsaved)</option>
                ) : null}
              </select>
              <span className="font-body-sm text-[12px] text-muted">
                {scenarioId === "custom"
                  ? null
                  : simScenarios.find((scenario) => scenario.id === scenarioId)?.description}
              </span>
            </div>

            {/* Grace period slider */}
            <div className="flex flex-col gap-3 bg-surface-container rounded-lg p-stack-comfortable">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon name="timer" className="text-muted text-[18px]" />
                  <label
                    htmlFor="grace-slider"
                    className="font-body-sm text-body-sm font-semibold text-on-surface"
                  >
                    Grace Period
                  </label>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono-code text-[18px] font-bold text-secondary">
                    {grace}
                  </span>
                  <span className="font-mono-code text-[12px] text-on-surface-variant">minutes</span>
                  {params.stepIndex !== defaultStep[params.policyId] ? (
                    <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-muted font-mono-code text-micro-label line-through">
                      {configuredGrace}m
                    </span>
                  ) : null}
                </div>
              </div>
              <input
                id="grace-slider"
                type="range"
                min={0}
                max={steps.length - 1}
                step={1}
                value={params.stepIndex}
                onChange={(event) =>
                  setParams((current) => ({ ...current, stepIndex: Number(event.target.value) }))
                }
                className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-secondary"
              />
              <div className="flex justify-between font-mono-code text-micro-label text-muted px-0.5">
                <span>{fmtMinutes(steps[0])} (Strict)</span>
                <span>{fmtMinutes(steps[1])}</span>
                <span className="text-secondary font-bold">
                  {fmtMinutes(configuredGrace)} (Configured)
                </span>
                <span>{fmtMinutes(steps[steps.length - 2])}</span>
                <span>{fmtMinutes(steps[steps.length - 1])} (Permissive)</span>
              </div>
            </div>

            {/* Horizon selector */}
            <div className="flex flex-col gap-1.5">
              <span className="font-label-caps text-label-caps text-muted uppercase tracking-wider">
                Evaluation Sample Horizon
              </span>
              <div className="flex items-center justify-between p-stack-comfortable rounded-lg bg-surface-container gap-3">
                <div className="flex items-center gap-stack-compact">
                  <Icon name="calendar_month" className="text-primary text-[18px]" />
                  <div className="flex flex-col">
                    <select
                      aria-label="Evaluation sample horizon"
                      value={params.horizonId}
                      onChange={(event) =>
                        setParams((current) => ({ ...current, horizonId: event.target.value }))
                      }
                      className="bg-transparent font-body-sm text-body-sm font-medium text-on-surface focus:outline-none cursor-pointer"
                    >
                      {simHorizons.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <span className="font-mono-code text-micro-label text-muted">{horizon.range}</span>
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-surface-container-high text-on-surface-variant font-mono-code text-micro-label">
                  {horizon.events.toLocaleString("en-US")} Events
                </span>
              </div>
            </div>

            {/* Scope matrix */}
            <div className="grid grid-cols-2 gap-stack-compact">
              <div className="p-4 rounded-lg bg-surface-container flex flex-col gap-1.5">
                <span className="font-label-caps text-label-caps text-muted uppercase">
                  Active Triggers
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {policy.trigger.split("|").map((trigger) => (
                    <span
                      key={trigger}
                      className="px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface font-mono-code text-micro-label"
                    >
                      {trigger.trim()}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-surface-container flex flex-col gap-1.5">
                <span className="font-label-caps text-label-caps text-muted uppercase">
                  Assigned Severity
                </span>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`w-2 h-2 rounded-full ${severity.dot}`} />
                  <span className={`font-body-sm text-body-sm font-semibold ${severity.text}`}>
                    {severity.label} ({policy.id})
                  </span>
                </div>
              </div>
            </div>

            {/* Scope bounds */}
            <div className="p-4 rounded-lg bg-surface-container flex flex-col gap-2">
              <span className="font-label-caps text-label-caps text-muted uppercase">
                Target Scope Bounds
              </span>
              <div className="flex flex-col gap-1.5 font-mono-code text-micro-label">
                {/* DATA HOLE — repo and Figma scope come from the policy's target
                    bindings, which the API does not serve yet. */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted flex items-center gap-1">
                    <Icon name="source" className="text-[14px]" /> Git Repos:
                  </span>
                  <span className="text-muted font-medium">Not yet scoped</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted flex items-center gap-1">
                    <Icon name="draw" className="text-[14px]" /> Figma Project:
                  </span>
                  <span className="text-muted font-medium">Not yet scoped</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted flex items-center gap-1">
                    <Icon name="label" className="text-[14px]" /> Suppression Guard:
                  </span>
                  <span className="text-on-surface-variant font-medium">
                    {params.guards ? `${policy.guards.length} clauses armed` : "bypassed (audit)"}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={run}
              disabled={running}
              className="w-full py-2.5 px-4 rounded bg-surface-container-highest hover:bg-surface-bright text-on-surface font-body-sm text-body-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
            >
              <Icon
                name={running ? "sync" : "cached"}
                className={`text-primary text-[18px] ${running ? "animate-spin" : ""}`}
              />
              <span>Re-run Simulation with Adjusted Parameters</span>
            </button>
          </div>

          {/* Sensitivity curve */}
          <div className="rounded-xl bg-surface-container-low p-stack-comfortable shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-label-caps text-muted uppercase tracking-wider">
                Grace Period Sensitivity Curve
              </span>
              <span className="font-mono-code text-micro-label text-tertiary">{horizon.label}</span>
            </div>
            <div className="h-20 w-full flex items-end justify-between gap-1 px-1 py-1">
              {curve.map((count, index) => (
                <div
                  key={steps[index]}
                  className={`w-full rounded-t transition-all flex flex-col justify-end items-center group relative ${
                    index === params.stepIndex
                      ? "bg-secondary-container"
                      : "bg-surface-container hover:bg-primary/20"
                  }`}
                  style={{
                    height: `${Math.max(6, Math.round((count / curveMax) * 100))}%`,
                  }}
                >
                  <span className="hidden group-hover:block absolute -top-6 bg-surface-container-highest text-on-surface font-mono-code text-micro-label px-1 py-0.5 rounded shadow whitespace-nowrap">
                    {fmtMinutes(steps[index])}: {count} alerts
                    {index === params.stepIndex ? " (Selected)" : ""}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-mono-code text-micro-label text-muted px-1">
              {steps.map((step, index) => (
                <span
                  key={step}
                  className={index === params.stepIndex ? "text-secondary font-bold" : ""}
                >
                  {fmtMinutes(step)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — results */}
        <div className="lg:col-span-7 flex flex-col gap-gutter">
          {/* Stale banner */}
          {stale ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-tertiary-container/25 text-on-tertiary-container font-mono-code text-micro-label">
              <Icon name="history" className="text-[16px] shrink-0" />
              <span>
                Parameters changed since run #{runNumber}.
              </span>
            </div>
          ) : null}

          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-stack-compact">
            <MetricCard
              label="Evaluated"
              value={result.counts.evaluated.toLocaleString("en-US")}
              unit="events"
              footnote={
                <span className="flex items-center gap-1 text-secondary">
                  <Icon name="check_circle" className="text-[12px]" />{" "}
                  {result.horizon.events > 0
                    ? `${Math.round((result.counts.evaluated / result.horizon.events) * 100)}% coverage`
                    : "coverage pending"}
                </span>
              }
              footnoteTone="text-secondary"
            />
            <MetricCard
              label="Simulated Triggers"
              value={result.counts.triggered}
              unit="violations"
              unitTone="text-error font-semibold"
              valueTone="text-error"
              footnote={
                comparison ? (
                  <span className={baselineDelta <= 0 ? "text-secondary" : "text-tertiary"}>
                    {baselineDelta >= 0 ? "+" : "−"}
                    {Math.abs(baselineDelta)} vs configured {resultConfiguredGrace}m
                  </span>
                ) : (
                  `${(result.rate * 100).toFixed(2)}% trigger rate`
                )
              }
              footnoteTone="text-outline"
            />
            <MetricCard
              label="Est. Alert Volume"
              value={`~${result.perDay.toFixed(1)}`}
              unit="/ day"
              valueTone="text-primary"
              footnote={
                comparison ? (
                  <span className={baselineDelta <= 0 ? "text-secondary" : "text-tertiary"}>
                    {baselineDelta >= 0 ? "+" : "−"}
                    {(Math.abs(baselineDelta) / result.horizon.days).toFixed(1)}/day vs configured{" "}
                    {resultConfiguredGrace}m
                  </span>
                ) : (
                  `${result.counts.triggered} across ${result.horizon.days} days`
                )
              }
              footnoteTone="text-muted"
            />
            <MetricCard
              label="False Positives"
              value={`${result.fpPct.toFixed(1)}%`}
              unit="est."
              valueTone="text-secondary"
              footnote={
                result.fpPct <= 5
                  ? `${result.fpExpected.toFixed(1)} of ${result.counts.triggered} flagged — within 5%`
                  : `${result.fpExpected.toFixed(1)} of ${result.counts.triggered} flagged — over 5%`
              }
              footnoteTone={result.fpPct <= 5 ? "text-secondary" : "text-tertiary"}
            />
          </div>

          {/* Filter strip */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-lg">
              {(
                [
                  { id: "all" as FilterId, label: "All Events", count: result.counts.evaluated, dot: "" },
                  { id: "triggered" as FilterId, label: "Triggered", count: result.counts.triggered, dot: "bg-error" },
                  { id: "passed" as FilterId, label: "Passed Grace", count: result.counts.passed, dot: "bg-secondary" },
                  { id: "suppressed" as FilterId, label: "Suppressed", count: result.counts.suppressed, dot: "bg-tertiary" },
                ]
              ).map((tab) => {
                const active = filter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id)}
                    className={`px-2.5 py-1 rounded font-body-sm text-body-sm transition flex items-center gap-1.5 ${
                      active
                        ? "bg-surface-container text-on-surface font-semibold shadow-sm"
                        : "hover:bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {tab.dot ? <span className={`w-2 h-2 rounded-full ${tab.dot}`} /> : null}
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-mono-code text-micro-label ${
                        tab.id === "triggered" && active
                          ? "bg-error-container/40 text-error font-bold"
                          : "bg-surface-container-highest text-muted"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono-code text-micro-label text-muted">
                Sort: {sortNewest ? "Newest" : "Oldest"} First
              </span>
              <button
                type="button"
                aria-label="Toggle sort order"
                onClick={() => setSortNewest((value) => !value)}
                className="p-1 rounded bg-surface-container-low hover:bg-surface-container text-muted hover:text-on-surface"
              >
                <Icon name="swap_vert" className="text-[18px]" />
              </button>
            </div>
          </div>

          {/* Event stream */}
          <div className="flex flex-col gap-stack-compact overflow-y-auto max-h-[640px] pr-1">
            {visibleRows.map((row) => (
              <EventRow
                key={`${result.signature}-${row.cls.id}`}
                row={row}
                policy={result.policy}
                grace={result.grace}
              />
            ))}
            {visibleRows.length === 0 ? (
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 text-center font-mono-code text-[12px] text-muted">
                No {filter} events in run #{runNumber}.
              </div>
            ) : null}
          </div>

          {/* Expected notifications */}
          <div className="rounded-xl bg-surface-container-low p-4 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                <Icon name="notifications_active" className="text-[16px] text-primary" />
                Expected Notifications if Promoted
              </span>
              <span className="px-2 py-0.5 rounded bg-primary/15 text-primary font-mono-code text-micro-label font-bold">
                {wouldDeliver} message{wouldDeliver === 1 ? "" : "s"} composed
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 font-mono-code text-micro-label">
              <div className="flex flex-col gap-1.5">
                <span className="text-muted uppercase text-micro-label">Template</span>
                <span className="text-on-surface">{result.policy.notifyTemplate}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-muted uppercase text-micro-label">Channel</span>
                <span className="text-on-surface">
                  {meta.channel} · {meta.recipients.join(", ")}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-muted uppercase text-micro-label">Escalation</span>
                <span className="text-on-surface-variant">{meta.escalation}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating promotion bar */}
      <div className="fixed bottom-4 left-72 right-8 bg-surface-container-high/90 backdrop-blur-md px-margin-page py-3 rounded-xl shadow-xl flex flex-wrap items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary shrink-0">
            <Icon name="verified" className="text-[18px]" />
          </div>
          <div className="flex flex-col">
            <span className="font-body-sm text-body-sm font-semibold text-on-surface">
              Ready to promote draft parameters for {result.policy.id}: {result.policy.name}
            </span>
            <span className="font-mono-code text-micro-label text-muted">
              Simulated impact: {result.counts.triggered} violations across {result.horizon.days}{" "}
              days · run #{runNumber}
              {stale ? " · stale (re-run first)" : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={flashExport}
            className="px-3 py-2 rounded bg-surface-container hover:bg-surface-bright text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm transition-colors flex items-center gap-1.5"
          >
            <Icon name={flash === "export" ? "check_circle" : "file_download"} className="text-[16px]" />
            <span>
              {flash === "export" ? "Report queued" : "Export Simulation Report (JSON/CSV)"}
            </span>
          </button>
          <Link
            href="/policies"
            className="px-4 py-2 rounded bg-primary-container hover:bg-inverse-primary text-on-primary font-body-sm text-body-sm font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Icon name="bolt" className="text-[18px]" />
            <span>Apply Parameters in Editor</span>
          </Link>
        </div>
      </div>
    </>
  );
}

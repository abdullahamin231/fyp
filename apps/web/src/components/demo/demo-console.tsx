"use client";

import Link from "next/link";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { Badge, type Tone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Panel, PanelHeader } from "@/components/ui/panel";
import {
  deliverDemoTicket,
  getDemoStatus,
  reverifyDemoPr,
  runLinkingDemo,
  setDemoFault,
  type DemoStatus,
  type FaultMode,
  type StepOutcome,
} from "@/lib/demo/actions";
import type { LinkingCheck } from "@/lib/demo/linking";

/**
 * `/demo` — the whole walkthrough as buttons. Each step drives the real
 * pipeline (signed deliveries to the real webhook endpoint, the real worker),
 * and the pipeline monitor on the right shows jobs and verdicts landing live,
 * so nothing in the demo needs a terminal.
 */

const REPO_URL = "https://github.com/abdullahamin231/fyp";

const verdictTone: Record<string, Tone> = {
  SUPPORTED: "success",
  CONTRADICTED: "critical",
  PARTIAL: "warning",
  INSUFFICIENT_EVIDENCE: "info",
};

const stateTone: Record<string, Tone> = {
  queued: "neutral",
  running: "accent",
  succeeded: "success",
  failed: "critical",
  cancelled: "neutral",
};

function useStep() {
  const [pending, start] = useTransition();
  const [outcome, setOutcome] = useState<(StepOutcome & { checks?: LinkingCheck[] }) | null>(null);
  const run = (action: () => Promise<StepOutcome & { checks?: LinkingCheck[] }>) =>
    start(async () => {
      setOutcome(null);
      setOutcome(await action());
    });
  return { pending, outcome, run };
}

function Outcome({ outcome }: { outcome: (StepOutcome & { checks?: LinkingCheck[] }) | null }) {
  if (!outcome) return null;
  return (
    <div
      className={`mt-3 rounded-lg border px-3 py-2 ${
        outcome.ok ? "border-secondary/40 bg-secondary/5" : "border-error/40 bg-error-container/20"
      }`}
    >
      <p className={`text-body-sm font-semibold ${outcome.ok ? "text-secondary" : "text-error"}`}>
        {outcome.message}
      </p>
      {outcome.checks ? (
        <ul className="mt-2 space-y-1">
          {outcome.checks.map((check) => (
            <li key={check.name} className="flex items-start gap-2 text-body-sm">
              <Icon
                name={check.ok ? "check_circle" : "cancel"}
                className={`text-[16px] mt-0.5 ${check.ok ? "text-secondary" : "text-error"}`}
              />
              <span className="text-on-surface">{check.name}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {outcome.detail ? (
        <p className="mt-1 font-mono-code text-micro-label text-muted break-all">{outcome.detail}</p>
      ) : null}
    </div>
  );
}

function OpenLinks({ links }: { links: { href: string; label: string; external?: boolean }[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {links.map((link) =>
        link.external ? (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-outline-variant text-micro-label font-mono-code text-on-surface-variant hover:text-on-surface hover:border-outline transition-colors"
          >
            {link.label}
            <Icon name="open_in_new" className="text-[12px]" />
          </a>
        ) : (
          <Link
            key={link.href}
            href={link.href}
            target="_blank"
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-outline-variant text-micro-label font-mono-code text-on-surface-variant hover:text-on-surface hover:border-outline transition-colors"
          >
            {link.label}
            <Icon name="arrow_outward" className="text-[12px]" />
          </Link>
        ),
      )}
    </div>
  );
}

function Step({
  number,
  title,
  shows,
  expect,
  children,
}: {
  number: number;
  title: string;
  shows: string;
  expect?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Panel className="p-4">
      <div className="flex items-start gap-3">
        <span className="w-7 h-7 shrink-0 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center font-mono-code text-body-sm font-bold text-on-surface">
          {number}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{title}</h3>
          <p className="text-body-sm text-on-surface-variant mt-0.5">{shows}</p>
          {expect ? (
            <p className="text-body-sm text-muted mt-1">
              <span className="font-semibold text-on-surface-variant">Expect: </span>
              {expect}
            </p>
          ) : null}
          {children}
        </div>
      </div>
    </Panel>
  );
}

function PipelineMonitor({ status, error }: { status: DemoStatus | null; error: string | null }) {
  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        title="Live pipeline"
        description="Verification jobs as the worker claims and finishes them · refreshes every 2s"
        action={<Badge tone="success" pulse>Live</Badge>}
      />
      {status && status.fault !== "none" ? (
        <div className="mx-4 mb-3 flex items-center gap-2 rounded-lg border border-error/50 bg-error-container/30 px-3 py-2">
          <Icon name="warning" className="text-error text-[18px]" />
          <p className="text-body-sm text-error font-semibold">
            Fault injection armed ({status.fault}) — the model fabricates citations. Disarm after step 6.
          </p>
        </div>
      ) : null}
      {error ? <p className="px-4 pb-4 text-body-sm text-error">{error}</p> : null}
      <div className="overflow-x-auto">
        <table className="w-full text-body-sm">
          <thead>
            <tr className="text-left text-label-caps uppercase text-muted border-y border-outline-variant/60">
              <th className="px-4 py-2 font-semibold">Criterion</th>
              <th className="px-2 py-2 font-semibold">Job</th>
              <th className="px-2 py-2 font-semibold">Verdict</th>
              <th className="px-2 py-2 font-semibold">Gate</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {(status?.rows ?? []).map((row) => (
              <tr key={row.jobId} className="border-b border-outline-variant/30 align-top">
                <td className="px-4 py-2">
                  <p className="font-mono-code text-on-surface">{row.criterion}</p>
                  <p className="font-mono-code text-micro-label text-muted">
                    head {row.head} · {new Date(row.enqueuedAt).toLocaleTimeString()}
                  </p>
                </td>
                <td className="px-2 py-2">
                  <Badge tone={stateTone[row.state] ?? "neutral"} pulse={row.state === "running" || row.state === "queued"}>
                    {row.state}
                  </Badge>
                  {row.error ? (
                    <p className="mt-1 text-micro-label text-error max-w-48 truncate" title={row.error}>
                      {row.error}
                    </p>
                  ) : null}
                </td>
                <td className="px-2 py-2">
                  {row.verdict ? (
                    <Badge tone={verdictTone[row.verdict] ?? "neutral"}>{row.verdict.replace("_", " ")}</Badge>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="px-2 py-2">
                  {row.gateOutcome ? (
                    <span
                      className={`font-mono-code text-micro-label font-bold ${
                        row.gateOutcome === "PASSED" ? "text-secondary" : "text-error"
                      }`}
                    >
                      {row.gateOutcome}
                      {row.reasonCode ? ` · ${row.reasonCode}` : ""}
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  {row.findingId ? (
                    <Link
                      href={`/conflicts/${row.findingId}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-micro-label font-mono-code text-primary hover:underline"
                    >
                      Open
                      <Icon name="arrow_outward" className="text-[12px]" />
                    </Link>
                  ) : null}
                </td>
              </tr>
            ))}
            {status && status.rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">
                  No verification jobs yet — run step 4.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function DemoConsole({ slug }: { slug: string }) {
  const [status, setStatus] = useState<DemoStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const ticket7 = useStep();
  const ticket8 = useStep();
  const linking = useStep();
  const pr47 = useStep();
  const pr48 = useStep();
  const fault = useStep();
  const t10 = useStep();

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const next = await getDemoStatus(slug);
        if (alive) {
          setStatus(next);
          setStatusError(null);
        }
      } catch (error) {
        if (alive) setStatusError(error instanceof Error ? error.message : String(error));
      }
    };
    poll();
    const timer = setInterval(poll, 2000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [slug]);

  const armed: FaultMode = status?.fault ?? "none";
  const ws = encodeURIComponent(slug);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-gutter items-start">
      <div className="space-y-4">
        <Step
          number={1}
          title="Orient: the product and its connections"
          shows="Auth, workspaces, read-only OAuth connections, and the evidence graph as it stands."
        >
          <OpenLinks
            links={[
              { href: "/", label: "Dashboard" },
              { href: "/workspaces", label: "Workspaces" },
              { href: `/settings/integrations?workspace=${ws}`, label: "Provider apps" },
              { href: `/settings/workspace?workspace=${ws}`, label: "Pipeline settings" },
              { href: "/graph", label: "Graph explorer" },
            ]}
          />
        </Step>

        <Step
          number={2}
          title="Ingest: a Jira ticket arrives"
          shows="A signed Jira delivery hits the real webhook. Its acceptance criteria become first-class Criterion nodes. (Jira is replayed — real payload shape, real signature, real endpoint.)"
          expect="200, then the delivery in Ingestion and the ticket + criteria in the graph."
        >
          <div className="mt-3 flex flex-wrap gap-2">
            <Button leadingIcon="confirmation_number" disabled={ticket7.pending} onClick={() => ticket7.run(() => deliverDemoTicket(slug, "UNI-7"))}>
              {ticket7.pending ? "Delivering…" : "Deliver UNI-7"}
            </Button>
            <Button variant="outline" leadingIcon="confirmation_number" disabled={ticket8.pending} onClick={() => ticket8.run(() => deliverDemoTicket(slug, "UNI-8"))}>
              {ticket8.pending ? "Delivering…" : "Deliver UNI-8"}
            </Button>
          </div>
          <Outcome outcome={ticket7.outcome} />
          <Outcome outcome={ticket8.outcome} />
          <OpenLinks links={[{ href: "/ingest", label: "Ingestion" }, { href: "/graph", label: "Graph" }]} />
        </Step>

        <Step
          number={3}
          title="Link: duplicates, out-of-order, Rule 2"
          shows="Eight deliveries into the scratch workspace: a duplicate is ignored, a PR naming a ticket that does not exist yet links once the ticket arrives, and merging while the ticket is In Progress raises Rule 2."
          expect="8/8 checks pass."
        >
          <div className="mt-3">
            <Button leadingIcon="link" disabled={linking.pending} onClick={() => linking.run(runLinkingDemo)}>
              {linking.pending ? "Running…" : "Run linking scenario"}
            </Button>
          </div>
          <Outcome outcome={linking.outcome} />
          <OpenLinks links={[{ href: "/links", label: "Link management" }, { href: "/conflicts", label: "Conflict inbox" }]} />
        </Step>

        <Step
          number={4}
          title="Verify a correct change — PR #47"
          shows="The PR is reopened: linker → one job per criterion pinned to base/head → worker clones and analyses the repo, runs its tests → evidence packet → bounded verifier loop → provenance gate."
          expect={<>three UNI-7 rows go queued → running → <b>SUPPORTED</b>, gate PASSED (~25s).</>}
        >
          <div className="mt-3">
            <Button leadingIcon="play_arrow" disabled={pr47.pending} onClick={() => pr47.run(() => reverifyDemoPr(slug, 47))}>
              {pr47.pending ? "Delivering…" : "Re-verify PR #47"}
            </Button>
          </div>
          <Outcome outcome={pr47.outcome} />
          <OpenLinks links={[{ href: `${REPO_URL}/pull/47/files`, label: "PR #47 diff", external: true }, { href: "/conflicts", label: "Conflict inbox" }]} />
        </Step>

        <Step
          number={5}
          title="Catch a bad change — PR #48"
          shows="UNI-8 says exactly-at-threshold is stale; PR #48 flips >= to >. It looks harmless in review — the repository's own tests disprove it."
          expect={<>two UNI-8 rows → <b>CONTRADICTED</b>, critical, citing the failing test run.</>}
        >
          <div className="mt-3">
            <Button leadingIcon="play_arrow" disabled={pr48.pending} onClick={() => pr48.run(() => reverifyDemoPr(slug, 48))}>
              {pr48.pending ? "Delivering…" : "Re-verify PR #48"}
            </Button>
          </div>
          <Outcome outcome={pr48.outcome} />
          <OpenLinks links={[{ href: `${REPO_URL}/pull/48/files`, label: "PR #48 diff", external: true }]} />
        </Step>

        <Step
          number={6}
          title="Failure case (T10) — a model that invents evidence"
          shows="Arm the fault: the model now cites evidence that was never in its packet. The gate resolves every citation against the immutable packet and refuses the decisive verdict."
          expect={<>armed → UNI-8 rows → <b>INSUFFICIENT EVIDENCE</b>, gate DOWNGRADED. Then disarm and re-verify to restore CONTRADICTED.</>}
        >
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {armed === "none" ? (
              <Button variant="danger" leadingIcon="bug_report" disabled={fault.pending} onClick={() => fault.run(() => setDemoFault(slug, "only"))}>
                Arm fault
              </Button>
            ) : (
              <Button variant="outline" leadingIcon="verified_user" disabled={fault.pending} onClick={() => fault.run(() => setDemoFault(slug, "none"))}>
                Disarm fault
              </Button>
            )}
            <Button leadingIcon="play_arrow" disabled={t10.pending} onClick={() => t10.run(() => reverifyDemoPr(slug, 48))}>
              {t10.pending ? "Delivering…" : "Re-verify PR #48"}
            </Button>
            <Badge tone={armed === "none" ? "success" : "critical"}>{armed === "none" ? "disarmed" : `armed · ${armed}`}</Badge>
          </div>
          <Outcome outcome={fault.outcome} />
          <Outcome outcome={t10.outcome} />
        </Step>

        <Step
          number={7}
          title="The reviewer acts"
          shows="Open any finding from the live pipeline: citations, verification passes, packet manifest, gate. Acknowledge / dispute / reopen — each needs a reason and is audited. Confirm or dismiss links."
        >
          <OpenLinks links={[{ href: "/conflicts", label: "Conflict inbox" }, { href: "/links", label: "Link management" }]} />
        </Step>

        <Step
          number={8}
          title="Explore the evidence graph"
          shows="Scroll to pan, Ctrl/⌘ + scroll to zoom, hover to trace one hop, Show Only Conflicts; in the artifact graph, search a node and switch layouts."
        >
          <OpenLinks links={[{ href: "/graph", label: "Graph explorer" }, { href: "/graph/artifacts", label: "Artifact graph" }]} />
        </Step>

        <Step
          number={9}
          title="Proof it was real — and the boundaries"
          shows="Raw deliveries and normalised events, the activity feed, alerts, and evaluation counts over stored verdicts. Then say plainly: the model is the deterministic stub (model selection still open), Jira is replayed, design→criterion linking is not wired, and Policies / Simulation / Search / Slack / Notifications / Audit console / Onboarding / Profile are screens without data yet."
        >
          <OpenLinks
            links={[
              { href: "/ingest", label: "Ingestion" },
              { href: "/activity", label: "Activity" },
              { href: "/alerts", label: "Alerts" },
              { href: "/evaluation", label: "Evaluation" },
            ]}
          />
        </Step>
      </div>

      <div className="xl:sticky xl:top-4">
        <PipelineMonitor status={status} error={statusError} />
      </div>
    </div>
  );
}

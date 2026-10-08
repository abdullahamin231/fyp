"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { StudyEvidence } from "@/components/study/study-evidence";
import {
  StudyDecisionForm,
  type Decision,
} from "@/components/study/study-decision-form";
import {
  scenarios,
  studyTasks,
  type ScenarioEvidence,
} from "@/components/study/scenarios";
import type { Verdict } from "@/lib/types";

type TaskRecord = {
  timeMs: number;
  artifacts: number;
  edges: number;
  queries: number;
  confidence: number;
  verdict: Verdict;
  outputs: number;
};

type Split = { label: string; ms: number };

const confidenceLabels: Record<number, string> = {
  1: "Level 1 (Very Low)",
  2: "Level 2 (Low)",
  3: "Level 3 (Moderate)",
  4: "Level 4 (High)",
  5: "Level 5 (Certain)",
};

/** Seeded record for the task the participant already completed. */
const seededRecords: Record<number, TaskRecord> = {
  1: {
    timeMs: 401_000,
    artifacts: 6,
    edges: 9,
    queries: 4,
    confidence: 3,
    verdict: "CONTRADICTED",
    outputs: 4,
  },
};

const emptyDecision = (evidence: ScenarioEvidence): Decision => ({
  verdict: null,
  rootCause: "",
  stakeholders: evidence.stakeholders
    .filter((person) => person.preselected)
    .map((person) => person.id),
  justification: "",
});

function clock(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  const seconds = (ms % 60_000) / 1000;
  return `${String(minutes).padStart(2, "0")}:${seconds.toFixed(1).padStart(4, "0")}`;
}

function shortClock(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Study runner: participant task list, live timing capture, telemetry,
 * per-task notes and the manual vs UNIFY-assisted comparison, wired around
 * the scenario evidence workspace and the decision submission form.
 */
export function StudyRunner() {
  const toast = useToast();
  const [activeTask, setActiveTask] = useState(2);
  const [records, setRecords] = useState<Record<number, TaskRecord>>(seededRecords);
  const [elapsed, setElapsed] = useState(222_800);
  const [running, setRunning] = useState(true);
  const [splits, setSplits] = useState<Split[]>([
    { label: "Task started", ms: 0 },
    { label: "First artifact opened", ms: 72_400 },
  ]);
  const [telemetry, setTelemetry] = useState({ artifacts: 3, edges: 5, queries: 2 });
  const [confidence, setConfidence] = useState(4);
  const [notes, setNotes] = useState<Record<number, string>>({
    2: "Frame updated after merge — checking whether PROJ-88 was re-reviewed…",
  });
  const [noteSavedAt, setNoteSavedAt] = useState("14:32");
  const [decision, setDecision] = useState<Decision>(() =>
    emptyDecision(scenarios[studyTasks[1].scenario]),
  );
  const [submitting, setSubmitting] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (!running || activeTask > studyTasks.length) return;
    const interval = setInterval(() => setElapsed((prev) => prev + 100), 100);
    return () => clearInterval(interval);
  }, [running, activeTask]);

  const finished = activeTask > studyTasks.length;
  const task = finished ? null : studyTasks[activeTask - 1];
  const evidence = task ? scenarios[task.scenario] : null;

  function captureSplit(label: string, ms = elapsed) {
    setSplits((prev) => [...prev, { label, ms }]);
  }

  function flagDiscrepancy() {
    captureSplit("Discrepancy flagged");
    toast("Discrepancy flagged — reviewer will inspect this state", {
      icon: "flag",
      tone: "error",
    });
  }

  function abandon() {
    captureSplit("Task abandoned");
    toast("Task marked abandoned — partial timing is kept for analysis", {
      icon: "cancel",
      tone: "neutral",
    });
  }

  function scrollToForm() {
    document.getElementById("decision-submission")?.scrollIntoView({ behavior: "smooth" });
  }

  function inspectNode() {
    setTelemetry((prev) => ({ ...prev, edges: prev.edges + 1 }));
  }

  function openTab() {
    setTelemetry((prev) => ({ ...prev, artifacts: Math.min(prev.artifacts + 1, 5) }));
  }

  function updateDecision(patch: Partial<Decision>) {
    setDecision((prev) => ({ ...prev, ...patch }));
  }

  function submit() {
    if (
      !task ||
      !evidence ||
      decision.verdict === null ||
      decision.rootCause === "" ||
      decision.stakeholders.length < 2 ||
      decision.justification.trim().length < 10
    ) {
      toast("Complete all four required outputs before submitting", {
        icon: "error",
        tone: "error",
      });
      return;
    }
    setSubmitting(true);
    captureSplit("Decision submitted");
    timers.current.push(
      setTimeout(() => {
        setRecords((prev) => ({
          ...prev,
          [task.id]: {
            timeMs: elapsed,
            artifacts: telemetry.artifacts,
            edges: telemetry.edges,
            queries: telemetry.queries,
            confidence,
            verdict: decision.verdict as Verdict,
            outputs: 4,
          },
        }));
        const nextTask = activeTask + 1;
        setActiveTask(nextTask);
        setElapsed(0);
        setTelemetry({ artifacts: 0, edges: 0, queries: 0 });
        setSplits([{ label: "Task started", ms: 0 }]);
        setConfidence(4);
        setDecision(
          emptyDecision(scenarios[studyTasks[Math.min(nextTask, studyTasks.length) - 1].scenario]),
        );
        setSubmitting(false);
        toast(
          nextTask > studyTasks.length
            ? "Task 4 recorded — session complete, thank you"
            : `Task ${task.id} recorded · loading task ${nextTask}`,
          { icon: "check_circle" },
        );
      }, 1200),
    );
  }

  /* ------------------------------------------------------- comparison model */

  const conditionRows = (condition: "MANUAL" | "UNIFY") => {
    const own = studyTasks.filter((item) => item.condition === condition);
    const done = own.filter((item) => records[item.id]);
    const isRunningTask = task !== null && task.condition === condition;
    const recordedMs = done.reduce((sum, item) => sum + records[item.id].timeMs, 0);
    const artifacts =
      done.reduce((sum, item) => sum + records[item.id].artifacts, 0) +
      (isRunningTask ? telemetry.artifacts : 0);
    const edges =
      done.reduce((sum, item) => sum + records[item.id].edges, 0) +
      (isRunningTask ? telemetry.edges : 0);
    const confidenceValue = isRunningTask
      ? confidence
      : done.length > 0
        ? records[done[done.length - 1].id].confidence
        : null;
    const verdicts = done.map((item) => records[item.id].verdict);
    const runningTime = isRunningTask ? clock(elapsed) : null;

    return {
      completed: `${done.length} / ${own.length}`,
      time: `${shortClock(recordedMs)}${runningTime ? ` + ${runningTime} running` : ""}`,
      artifacts: String(artifacts),
      edges: String(edges),
      confidence: confidenceValue ? confidenceLabels[confidenceValue] : "not yet recorded",
      verdict: verdicts.length > 0 ? verdicts.join(", ") : "pending",
    };
  };

  const manual = conditionRows("MANUAL");
  const unify = conditionRows("UNIFY");

  const comparison: { label: string; manual: string; unify: string }[] = [
    { label: "Tasks completed", manual: manual.completed, unify: unify.completed },
    { label: "Elapsed time (mm:ss)", manual: manual.time, unify: unify.time },
    { label: "Artifacts inspected", manual: manual.artifacts, unify: unify.artifacts },
    { label: "Edges traversed", manual: manual.edges, unify: unify.edges },
    { label: "Confidence recorded", manual: manual.confidence, unify: unify.confidence },
    { label: "Verdict recorded", manual: manual.verdict, unify: unify.verdict },
  ];

  /* -------------------------------------------------------------- rendering */

  const requirementsDone = [
    decision.verdict !== null,
    decision.rootCause !== "",
    decision.stakeholders.length >= 2,
    decision.justification.trim().length >= 10,
  ];

  return (
    <div className="space-y-6">
      {/* Study runner header & control bar */}
      <section className="relative bg-surface-container-high rounded-xl p-5 shadow-xl overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-10 w-48 h-48 bg-secondary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                <Icon name="science" className="text-[20px]" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                    Evaluation Session
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  <span className="font-mono-code text-[11px] text-on-surface-variant bg-surface-container-lowest px-2 py-0.5 rounded">
                    PID: P-14
                  </span>
                </div>
                <div className="font-headline-sm text-headline-sm text-on-surface">
                  Counterbalanced User Study Experiment
                </div>
              </div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-surface-container-highest mx-2" />
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-surface-container-lowest text-primary-fixed font-mono-code text-[12px] font-medium">
                Condition: <strong className="text-primary font-bold">UNIFY-FIRST</strong>
              </span>
              <span className="px-2 py-1 rounded bg-surface-container text-tertiary font-mono-code text-[11px]">
                {finished
                  ? "All 4 tasks recorded"
                  : `Task ${activeTask} of 4 (Scenario ${task?.scenario})`}
              </span>
              {task ? (
                <span
                  className={`px-2 py-1 rounded font-mono-code text-[11px] ${
                    task.condition === "UNIFY"
                      ? "bg-secondary/15 text-secondary"
                      : "bg-surface-container-highest text-on-surface-variant"
                  }`}
                >
                  {task.condition === "UNIFY" ? "UNIFY-assisted" : "Manual workflow"}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 bg-surface-container-lowest px-3.5 py-1.5 rounded-lg shadow-inner">
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <Icon name="timer" className="text-[18px] text-secondary" />
                <span className="font-label-caps text-label-caps uppercase text-outline">
                  Elapsed
                </span>
              </div>
              <span className="font-mono-code text-[15px] font-semibold text-secondary tracking-wider">
                {clock(elapsed)}
              </span>
              <button
                type="button"
                onClick={() => setRunning((prev) => !prev)}
                disabled={finished}
                title="Pause / Resume timer"
                aria-label={running ? "Pause timer" : "Resume timer"}
                className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-40"
              >
                <Icon name={running ? "pause" : "play_arrow"} className="text-[16px]" />
              </button>
            </div>
            <button
              type="button"
              onClick={flagDiscrepancy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container hover:bg-surface-variant text-error font-body-sm text-body-sm font-medium transition-colors"
            >
              <Icon name="flag" className="text-[16px]" />
              <span>Flag Discrepancy</span>
            </button>
            <button
              type="button"
              onClick={abandon}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container hover:bg-surface-variant text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm transition-colors"
            >
              <Icon name="cancel" className="text-[16px]" />
              <span>Abandon</span>
            </button>
            <button
              type="button"
              onClick={scrollToForm}
              className="flex items-center gap-2 px-4 py-1.5 rounded bg-primary text-on-primary font-body-sm text-body-sm font-semibold hover:opacity-90 transition-all shadow-md"
            >
              <Icon name="fact_check" className="text-[18px]" />
              <span>Record Decision</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2-pane main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left panel: task list, scenario, telemetry, timing, notes */}
        <aside className="xl:col-span-4 space-y-5">
          {/* Participant task list */}
          <div className="bg-surface-container rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="checklist" className="text-primary text-[18px]" />
                <span className="font-headline-sm text-[16px] text-on-surface font-semibold">
                  Participant Task List
                </span>
              </div>
              <span className="font-mono-code text-[11px] text-outline">Group G-A · 4 tasks</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {studyTasks.map((item) => {
                const record = records[item.id];
                const isActive = item.id === activeTask;
                const isUpcoming = item.id > activeTask;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors ${
                      isActive
                        ? "bg-primary/10 border-primary/40"
                        : record
                          ? "bg-surface-container-low border-transparent"
                          : "bg-surface-container-low/40 border-transparent opacity-60"
                    }`}
                  >
                    <span className="font-mono-code text-[11px] text-outline w-4">T{item.id}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-body-sm text-body-sm font-semibold text-on-surface truncate">
                        Scenario {item.scenario} · {item.label}
                      </div>
                      <div className="font-mono-code text-[10px] text-on-surface-variant">
                        {record
                          ? `recorded ${clock(record.timeMs)} · ${record.verdict}`
                          : isActive
                            ? `in progress · ${clock(elapsed)}`
                            : "locked until previous task is submitted"}
                      </div>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded font-mono-code text-[10px] font-bold ${
                        item.condition === "UNIFY"
                          ? "bg-secondary/15 text-secondary"
                          : "bg-surface-container-highest text-on-surface-variant"
                      }`}
                    >
                      {item.condition === "UNIFY" ? "UNIFY" : "MANUAL"}
                    </span>
                    {record ? (
                      <Icon name="check_circle" className="text-secondary text-[16px]" />
                    ) : isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                    ) : isUpcoming ? (
                      <Icon name="lock" className="text-outline text-[14px]" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scenario brief */}
          {evidence ? (
            <div className="bg-surface-container rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-label-caps text-label-caps text-tertiary uppercase tracking-wider">
                    Test Scenario Objective
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface mt-0.5">
                    {evidence.title}
                  </h2>
                </div>
                <span className="p-1.5 rounded bg-tertiary/10 text-tertiary flex-shrink-0">
                  <Icon name="psychology" className="text-[20px]" />
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {evidence.brief.map((token, index) => (
                  <span
                    key={`${token.text}-${index}`}
                    className={
                      token.code
                        ? `font-mono-code text-[11px] bg-surface-container-lowest px-1 rounded ${
                            token.tone ?? "text-primary"
                          }`
                        : (token.tone ?? "")
                    }
                  >
                    {token.text}
                  </span>
                ))}
              </p>
              <div className="p-3 rounded-lg bg-surface-container-low space-y-2">
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                  Participant Prompt
                </span>
                <p className="font-body-sm text-body-sm text-on-surface">{evidence.prompt}</p>
              </div>
              <div className="space-y-2.5 pt-2">
                <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider">
                  Required Output Metrics
                </span>
                <ul className="space-y-2 text-body-sm font-body-sm">
                  {evidence.requirements.map((requirement, index) => (
                    <li key={requirement} className="flex items-start gap-2 text-on-surface-variant">
                      <Icon
                        name={requirementsDone[index] ? "check_box" : "check_box_outline_blank"}
                        className={`text-[16px] mt-0.5 ${
                          requirementsDone[index] ? "text-secondary" : "text-outline"
                        }`}
                      />
                      <span>
                        {index + 1}. {requirement}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          {/* Live telemetry recorder */}
          <div className="bg-surface-container rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                <span className="font-headline-sm text-[16px] text-on-surface font-semibold">
                  Live Telemetry Recorder
                </span>
              </div>
              <span className="font-mono-code text-[11px] text-outline">AUTO-STREAMING</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Artifacts Inspected", value: telemetry.artifacts, suffix: "/ 5 total", tone: "text-on-surface", icon: "layers" },
                { label: "Edges Traversed", value: telemetry.edges, suffix: "links", tone: "text-secondary", icon: "alt_route" },
                { label: "Search Queries", value: telemetry.queries, suffix: "issued", tone: "text-primary", icon: "manage_search" },
                { label: "Dwell Time / Node", value: "44.2", suffix: "sec avg", tone: "text-tertiary", icon: "avg_time" },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="bg-surface-container-low p-3 rounded-lg flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-outline">
                    <span className="font-label-caps text-label-caps uppercase">
                      {metric.label}
                    </span>
                    <Icon name={metric.icon} className="text-[16px]" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className={`font-mono-code text-[22px] font-bold ${metric.tone}`}>
                      {metric.value}
                    </span>
                    <span className="font-mono-code text-[11px] text-on-surface-variant">
                      {metric.suffix}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-surface-container-low p-3.5 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="confidence"
                  className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider"
                >
                  Subject Decision Confidence
                </label>
                <span className="font-mono-code text-[12px] font-bold text-secondary">
                  {confidenceLabels[confidence]}
                </span>
              </div>
              <input
                id="confidence"
                type="range"
                min={1}
                max={5}
                value={confidence}
                onChange={(event) => setConfidence(Number(event.target.value))}
                className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-secondary"
              />
              <div className="flex justify-between font-mono-code text-[10px] text-outline px-0.5">
                <span>1: Blind Guess</span>
                <span>3: Moderate</span>
                <span>5: Certain</span>
              </div>
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded bg-surface-container-lowest text-on-surface-variant">
              <div className="flex items-center gap-2 font-mono-code text-[11px]">
                <Icon name="visibility" className="text-secondary text-[14px]" />
                <span>Viewport Focus:</span>
                <span className="text-on-surface font-semibold">Diff Inspector</span>
              </div>
              <span className="font-label-caps text-[10px] text-primary">SYNC OK</span>
            </div>
          </div>

          {/* Timing capture */}
          <div className="bg-surface-container rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-[16px] text-on-surface font-semibold">
                Timing Capture
              </span>
              <button
                type="button"
                onClick={() => captureSplit(`Split ${splits.length - 1}`)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-mono-code text-[11px] transition-colors"
              >
                <Icon name="add_alarm" className="text-[14px]" />
                Capture split
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {splits.map((split, index) => (
                <div
                  key={`${split.label}-${index}`}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded bg-surface-container-low font-mono-code text-[11px]"
                >
                  <span className="text-on-surface-variant">{split.label}</span>
                  <span className="text-secondary font-semibold">{clock(split.ms)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-surface-container-highest pt-2 font-mono-code text-[11px]">
              <span className="text-outline">Cumulative on task</span>
              <span className="text-on-surface font-semibold">{clock(elapsed)}</span>
            </div>
          </div>

          {/* Per-task notes */}
          <div className="bg-surface-container rounded-xl p-5 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-[16px] text-on-surface font-semibold">
                Per-Task Notes
              </span>
              <span className="font-mono-code text-[10px] text-secondary">
                saved {noteSavedAt}
              </span>
            </div>
            <p className="font-body-sm text-[11px] text-on-surface-variant">
              Free-text observations for Task {activeTask}. Stored with the timing record and
              excluded from the participant prompt.
            </p>
            <textarea
              rows={4}
              value={finished ? "" : (notes[activeTask] ?? "")}
              disabled={finished}
              onChange={(event) => {
                const value = event.target.value;
                setNotes((prev) => ({ ...prev, [activeTask]: value }));
                const now = new Date();
                setNoteSavedAt(
                  `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
                );
              }}
              placeholder="What did you check first? Where did you get stuck? Which tool was slowest?"
              className="w-full p-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:bg-surface-container-high transition-colors disabled:opacity-50"
            />
          </div>

          {/* Investigation protocol reference */}
          <div className="bg-surface-container-low p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-on-surface">
              <span className="font-body-sm text-body-sm font-semibold">
                Investigator Protocol Notes
              </span>
              <Icon name="info" className="text-[16px] text-outline" />
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant text-[12px] leading-relaxed">
              Participant has received 5-minute training on UNIFY graph exploration.
              Counterbalanced group G-A completes Scenario B-2 using UNIFY (Task 2) before manual
              IDE / Figma inspection in Task 3; Scenario A-1 runs manual first (Task 1) and
              UNIFY-assisted last (Task 4). Do not reveal verdict ground truth before submission.
            </p>
          </div>
        </aside>

        {/* Right panel: split investigation workspace */}
        <main className="xl:col-span-8 space-y-6 min-w-0">
          {evidence && task ? (
            <>
              <StudyEvidence
                key={task.id}
                evidence={evidence}
                condition={task.condition}
                onInspectNode={inspectNode}
                onOpenTab={openTab}
              />
              <StudyDecisionForm
                evidence={evidence}
                taskId={task.id}
                condition={task.condition}
                decision={decision}
                onChange={updateDecision}
                onSubmit={submit}
                submitting={submitting}
                complete={finished}
              />
            </>
          ) : (
            <section className="bg-surface-container rounded-xl p-8 shadow-xl text-center space-y-3">
              <Icon name="celebration" className="text-secondary text-[32px]" />
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Session complete — all 4 tasks recorded
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Subject P-14 timing, telemetry and responses have been appended to the study
                dataset. The investigator will now run the post-task interview.
              </p>
            </section>
          )}
        </main>
      </div>

      {/* Manual vs UNIFY-assisted comparison */}
      <section className="rounded-xl bg-surface-container-low p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
              Within-Subject Comparison
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
              Manual Workflow vs UNIFY-Assisted (recorded so far)
            </h3>
          </div>
          <span className="font-mono-code text-[11px] text-on-surface-variant">
            updates on every task submission · ground truth withheld
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider">
                <th className="py-2 px-3 w-56">Metric</th>
                <th className="py-2 px-3">Manual workflow (Tasks 1, 3)</th>
                <th className="py-2 px-3">UNIFY-assisted (Tasks 2, 4)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 text-on-surface font-body-md text-body-md">
              {comparison.map((row, index) => (
                <tr key={row.label} className={index % 2 === 1 ? "bg-surface-container-low/40" : ""}>
                  <td className="py-2.5 px-3 font-body-sm text-body-sm text-on-surface-variant">
                    {row.label}
                  </td>
                  <td className="py-2.5 px-3 font-mono-code text-[12px]">{row.manual}</td>
                  <td className="py-2.5 px-3 font-mono-code text-[12px] text-secondary">
                    {row.unify}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

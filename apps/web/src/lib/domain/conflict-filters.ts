import type { Finding, FindingStatus, Severity } from "@/lib/types";

/** The inbox filters, as they live in the URL query. */
export interface ConflictFilters {
  status: "all" | FindingStatus;
  severity: "all" | Severity;
  /** A rule id, `verdict` for verifier findings, or `all`. */
  rule: string;
  q: string;
}

const STATUSES: FindingStatus[] = ["open", "acknowledged", "resolved", "suppressed", "disputed", "superseded"];
const SEVERITIES: Severity[] = ["critical", "warning", "info"];

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

export function parseConflictFilters(params: Record<string, string | string[] | undefined>): ConflictFilters {
  const status = one(params.status);
  const severity = one(params.severity);
  return {
    status: STATUSES.includes(status as FindingStatus) ? (status as FindingStatus) : "all",
    severity: SEVERITIES.includes(severity as Severity) ? (severity as Severity) : "all",
    rule: one(params.rule) || "all",
    q: one(params.q).trim(),
  };
}

export const ruleKey = (finding: Finding) => finding.policy ?? "verdict";

export function applyConflictFilters(findings: Finding[], filters: ConflictFilters): Finding[] {
  const needle = filters.q.toLowerCase();
  return findings.filter((f) => {
    if (filters.status !== "all" && f.status !== filters.status) return false;
    if (filters.severity !== "all" && f.severity !== filters.severity) return false;
    if (filters.rule !== "all" && ruleKey(f) !== filters.rule) return false;
    if (!needle) return true;
    const haystack = [f.id, f.title, f.policyTitle, f.summary, ...f.artifacts.map((a) => a.ref)].join(" ").toLowerCase();
    return haystack.includes(needle);
  });
}

/** The rules that actually appear among the findings, for the rule select. */
export function ruleOptions(findings: Finding[]): { value: string; label: string }[] {
  const seen = new Map<string, string>();
  for (const f of findings) if (!seen.has(ruleKey(f))) seen.set(ruleKey(f), f.policy ? `${f.policy}: ${f.policyTitle}` : "Criterion verification");
  return [...seen].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
}

export function conflictsCsv(findings: Finding[]): string {
  const cell = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
  const rows = findings.map((f) =>
    [f.id, f.severity, f.status, f.policy ?? "verdict", f.title, f.artifacts.map((a) => a.ref).join(" "), f.createdAt].map(cell).join(","),
  );
  return ["id,severity,status,rule,title,artifacts,created_at", ...rows].join("\n");
}

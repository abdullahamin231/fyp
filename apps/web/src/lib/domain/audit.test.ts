import { describe, expect, it } from "vitest";
import { auditCsv, canonicalJson, toAuditActor, toAuditEvent, type AuditRow } from "./audit";

const NOW = new Date("2026-10-19T12:00:00Z");

const resolved: AuditRow = {
  id: "a1",
  finding_id: "f1",
  actor_id: "p1",
  action: "finding_resolved",
  reason: "Fixed in PR #48",
  evidence_snapshot: { from: "open", to: "resolved", annotation: "UNI-7 contradicted" },
  at: "2026-10-19T09:00:00Z",
};

describe("audit events", () => {
  it("name the finding's subject as the artifact and expose the state change as a diff", () => {
    const event = toAuditEvent(
      resolved,
      { id: "f1", annotation: "UNI-7 contradicted", subject: { type: "Ticket", external_id: "UNI-7" } },
      "d".repeat(64),
      NOW,
    );
    expect(event).toMatchObject({
      timestamp: "2026-10-19 09:00:00",
      relative: "3h ago",
      action: "finding_resolved",
      artifact: { tool: "jira", label: "UNI-7", context: "UNI-7 contradicted" },
      reason: "Fixed in PR #48",
      diff: { removed: "state: open", added: "state: resolved" },
    });
  });

  it("have no diff for a link decision, which records only the edge", () => {
    const event = toAuditEvent(
      { ...resolved, finding_id: null, action: "link_confirmed", evidence_snapshot: { edgeId: "e1234567-aaaa" } },
      undefined,
      "d".repeat(64),
      NOW,
    );
    expect(event.diff).toBeNull();
    expect(event.artifact.label).toBe("link e1234567");
  });

  it("digest the same record identically whatever its key order", () => {
    expect(canonicalJson({ b: 1, a: { d: [2, { y: 1, x: 0 }], c: null } })).toBe(canonicalJson({ a: { c: null, d: [2, { x: 0, y: 1 }] }, b: 1 }));
  });

  it("export as CSV with actor names and quoted reasons", () => {
    const actor = toAuditActor({ id: "p1", external_id: "user:1", payload: { name: "Mishal Fatima", email: "mishal@example.com" } });
    expect(actor).toMatchObject({ handle: "mishal", initials: "MF" });
    const event = toAuditEvent({ ...resolved, reason: 'said "done", twice' }, undefined, "ab", NOW);
    expect(auditCsv([event], new Map([[actor.id, actor]])).split("\n")).toEqual([
      "timestamp_utc,actor,action,artifact,reason,sha256",
      '2026-10-19 09:00:00,Mishal Fatima,finding_resolved,finding,"said ""done"", twice",ab',
    ]);
  });
});

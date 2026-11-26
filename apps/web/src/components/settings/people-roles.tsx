"use client";

import { useState, useTransition } from "react";
import { PERSON_ROLES } from "@unify/contracts";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { mergePersonAction, setPersonRoleAction } from "@/lib/actions/people";
import type { ActionOutcome } from "@/lib/actions/links";
import type { PersonView, WorkspacePeople } from "@/lib/data/people";

const selectClass =
  "cursor-pointer rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm px-3 py-1.5 focus:outline-none disabled:opacity-50";
const buttonClass =
  "px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-body-sm text-body-sm font-semibold disabled:opacity-50";

function holdings({ edges }: PersonView): string {
  const parts = [
    edges.ASSIGNED_TO ? `assigned on ${edges.ASSIGNED_TO}` : null,
    edges.OWNS ? `owns ${edges.OWNS}` : null,
    edges.WATCHES ? `watches ${edges.WATCHES}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "no artefacts";
}

function RoleSource({ source }: { source: PersonView["roleSource"] }) {
  if (source === "admin") return <Badge tone="success">Set by admin</Badge>;
  if (source === "default") return <Badge tone="warning">Default</Badge>;
  return <Badge>Not recorded</Badge>;
}

/** People known to the graph: set their routing role, and assign unresolved accounts to members. */
export function PeopleRoles({ slug, people, members }: { slug: string } & WorkspacePeople) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  /** Chosen merge target per identity id. */
  const [targets, setTargets] = useState<Record<string, string>>({});

  function run(action: () => Promise<ActionOutcome>, done: string) {
    startTransition(async () => {
      const outcome = await action();
      if (outcome.ok) toast(done, { icon: "check" });
      else toast(outcome.error ?? "Could not save.", { icon: "error", tone: "error" });
    });
  }

  const unresolved = people.flatMap((person) =>
    person.identities.filter((identity) => identity.unresolved).map((identity) => ({ person, identity })),
  );

  return (
    <>
      <section className="rounded-xl bg-surface-container-low shadow-sm p-4 flex flex-col gap-3">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Unresolved accounts</h2>
        <p className="font-body-sm text-body-sm text-muted">
          Provider accounts not matched to a member. They are never notified. Assigning one to a member moves its
          artefacts to them and cannot be undone here.
        </p>
        {unresolved.length === 0 ? (
          <p className="p-4 text-center text-muted font-body-sm text-body-sm">No unresolved accounts.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {unresolved.map(({ person, identity }) => (
              <li key={identity.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 rounded-lg bg-surface-container">
                <div className="flex flex-col">
                  <span className="font-body-sm text-body-sm text-on-surface font-medium">
                    {identity.label} <span className="text-muted">({identity.tool})</span>
                  </span>
                  <span className="font-mono-code text-micro-label text-muted">
                    {identity.accountId} · {holdings(person)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    aria-label={`Member who owns ${identity.label}`}
                    value={targets[identity.id] ?? ""}
                    onChange={(event) => setTargets({ ...targets, [identity.id]: event.target.value })}
                    disabled={pending}
                    className={selectClass}
                  >
                    <option value="">Choose a member…</option>
                    {members.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={pending || !targets[identity.id]}
                    onClick={() => run(() => mergePersonAction(slug, identity.id, targets[identity.id]!), "Account assigned.")}
                    className={buttonClass}
                  >
                    Merge
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl bg-surface-container-low shadow-sm p-4 flex flex-col gap-3">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Routing roles</h2>
        <p className="font-body-sm text-body-sm text-muted">
          A rule only notifies people whose role it names. &ldquo;Default&rdquo; means nobody has chosen the role yet.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm text-body-sm">
            <thead className="font-label-caps text-label-caps text-muted uppercase tracking-wider">
              <tr>
                <th className="py-2 px-3">Person</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Source</th>
                <th className="py-2 px-3">Artefacts</th>
                <th className="py-2 px-3">Routing</th>
              </tr>
            </thead>
            <tbody>
              {people.map((person) => (
                <tr key={person.id} className="hover:bg-surface-container transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="flex flex-col">
                      <span className="text-on-surface font-medium">{person.name}</span>
                      <span className="text-muted font-mono-code text-micro-label">
                        {person.identities.map((identity) => identity.tool).join(", ") || "no linked accounts"}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <select
                        aria-label={`Role of ${person.name}`}
                        value={person.role ?? ""}
                        onChange={(event) => run(() => setPersonRoleAction(slug, person.id, event.target.value), "Role saved.")}
                        disabled={pending}
                        className={selectClass}
                      >
                        {person.role ? null : <option value="">No role</option>}
                        {PERSON_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      {/* Re-selecting the shown value fires nothing, so confirming a default needs its own control. */}
                      {person.role && person.roleSource !== "admin" ? (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => run(() => setPersonRoleAction(slug, person.id, person.role!), "Role confirmed.")}
                          className="px-2 py-1 rounded text-muted hover:text-on-surface font-body-sm text-body-sm"
                        >
                          Confirm
                        </button>
                      ) : null}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <RoleSource source={person.roleSource} />
                  </td>
                  <td className="py-2.5 px-3 font-mono-code text-micro-label text-muted">{holdings(person)}</td>
                  <td className="py-2.5 px-3">
                    <Badge tone={person.routable ? "success" : "neutral"}>{person.routable ? "Routable" : "Not notified"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {people.length === 0 ? <p className="p-4 text-center text-muted font-body-sm text-body-sm">No people recorded yet.</p> : null}
        </div>
      </section>
    </>
  );
}

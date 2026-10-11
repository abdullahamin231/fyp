"use client";

import { useRef, useState } from "react";
import { type LinkSuggestion } from "@/lib/domain/link-suggestions";
import type { RelationLink } from "@/lib/types";
import { confirmLinkAction, dismissLinkAction } from "@/lib/actions/links";
import { LinkWizard, type LinkDraft } from "./link-wizard";
import { SuggestionStack } from "./suggestion-stack";
import { LinkDirectory } from "./link-directory";
import { ProvenanceModal } from "./provenance-modal";
import { guessArtifact, linkToRecord, type ProvenanceRecord } from "./present";

/**
 * Client-side state for the Link Management screen: the relationship
 * directory, the heuristic suggestion queue and the provenance inspector.
 *
 * Suggestions and links arrive from the server (RLS-scoped `edges`), and the
 * two consequential buttons — confirm and reject — call the server actions
 * that write `link_state`, the resolver and an `audit_log` row. Local state
 * moves optimistically so the queue feels immediate; if the write is refused,
 * the suggestion comes back and the refusal is shown rather than lost.
 *
 * The manual-link wizard is still local-only: it drafts a link from free-text
 * endpoints, and persisting one needs the analyser's node resolution (Slice D),
 * so a draft here is a draft, not a stored edge.
 */
export function LinkManager({
  initialLinks,
  initialSuggestions,
}: {
  initialLinks: RelationLink[];
  initialSuggestions: LinkSuggestion[];
}) {
  const [links, setLinks] = useState<RelationLink[]>(initialLinks);
  const [suggestions, setSuggestions] = useState<LinkSuggestion[]>(initialSuggestions);
  const [record, setRecord] = useState<ProvenanceRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sequence = useRef(900);

  function inspectLink(link: RelationLink) {
    setRecord(linkToRecord(link));
  }

  /** A refusal from the server puts the suggestion back where it was. */
  async function callAndTrack<T>(
    call: () => Promise<{ ok: boolean; error?: string }>,
    remove: () => void,
    restore: (item: T) => void,
    item?: T,
  ) {
    remove();
    const result = await call();
    if (result.ok) {
      setError(null);
      return;
    }
    if (item) restore(item);
    setError(result.error ?? "The write was refused.");
  }

  function confirmLink(id: string) {
    const link = links.find((entry) => entry.id === id);
    void callAndTrack<RelationLink>(
      () => confirmLinkAction(id),
      () => setLinks((prev) => prev.filter((entry) => entry.id !== id)),
      (restored) => setLinks((prev) => [restored, ...prev]),
      link,
    );
  }

  function rejectLink(id: string) {
    const link = links.find((entry) => entry.id === id);
    void callAndTrack<RelationLink>(
      () => dismissLinkAction(id, "Rejected from the link directory"),
      () => setLinks((prev) => prev.filter((entry) => entry.id !== id)),
      (restored) => setLinks((prev) => [restored, ...prev]),
      link,
    );
  }

  function confirmSuggestion(id: string) {
    const suggestion = suggestions.find((entry) => entry.id === id);
    if (!suggestion) return;
    void callAndTrack<LinkSuggestion>(
      () => confirmLinkAction(id, `Confirmed from the suggestion queue (${suggestion.detector})`),
      () => setSuggestions((prev) => prev.filter((entry) => entry.id !== id)),
      (restored) => setSuggestions((prev) => [restored, ...prev]),
      suggestion,
    );
  }

  function confirmAllSuggestions() {
    const accepted = suggestions.filter((entry) => entry.confidence >= 0.85);
    if (accepted.length === 0) return;
    const acceptedIds = new Set(accepted.map((entry) => entry.id));
    setSuggestions((prev) => prev.filter((entry) => !acceptedIds.has(entry.id)));
    setLinks((prev) => [
      ...accepted.map((suggestion) => ({
        id: suggestion.id,
        source: suggestion.source,
        target: suggestion.target,
        relation: suggestion.relation,
        eligibility: "confirmed" as const,
        confidence: suggestion.confidence,
        provenance: suggestion.provenance,
        confirmedBy: "batch confirm",
        changedAt: new Date().toISOString(),
      })),
      ...prev,
    ]);
    void Promise.all(
      accepted.map((suggestion) =>
        confirmLinkAction(suggestion.id, `Batch-confirmed at ${suggestion.confidence} confidence`),
      ),
    ).then((results) => {
      const refusal = results.find((result) => !result.ok);
      setError(refusal ? refusal.error ?? "A batch confirmation was refused." : null);
    });
  }

  function dismissSuggestion(id: string) {
    const suggestion = suggestions.find((entry) => entry.id === id);
    if (!suggestion) return;
    void callAndTrack<LinkSuggestion>(
      () => dismissLinkAction(id, "Rejected from the suggestion queue"),
      () => setSuggestions((prev) => prev.filter((entry) => entry.id !== id)),
      (restored) => setSuggestions((prev) => [restored, ...prev]),
      suggestion,
    );
  }

  function establish(draft: LinkDraft) {
    const id = `LNK-${sequence.current}`;
    sequence.current += 1;
    const sourceArtifact = guessArtifact(draft.source);
    const targetArtifact = guessArtifact(draft.target);
    // Local draft only: it renders in the directory for review, but the edge is
    // not written. Persisting it needs the analyser's node resolution (Slice D),
    // so it stays `unconfirmed` rather than pretending to be a stored link.
    setLinks((prev) => [
      {
        id,
        source: {
          tool: sourceArtifact.tool,
          label: `${sourceArtifact.kind} · draft, not saved`,
          ref: draft.source,
        },
        target: {
          tool: targetArtifact.tool,
          label: `${targetArtifact.kind} · draft, not saved`,
          ref: draft.target,
        },
        relation: draft.relation,
        eligibility: "unconfirmed",
        confidence: 1,
        provenance: "manual",
        changedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  return (
    <>
      <LinkWizard onEstablish={establish} />

      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-error-container/30 text-on-error-container px-3 py-2 font-body-sm text-body-sm"
        >
          {error}
        </p>
      ) : null}

      <SuggestionStack
        suggestions={suggestions}
        onConfirm={confirmSuggestion}
        onConfirmAll={confirmAllSuggestions}
        onDismiss={dismissSuggestion}
        onInspect={setRecord}
      />

      <LinkDirectory
        links={links}
        onConfirm={confirmLink}
        onReject={rejectLink}
        onUnlink={rejectLink}
        onAudit={inspectLink}
      />

      <ProvenanceModal record={record} onClose={() => setRecord(null)} />
    </>
  );
}

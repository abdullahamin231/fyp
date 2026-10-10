"use client";

import { useRef, useState } from "react";
import { type LinkSuggestion } from "@/lib/domain/link-suggestions";
import type { RelationLink } from "@/lib/types";
import { LinkWizard, type LinkDraft } from "./link-wizard";
import { SuggestionStack } from "./suggestion-stack";
import { LinkDirectory } from "./link-directory";
import { ProvenanceModal } from "./provenance-modal";
import { guessArtifact, linkToRecord, type ProvenanceRecord } from "./present";

/**
 * DATA HOLE — replace with the signed-in user's display name from the session
 * API. Empty until then, so `confirmedBy` reads as unattributed and the
 * provenance guards in `present.ts` treat it as absent.
 */
const CURRENT_USER = "";

/**
 * DATA HOLE — replace with the links API.
 *
 * Both stores start empty until their endpoints exist: the directory and the
 * suggestion queue render their empty states, and the wizard's created links
 * accumulate in local state as before.
 */
const initialLinks: RelationLink[] = [];
const linkSuggestions: LinkSuggestion[] = [];

/**
 * Client-side graph state for the Link Management screen: the relationship
 * directory, the heuristic suggestion queue and the provenance inspector.
 * All mutations are local and reversible.
 */
export function LinkManager() {
  const [links, setLinks] = useState<RelationLink[]>(initialLinks);
  const [suggestions, setSuggestions] = useState<LinkSuggestion[]>(linkSuggestions);
  const [record, setRecord] = useState<ProvenanceRecord | null>(null);
  const sequence = useRef(900);

  function inspectLink(link: RelationLink) {
    setRecord(linkToRecord(link));
  }

  function confirmLink(id: string) {
    setLinks((prev) =>
      prev.map((link) =>
        link.id === id
          ? {
              ...link,
              eligibility: "confirmed",
              confirmedBy: CURRENT_USER,
              changedAt: new Date().toISOString(),
            }
          : link,
      ),
    );
    setSuggestions((prev) => prev.filter((suggestion) => suggestion.id !== id));
  }

  function rejectLink(id: string) {
    setLinks((prev) => prev.filter((link) => link.id !== id));
    setSuggestions((prev) => prev.filter((suggestion) => suggestion.id !== id));
  }

  function confirmSuggestion(id: string) {
    const suggestion = suggestions.find((entry) => entry.id === id);
    if (!suggestion) return;
    setSuggestions((prev) => prev.filter((entry) => entry.id !== id));
    setLinks((prev) => [
      {
        id: suggestion.id.replace("SGT", "LNK"),
        source: suggestion.source,
        target: suggestion.target,
        relation: suggestion.relation,
        eligibility: "confirmed",
        confidence: suggestion.confidence,
        provenance: suggestion.provenance,
        confirmedBy: CURRENT_USER,
        changedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  function confirmAllSuggestions() {
    const accepted = suggestions.filter((entry) => entry.confidence >= 0.85);
    if (accepted.length === 0) return;
    const acceptedIds = new Set(accepted.map((entry) => entry.id));
    setSuggestions((prev) => prev.filter((entry) => !acceptedIds.has(entry.id)));
    setLinks((prev) => [
      ...accepted.map((suggestion) => ({
        id: suggestion.id.replace("SGT", "LNK"),
        source: suggestion.source,
        target: suggestion.target,
        relation: suggestion.relation,
        eligibility: "confirmed" as const,
        confidence: suggestion.confidence,
        provenance: suggestion.provenance,
        confirmedBy: CURRENT_USER,
        changedAt: new Date().toISOString(),
      })),
      ...prev,
    ]);
  }

  function dismissSuggestion(id: string) {
    setSuggestions((prev) => prev.filter((entry) => entry.id !== id));
  }

  function establish(draft: LinkDraft) {
    const id = `LNK-${sequence.current}`;
    sequence.current += 1;
    const sourceArtifact = guessArtifact(draft.source);
    const targetArtifact = guessArtifact(draft.target);
    setLinks((prev) => [
      {
        id,
        source: {
          tool: sourceArtifact.tool,
          label: `${sourceArtifact.kind} · manual entry`,
          ref: draft.source,
        },
        target: {
          tool: targetArtifact.tool,
          label: `${targetArtifact.kind} · manual entry`,
          ref: draft.target,
        },
        relation: draft.relation,
        eligibility: "confirmed",
        confidence: 1,
        provenance: "manual",
        confirmedBy: CURRENT_USER,
        changedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  return (
    <>
      <LinkWizard onEstablish={establish} />

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

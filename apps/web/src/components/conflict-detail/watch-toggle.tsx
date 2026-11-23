"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { unwatchArtefactAction, watchArtefactAction } from "@/lib/actions/watch";

/** Opt in to (or out of) findings on this finding's artefact — the one role edge a person asks for. */
export function WatchToggle({ nodeId, watching: initial }: { nodeId: string; watching: boolean }) {
  const toast = useToast();
  const [watching, setWatching] = useState(initial);
  const [pending, startTransition] = useTransition();

  const flip = () =>
    startTransition(async () => {
      const result = await (watching ? unwatchArtefactAction(nodeId) : watchArtefactAction(nodeId));
      if (!result.ok) {
        toast(result.error ?? "Could not update your watch.", { icon: "error", tone: "error" });
        return;
      }
      setWatching(!watching);
      toast(watching ? "You will no longer be notified about this artefact" : "You will be notified about findings on this artefact", {
        icon: watching ? "visibility_off" : "visibility",
      });
    });

  return (
    <button
      type="button"
      onClick={flip}
      disabled={pending}
      aria-pressed={watching}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface text-body-sm font-body-sm transition-colors shadow-sm disabled:opacity-40"
    >
      <Icon name={watching ? "visibility_off" : "visibility"} className="text-[16px]" />
      <span>{watching ? "Unwatch" : "Watch"}</span>
    </button>
  );
}

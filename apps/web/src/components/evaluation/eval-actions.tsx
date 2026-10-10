"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

/**
 * Action cluster for the internal evaluation banner (Compare / Export / Run).
 * Mirrors the Stitch screen: every action surfaces a transient status toast
 * instead of hitting a backend that does not exist yet.
 */
export function EvalActions() {
  const [toast, setToast] = useState<string | null>(null);

  const trigger = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <>
      <div className="flex items-center gap-2.5 flex-wrap">
        <button
          type="button"
          onClick={() => trigger("Baseline loaded: comparing v3.2 with the v2.8 golden set…")}
          className="px-3 py-2 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
          <Icon name="compare_arrows" className="text-[18px] text-muted" />
          <span>Compare with Baseline</span>
        </button>
        <button
          type="button"
          onClick={() => trigger("Generating LaTeX & CSV benchmark packet (v3.2)…")}
          className="px-3 py-2 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
          <Icon name="terminal" className="text-[18px] text-secondary" />
          <span>LaTeX / CSV Export</span>
        </button>
        <button
          type="button"
          onClick={() =>
            trigger("Evaluation suite triggered: running 1,482 test pairs across the 30d replay…")
          }
          className="px-3.5 py-2 rounded bg-primary-container hover:bg-inverse-primary text-on-primary font-body-sm font-bold transition-all flex items-center gap-2 shadow-sm active:scale-95"
        >
          <Icon name="play_arrow" className="text-[18px]" />
          <span>Run Evaluation Suite</span>
        </button>
      </div>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-surface-bright text-on-surface px-4 py-3 rounded-lg shadow-xl flex items-center gap-3">
            <Icon name="check_circle" className="text-secondary text-[20px]" />
            <span className="font-body-sm font-semibold">{toast}</span>
          </div>
        </div>
      ) : null}
    </>
  );
}

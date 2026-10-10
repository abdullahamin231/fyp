"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { auditTotals } from "@/lib/mock/audit";

type VerifyState = "idle" | "running" | "done";

const EXPORT_OPTIONS = [
  { id: "csv", icon: "table_chart", label: "Delimited CSV (.csv)", tag: "Cleaned", iconClass: "text-primary" },
  { id: "json", icon: "data_object", label: "Full Merkle JSON (.jsonl)", tag: "Signed", iconClass: "text-secondary" },
] as const;

/** "Verify Integrity" button + "Export Filtered Records" dropdown (header row). */
export function AuditHeaderActions() {
  const [verify, setVerify] = useState<VerifyState>("idle");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function runIntegrityCheck() {
    if (verify !== "idle") return;
    setVerify("running");
    timers.current.push(
      window.setTimeout(() => {
        setVerify("done");
        timers.current.push(window.setTimeout(() => setVerify("idle"), 3000));
      }, 900),
    );
  }

  function startExport(format: "csv" | "json") {
    setMenuOpen(false);
    setNotice(
      `Preparing verified cryptographic ${format.toUpperCase()} export of the filtered ledger slice, with tokens and raw vendor payloads redacted via policy #901…`,
    );
    timers.current.push(window.setTimeout(() => setNotice(null), 5000));
  }

  return (
    <div className="flex flex-col items-end gap-2 shrink-0">
      <div className="flex items-center gap-2 self-start sm:self-auto">
        <button
          type="button"
          onClick={runIntegrityCheck}
          disabled={verify === "running"}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface text-body-sm font-medium shadow-sm transition-all active:scale-95 disabled:opacity-70"
        >
          <Icon
            name={verify === "running" ? "refresh" : verify === "done" ? "verified" : "security_update_good"}
            className={`text-[18px] text-secondary ${verify === "running" ? "animate-spin" : ""}`}
          />
          <span>
            {verify === "running"
              ? "Verifying SHA-256 Tree…"
              : verify === "done"
                ? `${auditTotals.events.toLocaleString("en-US")} Blocks Validated`
                : "Verify Integrity"}
          </span>
        </button>

        <div className="relative inline-block text-left" ref={menuRef}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary-container hover:bg-primary-container/90 text-on-primary-container text-body-sm font-semibold shadow-md transition-all active:scale-95"
          >
            <Icon name="download" className="text-[18px]" />
            <span>Export Filtered Records</span>
            <Icon name="expand_more" className="text-[16px]" />
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-72 rounded bg-surface-container-high shadow-xl p-3 z-30"
            >
              <div className="px-2 py-1 mb-2">
                <span className="font-label-caps text-label-caps text-muted uppercase tracking-wider block">
                  Cryptographic Export
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant text-micro-label leading-tight mt-1">
                  Tokens &amp; raw vendor payloads automatically redacted via policy #901.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                {EXPORT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="menuitem"
                    onClick={() => startExport(option.id)}
                    className="flex items-center justify-between px-3 py-2 rounded hover:bg-surface-bright text-on-surface text-left transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Icon name={option.icon} className={`text-[18px] ${option.iconClass}`} />
                      <span className="font-body-sm text-body-sm font-medium">{option.label}</span>
                    </span>
                    <span className="font-mono-code text-micro-label text-on-surface-variant">
                      {option.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {notice ? (
        <p
          aria-live="polite"
          className="max-w-md text-right font-mono-code text-micro-label text-secondary flex items-start gap-1.5 justify-end"
        >
          <Icon name="encrypted" className="text-[13px] mt-0.5" />
          <span>{notice}</span>
        </p>
      ) : null}
    </div>
  );
}

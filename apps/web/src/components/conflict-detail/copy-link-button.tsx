"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

/** "Copy Link" quick action — copies the canonical conflict URL, flips to a check. */
export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard can be blocked in preview iframes — still confirm intent.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface text-body-sm font-body-sm transition-colors shadow-sm"
    >
      <Icon name={copied ? "check" : "share"} className="text-[16px]" />
      <span>{copied ? "Copied" : "Copy Link"}</span>
    </button>
  );
}

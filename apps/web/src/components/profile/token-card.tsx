"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";

/** Shape of a personal access token record as the tokens API returns it. */
interface TokenRecord {
  /** Masked secret — only ever returned masked by the API. */
  secret: string;
  label: string;
  createdLabel: string;
  expiresLabel: string;
  scopes: string[];
}

/**
 * DATA HOLE — replace with the tokens API.
 * Null until the endpoint exists; the token row renders its empty state and no
 * secret is ever held in the browser before then.
 */
const token: TokenRecord | null = null;

/** Personal API / CLI access tokens with roll, revoke and copy actions. */
export function TokenCard() {
  const toast = useToast();
  const [revoked, setRevoked] = useState(false);
  const [copied, setCopied] = useState(false);

  function copy() {
    if (!token) return;
    navigator.clipboard?.writeText(token.secret).catch(() => undefined);
    setCopied(true);
    toast("Token copied to secure clipboard", { icon: "content_copy", tone: "neutral" });
    setTimeout(() => setCopied(false), 2000);
  }

  function roll() {
    toast("Rolling a new key — the previous key is invalidated", { icon: "key" });
  }

  function revoke() {
    setRevoked(true);
    toast("Personal access token revoked", { icon: "lock_reset", tone: "error" });
  }

  return (
    <section className="rounded-xl bg-surface-container p-4 lg:p-4 flex flex-col space-y-4 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider">
              Developer Tooling Credentials
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-mono-code text-micro-label">
              unify-cli v2.4
            </span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
            Personal API &amp; CLI Access Tokens
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-2xl">
            Authenticate programmatic local commands, CI/CD pipelines, and local Git hooks against
            the Unified Knowledge Graph.
          </p>
        </div>
        <button
          type="button"
          onClick={() => toast("Initiating token generator with inherited RBAC scopes…", {
            icon: "vpn_key",
            tone: "neutral",
          })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary hover:opacity-90 font-body-sm text-body-sm font-semibold transition-colors shadow"
        >
          <Icon name="add_circle" className="text-[18px]" />
          <span>Generate New Token</span>
        </button>
      </div>

      {token === null ? (
        <div className="rounded-lg bg-surface-container-high p-6 flex flex-col items-center text-center shadow-sm">
          <Icon name="key_off" className="text-[32px] text-muted mb-2" />
          <p className="font-body-md text-body-md text-on-surface font-medium">
            No personal access tokens yet
          </p>
          <p className="font-body-sm text-body-sm text-muted mt-1.5 max-w-md">
            Generate a token to authenticate the CLI, CI pipelines and Git hooks. Tokens appear
            here once the tokens API is connected.
          </p>
        </div>
      ) : (
        <div
          className={`rounded-lg bg-surface-container-high p-4 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-opacity ${
            revoked ? "opacity-40 pointer-events-none" : ""
          }`}
        >
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon name="vpn_key" className="text-[22px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-body-md text-body-md font-semibold text-on-surface">
                  {token.label}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-label-caps text-eyebrow font-bold uppercase">
                  {revoked ? "Revoked" : "Active"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 font-mono-code text-mono-code">
                <span className="px-2.5 py-1 rounded bg-surface-container-lowest text-primary tracking-wider font-bold select-all">
                  {token.secret}
                </span>
                <button
                  type="button"
                  onClick={copy}
                  className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm transition-colors"
                  title="Copy masked key"
                >
                  <Icon name={copied ? "check" : "content_copy"} className="text-[16px]" />
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-muted font-body-sm text-body-sm">
                <span>{token.createdLabel}</span>
                <span>•</span>
                <span className="text-secondary font-medium">{token.expiresLabel}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <span>Scopes:</span>
                  {token.scopes.map((scope) => (
                    <span
                      key={scope}
                      className="px-1.5 py-0.2 rounded bg-surface-container-lowest text-on-surface font-mono-code text-micro-label"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
            <button
              type="button"
              onClick={roll}
              className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-bright text-on-surface font-body-sm text-body-sm font-medium transition-colors"
            >
              Roll Key
            </button>
            <button
              type="button"
              onClick={revoke}
              className="px-3 py-1.5 rounded bg-error-container/40 hover:bg-error-container text-error font-body-sm text-body-sm font-medium transition-colors"
            >
              Revoke
            </button>
          </div>
        </div>
      )}

      <div className="p-4 rounded-lg bg-surface-container-lowest/60 flex items-start gap-3.5">
        <Icon name="security" className="text-tertiary text-[20px] flex-shrink-0 mt-0.5" />
        <div className="flex flex-col text-body-sm">
          <span className="font-semibold text-on-surface">Security &amp; RBAC Notice:</span>
          <p className="text-on-surface-variant mt-0.5">
            Personal access tokens inherit your exact RBAC permissions (
            <span className="text-primary font-mono-code text-[12px]">Code owner / assignee</span>
            ). Never commit tokens or secrets into Git repos, Figma description fields, or CI logs.
            Tokens left idle for &gt; 90 days are automatically decommissioned.
          </p>
        </div>
      </div>
    </section>
  );
}

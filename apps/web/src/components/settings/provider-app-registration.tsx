"use client";

import { useActionState } from "react";
import type { IntegrationProvider } from "@/lib/integrations/types";

type Registration = {
  provider: IntegrationProvider;
  client_id: string;
  updated_at: string;
};

type ActionResult = {
  error?: string;
  oneTimeValue?: string;
};

type RegistrationAction = (
  previous: ActionResult,
  formData: FormData,
) => Promise<ActionResult>;

export function ProviderAppRegistration({
  provider,
  workspaceId,
  origin,
  registration,
  action,
}: {
  provider: IntegrationProvider;
  workspaceId: string;
  origin: string;
  registration?: Registration;
  action: RegistrationAction;
}) {
  const [result, formAction, pending] = useActionState(action, {});
  const name = provider === "github" ? "GitHub" : provider === "jira" ? "Jira" : "Figma";
  const redirectUri = `${origin}/api/integrations/${provider}/callback`;
  const webhookUrl = `${origin}/api/webhooks/${provider}/${workspaceId}`;

  return (
    <section className="rounded-lg bg-surface-container p-5 shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">{name}</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            {registration ? `Registered as ${registration.client_id}` : "Not registered"}
          </p>
        </div>
        {registration ? (
          <span className="rounded bg-secondary/10 px-2 py-1 text-label-caps text-secondary">
            Secret configured
          </span>
        ) : null}
      </div>
      {registration ? (
        <p className="mt-2 text-micro-label text-muted">
          Updated {new Date(registration.updated_at).toLocaleString()}
        </p>
      ) : null}
      <div className="mt-4 grid gap-2 text-body-sm">
        <p><strong>Redirect URI:</strong> <code className="break-all">{redirectUri}</code></p>
        <p><strong>Webhook URL:</strong> <code className="break-all">{webhookUrl}</code></p>
      </div>
      <form action={formAction} className="mt-5 grid gap-3">
        <input type="hidden" name="provider" value={provider} />
        <label className="grid gap-1 text-body-sm text-on-surface">
          Client ID
          <input name="clientId" required className="rounded border border-outline-variant bg-surface-container-lowest px-3 py-2" />
        </label>
        <label className="grid gap-1 text-body-sm text-on-surface">
          Client secret
          <input name="secret" type="password" autoComplete="off" required className="rounded border border-outline-variant bg-surface-container-lowest px-3 py-2" />
        </label>
        <p className="text-micro-label text-muted">
          Re-saving generates a new webhook secret and invalidates the previous one. Update the provider before reconnecting.
        </p>
        <button type="submit" disabled={pending} className="w-fit rounded bg-primary px-4 py-2 text-on-primary disabled:opacity-50">
          {pending ? "Saving..." : registration ? "Replace registration" : "Register app"}
        </button>
      </form>
      {result.error ? <p className="mt-3 text-body-sm text-error">{result.error}</p> : null}
      {result.oneTimeValue ? (
        <div className="mt-4 rounded border border-secondary/30 bg-secondary/10 p-3">
          <p className="font-semibold text-on-surface">Webhook secret (shown once)</p>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            shown once — paste it into the provider&apos;s webhook settings now
          </p>
          <div className="mt-2 flex gap-2">
            <code className="min-w-0 flex-1 break-all rounded bg-surface-container-lowest p-2 text-body-sm">{result.oneTimeValue}</code>
            <button type="button" onClick={() => navigator.clipboard.writeText(result.oneTimeValue ?? "")} className="rounded bg-surface-container-high px-3 py-2 text-body-sm">
              Copy
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

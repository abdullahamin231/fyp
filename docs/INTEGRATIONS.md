# Live integrations

UNIFY accepts read-only OAuth connections for GitHub, Jira Cloud, and Figma.
OAuth access and refresh tokens are encrypted with AES-256-GCM before they are
stored in `integration_connections`. They are never returned to the browser.

## Setup

Apply `supabase/migrations/00010_integrations.sql`, then configure the
server-only variables documented in [`apps/web/README.md`](../apps/web/README.md).
Each provider callback must be registered as:

```
https://<unify-host>/api/integrations/github/callback
https://<unify-host>/api/integrations/jira/callback
https://<unify-host>/api/integrations/figma/callback
```

The onboarding buttons redirect to the provider authorization page. OAuth
state is signed, short-lived, includes the workspace and user, and is checked
again at the callback.

## Webhooks

Register the provider webhook URL with the workspace UUID:

```
https://<unify-host>/api/webhooks/github/<workspace-id>
https://<unify-host>/api/webhooks/jira/<workspace-id>
https://<unify-host>/api/webhooks/figma/<workspace-id>
```

The route reads the raw request body, enforces a 10 MiB limit, verifies the
provider signature/passcode, persists an immutable delivery receipt, and
upserts normalized rows into `events`. Duplicate deliveries are safe because
both the receipt and event have database uniqueness constraints.

Supported event mapping:

- GitHub: `pull_request` and `push`; PR payloads preserve repository identity,
  base SHA, head SHA, merge state, and ticket/URL references.
- Jira: `jira:issue_created`, `jira:issue_updated`, and
  `jira:issue_deleted`; status transitions come from `changelog.items`, not
  from a second issue read.
- Figma: `FILE_VERSION_UPDATE` and `DEV_MODE_STATUS_UPDATE`. No
  `FILE_UPDATE` event is treated as a design-version event.

GitHub uses `X-Hub-Signature-256`, Jira uses `X-Hub-Signature`, and Figma v2
uses the passcode in the event payload. Secrets must match the values used when
the provider webhook was created. Reconciliation remains the mechanism of
record for gaps because vendor webhook delivery is best effort.

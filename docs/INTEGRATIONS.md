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

New event IDs include the workspace UUID. The same vendor delivery can reach
several workspaces without sharing an event row; replays of legacy deliveries
keep their stored IDs so snapshot and checkpoint references remain valid.

Jira ingestion compares the incoming issue version as a timestamp with the
current Ticket or Requirement. An older delivery is recorded but cannot
restore old criteria or undo an NFR relabelling.

Verification jobs pin the criterion's version and text as well as the commit
pair. A criteria edit queues new work even when an earlier revision is running.
The worker publishes its verdict, finding, supersession and successful job state
in one transaction under the criterion lock. A changed or retired criterion
cancels obsolete work while preserving its packet and pass logs.

Supported event mapping:

- GitHub: `pull_request` and `push`; PR payloads preserve repository identity,
  base SHA, head SHA, merge state, and ticket/URL references. Jira keys are read
  from the PR title, branch, body and every commit message. A push is recorded;
  its commits reach linking through the PR's `synchronize` delivery.
- Jira: `jira:issue_created`, `jira:issue_updated`, and
  `jira:issue_deleted`; status transitions come from `changelog.items`, not
  from a second issue read.
- Figma: `FILE_VERSION_UPDATE` and `DEV_MODE_STATUS_UPDATE`. No
  `FILE_UPDATE` event is treated as a design-version event.

GitHub uses `X-Hub-Signature-256`, Jira uses `X-Hub-Signature`, and Figma v2
uses the passcode in the event payload. Secrets must match the values used when
the provider webhook was created.

## Tokens

`getProviderToken` (`apps/web/src/lib/integrations/tokens.ts`) is the only way
code reads a provider token. It refreshes a token within a minute of expiry,
stores Atlassian's rotated refresh token (Figma's does not rotate), and raises
`ReconnectRequired` when a person has to reconnect. The OAuth callback records
the connected account: the GitHub login, the Figma handle, and for Jira the
site's cloudId, which every Jira REST call needs.

GitHub asks for the `repo` scope by default. OAuth apps have no read-only
scope for private repository contents. The worker clones with the workspace's
token, passed per git command and never written to disk.

## Reconciliation

Vendor webhook delivery is best effort. For GitHub, reconciliation lists the
open pull requests of every repository in `analysis_targets` and replays any
whose head the graph has not seen through the same path a webhook takes, with
the delivery id `reconcile:<repo>#<n>@<head>` so a late real delivery dedupes.
Run it with `POST /api/integrations/github/reconcile?workspace=<slug>`.

For Jira, reconciliation runs an enhanced JQL search (`/rest/api/3/search/jql`)
for issues updated in the last day on the connected site and replays, through
the same ingest as a webhook, every issue whose `updated` time the graph has
not recorded (delivery id `reconcile:<key>@<updated>`). Run it with
`POST /api/integrations/jira/reconcile?workspace=<slug>`.

The local loop `npm run poll` in `apps/web` runs both reconciliations and polls
watched Figma files on an interval.

## Figma design nodes

Each poll that baselines a file or sees a new version fetches the file
(`GET /v1/files/:key?depth=3`) and writes a `DesignArtifact` for the file and a
`DesignConstraint` per top-level frame or component, stating its size,
auto-layout, spacing, padding and direct text. Those statements are the
evidence the worker puts in the DESIGN_CONSTRAINTS packet slot. A Jira ticket
whose summary or description links a Figma file or frame gets a `CONSTRAINS`
edge from that design, whichever arrives first, and a linked file nobody
watches is added to the watch list.

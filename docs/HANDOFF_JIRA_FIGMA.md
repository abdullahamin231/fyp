# Handoff: Jira + Figma integrations (deployed workspace)

This doc was written after Haaniah tested the Jira and Figma connections on the workspace "testing".

Deployment: `https://unify-web-weld.vercel.app`
Workspace slug used for setup: `testing`

This describes how the two integrations were set up and how they work. It is
based on reading the code, plus what was done during setup. Items marked
**(unverified)** were not confirmed against the running system.

---

## 1. Shared mechanics

| Piece | Where |
|---|---|
| Register a provider OAuth app (client ID + secret) | `/settings/integrations?workspace=<slug>` (owner/admin only) |
| Connect / Reconnect | `/workspaces/<slug>/integrations` |
| Start OAuth | `apps/web/src/app/api/integrations/[provider]/authorize/route.ts` |
| OAuth callback (token exchange, stores connection) | `.../[provider]/callback/route.ts` |
| Token storage and refresh | `apps/web/src/lib/integrations/tokens.ts` |
| App registrations / connections helpers | `apps/web/src/lib/integrations/server.ts` |

- Callback URL for any provider: `https://unify-web-weld.vercel.app/api/integrations/<provider>/callback`.
  It is built from the request origin, so the provider's registered URL must match exactly.
- `OAUTH_STATE_SECRET` must be set in Vercel env vars (signs the OAuth state).
- Secrets and tokens are stored as plain text (commit 814876e dropped encryption).
- Registering an app generates a random 32-byte **webhook secret**, shown once.
  Connecting copies it onto the connection row (`integration_connections.webhook_secret_ciphertext`),
  and that copy is what the webhook route verifies against. Re-registering the app generates a
  new secret, so click **Reconnect** afterwards to pick it up.
- Tokens refresh automatically (`getProviderToken`). If a refresh fails the code throws
  `ReconnectRequired`; fix by clicking Reconnect.

### Database
Per `supabase/README.md`, the live project already had migrations through 00036.
00037, 00038 and 00039 are applied by hand, in that order, in the SQL editor or `psql -f`
(not `supabase db push`). **(unverified: whether 00037-00039 are applied on the live project.)**
OAuth connect works without them; Jira ingestion and verification expect them.

---

## 2. Jira

### Setup performed
1. Atlassian developer console, https://developer.atlassian.com/console/myapps: **Create > OAuth 2.0 integration**.
2. Permissions: Jira API, scopes `read:jira-work` and `read:jira-user`.
3. Authorization: OAuth 2.0 (3LO), callback URL `https://unify-web-weld.vercel.app/api/integrations/jira/callback`.
4. Access type: **Resource-level**. The callback stores the first site Atlassian returns
   (`accessible-resources[0]`) as the account's `cloudId`; resource-level means that is the
   site the user picked.
5. Client ID + secret entered in UNIFY under `/settings/integrations`. Webhook secret copied.
6. **Connect Jira Cloud** on the workspace integrations page, consented, landed back with `?connected=1`.
7. Jira webhook created at `<site>.atlassian.net/plugins/servlet/webhooks` (needs Jira admin):
   - URL: `https://unify-web-weld.vercel.app/api/webhooks/jira/<workspace-uuid>`
     (copy it from the **Webhook URL** box on the connected Jira card; it uses the UUID, not the slug)
   - Secret: the webhook secret from step 5
   - Events: issue created, issue updated
8. Edited an issue in Jira; the integrations card showed a new "Last event". Webhook delivery confirmed working.

OAuth scope string requested (override with `JIRA_OAUTH_SCOPE`):
`read:jira-work read:jira-user offline_access` (`offline_access` gives the refresh token).

### What happens to a delivery
`POST /api/webhooks/jira/<workspaceId>` (`apps/web/src/app/api/webhooks/[provider]/[workspaceId]/route.ts`):

1. Verify HMAC-SHA256 in the `x-hub-signature` header (`sha256=<hex>`) against the stored webhook secret. Bad signature gives 401.
2. `jiraAdapter.normalise` (`lib/integrations/adapters.ts`) builds a normalised event. Dedupe key is
   `x-atlassian-webhook-identifier`, or a hash of the body if the header is absent.
3. Insert into `events` (append-only) and `integration_deliveries` (raw payload).
4. `ingestJiraIssue` (`lib/integrations/pipeline.ts`) calls the `ingest_jira_issue` RPC (migration 00036):
   - **Ticket** node per issue key (e.g. `UNI-7`), with status, owner, version
   - **Criterion** nodes `KEY/AC-n`, with `Ticket -REFERENCES-> Criterion` edges and snapshots in `artifact_snapshots`
   - A **Requirement** node instead of a Ticket if the issue has the label `nfr`
   - Criteria come from the configured custom field, or from an `## Acceptance Criteria` section in the description
5. New or changed criteria are queued as verification jobs on every PR that tracks the ticket.
6. Rule 2 (ticket/PR workflow mismatch) is evaluated and can create findings.
7. Figma links found in the issue are recorded as `figmaRefs`, referenced files are auto-watched, and design links are made (see section 3).
8. A checkpoint is recorded for the project key.

Out-of-order (older) deliveries are rejected by migration 00038.

### Optional settings
- Acceptance-criteria custom field: `/settings/workspace` (`saveJiraCriteriaField`; the Jira app must be registered first).

### Other ways to feed events
- **Reconcile:** `POST /api/integrations/jira/reconcile?workspace=<slug>` (admin session) searches issues updated in the last 24h
  and replays any the graph has not recorded. Idempotent (`reconcile:<key>@<updated>`).
  There is no scheduled Jira reconcile; `jiraConnectedWorkspaces()` exists but nothing calls it.
- **Replay script:** `node apps/web/scripts/jira-replay.mjs <slug> --base https://unify-web-weld.vercel.app --issue UNI-7`
  signs a synthetic payload and posts it to the real webhook route. Needs `apps/web/.env.local` with the live Supabase URL and service-role key.
  It writes to the live database.

### Known caveats
- Only the first accessible Atlassian site is used.
- A ticket without an Acceptance Criteria section and without a configured criteria field gets a Ticket node and no Criterion nodes.
- Jira's webhook Secret field was believed to exist and the webhook was confirmed working with it.

---

## 3. Figma (polling, no webhooks)

### Setup performed
Connected through the same OAuth flow (`/workspaces/<slug>/integrations`, **Connect Figma**), using a Figma OAuth app registered
under `/settings/integrations`. Polling was used instead of Figma webhooks. **(unverified: exact steps taken in the Figma developer console and which file keys are watched.)**

Scopes requested (override with `FIGMA_OAUTH_SCOPE`):
`file_content:read file_metadata:read file_versions:read current_user:read`
(`current_user:read` is needed for `/v1/me` in the callback; `file_versions:read` for listing versions; see commits 85dd18e and 7449762).
Figma takes client credentials as HTTP Basic auth at the token endpoint.

### Watching files
- The poller UI (`components/workspaces/figma-poller.tsx`) on the workspace integrations page adds a file by its **file key**
  (the segment after `/design/` in a Figma URL).
- API: `GET/POST/DELETE /api/integrations/figma/files?workspace=<slug>` (admin). Rows live in `figma_watched_files`.
- Files named in Jira tickets (Figma URLs in summary/description/comments) are auto-watched, when Figma is connected.

### Polling behaviour (`lib/integrations/figma-poll.ts`)
- Manual: **Poll now** in the UI, or `POST /api/integrations/figma/poll?workspace=<slug>` (admin).
- First poll of a file only **baselines**: it records the newest version as the high-water mark and projects the design at that version. It does not import history.
- Later polls list `/v1/files/<key>/versions` (up to 10 pages) and, for each version newer than the mark, write an event
  (`FILE_VERSION_UPDATE`, delivery id `figma:poll:<fileKey>:<versionId>`) and a delivery row. Then the file is re-fetched (`?depth=3`) and projected.
- If the stored mark is no longer in Figma's history, it re-baselines.
- Per-file state (`last_seen_version_id`, `last_polled_at`, `last_poll_error`) is stored on `figma_watched_files`. A checkpoint is recorded per file.
- Polling cannot see Dev Mode status changes or file deletions (webhook-only). Polling does not verify signatures because it calls Figma directly.
- Polls files sequentially to respect rate limits.

### What lands in the graph (`figma-design.ts`, `figma-sync.ts`)
- **DesignArtifact** node per watched file: `figma:<fileKey>`, pinned to a version.
- **DesignConstraint** nodes per top-level frame/component/section: `figma:<fileKey>:<nodeId>`, capped at 60 per file. They hold facts (size, auto-layout, gap, padding, the frame's own text) that the worker reads into the `DESIGN_CONSTRAINTS` packet slot.
- `DesignConstraint -PART_OF-> DesignArtifact` edges.
- Constraints that disappear from a newer version are retired (`valid_to` set, status `retired`).
- **Linking to tickets:** a Figma URL in a Jira ticket becomes `design -CONSTRAINS-> ticket`. A `node-id` in the URL links the specific frame; no `node-id` links the whole file. Order does not matter: linking runs after both Jira ingestion and each Figma sync.

### Scheduled polling is not configured
`/api/cron/figma-poll` exists (polls every workspace with a watched file) and requires `Authorization: Bearer <CRON_SECRET>`,
but `apps/web/vercel.json` has **no `crons` entry**, so nothing calls it. Today polling is manual (Poll now). To schedule it:
set `CRON_SECRET` in Vercel and add a `crons` entry for `/api/cron/figma-poll` in `vercel.json`.

---

## 4. End-to-end check (Jira + Figma on one workspace)
1. Both cards on `/workspaces/<slug>/integrations` show **Connected**.
2. Add a Figma file key and click **Poll now**; expect status `baselined`, with `design.upserted` > 0.
3. In Jira, create or edit an issue whose description contains the Figma file/frame URL and an `## Acceptance Criteria` section.
4. Confirm "Last event" updates on the Jira card.
5. In the graph (`/graph`), expect Ticket, its Criterion nodes, the DesignArtifact/DesignConstraint nodes, and a `CONSTRAINS` edge from the design to the ticket.
6. Publish a new Figma version, Poll now again; expect `ingested`, `versionsIngested` >= 1.

## 5. Troubleshooting
| Symptom | Likely cause |
|---|---|
| Redirect mismatch at consent | Callback URL in the provider app does not exactly match `https://unify-web-weld.vercel.app/api/integrations/<provider>/callback` |
| Banner "No <provider> app is registered" | App not registered at `/settings/integrations` |
| Webhook 401 | Webhook secret mismatch; re-save app, Reconnect, update the secret in Jira |
| Webhook 400 "Webhook secret is not configured" | Connection has no stored secret; Reconnect |
| `needs to be reconnected` | Token refresh failed or only a webhook secret is stored; Reconnect |
| Figma poll error `file_versions` / 403 | Scope missing; Reconnect so the new scopes are granted |
| Ticket has no criteria | No `## Acceptance Criteria` section and no criteria field configured |
| Graph empty after a Jira event | Check webhook response; confirm migrations 00037-00039 are applied |

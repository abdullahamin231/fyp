# Testing GitHub, Jira, and Figma Integrations

This guide tests the real OAuth and webhook paths implemented in
`apps/web/src/app/api/`. It does not use the mock vendor.

The test flow is:

1. Configure server-only environment variables.
2. Apply the integration database migration.
3. Register OAuth callback URLs with each provider.
4. Run the app through a public HTTPS tunnel.
5. Connect each provider from the onboarding screen.
6. Register provider webhooks against the workspace UUID.
7. Send a real provider event or a locally signed fixture.
8. Verify the delivery receipt and normalized event in Supabase.

## 1. Install and start the app

From PowerShell:

```powershell
cd "C:\Users\hp\Desktop\fyp shit\fyp\apps\web"
npm install
npm run dev
```

The app should be available at:

```text
http://localhost:3000
```

For OAuth and provider webhooks, use an HTTPS tunnel. For example, with
`cloudflared`:

```powershell
cloudflared tunnel --url http://localhost:3000
```

Copy the generated HTTPS URL. In the examples below it is called:

```text
https://YOUR-TUNNEL.example.com
```

Do not use a tunnel URL in production. Configure a stable production HTTPS
domain there.

## 2. Required environment variables

Create or update:

```text
apps/web/.env.local
```

Use long random values for the application secrets. Do not commit this file.

```env
# Existing Supabase browser configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Server-only Supabase access for OAuth persistence and webhook ingestion
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

# Application cryptographic secrets
INTEGRATION_ENCRYPTION_KEY=generate-a-long-random-secret
OAUTH_STATE_SECRET=generate-another-long-random-secret

# Provider OAuth apps are not configured here. Register each provider's
# client ID and secret per workspace at /settings/integrations?workspace=<slug>;
# they and the generated webhook secrets are stored encrypted in the database.
# Optional scope overrides:
# GITHUB_OAUTH_SCOPE=repo read:org read:user
# JIRA_OAUTH_SCOPE=read:jira-work read:jira-user offline_access
# FIGMA_OAUTH_SCOPE=file_content:read file_metadata:read

# Scheduled Figma poll route (/api/cron/figma-poll), if you call it
CRON_SECRET=generate-a-third-random-secret
```

Generate application secrets with PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Run it at least twice and use different output values for
`INTEGRATION_ENCRYPTION_KEY` and `OAUTH_STATE_SECRET`.

Never expose these values as `NEXT_PUBLIC_*`. In particular, do not put client
secrets, webhook secrets, the service-role key, or encryption keys in browser
code.

## 3. Apply the database migration

From the repository root:

```powershell
cd "C:\Users\hp\Desktop\fyp shit\fyp"
supabase db push
```

The migration adds:

- `public.integration_connections`
- `public.integration_deliveries`
- RLS policies for those tables

Confirm the migration was applied in Supabase SQL Editor:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('integration_connections', 'integration_deliveries');
```

## 4. Register OAuth applications

The callback URL must match exactly, including protocol, host, path, and
trailing slash behavior.

### GitHub

Create an OAuth App under the GitHub account or organization that owns the
repositories being tested.

Set:

```text
Homepage URL:
https://YOUR-TUNNEL.example.com

Authorization callback URL:
https://YOUR-TUNNEL.example.com/api/integrations/github/callback
```

Register the generated client ID and client secret for the workspace at
`/settings/integrations?workspace=<slug>`.

The authorization request asks for:

```text
repo read:org read:user
```

`repo` is needed because OAuth apps have no read-only scope for private
repository contents; UNIFY only reads with it. Override with
`GITHUB_OAUTH_SCOPE` if your organization requires otherwise.

### Jira Cloud

Create an OAuth 2.0 integration in the Atlassian developer console.

Set the callback URL to:

```text
https://YOUR-TUNNEL.example.com/api/integrations/jira/callback
```

Add the scopes configured in `JIRA_OAUTH_SCOPE`. The default is:

```text
read:jira-work read:jira-user offline_access
```

The Jira site used for testing must authorize the application. The OAuth
callback stores the returned access and refresh tokens encrypted.

### Figma

Create a Figma OAuth application and set:

```text
https://YOUR-TUNNEL.example.com/api/integrations/figma/callback
```

The default read-only scopes are:

```text
file_content:read file_metadata:read
```

The Figma account must be able to read the test file.

Restart `npm run dev` after changing `.env.local`.

## 5. Connect from the application

1. Sign in to UNIFY.
2. Open `/onboarding`.
3. Create or select a workspace.
4. On each provider step, click the real authorization button.
5. Approve access at the provider.
6. Confirm that the browser returns to `/onboarding?...connected=1`.

Check that the connection was stored without exposing tokens:

```sql
select
  workspace_id,
  provider,
  external_account_id,
  scopes,
  access_token_ciphertext is not null as has_access_token,
  refresh_token_ciphertext is not null as has_refresh_token
from public.integration_connections;
```

The token columns must contain ciphertext, not a provider token beginning with
an easily recognizable token prefix. Never select or paste the actual token
values into an issue, chat, screenshot, or log.

## 6. Find the workspace UUID

Webhook URLs use the workspace UUID, not the workspace slug:

```sql
select id, name, slug
from public.workspaces
order by created_at desc;
```

Use the `id` for the workspace connected during the OAuth test.

## 7. Register webhooks

The webhook endpoints are:

```text
https://YOUR-TUNNEL.example.com/api/webhooks/github/WORKSPACE_UUID
https://YOUR-TUNNEL.example.com/api/webhooks/jira/WORKSPACE_UUID
https://YOUR-TUNNEL.example.com/api/webhooks/figma/WORKSPACE_UUID
```

Configure the same secret in the provider and in the corresponding
webhook secret shown when the provider app is registered at
`/settings/integrations?workspace=<slug>`.

The OAuth callback stores the configured webhook secret, encrypted, in
`integration_connections`. If the connection already existed before changing
the environment variable, reconnect that provider or update the encrypted
secret through an administrative setup operation before testing webhooks.

### GitHub webhook

Create a repository or organization webhook with:

```text
Payload URL:
https://YOUR-TUNNEL.example.com/api/webhooks/github/WORKSPACE_UUID

Content type:
application/json

Secret:
the GitHub webhook secret from /settings/integrations

Events:
Pull requests
Pushes

Active:
enabled
```

GitHub signs the exact raw body using `X-Hub-Signature-256`. The route rejects
requests with a missing or invalid signature.

### Jira webhook

Register an admin/REST webhook for:

```text
https://YOUR-TUNNEL.example.com/api/webhooks/jira/WORKSPACE_UUID
```

Subscribe to:

```text
jira:issue_created
jira:issue_updated
jira:issue_deleted
```

Use the Jira webhook secret from `/settings/integrations` for the HMAC secret. Jira sends the
signature in `X-Hub-Signature`.

For a transition test, make sure the webhook payload includes a changelog.
The adapter reads the status transition from:

```text
changelog.items[].field
changelog.items[].fromString
changelog.items[].toString
```

### Figma webhook

Create a Figma webhook for the test file or team using:

```text
https://YOUR-TUNNEL.example.com/api/webhooks/figma/WORKSPACE_UUID
```

Use the Figma webhook secret from `/settings/integrations` as the Figma webhook passcode.

Test these event types:

```text
FILE_VERSION_UPDATE
DEV_MODE_STATUS_UPDATE
```

`FILE_UPDATE` is intentionally ignored because it is delayed and noisy for
design-drift evaluation.

## 8. Verify webhook receipts and events

After triggering a provider event, query Supabase:

```sql
select
  provider,
  vendor_delivery_id,
  event_id,
  received_at
from public.integration_deliveries
order by received_at desc
limit 20;
```

Then inspect the normalized events:

```sql
select
  event_id,
  source_tool,
  vendor_delivery_id,
  entity_type,
  entity_id,
  version,
  action,
  state_before,
  state_after,
  actor,
  occurred_at,
  references,
  raw_hash
from public.events
order by received_at desc
limit 20;
```

Expected mappings:

| Provider | Event | Expected normalized result |
|---|---|---|
| GitHub | PR opened/synchronized/closed | `entity_type = pull_request`; `version` is the head SHA; PR payload preserves `base_sha` and `head_sha` |
| GitHub | Push | `entity_type = commit`; `version` is the pushed commit SHA |
| Jira | Issue updated | `entity_type = ticket`; `version` is issue `fields.updated`; status values come from the changelog |
| Figma | `FILE_VERSION_UPDATE` | `entity_type = design_artifact`; `version` is the named version ID |
| Figma | `DEV_MODE_STATUS_UPDATE` | `entity_type = design_artifact`; state values contain the dev-mode transition |

## 9. Local signed webhook smoke tests

These tests verify the route and signature handling without waiting for a live
provider event. They require a valid workspace UUID and the matching webhook
secret in `.env.local`.

### GitHub fixture

PowerShell:

```powershell
$json = @'
{
  "action": "opened",
  "number": 42,
  "repository": { "full_name": "acme/example" },
  "pull_request": {
    "title": "Implement ABC-123 checkout",
    "body": "Tracks ABC-123",
    "updated_at": "2026-10-11T18:00:00Z",
    "base": { "sha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "ref": "main" },
    "head": { "sha": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", "ref": "feature/ABC-123" }
  },
  "sender": { "login": "integration-test" }
}
'@
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
$hmac = [System.Security.Cryptography.HMACSHA256]::new(
  [System.Text.Encoding]::UTF8.GetBytes($env:UNIFY_GITHUB_WEBHOOK_SECRET)
)
$digest = [Convert]::ToHexString($hmac.ComputeHash($bytes)).ToLowerInvariant()
Invoke-WebRequest `
  -Uri "https://YOUR-TUNNEL.example.com/api/webhooks/github/WORKSPACE_UUID" `
  -Method Post `
  -ContentType "application/json" `
  -Headers @{
    "X-GitHub-Delivery" = "integration-test-github-001"
    "X-GitHub-Event" = "pull_request"
    "X-Hub-Signature-256" = "sha256=$digest"
  } `
  -Body $json
```

Expected response:

```json
{ "accepted": true, "events": 1 }
```

Send the same request again. The receipt and event count must remain
unchanged.

### Jira fixture

Use the same HMAC approach as GitHub, but send:

```text
X-Atlassian-Webhook-Identifier: integration-test-jira-001
X-Hub-Signature: sha256=<lowercase hmac>
```

Example payload:

```json
{
  "timestamp": 1791741600000,
  "webhookEvent": "jira:issue_updated",
  "user": { "accountId": "integration-test" },
  "issue": {
    "key": "ABC-123",
    "fields": {
      "summary": "Checkout",
      "description": "Design: https://www.figma.com/file/test/checkout",
      "updated": "2026-10-11T18:00:00.000+0000"
    }
  },
  "changelog": {
    "items": [
      { "field": "status", "fromString": "In Progress", "toString": "Done" }
    ]
  }
}
```

### Figma fixture

Figma uses the passcode in the JSON payload rather than an HMAC header:

```json
{
  "id": "integration-test-figma-001",
  "passcode": "the-figma-webhook-secret-from-settings",
  "event_type": "FILE_VERSION_UPDATE",
  "file_key": "test-file-key",
  "version_id": "test-version-001",
  "timestamp": "2026-10-11T18:00:00Z",
  "user": { "handle": "integration-test" }
}
```

Post it as JSON to:

```text
https://YOUR-TUNNEL.example.com/api/webhooks/figma/WORKSPACE_UUID
```

Change the passcode and confirm the route returns `401`.

## 10. Negative and reliability tests

Run these before considering an integration ready:

| Test | Expected result |
|---|---|
| Missing GitHub signature | HTTP `401` |
| Invalid GitHub signature | HTTP `401` |
| Missing/invalid Jira signature | HTTP `401` |
| Invalid Figma passcode | HTTP `401` |
| Unsupported provider path | HTTP `404` |
| Payload larger than 10 MiB | HTTP `413` |
| Same delivery sent twice | One receipt and one event |
| GitHub event other than PR/push | HTTP `200` with zero normalized events |
| Figma `FILE_UPDATE` | HTTP `200` with zero normalized events |
| Jira status update without a status changelog item | Event exists with null transition fields |
| Old/out-of-order versions | Existing ingestion/version guard decides state; webhook route does not duplicate reliability logic |

## 11. Commands to run after dependencies are installed

```powershell
cd "C:\Users\hp\Desktop\fyp shit\fyp\apps\web"
npm install
npm run typecheck
npm run lint
npm run build

cd "C:\Users\hp\Desktop\fyp shit\fyp\packages\contracts"
npm install
npm test
npm run build
```

The contract tests are regression coverage for the existing event and
ingestion schemas. The provider webhook smoke tests above are still required
because the current repository does not yet contain a live provider test
harness.


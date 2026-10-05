#!/usr/bin/env bash
# scripts/register_webhooks.sh
# Phase 2: Register webhooks on all three vendors.
# Run AFTER starting the receiver and ngrok tunnel.
#
# Usage:
#   export NGROK_URL="https://abc123.ngrok.io"   (your current ngrok URL)
#   source .env
#   bash scripts/register_webhooks.sh

set -euo pipefail

if [ -z "${NGROK_URL:-}" ]; then
  echo "ERROR: NGROK_URL is not set. Run: export NGROK_URL=https://your-ngrok-url.ngrok.io"
  exit 1
fi

mkdir -p payloads/github payloads/jira payloads/figma

echo "============================================================"
echo " UNIFY — Phase 2: Register Webhooks"
echo " Base URL: ${NGROK_URL}"
echo "============================================================"

# ── GitHub ─────────────────────────────────────────────────────────────────
echo ""
echo "[GitHub] Registering webhook on ${FIXTURE_GITHUB_OWNER}/${FIXTURE_GITHUB_REPO}..."
curl -s -X POST \
  -H "Authorization: Bearer ${GITHUB_PAT}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/${FIXTURE_GITHUB_OWNER}/${FIXTURE_GITHUB_REPO}/hooks" \
  -d "{
    \"name\": \"web\",
    \"active\": true,
    \"events\": [\"pull_request\", \"push\", \"pull_request_review\", \"create\", \"delete\"],
    \"config\": {
      \"url\": \"${NGROK_URL}/webhooks/github\",
      \"content_type\": \"json\",
      \"secret\": \"${GITHUB_WEBHOOK_SECRET}\"
    }
  }" | tee payloads/github/webhook_registration.json | python3 -c "
import sys,json
d=json.load(sys.stdin)
if 'id' in d:
    print(f'  ✓ GitHub webhook registered: ID={d[\"id\"]}, events={d[\"events\"]}')
else:
    print(f'  ✗ Error: {d}')
"

# ── Jira ───────────────────────────────────────────────────────────────────
echo ""
JIRA_AUTH=$(echo -n "${JIRA_EMAIL}:${JIRA_API_TOKEN}" | base64)

echo "[Jira] Registering webhook on ${JIRA_DOMAIN}..."
curl -s -X POST \
  -H "Authorization: Basic ${JIRA_AUTH}" \
  -H "Content-Type: application/json" \
  "https://${JIRA_DOMAIN}/rest/webhooks/1.0/webhook" \
  -d "{
    \"name\": \"unify-webhook\",
    \"url\": \"${NGROK_URL}/webhooks/jira?secret=${JIRA_WEBHOOK_SECRET}\",
    \"events\": [
      \"jira:issue_updated\",
      \"jira:issue_created\",
      \"jira:issue_deleted\"
    ],
    \"jqlFilter\": \"project = ${FIXTURE_JIRA_PROJECT_KEY}\",
    \"excludeIssueDetails\": false
  }" | tee payloads/jira/webhook_registration.json | python3 -c "
import sys,json
d=json.load(sys.stdin)
# Jira returns the webhook object on success
if isinstance(d, dict) and ('self' in d or 'id' in d or 'url' in d):
    print(f'  ✓ Jira webhook registered')
    print(f'    URL: {d.get(\"url\",\"?\")}')
elif isinstance(d, list):
    print(f'  ✓ Jira webhooks listed: {len(d)} total')
else:
    print(f'  ✗ Unexpected response: {d}')
"

# ── Figma ──────────────────────────────────────────────────────────────────
echo ""
echo "[Figma] Registering FILE_VERSION_UPDATE webhook..."
curl -s -X POST \
  -H "X-Figma-Token: ${FIGMA_PAT}" \
  -H "Content-Type: application/json" \
  "https://api.figma.com/v2/webhooks" \
  -d "{
    \"event_type\": \"FILE_VERSION_UPDATE\",
    \"team_id\": \"${FIGMA_TEAM_ID}\",
    \"endpoint\": \"${NGROK_URL}/webhooks/figma\",
    \"passcode\": \"${FIGMA_WEBHOOK_SECRET}\",
    \"description\": \"Unify file version updates\"
  }" | tee payloads/figma/webhook_registration_version.json | python3 -c "
import sys,json
d=json.load(sys.stdin)
if 'id' in d or d.get('status') == 'ACTIVE':
    print(f'  ✓ Figma FILE_VERSION_UPDATE webhook registered: {d.get(\"id\",\"?\")}')
elif d.get('status') == 403 or 'error' in d:
    print('  ✗ FIGMA WEBHOOK FAILED — check plan tier and team_id')
    print('    → Fall back to polling: GET /v1/files/{key}/versions on a cron')
else:
    print(f'  Response: {d}')
"

echo "[Figma] Registering DEV_MODE_STATUS_UPDATE webhook..."
curl -s -X POST \
  -H "X-Figma-Token: ${FIGMA_PAT}" \
  -H "Content-Type: application/json" \
  "https://api.figma.com/v2/webhooks" \
  -d "{
    \"event_type\": \"DEV_MODE_STATUS_UPDATE\",
    \"team_id\": \"${FIGMA_TEAM_ID}\",
    \"endpoint\": \"${NGROK_URL}/webhooks/figma\",
    \"passcode\": \"${FIGMA_WEBHOOK_SECRET}\",
    \"description\": \"Unify dev mode status updates\"
  }" | tee payloads/figma/webhook_registration_devmode.json | python3 -c "
import sys,json
d=json.load(sys.stdin)
if 'id' in d or d.get('status') == 'ACTIVE':
    print(f'  ✓ Figma DEV_MODE_STATUS_UPDATE webhook registered: {d.get(\"id\",\"?\")}')
elif d.get('status') == 403 or 'error' in d:
    print('  ✗ DEV_MODE_STATUS_UPDATE unavailable — requires Professional plan + Dev Mode')
else:
    print(f'  Response: {d}')
"

echo ""
echo "============================================================"
echo " Webhook registration complete."
echo " Trigger events in each tool and check your receiver logs."
echo " Payloads will appear in payloads/github/, payloads/jira/, payloads/figma/"
echo "============================================================"

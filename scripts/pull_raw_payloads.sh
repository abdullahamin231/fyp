#!/usr/bin/env bash
# scripts/pull_raw_payloads.sh
# Phase 1: Hand-pull one payload from each vendor to save as normalisation reference.
# Run AFTER setting up your .env credentials.
#
# Usage:
#   source .env  (or export vars manually)
#   bash scripts/pull_raw_payloads.sh

set -euo pipefail

mkdir -p payloads/github payloads/jira payloads/figma

echo "============================================================"
echo " UNIFY — Phase 1: Pull Raw Payloads"
echo "============================================================"

# ── GitHub ─────────────────────────────────────────────────────────────────
echo ""
echo "[GitHub] Pulling repo metadata..."
curl -s \
  -H "Authorization: Bearer ${GITHUB_PAT}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/${FIXTURE_GITHUB_OWNER}/${FIXTURE_GITHUB_REPO}" \
  | tee payloads/github/repo_meta.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  ✓ Repo: {d[\"full_name\"]} | stars: {d[\"stargazers_count\"]}')"

echo "[GitHub] Pulling PR #1..."
curl -s \
  -H "Authorization: Bearer ${GITHUB_PAT}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/${FIXTURE_GITHUB_OWNER}/${FIXTURE_GITHUB_REPO}/pulls/1" \
  | tee payloads/github/pr_1.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  ✓ PR #{d.get(\"number\")}: {d.get(\"title\")}')"

echo "[GitHub] Pulling rate limits..."
curl -sv \
  -H "Authorization: Bearer ${GITHUB_PAT}" \
  "https://api.github.com/rate_limit" \
  2>&1 | tee payloads/github/rate_limit_full.txt | grep -E "x-ratelimit|HTTP/" || true
curl -s \
  -H "Authorization: Bearer ${GITHUB_PAT}" \
  "https://api.github.com/rate_limit" \
  | tee payloads/github/rate_limit.json | python3 -c "
import sys,json
d=json.load(sys.stdin)
core=d['resources']['core']
print(f'  ✓ Rate limit: {core[\"remaining\"]}/{core[\"limit\"]} remaining')
"

# ── Jira ───────────────────────────────────────────────────────────────────
echo ""
JIRA_AUTH=$(echo -n "${JIRA_EMAIL}:${JIRA_API_TOKEN}" | base64)

echo "[Jira] Pulling project metadata..."
curl -s \
  -H "Authorization: Basic ${JIRA_AUTH}" \
  -H "Content-Type: application/json" \
  "https://${JIRA_DOMAIN}/rest/api/3/project/${FIXTURE_JIRA_PROJECT_KEY}" \
  | tee payloads/jira/project_meta.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  ✓ Project: {d.get(\"name\")} ({d.get(\"key\")})')"

echo "[Jira] Pulling issues..."
curl -s \
  -H "Authorization: Basic ${JIRA_AUTH}" \
  -H "Content-Type: application/json" \
  "https://${JIRA_DOMAIN}/rest/api/3/search?jql=project=${FIXTURE_JIRA_PROJECT_KEY}&maxResults=5" \
  | tee payloads/jira/issues_sample.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  ✓ Issues: {d.get(\"total\")} total, pulled {len(d.get(\"issues\",[]))}')"

echo "[Jira] Pulling issue ${FIXTURE_JIRA_PROJECT_KEY}-1..."
curl -s \
  -H "Authorization: Basic ${JIRA_AUTH}" \
  -H "Content-Type: application/json" \
  "https://${JIRA_DOMAIN}/rest/api/3/issue/${FIXTURE_JIRA_PROJECT_KEY}-1" \
  | tee "payloads/jira/issue_${FIXTURE_JIRA_PROJECT_KEY}-1.json" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(f'  ✓ Issue: {d.get(\"key\")} — {d.get(\"fields\",{}).get(\"summary\",\"\")}')
"

echo "[Jira] Checking rate limits (via response headers)..."
curl -sv \
  -H "Authorization: Basic ${JIRA_AUTH}" \
  "https://${JIRA_DOMAIN}/rest/api/3/myself" \
  2>&1 | grep -iE "retry-after|x-ratelimit|X-Ratelimit" \
  | tee payloads/jira/rate_limit_headers.txt || echo "  (No rate limit headers on this response)"

# ── Figma ──────────────────────────────────────────────────────────────────
echo ""
echo "[Figma] Pulling file metadata..."
curl -s \
  -H "X-Figma-Token: ${FIGMA_PAT}" \
  "https://api.figma.com/v1/files/${FIXTURE_FIGMA_FILE_KEY}" \
  | tee payloads/figma/file_meta.json | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(f'  ✓ File: {d.get(\"name\")} | last modified: {d.get(\"lastModified\")}')
"

echo "[Figma] Pulling file version history..."
curl -s \
  -H "X-Figma-Token: ${FIGMA_PAT}" \
  "https://api.figma.com/v1/files/${FIXTURE_FIGMA_FILE_KEY}/versions" \
  | tee payloads/figma/file_versions.json | python3 -c "
import sys,json
d=json.load(sys.stdin)
versions=d.get('versions',[])
print(f'  ✓ Versions: {len(versions)} found')
if versions:
    v=versions[0]
    print(f'    Latest: {v.get(\"label\",\"(no label)\")} by {v.get(\"user\",{}).get(\"handle\",\"?\")} at {v.get(\"created_at\")}')
"

echo "[Figma] Checking webhook availability (plan tier check)..."
curl -s \
  -H "X-Figma-Token: ${FIGMA_PAT}" \
  "https://api.figma.com/v2/webhooks" \
  | tee payloads/figma/webhook_check.json | python3 -c "
import sys,json
d=json.load(sys.stdin)
if 'error' in d or d.get('status',200) == 403:
    print('  ✗ WEBHOOKS UNAVAILABLE — check your Figma plan tier')
    print('  → Your adapter must use POLLING. Document this in the risk register.')
else:
    hooks=d.get('webhooks',[])
    print(f'  ✓ Webhooks available. Registered: {len(hooks)}')
"

echo ""
echo "============================================================"
echo " Done. Check payloads/ for all saved JSON files."
echo " These are your normalisation reference payloads."
echo "============================================================"

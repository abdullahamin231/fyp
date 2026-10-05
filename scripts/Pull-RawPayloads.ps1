# Pull One Raw Payload From Each Vendor
# PowerShell version — works natively on Windows
# Run AFTER filling in your .env values
#
# Usage:
#   1. Copy .env.example to .env and fill in tokens
#   2. Open PowerShell in the project root
#   3. .\scripts\Pull-RawPayloads.ps1

param(
    [string]$EnvFile = ".\.env"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ── Load .env ────────────────────────────────────────────────────────────────
if (-not (Test-Path $EnvFile)) {
    Write-Error "No .env file found at '$EnvFile'. Copy .env.example to .env and fill in your tokens."
}

Get-Content $EnvFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $name  = $Matches[1].Trim()
        $value = $Matches[2].Trim().Trim('"').Trim("'")
        [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

$GH_TOKEN     = $env:GITHUB_PAT
$GH_OWNER     = $env:FIXTURE_GITHUB_OWNER
$GH_REPO      = $env:FIXTURE_GITHUB_REPO
$JIRA_TOKEN   = $env:JIRA_API_TOKEN
$JIRA_EMAIL   = $env:JIRA_EMAIL
$JIRA_DOMAIN  = $env:JIRA_DOMAIN
$JIRA_PROJECT = $env:FIXTURE_JIRA_PROJECT_KEY
$FIGMA_TOKEN  = $env:FIGMA_PAT
$FIGMA_FILE   = $env:FIXTURE_FIGMA_FILE_KEY
$FIGMA_TEAM   = $env:FIGMA_TEAM_ID

# ── Helpers ──────────────────────────────────────────────────────────────────
function Save-Json {
    param([string]$Path, [object]$Data)
    $dir = Split-Path $Path -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    $Data | ConvertTo-Json -Depth 20 | Set-Content -Path $Path -Encoding UTF8
    Write-Host "  ✓ Saved → $Path" -ForegroundColor Green
}

function Invoke-API {
    param([string]$Uri, [hashtable]$Headers)
    try {
        $response = Invoke-RestMethod -Uri $Uri -Headers $Headers -Method GET
        return $response
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "  ✗ HTTP $statusCode — $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# ── GitHub ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " [GitHub]" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan

if (-not $GH_TOKEN) { Write-Warning "GITHUB_PAT not set — skipping GitHub"; } else {

    $ghHeaders = @{
        "Authorization" = "Bearer $GH_TOKEN"
        "Accept"        = "application/vnd.github+json"
        "X-GitHub-Api-Version" = "2022-11-28"
    }

    Write-Host "[GitHub] Pulling repo metadata..."
    $repo = Invoke-API "https://api.github.com/repos/$GH_OWNER/$GH_REPO" $ghHeaders
    if ($repo) {
        Save-Json "payloads\github\repo_meta.json" $repo
        Write-Host "         Repo: $($repo.full_name) | Stars: $($repo.stargazers_count)"
    }

    Write-Host "[GitHub] Pulling PR list..."
    $prs = Invoke-API "https://api.github.com/repos/$GH_OWNER/$GH_REPO/pulls?state=all&per_page=5" $ghHeaders
    if ($prs) {
        Save-Json "payloads\github\prs_list.json" $prs
        Write-Host "         Found $($prs.Count) PRs"
    }

    Write-Host "[GitHub] Pulling PR #1..."
    $pr1 = Invoke-API "https://api.github.com/repos/$GH_OWNER/$GH_REPO/pulls/1" $ghHeaders
    if ($pr1) {
        Save-Json "payloads\github\pr_1.json" $pr1
        Write-Host "         PR #$($pr1.number): $($pr1.title)"
    }

    Write-Host "[GitHub] Pulling commit list on PR #1..."
    $commits = Invoke-API "https://api.github.com/repos/$GH_OWNER/$GH_REPO/pulls/1/commits" $ghHeaders
    if ($commits) { Save-Json "payloads\github\pr_1_commits.json" $commits }

    Write-Host "[GitHub] Checking rate limits..."
    $rateLimit = Invoke-API "https://api.github.com/rate_limit" $ghHeaders
    if ($rateLimit) {
        Save-Json "payloads\github\rate_limit.json" $rateLimit
        $core = $rateLimit.resources.core
        Write-Host "         Core: $($core.remaining)/$($core.limit) remaining, resets $(([datetimeoffset]::FromUnixTimeSeconds($core.reset)).LocalDateTime)"
    }
}

# ── Jira ─────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " [Jira]" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan

if (-not $JIRA_TOKEN -or -not $JIRA_EMAIL) { Write-Warning "JIRA_API_TOKEN or JIRA_EMAIL not set — skipping Jira"; } else {

    $jiraAuthBytes = [System.Text.Encoding]::UTF8.GetBytes("${JIRA_EMAIL}:${JIRA_TOKEN}")
    $jiraAuth = [System.Convert]::ToBase64String($jiraAuthBytes)
    $jiraHeaders = @{
        "Authorization" = "Basic $jiraAuth"
        "Content-Type"  = "application/json"
        "Accept"        = "application/json"
    }

    Write-Host "[Jira] Pulling project metadata..."
    $project = Invoke-API "https://$JIRA_DOMAIN/rest/api/3/project/$JIRA_PROJECT" $jiraHeaders
    if ($project) {
        Save-Json "payloads\jira\project_meta.json" $project
        Write-Host "       Project: $($project.name) ($($project.key))"
    }

    Write-Host "[Jira] Pulling issues (first 5)..."
    $issues = Invoke-API "https://$JIRA_DOMAIN/rest/api/3/search?jql=project=$JIRA_PROJECT%20ORDER%20BY%20created%20DESC&maxResults=5" $jiraHeaders
    if ($issues) {
        Save-Json "payloads\jira\issues_sample.json" $issues
        Write-Host "       Total issues: $($issues.total), pulled: $($issues.issues.Count)"
    }

    Write-Host "[Jira] Pulling issue ${JIRA_PROJECT}-1..."
    $issue1 = Invoke-API "https://$JIRA_DOMAIN/rest/api/3/issue/${JIRA_PROJECT}-1" $jiraHeaders
    if ($issue1) {
        Save-Json "payloads\jira\issue_${JIRA_PROJECT}-1.json" $issue1
        Write-Host "       $($issue1.key): $($issue1.fields.summary)"
    }

    # Jira doesn't expose rate limit via a dedicated endpoint.
    # Make a lightweight call and capture response headers.
    Write-Host "[Jira] Checking response for rate limit headers..."
    try {
        $resp = Invoke-WebRequest -Uri "https://$JIRA_DOMAIN/rest/api/3/myself" -Headers $jiraHeaders -Method GET
        $rlHeaders = $resp.Headers.Keys | Where-Object { $_ -match "ratelimit|retry-after" }
        if ($rlHeaders.Count -gt 0) {
            $rlHeaders | ForEach-Object { Write-Host "       $_ : $($resp.Headers[$_])" }
        } else {
            Write-Host "       (No rate limit headers on this response — Jira Cloud doesn't expose them by default)"
        }
        Save-Json "payloads\jira\myself.json" ($resp.Content | ConvertFrom-Json)
    } catch { Write-Warning "Jira /myself call failed: $_" }
}

# ── Figma ────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " [Figma]" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan

if (-not $FIGMA_TOKEN) { Write-Warning "FIGMA_PAT not set — skipping Figma"; } else {

    $figmaHeaders = @{ "X-Figma-Token" = $FIGMA_TOKEN }

    Write-Host "[Figma] Pulling file metadata..."
    $file = Invoke-API "https://api.figma.com/v1/files/$FIGMA_FILE" $figmaHeaders
    if ($file) {
        Save-Json "payloads\figma\file_meta.json" $file
        Write-Host "        File: $($file.name) | Last modified: $($file.lastModified)"
    }

    Write-Host "[Figma] Pulling version history..."
    $versions = Invoke-API "https://api.figma.com/v1/files/$FIGMA_FILE/versions" $figmaHeaders
    if ($versions) {
        Save-Json "payloads\figma\file_versions.json" $versions
        $vCount = $versions.versions.Count
        Write-Host "        Versions: $vCount found"
        if ($vCount -gt 0) {
            $latest = $versions.versions[0]
            Write-Host "        Latest: '$($latest.label)' by $($latest.user.handle) at $($latest.created_at)"
        }
    }

    Write-Host "[Figma] Pulling file components..."
    $components = Invoke-API "https://api.figma.com/v1/files/$FIGMA_FILE/components" $figmaHeaders
    if ($components) { Save-Json "payloads\figma\file_components.json" $components }

    Write-Host "[Figma] Pulling comments (dev resource references)..."
    $comments = Invoke-API "https://api.figma.com/v1/files/$FIGMA_FILE/comments" $figmaHeaders
    if ($comments) { Save-Json "payloads\figma\file_comments.json" $comments }

    # ── PLAN TIER CHECK ──────────────────────────────────────────────────────
    Write-Host ""
    Write-Host "[Figma] ⚠ PLAN TIER CHECK — checking if webhooks are available..." -ForegroundColor Yellow
    try {
        $whCheck = Invoke-RestMethod -Uri "https://api.figma.com/v2/webhooks" -Headers $figmaHeaders -Method GET
        Save-Json "payloads\figma\webhook_check.json" $whCheck
        $hookCount = if ($whCheck.webhooks) { $whCheck.webhooks.Count } else { 0 }
        Write-Host "  ✓ WEBHOOKS AVAILABLE. Existing hooks: $hookCount" -ForegroundColor Green
        Write-Host "  → Proceed with webhook registration (FILE_VERSION_UPDATE + DEV_MODE_STATUS_UPDATE)" -ForegroundColor Green
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        if ($status -eq 403 -or $status -eq 404) {
            Write-Host "  ✗ WEBHOOKS NOT AVAILABLE (HTTP $status)" -ForegroundColor Red
            Write-Host "  → You are likely on the Starter (free) plan." -ForegroundColor Red
            Write-Host "  → ACTION REQUIRED: Switch Figma adapter to POLLING mode." -ForegroundColor Red
            Write-Host "  → Polling: GET /v1/files/{key}/versions every 60s" -ForegroundColor Yellow
            Write-Host "  → Latency: ~60s instead of near-real-time — document in risk register §18.2" -ForegroundColor Yellow
            @{ webhook_available = $false; http_status = $status; note = "Starter plan — use polling" } | 
                ConvertTo-Json | Set-Content "payloads\figma\webhook_check.json" -Encoding UTF8
        } else {
            Write-Warning "Webhook check failed with HTTP $status"
        }
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " Done. Check payloads\ for all raw JSON." -ForegroundColor Cyan
Write-Host " These are your normalisation reference payloads." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan

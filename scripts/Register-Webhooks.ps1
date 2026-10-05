# Register Webhooks on All Three Vendors
# PowerShell version — works natively on Windows
#
# Prerequisites:
#   1. ngrok is running: ngrok http 4000
#   2. receiver/server.py is running: python webhooks/receiver/server.py
#   3. .env is filled in with all tokens
#
# Usage:
#   $env:NGROK_URL = "https://abc123.ngrok.io"   ← your current ngrok URL
#   .\scripts\Register-Webhooks.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$NgrokUrl,

    [string]$EnvFile = ".\.env"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ── Load .env ────────────────────────────────────────────────────────────────
if (-not (Test-Path $EnvFile)) {
    Write-Error "No .env file found. Copy .env.example to .env and fill in values."
}

Get-Content $EnvFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $name  = $Matches[1].Trim()
        $value = $Matches[2].Trim().Trim('"').Trim("'")
        [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

$NgrokUrl = $NgrokUrl.TrimEnd('/')

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " UNIFY — Webhook Registration" -ForegroundColor Cyan
Write-Host " Receiver URL: $NgrokUrl" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan

# ── GitHub ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[GitHub] Registering webhook..." -ForegroundColor Yellow

$ghHeaders = @{
    "Authorization" = "Bearer $($env:GITHUB_PAT)"
    "Accept"        = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

$ghBody = @{
    name   = "web"
    active = $true
    events = @("pull_request","push","pull_request_review","create","delete")
    config = @{
        url          = "$NgrokUrl/webhooks/github"
        content_type = "json"
        secret       = $env:GITHUB_WEBHOOK_SECRET
    }
} | ConvertTo-Json -Depth 5

try {
    $ghHook = Invoke-RestMethod `
        -Uri "https://api.github.com/repos/$($env:FIXTURE_GITHUB_OWNER)/$($env:FIXTURE_GITHUB_REPO)/hooks" `
        -Method POST -Headers $ghHeaders -Body $ghBody -ContentType "application/json"
    $ghHook | ConvertTo-Json -Depth 5 | Set-Content "payloads\github\webhook_registration.json" -Encoding UTF8
    Write-Host "  ✓ GitHub webhook registered" -ForegroundColor Green
    Write-Host "    ID: $($ghHook.id)"
    Write-Host "    URL: $($ghHook.config.url)"
    Write-Host "    Events: $($ghHook.events -join ', ')"
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    Write-Host "  ✗ GitHub webhook registration failed (HTTP $status)" -ForegroundColor Red
    Write-Host "    $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    → Check: PAT has repo admin permissions, repo name is correct" -ForegroundColor Yellow
}

# ── Jira ─────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[Jira] Registering webhook..." -ForegroundColor Yellow

$jiraAuthBytes = [System.Text.Encoding]::UTF8.GetBytes("$($env:JIRA_EMAIL):$($env:JIRA_API_TOKEN)")
$jiraAuth = [System.Convert]::ToBase64String($jiraAuthBytes)
$jiraHeaders = @{
    "Authorization" = "Basic $jiraAuth"
    "Content-Type"  = "application/json"
    "Accept"        = "application/json"
}

# Encode the secret into the URL (Jira Cloud doesn't sign payloads)
$jiraWebhookUrl = "$NgrokUrl/webhooks/jira?secret=$($env:JIRA_WEBHOOK_SECRET)"

$jiraBody = @{
    name               = "unify-webhook"
    url                = $jiraWebhookUrl
    events             = @("jira:issue_updated","jira:issue_created","jira:issue_deleted")
    jqlFilter          = "project = $($env:FIXTURE_JIRA_PROJECT_KEY)"
    excludeIssueDetails = $false
} | ConvertTo-Json

try {
    $jiraHook = Invoke-RestMethod `
        -Uri "https://$($env:JIRA_DOMAIN)/rest/webhooks/1.0/webhook" `
        -Method POST -Headers $jiraHeaders -Body $jiraBody -ContentType "application/json"
    $jiraHook | ConvertTo-Json -Depth 5 | Set-Content "payloads\jira\webhook_registration.json" -Encoding UTF8
    Write-Host "  ✓ Jira webhook registered" -ForegroundColor Green
    Write-Host "    URL: $($jiraHook.url)"
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    Write-Host "  ✗ Jira webhook registration failed (HTTP $status)" -ForegroundColor Red
    Write-Host "    → Check: You need Jira Admin role on the site to register webhooks" -ForegroundColor Yellow
    Write-Host "    → Alternative: Jira Settings → System → WebHooks → Create a WebHook (manually)" -ForegroundColor Yellow
    Write-Host "    → Use this URL: $jiraWebhookUrl" -ForegroundColor Yellow
}

# ── Figma ─────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[Figma] Registering FILE_VERSION_UPDATE webhook..." -ForegroundColor Yellow

$figmaHeaders = @{ "X-Figma-Token" = $env:FIGMA_PAT; "Content-Type" = "application/json" }

$figmaBody1 = @{
    event_type  = "FILE_VERSION_UPDATE"
    team_id     = $env:FIGMA_TEAM_ID
    endpoint    = "$NgrokUrl/webhooks/figma"
    passcode    = $env:FIGMA_WEBHOOK_SECRET
    description = "Unify file version updates"
} | ConvertTo-Json

try {
    $figmaHook1 = Invoke-RestMethod `
        -Uri "https://api.figma.com/v2/webhooks" `
        -Method POST -Headers $figmaHeaders -Body $figmaBody1 -ContentType "application/json"
    $figmaHook1 | ConvertTo-Json -Depth 5 | Set-Content "payloads\figma\webhook_registration_version.json" -Encoding UTF8
    Write-Host "  ✓ Figma FILE_VERSION_UPDATE registered" -ForegroundColor Green
    Write-Host "    ID: $($figmaHook1.id)  Status: $($figmaHook1.status)"
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    Write-Host "  ✗ Figma FILE_VERSION_UPDATE failed (HTTP $status)" -ForegroundColor Red
    if ($status -eq 403) {
        Write-Host "  → PLAN ISSUE: Webhooks require Figma Professional plan or above." -ForegroundColor Red
        Write-Host "  → FALLBACK: Switch to polling mode (see integrations/figma/poller.py)" -ForegroundColor Yellow
        Write-Host "  → Document this in risk register §18.2 and update the latency story." -ForegroundColor Yellow
    }
}

Write-Host "[Figma] Registering DEV_MODE_STATUS_UPDATE webhook..." -ForegroundColor Yellow

$figmaBody2 = @{
    event_type  = "DEV_MODE_STATUS_UPDATE"
    team_id     = $env:FIGMA_TEAM_ID
    endpoint    = "$NgrokUrl/webhooks/figma"
    passcode    = $env:FIGMA_WEBHOOK_SECRET
    description = "Unify dev mode status updates"
} | ConvertTo-Json

try {
    $figmaHook2 = Invoke-RestMethod `
        -Uri "https://api.figma.com/v2/webhooks" `
        -Method POST -Headers $figmaHeaders -Body $figmaBody2 -ContentType "application/json"
    $figmaHook2 | ConvertTo-Json -Depth 5 | Set-Content "payloads\figma\webhook_registration_devmode.json" -Encoding UTF8
    Write-Host "  ✓ Figma DEV_MODE_STATUS_UPDATE registered" -ForegroundColor Green
    Write-Host "    ID: $($figmaHook2.id)  Status: $($figmaHook2.status)"
} catch {
    Write-Host "  ✗ DEV_MODE_STATUS_UPDATE failed — requires Dev Mode on Professional+ plan" -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " Registration complete." -ForegroundColor Cyan
Write-Host " Now trigger one event in each tool:" -ForegroundColor Cyan
Write-Host "   GitHub: open/push to a PR" -ForegroundColor White
Write-Host "   Jira:   update a ticket status" -ForegroundColor White
Write-Host "   Figma:  publish a named version (File → Save to version history)" -ForegroundColor White
Write-Host " Watch payloads\github\, payloads\jira\, payloads\figma\" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan

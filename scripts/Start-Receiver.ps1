# Setup & Start the UNIFY Webhook Receiver
# PowerShell version
#
# Run this AFTER:
#   1. Python is installed (winget install Python.Python.3.12)
#   2. ngrok is installed  (winget install ngrok)
#   3. .env is filled in
#
# Usage:
#   .\scripts\Start-Receiver.ps1

param(
    [string]$EnvFile = ".\.env",
    [int]$Port = 4000,
    [switch]$SkipInstall
)

Set-StrictMode -Version Latest

# ── Locate Python ──────────────────────────────────────────────────────────
$pythonCmd = $null
foreach ($cmd in @("python", "python3", "py")) {
    try {
        $ver = & $cmd --version 2>&1
        if ($ver -match "Python 3") {
            $pythonCmd = $cmd
            Write-Host "✓ Found Python: $ver ($cmd)" -ForegroundColor Green
            break
        }
    } catch {}
}

if (-not $pythonCmd) {
    Write-Host "✗ Python 3 not found." -ForegroundColor Red
    Write-Host ""
    Write-Host "Install Python via one of these methods:" -ForegroundColor Yellow
    Write-Host "  1. winget install Python.Python.3.12" -ForegroundColor White
    Write-Host "  2. https://python.org/downloads" -ForegroundColor White
    Write-Host "  3. Microsoft Store → search 'Python 3.12'" -ForegroundColor White
    Write-Host ""
    Write-Host "After installing, re-run this script." -ForegroundColor Yellow
    exit 1
}

# ── Install pip dependencies ───────────────────────────────────────────────
if (-not $SkipInstall) {
    Write-Host ""
    Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
    & $pythonCmd -m pip install flask python-dotenv --quiet
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ pip install failed" -ForegroundColor Red; exit 1
    }
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
}

# ── Load .env into current process ────────────────────────────────────────
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $name  = $Matches[1].Trim()
            $value = $Matches[2].Trim().Trim('"').Trim("'")
            [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    Write-Host "✓ .env loaded" -ForegroundColor Green
} else {
    Write-Warning ".env not found — receiver will start without secrets (webhooks will be rejected)"
}

# ── Check secrets ─────────────────────────────────────────────────────────
$missing = @()
if (-not $env:GITHUB_WEBHOOK_SECRET) { $missing += "GITHUB_WEBHOOK_SECRET" }
if (-not $env:JIRA_WEBHOOK_SECRET)   { $missing += "JIRA_WEBHOOK_SECRET" }
if (-not $env:FIGMA_WEBHOOK_SECRET)  { $missing += "FIGMA_WEBHOOK_SECRET" }
if ($missing.Count -gt 0) {
    Write-Host "⚠ Missing secrets: $($missing -join ', ')" -ForegroundColor Yellow
    Write-Host "  Webhooks from these vendors will return 401. Fill in .env first." -ForegroundColor Yellow
}

# ── Create payloads directories ───────────────────────────────────────────
@("payloads\github", "payloads\jira", "payloads\figma") | ForEach-Object {
    if (-not (Test-Path $_)) { New-Item -ItemType Directory -Path $_ -Force | Out-Null }
}

# ── Start receiver ────────────────────────────────────────────────────────
Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " Starting UNIFY Webhook Receiver on port $Port" -ForegroundColor Cyan
Write-Host " Endpoints:" -ForegroundColor Cyan
Write-Host "   POST http://localhost:$Port/webhooks/github" -ForegroundColor White
Write-Host "   POST http://localhost:$Port/webhooks/jira" -ForegroundColor White
Write-Host "   POST http://localhost:$Port/webhooks/figma" -ForegroundColor White
Write-Host "   GET  http://localhost:$Port/health" -ForegroundColor White
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "In a SEPARATE terminal, run:" -ForegroundColor Yellow
Write-Host "  ngrok http $Port" -ForegroundColor White
Write-Host "Then copy the https://xxxxx.ngrok.io URL and run:" -ForegroundColor Yellow
Write-Host "  .\scripts\Register-Webhooks.ps1 -NgrokUrl 'https://xxxxx.ngrok.io'" -ForegroundColor White
Write-Host ""

$env:PORT = $Port
$env:FLASK_ENV = "development"
& $pythonCmd "webhooks\receiver\server.py"

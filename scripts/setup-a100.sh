#!/usr/bin/env bash
set -Eeuo pipefail

MODEL="inkling-2-mini:26b-a5b"
WEB_PORT="${WEB_PORT:-3000}"
WEB_HOST="127.0.0.1"
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"

fail() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

prompt_secret() {
  local prompt="$1"
  local value
  read -r -s -p "$prompt: " value
  printf '\n' >&2
  [[ -n "$value" ]] || fail "A value is required."
  printf '%s' "$value"
}

printf 'UNIFY A100 setup\nRepository: %s\n\n' "$ROOT"

command -v node >/dev/null 2>&1 || fail "Node.js 24 is required. Install it, then rerun this script."
command -v npm >/dev/null 2>&1 || fail "npm is required."
node -e 'if (Number(process.versions.node.split(".")[0]) < 24) process.exit(1)' ||
  fail "Node.js 24 or newer is required (found $(node --version))."
command -v curl >/dev/null 2>&1 || fail "curl is required."
command -v openssl >/dev/null 2>&1 || fail "openssl is required to generate the OAuth state secret."
command -v ollama >/dev/null 2>&1 || fail "Ollama is not installed."

if command -v nvidia-smi >/dev/null 2>&1; then
  nvidia-smi
else
  printf 'Warning: nvidia-smi is unavailable; continuing without GPU verification.\n'
fi

if ! curl --silent --fail http://127.0.0.1:11434/api/tags >/dev/null; then
  if command -v systemctl >/dev/null 2>&1; then
    sudo systemctl enable --now ollama
  fi
fi
curl --silent --fail http://127.0.0.1:11434/api/tags >/dev/null ||
  fail "Ollama is not responding at 127.0.0.1:11434. Start Ollama and rerun."

if ! ollama list | awk 'NR > 1 { print $1 }' | grep -Fxq "$MODEL"; then
  read -r -p "$MODEL is not installed. Download it now? [y/N] " answer
  [[ "$answer" == "y" || "$answer" == "Y" ]] ||
    fail "Install $MODEL with 'ollama pull $MODEL', then rerun."
  ollama pull "$MODEL"
fi

cd "$ROOT"
printf '\nInstalling repository dependencies...\n'
npm ci

WEB_ENV="$ROOT/apps/web/.env"
WORKER_ENV="$ROOT/apps/worker/.env"
if [[ -e "$WEB_ENV" || -e "$WORKER_ENV" ]]; then
  fail "Refusing to overwrite existing private env files. Review apps/web/.env and apps/worker/.env, move them aside if you want to recreate them, then rerun."
fi

printf '\nEnter Supabase values. Input is hidden; values are not printed or passed as command arguments.\n'
SUPABASE_URL="$(prompt_secret 'Supabase project URL (https://<project-ref>.supabase.co)')"
[[ "$SUPABASE_URL" == https://*.supabase.co ]] || fail "Expected a Supabase HTTPS project URL."
SUPABASE_ANON_KEY="$(prompt_secret 'Supabase anon/publishable key')"
SUPABASE_SERVICE_KEY="$(prompt_secret 'Supabase service-role/secret key (server-only)')"
INTEGRATION_KEY="$(prompt_secret 'Integration encryption key (existing key needed to decrypt saved integration tokens)')"

mkdir -p "$ROOT/apps/web" "$ROOT/apps/worker"
umask 077
{
  printf 'NEXT_PUBLIC_SUPABASE_URL=%s\n' "$SUPABASE_URL"
  printf 'NEXT_PUBLIC_SUPABASE_ANON_KEY=%s\n' "$SUPABASE_ANON_KEY"
  printf 'SUPABASE_SECRET_KEY=%s\n' "$SUPABASE_SERVICE_KEY"
  printf 'INTEGRATION_ENCRYPTION_KEY=%s\n' "$INTEGRATION_KEY"
  printf 'OAUTH_STATE_SECRET=%s\n' "$(openssl rand -hex 32)"
} >"$WEB_ENV"
{
  printf 'SUPABASE_URL=%s\n' "$SUPABASE_URL"
  printf 'SUPABASE_SERVICE_ROLE_KEY=%s\n' "$SUPABASE_SERVICE_KEY"
  printf 'INTEGRATION_ENCRYPTION_KEY=%s\n' "$INTEGRATION_KEY"
} >"$WORKER_ENV"
chmod 600 "$WEB_ENV" "$WORKER_ENV"
unset SUPABASE_URL SUPABASE_ANON_KEY SUPABASE_SERVICE_KEY INTEGRATION_KEY

printf '\nStarting worker and UI.\n'
printf 'Once both are ready, open http://localhost:%s on your PC.\n' "$WEB_PORT"
printf 'In a terminal on your PC, forward the UI with:\n'
printf '  ssh -i ~/.ssh/gcp_key -N -L %s:127.0.0.1:%s abdhullah@34.170.99.211\n\n' "$WEB_PORT" "$WEB_PORT"
printf 'Keep this server terminal and your PC SSH tunnel open. Press Ctrl-C here to stop the app processes.\n\n'

npm run dev --workspace @unify/worker &
worker_pid=$!
npm run dev --workspace @unify/web -- --hostname "$WEB_HOST" --port "$WEB_PORT" &
web_pid=$!

cleanup() {
  trap - EXIT INT TERM
  kill "$worker_pid" "$web_pid" 2>/dev/null || true
  wait "$worker_pid" "$web_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

wait -n "$worker_pid" "$web_pid"

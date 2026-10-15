#!/usr/bin/env bash
#
# Install the UNIFY verification worker as a systemd service.
#
# Usage:
#   ./deploy/install.sh
#
# Run WITHOUT sudo — the script escalates only the privileged steps itself.
# It builds the worker, locks down .env, generates the unit from the template
# (substituting your user, repo path and node binary), and enables + starts it.
# All operational values (model provider, budgets, analysis settings) are
# hardcoded in the worker's src/config.ts.

set -euo pipefail

# --- Resolve paths relative to this script (apps/worker/deploy/install.sh) ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"      # apps/worker
# deploy/ -> worker/ -> apps/ -> repo root: three levels up from this script.
REPO_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"   # repo root
TEMPLATE="$SCRIPT_DIR/unify-worker.service"

# --- Identity: run the service as the invoking user, not root ---
if [[ $EUID -eq 0 ]]; then
  echo "error: run this script as your normal user, not root (it uses sudo internally)" >&2
  exit 1
fi
RUN_USER="${SUDO_USER:-$USER}"
RUN_GROUP="$(id -gn "$RUN_USER")"

# --- Node binary (systemd ExecStart needs an absolute path) ---
NODE_BIN="$(command -v node || true)"
NPM_BIN="$(command -v npm || true)"
if [[ -z "$NODE_BIN" ]]; then
  echo "error: node not found on PATH" >&2
  exit 1
fi

echo "==> Building worker ($WORKER_DIR)"
( cd "$WORKER_DIR" && npm install && npm run build )

echo "==> Locking down .env (holds the service-role key)"
chmod 600 "$WORKER_DIR/.env"

echo "==> Generating unit (user=$RUN_USER, group=$RUN_GROUP, node=$NODE_BIN)"
UNIT="$(mktemp)"
sed \
  -e "s|@REPO@|$REPO_DIR|g" \
  -e "s|@USER@|$RUN_USER|g" \
  -e "s|@GROUP@|$RUN_GROUP|g" \
  -e "s|@NODE@|$NODE_BIN|g" \
  -e "s|@NPM@|$NPM_BIN|g" \
  "$TEMPLATE" > "$UNIT"

echo "==> Installing to /etc/systemd/system/unify-worker.service"
sudo install -m 644 "$UNIT" /etc/systemd/system/unify-worker.service
rm -f "$UNIT"

echo "==> Enabling + (re)starting"
sudo systemctl daemon-reload
sudo systemctl enable unify-worker
sudo systemctl restart unify-worker

echo
echo "Done. Follow the log with:"
echo "    journalctl -u unify-worker -f"
echo "Status:"
sudo systemctl --no-pager --lines=0 status unify-worker

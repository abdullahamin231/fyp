#!/usr/bin/env bash
#
# Install the UNIFY poll loop (apps/web `npm run poll`) as a systemd service.
#
# Usage:
#   ./apps/worker/deploy/install-poll.sh
#
# Run WITHOUT sudo — the script escalates only the privileged steps itself.
# It installs dependencies, locks down the env file, generates the unit from the
# template (substituting your user, repo path and node binary), and enables +
# starts it. Independent of install.sh: either service can run without the other.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"   # repo root
WEB_DIR="$REPO_DIR/apps/web"
TEMPLATE="$SCRIPT_DIR/unify-poll.service"

if [[ $EUID -eq 0 ]]; then
  echo "error: run this script as your normal user, not root (it uses sudo internally)" >&2
  exit 1
fi
RUN_USER="${SUDO_USER:-$USER}"
RUN_GROUP="$(id -gn "$RUN_USER")"

NODE_BIN="$(command -v node || true)"
NPM_BIN="$(command -v npm || true)"
if [[ -z "$NODE_BIN" || -z "$NPM_BIN" ]]; then
  echo "error: node and npm must be on PATH" >&2
  exit 1
fi
NODE_DIR="$(dirname "$NODE_BIN")"

# The same file the loop picks: .env.local if present, else .env.
ENV_FILE=""
for name in .env.local .env; do
  if [[ -f "$WEB_DIR/$name" ]]; then ENV_FILE="$WEB_DIR/$name"; break; fi
done
if [[ -z "$ENV_FILE" ]]; then
  echo "error: create $WEB_DIR/.env with NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY and INTEGRATION_ENCRYPTION_KEY" >&2
  exit 1
fi

echo "==> Installing dependencies ($REPO_DIR)"
# From the root: the loop imports @unify/contracts, which postinstall builds.
( cd "$REPO_DIR" && npm install )

echo "==> Locking down $ENV_FILE (holds the service-role key)"
chmod 600 "$ENV_FILE"

echo "==> Generating unit (user=$RUN_USER, group=$RUN_GROUP, node=$NODE_BIN)"
UNIT="$(mktemp)"
sed \
  -e "s|@REPO@|$REPO_DIR|g" \
  -e "s|@USER@|$RUN_USER|g" \
  -e "s|@GROUP@|$RUN_GROUP|g" \
  -e "s|@NODE_DIR@|$NODE_DIR|g" \
  -e "s|@NPM@|$NPM_BIN|g" \
  "$TEMPLATE" > "$UNIT"

echo "==> Installing to /etc/systemd/system/unify-poll.service"
sudo install -m 644 "$UNIT" /etc/systemd/system/unify-poll.service
rm -f "$UNIT"

echo "==> Enabling + (re)starting"
sudo systemctl daemon-reload
sudo systemctl enable unify-poll
sudo systemctl restart unify-poll

echo
echo "Done. Follow the log with:"
echo "    journalctl -u unify-poll -f"
echo "Status:"
sudo systemctl --no-pager --lines=0 status unify-poll

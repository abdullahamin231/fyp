#!/usr/bin/env bash
# Minimal Stitch MCP client.
#
# The OpenCode-configured Stitch MCP server only picks up STITCH_API_KEY when
# OpenCode itself is started with the variable exported, so sessions launched
# without it get HTTP 401. This script talks to the same endpoint directly
# using the key from .env, which keeps design reference lookups working from
# any shell.
#
# Usage:
#   scripts/stitch-mcp.sh <tool-name> ['<json-arguments>']
#
# Examples:
#   scripts/stitch-mcp.sh list_screens '{"projectId":"14858991041797474900"}'
#   scripts/stitch-mcp.sh get_screen '{"name":"projects/14858991041797474900/screens/abc"}'
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -z "${STITCH_API_KEY:-}" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi

if [[ -z "${STITCH_API_KEY:-}" ]]; then
  echo "error: STITCH_API_KEY is not set (export it or add it to .env)" >&2
  exit 1
fi

TOOL="${1:?usage: stitch-mcp.sh <tool-name> [json-arguments]}"
ARGS="${2:-}"
if [[ -z "$ARGS" ]]; then
  ARGS='{}'
fi

payload="$(printf '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"%s","arguments":%s}}' "$TOOL" "$ARGS")"

response="$(curl -sS -X POST https://stitch.googleapis.com/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H "X-Goog-Api-Key: $STITCH_API_KEY" \
  -d "$payload")"

# The server answers either plain JSON or an SSE frame; normalise to JSON text
# of the tool result so the output is directly pipeable into jq.
printf '%s' "$response" | python3 -c '
import json, sys

raw = sys.stdin.read()
if raw.startswith("event:") or raw.startswith("data:"):
    raw = next(
        line[5:].strip() for line in raw.splitlines() if line.startswith("data:")
    )

envelope = json.loads(raw)
if "error" in envelope:
    sys.stderr.write(json.dumps(envelope["error"], indent=2) + "\n")
    sys.exit(1)

result = envelope.get("result", {})
if result.get("isError"):
    sys.stderr.write("\n".join(c.get("text", "") for c in result.get("content", [])) + "\n")
    sys.exit(1)

parts = [c.get("text", "") for c in result.get("content", []) if c.get("type") == "text"]
if not parts:
    sys.exit(0)
text = "\n".join(parts)
try:
    print(json.dumps(json.loads(text), indent=2))
except json.JSONDecodeError:
    print(text)
'

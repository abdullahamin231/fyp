"""
Unify Webhook Receiver
======================
Receives webhooks from GitHub, Jira, and Figma.
Verifies signatures, writes raw payloads to disk.

Usage:
    GITHUB_WEBHOOK_SECRET=xxx JIRA_WEBHOOK_SECRET=yyy FIGMA_WEBHOOK_SECRET=zzz \
    python webhooks/receiver/server.py

Endpoints:
    POST /webhooks/github   — GitHub App webhook
    POST /webhooks/jira     — Jira webhook
    POST /webhooks/figma    — Figma webhook
    GET  /health            — Health check
"""

import hashlib
import hmac
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, request, abort, jsonify

app = Flask(__name__)

# ── Config ───────────────────────────────────────────────────────────────────
GITHUB_SECRET = os.environ.get("GITHUB_WEBHOOK_SECRET", "").encode()
JIRA_SECRET   = os.environ.get("JIRA_WEBHOOK_SECRET", "").encode()
FIGMA_SECRET  = os.environ.get("FIGMA_WEBHOOK_SECRET", "").encode()

# Resolve payload directory relative to project root
_HERE = Path(__file__).parent
PROJECT_ROOT = _HERE.parent.parent
PAYLOAD_DIR  = PROJECT_ROOT / "payloads"


def _save_payload(vendor: str, event_type: str, payload: dict) -> Path:
    """Write raw payload to disk with a UTC timestamp filename."""
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%f")
    out_dir = PAYLOAD_DIR / vendor
    out_dir.mkdir(parents=True, exist_ok=True)
    fname = out_dir / f"{event_type}_{ts}.json"
    fname.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[{vendor.upper()}] ✓ Saved → {fname.name}", flush=True)
    return fname


# ── Health ────────────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()})


# ── GitHub ───────────────────────────────────────────────────────────────────
def _verify_github_signature(payload_bytes: bytes, sig_header: str) -> bool:
    if not GITHUB_SECRET:
        print("[GITHUB] WARNING: No webhook secret set — skipping signature check", flush=True)
        return True
    if not sig_header or not sig_header.startswith("sha256="):
        return False
    expected = "sha256=" + hmac.new(GITHUB_SECRET, payload_bytes, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, sig_header)


@app.route("/webhooks/github", methods=["POST"])
def github_webhook():
    payload_bytes = request.get_data()
    sig = request.headers.get("X-Hub-Signature-256", "")

    if not _verify_github_signature(payload_bytes, sig):
        print("[GITHUB] ✗ Invalid signature", flush=True)
        abort(401, "Invalid GitHub webhook signature")

    event_type  = request.headers.get("X-GitHub-Event", "unknown")
    delivery_id = request.headers.get("X-GitHub-Delivery", "no-delivery-id")

    try:
        payload = json.loads(payload_bytes)
    except json.JSONDecodeError as e:
        abort(400, f"Invalid JSON: {e}")

    # Attach Unify metadata before saving
    payload["__unify_received_at"]  = datetime.now(timezone.utc).isoformat()
    payload["__unify_delivery_id"]  = delivery_id
    payload["__unify_event_type"]   = event_type

    _save_payload("github", event_type, payload)
    return jsonify({"status": "ok", "event": event_type, "delivery_id": delivery_id}), 200


# ── Jira ──────────────────────────────────────────────────────────────────────
# Note: Jira Cloud does NOT sign webhook payloads (unlike Jira Server/DC).
# Mitigation: include a secret as a query parameter when registering the webhook.
@app.route("/webhooks/jira", methods=["POST"])
def jira_webhook():
    payload_bytes = request.get_data()

    # Secret-in-URL validation
    secret_param = request.args.get("secret", "").encode()
    if JIRA_SECRET and secret_param != JIRA_SECRET:
        print("[JIRA] ✗ Invalid secret param", flush=True)
        abort(401, "Invalid Jira webhook secret")

    try:
        payload = json.loads(payload_bytes)
    except json.JSONDecodeError as e:
        abort(400, f"Invalid JSON: {e}")

    event_type = payload.get("webhookEvent", "unknown").replace(":", "_")
    payload["__unify_received_at"] = datetime.now(timezone.utc).isoformat()

    _save_payload("jira", event_type, payload)
    return jsonify({"status": "ok", "event": event_type}), 200


# ── Figma ────────────────────────────────────────────────────────────────────
def _verify_figma_signature(payload_bytes: bytes, sig_header: str, ts_header: str) -> bool:
    """
    Figma uses HMAC-SHA256.
    Signature = HMAC(passcode, timestamp + ":" + body)
    """
    if not FIGMA_SECRET:
        print("[FIGMA] WARNING: No webhook secret set — skipping signature check", flush=True)
        return True
    if not sig_header:
        return False
    msg = ts_header.encode() + b":" + payload_bytes
    expected = hmac.new(FIGMA_SECRET, msg, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, sig_header)


@app.route("/webhooks/figma", methods=["POST"])
def figma_webhook():
    payload_bytes = request.get_data()
    sig = request.headers.get("X-Figma-Signature", "")
    ts  = request.headers.get("X-Figma-Timestamp", "")

    if not _verify_figma_signature(payload_bytes, sig, ts):
        print("[FIGMA] ✗ Invalid signature", flush=True)
        abort(401, "Invalid Figma webhook signature")

    try:
        payload = json.loads(payload_bytes)
    except json.JSONDecodeError as e:
        abort(400, f"Invalid JSON: {e}")

    event_type = payload.get("event_type", "unknown")
    payload["__unify_received_at"] = datetime.now(timezone.utc).isoformat()

    _save_payload("figma", event_type, payload)
    return jsonify({"status": "ok", "event": event_type}), 200


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 4000))
    print(f"[UNIFY] Webhook receiver starting on port {port}")
    print(f"[UNIFY] Payload directory: {PAYLOAD_DIR}")
    print(f"[UNIFY] GitHub secret set: {'yes' if GITHUB_SECRET else 'NO — unsecured!'}")
    print(f"[UNIFY] Jira secret set:   {'yes' if JIRA_SECRET else 'NO — unsecured!'}")
    print(f"[UNIFY] Figma secret set:  {'yes' if FIGMA_SECRET else 'NO — unsecured!'}")
    app.run(host="0.0.0.0", port=port, debug=True)

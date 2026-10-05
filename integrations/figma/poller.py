"""
Figma Polling Fallback
========================
Owner: Abdullah Amin

Use this when Figma webhooks are NOT available (Starter/free plan).
Polls GET /v1/files/{key}/versions every 60 seconds.
Emits synthetic FILE_VERSION_UPDATE payloads in the same format
that the real webhook would send — so the mapper doesn't change.

Usage:
    python integrations/figma/poller.py

Or import and call start_polling() in your receiver startup.
"""

import hashlib
import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

FIGMA_TOKEN   = os.environ.get("FIGMA_PAT", "")
FIGMA_FILE    = os.environ.get("FIXTURE_FIGMA_FILE_KEY", "")
POLL_INTERVAL = int(os.environ.get("FIGMA_POLL_INTERVAL_SECONDS", "60"))

PAYLOAD_DIR = Path(__file__).parent.parent.parent / "payloads" / "figma"
STATE_FILE  = Path(__file__).parent / "poller_state.json"


def _load_state() -> dict:
    """Load last-seen version ID from disk."""
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"last_version_id": None, "last_poll": None}


def _save_state(state: dict) -> None:
    STATE_FILE.write_text(json.dumps(state, indent=2))


def _fetch_versions(file_key: str) -> list[dict]:
    """GET /v1/files/{key}/versions — returns list of version objects."""
    resp = requests.get(
        f"https://api.figma.com/v1/files/{file_key}/versions",
        headers={"X-Figma-Token": FIGMA_TOKEN},
        timeout=15
    )
    resp.raise_for_status()
    return resp.json().get("versions", [])


def _make_synthetic_event(version: dict, file_key: str, file_name: str) -> dict:
    """
    Create a synthetic payload in the same shape as a real FILE_VERSION_UPDATE webhook.
    The mapper receives this and doesn't know if it came from a webhook or polling.
    """
    return {
        "__unify_received_at":  datetime.now(timezone.utc).isoformat(),
        "__unify_source":       "polling",   # flag for latency measurement
        "event_type":           "FILE_VERSION_UPDATE",
        "file_key":             file_key,
        "file_name":            file_name,
        "version_id":           version.get("id", ""),
        "label":                version.get("label", ""),
        "description":          version.get("description", ""),
        "created_at":           version.get("created_at", datetime.now(timezone.utc).isoformat()),
        "triggered_by":         version.get("user", {}),
        "passcode":             "__polling__",
        "webhook_id":           None,
        "retries":              0,
    }


def _save_payload(payload: dict) -> Path:
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%f")
    PAYLOAD_DIR.mkdir(parents=True, exist_ok=True)
    path = PAYLOAD_DIR / f"FILE_VERSION_UPDATE_polled_{ts}.json"
    path.write_text(json.dumps(payload, indent=2))
    print(f"[Figma poller] ✓ Saved new version → {path.name}", flush=True)
    return path


def poll_once(file_key: str) -> list[dict]:
    """
    Poll once. Returns list of new synthetic events (empty if no new versions).
    """
    state = _load_state()
    last_id = state.get("last_version_id")

    try:
        versions = _fetch_versions(file_key)
    except requests.HTTPError as e:
        print(f"[Figma poller] HTTP error: {e}", flush=True)
        return []
    except Exception as e:
        print(f"[Figma poller] Error: {e}", flush=True)
        return []

    if not versions:
        return []

    # Figma returns versions newest-first
    latest = versions[0]
    latest_id = latest.get("id")

    new_events = []
    if latest_id != last_id:
        # Find all versions newer than last seen
        new_versions = []
        for v in versions:
            if v.get("id") == last_id:
                break
            new_versions.append(v)

        # Reverse so we process oldest-new first
        for v in reversed(new_versions):
            # We need the file name — fetch from file metadata if not cached
            file_name = state.get("file_name", file_key)
            event = _make_synthetic_event(v, file_key, file_name)
            _save_payload(event)
            new_events.append(event)

        state["last_version_id"] = latest_id
        state["last_poll"] = datetime.now(timezone.utc).isoformat()
        _save_state(state)
    else:
        print(f"[Figma poller] No new versions (latest: {latest_id})", flush=True)

    return new_events


def start_polling(file_key: str, interval_seconds: int = POLL_INTERVAL) -> None:
    """
    Run the polling loop forever.
    Each iteration: fetch versions, emit synthetic events for new ones, sleep.
    """
    print(f"[Figma poller] Starting — file={file_key}, interval={interval_seconds}s", flush=True)
    print(f"[Figma poller] NOTE: Polling latency ≈ {interval_seconds}s (vs near-real-time for webhooks)", flush=True)
    print(f"[Figma poller] Document this in risk register §18.2 if on Starter plan.", flush=True)

    # Seed state with current latest so we don't re-emit old versions on startup
    try:
        versions = _fetch_versions(file_key)
        if versions:
            state = _load_state()
            if not state.get("last_version_id"):
                state["last_version_id"] = versions[0].get("id")
                state["last_poll"] = datetime.now(timezone.utc).isoformat()
                _save_state(state)
                print(f"[Figma poller] Seeded with version {state['last_version_id']}", flush=True)
    except Exception as e:
        print(f"[Figma poller] Warning: could not seed state: {e}", flush=True)

    while True:
        new = poll_once(file_key)
        if new:
            print(f"[Figma poller] Emitted {len(new)} new event(s)", flush=True)
        time.sleep(interval_seconds)


if __name__ == "__main__":
    if not FIGMA_TOKEN:
        print("ERROR: FIGMA_PAT not set in .env")
        exit(1)
    if not FIGMA_FILE:
        print("ERROR: FIXTURE_FIGMA_FILE_KEY not set in .env")
        exit(1)
    start_polling(FIGMA_FILE)

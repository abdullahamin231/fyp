"""
Figma → UnifyEventEnvelope Mapper
====================================
Owner: Abdullah Amin

Maps raw Figma webhook payloads to the agreed event envelope schema.
Write against the saved payloads in payloads/figma/.

Supported events:
    FILE_VERSION_UPDATE       → map_file_version_update()
    DEV_MODE_STATUS_UPDATE    → map_dev_mode_status_update()
    FILE_UPDATE               → map_file_update()  (polling fallback event)

Plan tier notes:
    Webhooks require Professional plan or above.
    On Starter (free) plan: use polling via /v1/files/{key}/versions instead.
    Document which approach is in use in payloads/figma/webhook_check.json.
"""

import hashlib
import json
import re
import uuid
from datetime import datetime, timezone
from typing import Optional


# ── Cross-tool reference patterns ────────────────────────────────────────────

JIRA_KEY_PATTERN   = re.compile(r'\b([A-Z][A-Z0-9]{1,9}-\d+)\b')
GITHUB_URL_PATTERN = re.compile(r'https://github\.com/[^\s<>"\']*')


def _extract_references(text: str) -> dict:
    """Extract cross-tool references from a Figma text field (label, description, file name)."""
    if not text:
        return {"jira_keys": [], "figma_urls": [], "github_urls": [], "pr_numbers": []}
    return {
        "jira_keys":   sorted(set(JIRA_KEY_PATTERN.findall(text.upper()))),
        "figma_urls":  [],   # Figma events don't cross-reference other Figma files
        "github_urls": list(set(GITHUB_URL_PATTERN.findall(text))),
        "pr_numbers":  [],
    }


def _make_event_id(namespace: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, namespace))


def _raw_hash(payload: dict) -> str:
    return hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()


# ── Mappers ──────────────────────────────────────────────────────────────────

def map_file_version_update(raw: dict) -> dict:
    """
    Map a Figma FILE_VERSION_UPDATE webhook payload → UnifyEventEnvelope.

    Figma fires this when a user explicitly publishes a named version.
    This is the primary design-intent event for Unify.

    Test with:
        python -c "
        import json, pprint
        from integrations.figma.mapper import map_file_version_update
        raw = json.load(open('payloads/figma/FILE_VERSION_UPDATE_<timestamp>.json'))
        pprint.pprint(map_file_version_update(raw))
        "
    """
    file_key    = raw.get("file_key", "")
    version_id  = raw.get("version_id", "")
    file_name   = raw.get("file_name", "")
    label       = raw.get("label", "")
    description = raw.get("description", "")

    entity_id = f"{file_key}:{version_id}"

    # Scan version label + description + file name for Jira keys
    refs = _extract_references(f"{label} {description} {file_name}")

    triggered_by = raw.get("triggered_by", {})
    rh = _raw_hash(raw)

    return {
        "event_id":    _make_event_id(f"figma:file_version:{entity_id}"),
        "source_tool": "figma",
        "entity_type": "file_version",
        "entity_id":   entity_id,
        "version":     version_id,
        "action":      "published",
        "state_before": None,  # Figma doesn't deliver the prior version in the event payload
        "state_after": {
            "file_key":    file_key,
            "file_name":   file_name,
            "version_id":  version_id,
            "label":       label,
            "description": description,
        },
        "actor": {
            "id":    triggered_by.get("id", ""),
            "login": triggered_by.get("handle", triggered_by.get("email", "")),
            "type":  "user",
        } if triggered_by else None,
        "occurred_at": raw.get("created_at", datetime.now(timezone.utc).isoformat()),
        "received_at": raw.get("__unify_received_at", datetime.now(timezone.utc).isoformat()),
        "references":  refs,
        "raw_hash":    rh,
        "raw_payload": raw,
    }


def map_dev_mode_status_update(raw: dict) -> dict:
    """
    Map a Figma DEV_MODE_STATUS_UPDATE webhook payload → UnifyEventEnvelope.

    Fired when a designer marks a frame/section as "Ready for dev" in Dev Mode.
    Only available on Professional+ plans with Dev Mode enabled.
    """
    file_key = raw.get("file_key", "")
    status   = raw.get("status", "")     # e.g. "ready_for_dev", "in_progress", "completed"
    node_ids = raw.get("node_ids", [])

    entity_id = f"{file_key}:devmode"
    triggered_by = raw.get("triggered_by", {})
    rh = _raw_hash(raw)

    refs = _extract_references(raw.get("file_name", ""))

    return {
        "event_id":    _make_event_id(f"figma:dev_mode:{entity_id}:{rh[:16]}"),
        "source_tool": "figma",
        "entity_type": "dev_mode_status",
        "entity_id":   entity_id,
        "version":     None,
        "action":      status.lower().replace(" ", "_"),
        "state_before": None,
        "state_after": {
            "status":   status,
            "node_ids": node_ids,
            "file_key": file_key,
            "file_name": raw.get("file_name", ""),
        },
        "actor": {
            "id":    triggered_by.get("id", ""),
            "login": triggered_by.get("handle", triggered_by.get("email", "")),
            "type":  "user",
        } if triggered_by else None,
        "occurred_at": raw.get("created_at", datetime.now(timezone.utc).isoformat()),
        "received_at": raw.get("__unify_received_at", datetime.now(timezone.utc).isoformat()),
        "references":  refs,
        "raw_hash":    rh,
        "raw_payload": raw,
    }


def map_file_update(raw: dict) -> dict:
    """
    Map a Figma FILE_UPDATE webhook payload → UnifyEventEnvelope.

    Fired on any file save (autosave). Noisy — use FILE_VERSION_UPDATE for
    intent-significant events. Keep this for latency measurement.
    """
    file_key = raw.get("file_key", "")
    entity_id = file_key
    rh = _raw_hash(raw)

    return {
        "event_id":    _make_event_id(f"figma:file_update:{file_key}:{rh[:16]}"),
        "source_tool": "figma",
        "entity_type": "file",
        "entity_id":   entity_id,
        "version":     None,
        "action":      "autosaved",
        "state_before": None,
        "state_after":  {"file_key": file_key, "file_name": raw.get("file_name")},
        "actor": None,
        "occurred_at": raw.get("timestamp", datetime.now(timezone.utc).isoformat()),
        "received_at": raw.get("__unify_received_at", datetime.now(timezone.utc).isoformat()),
        "references":  _extract_references(raw.get("file_name", "")),
        "raw_hash":    rh,
        "raw_payload": raw,
    }


# ── Router ────────────────────────────────────────────────────────────────────

MAPPERS = {
    "FILE_VERSION_UPDATE":    map_file_version_update,
    "DEV_MODE_STATUS_UPDATE": map_dev_mode_status_update,
    "FILE_UPDATE":            map_file_update,
}


def map_figma_event(raw: dict) -> Optional[dict]:
    """Entry point: route to the correct mapper by event_type."""
    event_type = raw.get("event_type", "")
    mapper = MAPPERS.get(event_type)
    if mapper is None:
        print(f"[Figma mapper] Unhandled event type: {event_type!r} — skipping")
        return None
    return mapper(raw)

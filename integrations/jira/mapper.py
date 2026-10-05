"""
Jira → UnifyEventEnvelope Mapper
==================================
Owner: Mishal Fatima

Maps raw Jira webhook payloads to the agreed event envelope schema.
Write against the saved payloads in payloads/jira/.

Supported events:
    jira:issue_created  → map_issue_event()
    jira:issue_updated  → map_issue_event()
    jira:issue_deleted  → map_issue_event()
"""

import hashlib
import json
import re
import uuid
from datetime import datetime, timezone
from typing import Optional


# ── Cross-tool reference patterns ────────────────────────────────────────────

FIGMA_URL_PATTERN = re.compile(
    r'https://(?:www\.)?figma\.com/(?:file|design|proto)/'
    r'(?P<file_key>[A-Za-z0-9_-]+)'
    r'(?:/[^?#\s"<>]*)?'
    r'(?:\?node-id=(?P<node_id>[^&\s#"]+))?'
)
GITHUB_PR_PATTERN = re.compile(
    r'https://github\.com/(?P<owner>[^/]+)/(?P<repo>[^/]+)/pull/(?P<pr_num>\d+)'
)
GITHUB_URL_PATTERN = re.compile(r'https://github\.com/[^\s<>"\']*')


def _adf_to_text(node) -> str:
    """
    Recursively extract plain text from Atlassian Document Format (ADF).
    ADF is the JSON structure Jira Cloud uses for rich-text fields.
    """
    if not node:
        return ""
    if isinstance(node, str):
        return node
    if isinstance(node, list):
        return " ".join(_adf_to_text(c) for c in node)
    if isinstance(node, dict):
        if node.get("type") == "text":
            return node.get("text", "")
        if node.get("type") == "inlineCard":
            # Inline Figma/GitHub card — extract the URL
            return node.get("attrs", {}).get("url", "")
        children = node.get("content", [])
        return " ".join(_adf_to_text(c) for c in children)
    return ""


def _extract_references(text: str) -> dict:
    """Extract cross-tool references from a Jira text field. Pure regex."""
    if not text:
        return {"jira_keys": [], "figma_urls": [], "github_urls": [], "pr_numbers": []}

    figma_keys = list(set(m.group("file_key") for m in FIGMA_URL_PATTERN.finditer(text)))
    github_urls = list(set(GITHUB_URL_PATTERN.findall(text)))
    pr_numbers  = [int(m.group("pr_num")) for m in GITHUB_PR_PATTERN.finditer(text)]

    return {
        "jira_keys":   [],        # Jira descriptions don't typically reference other Jira keys
        "figma_urls":  figma_keys,
        "github_urls": github_urls,
        "pr_numbers":  sorted(set(pr_numbers)),
    }


def _make_event_id(namespace: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, namespace))


def _raw_hash(payload: dict) -> str:
    return hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()


# ── Mapper ───────────────────────────────────────────────────────────────────

def map_issue_event(raw: dict) -> dict:
    """
    Map a Jira issue webhook payload → UnifyEventEnvelope.

    Handles: jira:issue_created, jira:issue_updated, jira:issue_deleted

    Test with:
        python -c "
        import json, pprint
        from integrations.jira.mapper import map_issue_event
        raw = json.load(open('payloads/jira/jira_issue_updated_<timestamp>.json'))
        pprint.pprint(map_issue_event(raw))
        "
    """
    issue     = raw.get("issue", {})
    fields    = issue.get("fields", {})
    changelog = raw.get("changelog", {})

    issue_key = issue.get("key", "UNKNOWN")
    entity_id = issue_key

    # Version: Jira uses the issue's `updated` timestamp as its version signal
    version = fields.get("updated") or str(issue.get("id", ""))

    # Determine action from webhookEvent
    webhook_event = raw.get("webhookEvent", "")
    if "created" in webhook_event:
        action = "created"
    elif "deleted" in webhook_event:
        action = "deleted"
    else:
        # Infer from changelog items
        changed_fields = {item.get("field") for item in changelog.get("items", [])}
        if "status" in changed_fields:
            action = "status_changed"
        elif "assignee" in changed_fields:
            action = "assigned"
        elif "description" in changed_fields or "summary" in changed_fields:
            action = "content_updated"
        elif changed_fields:
            action = f"updated:{','.join(sorted(changed_fields))}"
        else:
            action = "updated"

    # State snapshots from changelog
    state_before: dict = {}
    state_after: dict = {}
    for item in changelog.get("items", []):
        field = item.get("field")
        state_before[field] = item.get("fromString")
        state_after[field]  = item.get("toString")

    # If no changelog (e.g., on create), pull current state
    if not state_after:
        state_after = {
            "status":   (fields.get("status") or {}).get("name"),
            "assignee": ((fields.get("assignee") or {}) or {}).get("displayName"),
            "priority": (fields.get("priority") or {}).get("name"),
            "issuetype": (fields.get("issuetype") or {}).get("name"),
        }

    # Extract references: scan summary + description (ADF)
    summary      = fields.get("summary", "")
    description  = _adf_to_text(fields.get("description"))
    refs = _extract_references(summary + " " + description)

    # Actor
    actor = raw.get("user") or {}

    rh = _raw_hash(raw)
    # Include hash prefix in event_id to handle Jira's non-unique event IDs
    event_id = _make_event_id(f"jira:issue:{entity_id}:{action}:{rh[:16]}")

    return {
        "event_id":    event_id,
        "source_tool": "jira",
        "entity_type": "issue",
        "entity_id":   entity_id,
        "version":     version,
        "action":      action,
        "state_before": state_before or None,
        "state_after":  state_after or None,
        "actor": {
            "id":    actor.get("accountId", ""),
            "login": actor.get("displayName", actor.get("emailAddress", "")),
            "type":  "user",
        } if actor else None,
        "occurred_at": fields.get("updated") or datetime.now(timezone.utc).isoformat(),
        "received_at": raw.get("__unify_received_at", datetime.now(timezone.utc).isoformat()),
        "references":  refs,
        "raw_hash":    rh,
        "raw_payload": raw,
    }


# ── Router ────────────────────────────────────────────────────────────────────

MAPPERS = {
    "jira_issue_created": map_issue_event,
    "jira_issue_updated": map_issue_event,
    "jira_issue_deleted": map_issue_event,
}


def map_jira_event(raw: dict) -> Optional[dict]:
    """Entry point: route to the correct mapper by webhookEvent."""
    webhook_event = raw.get("webhookEvent", "").replace(":", "_")
    mapper = MAPPERS.get(webhook_event)
    if mapper is None:
        print(f"[Jira mapper] Unhandled event: {webhook_event!r} — skipping")
        return None
    return mapper(raw)

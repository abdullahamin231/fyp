"""
GitHub → UnifyEventEnvelope Mapper
====================================
Owner: Haaniah Ismail

Maps raw GitHub webhook payloads to the agreed event envelope schema.
Write against the saved payloads in payloads/github/.

Supported events:
    pull_request   → map_pull_request_event()
    push           → map_push_event()
    create/delete  → map_ref_event()
"""

import hashlib
import json
import re
import uuid
from datetime import datetime, timezone
from typing import Optional


# ── Cross-tool reference patterns ────────────────────────────────────────────

JIRA_KEY_PATTERN  = re.compile(r'\b([A-Z][A-Z0-9]{1,9}-\d+)\b')
FIGMA_URL_PATTERN = re.compile(
    r'https://(?:www\.)?figma\.com/(?:file|design|proto)/'
    r'(?P<file_key>[A-Za-z0-9_-]+)'
    r'(?:/[^?#\s]*)?'
    r'(?:\?node-id=(?P<node_id>[^&\s#"]+))?'
)
GITHUB_PR_SHORT   = re.compile(r'(?:^|\s)#(\d+)(?:\s|$)')


def _extract_references(text: str, context_repo: Optional[str] = None) -> dict:
    """Extract cross-tool references from a text string. Pure regex, no AI."""
    if not text:
        return {"jira_keys": [], "figma_urls": [], "github_urls": [], "pr_numbers": []}

    jira_keys  = list(set(JIRA_KEY_PATTERN.findall(text.upper())))
    figma_keys = list(set(m.group("file_key") for m in FIGMA_URL_PATTERN.finditer(text)))
    pr_nums    = [int(n) for n in set(GITHUB_PR_SHORT.findall(text))]

    return {
        "jira_keys":   sorted(jira_keys),
        "figma_urls":  figma_keys,
        "github_urls": [],
        "pr_numbers":  pr_nums,
    }


def _merge_references(*refs: dict) -> dict:
    merged = {"jira_keys": set(), "figma_urls": set(), "github_urls": set(), "pr_numbers": set()}
    for r in refs:
        for k in merged:
            merged[k].update(r.get(k, []))
    return {k: sorted(v) if k != "pr_numbers" else sorted(int(x) for x in v) for k, v in merged.items()}


def _make_event_id(namespace: str) -> str:
    """Deterministic UUIDv5 from a namespace string."""
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, namespace))


def _raw_hash(payload: dict) -> str:
    return hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()


# ── Mappers ──────────────────────────────────────────────────────────────────

def map_pull_request_event(raw: dict) -> dict:
    """
    Map a GitHub pull_request webhook payload → UnifyEventEnvelope.

    Test with:
        python -c "
        import json, pprint
        from integrations.github.mapper import map_pull_request_event
        raw = json.load(open('payloads/github/pull_request_<timestamp>.json'))
        pprint.pprint(map_pull_request_event(raw))
        "
    """
    pr     = raw["pull_request"]
    action = raw["action"]   # opened | closed | synchronize | reopened | ready_for_review
    repo   = raw["repository"]

    entity_id = f"{repo['full_name']}:{pr['number']}"
    version   = pr["head"]["sha"]

    # References: scan title + body + head branch name
    refs = _merge_references(
        _extract_references(pr.get("title", "")),
        _extract_references(pr.get("body") or ""),
        _extract_references(pr["head"].get("ref", "")),
    )

    state_after = {
        "state":    pr["state"],
        "merged":   pr.get("merged", False),
        "draft":    pr.get("draft", False),
        "base_ref": pr["base"]["ref"],
        "head_sha": pr["head"]["sha"],
        "title":    pr.get("title"),
    }

    actor = raw.get("sender")

    return {
        "event_id":    _make_event_id(f"github:pull_request:{entity_id}:{version}:{action}"),
        "source_tool": "github",
        "entity_type": "pull_request",
        "entity_id":   entity_id,
        "version":     version,
        "action":      action,
        "state_before": None,   # not available in webhook; populated by adapter from stored state
        "state_after":  state_after,
        "actor": {
            "id":    str(actor["id"]),
            "login": actor["login"],
            "type":  "bot" if actor.get("type") == "Bot" else "user",
        } if actor else None,
        "occurred_at": pr.get("updated_at", datetime.now(timezone.utc).isoformat()),
        "received_at": raw.get("__unify_received_at", datetime.now(timezone.utc).isoformat()),
        "references":  refs,
        "raw_hash":    _raw_hash(raw),
        "raw_payload": raw,
    }


def map_push_event(raw: dict) -> dict:
    """Map a GitHub push webhook payload → UnifyEventEnvelope."""
    repo  = raw["repository"]
    ref   = raw.get("ref", "")       # "refs/heads/feature/UNIFY-5-my-feature"
    after = raw.get("after", "")
    before = raw.get("before", "")

    entity_id = f"{repo['full_name']}:{ref}"

    # Scan branch name + all commit messages for cross-tool references
    commit_messages = " ".join(c.get("message", "") for c in raw.get("commits", []))
    refs = _merge_references(
        _extract_references(ref),
        _extract_references(commit_messages),
    )

    actor = raw.get("pusher") or raw.get("sender") or {}

    return {
        "event_id":    _make_event_id(f"github:push:{entity_id}:{after}"),
        "source_tool": "github",
        "entity_type": "push",
        "entity_id":   entity_id,
        "version":     after or None,
        "action":      "pushed",
        "state_before": {"sha": before} if before else None,
        "state_after":  {
            "sha":         after,
            "ref":         ref,
            "commit_count": len(raw.get("commits", [])),
        },
        "actor": {
            "id":    actor.get("name", ""),
            "login": actor.get("name", ""),
            "type":  "user",
        } if actor else None,
        "occurred_at": raw.get("commits", [{}])[-1].get("timestamp",
                       datetime.now(timezone.utc).isoformat()) if raw.get("commits") else
                       datetime.now(timezone.utc).isoformat(),
        "received_at": raw.get("__unify_received_at", datetime.now(timezone.utc).isoformat()),
        "references":  refs,
        "raw_hash":    _raw_hash(raw),
        "raw_payload": raw,
    }


def map_ref_event(raw: dict) -> dict:
    """Map a GitHub create/delete (branch/tag) webhook payload → UnifyEventEnvelope."""
    repo      = raw["repository"]
    ref       = raw.get("ref", "")
    ref_type  = raw.get("ref_type", "branch")   # "branch" | "tag"
    action    = raw.get("__unify_event_type", "create")  # "create" or "delete"

    entity_id = f"{repo['full_name']}:{ref_type}/{ref}"

    return {
        "event_id":    _make_event_id(f"github:ref:{entity_id}:{action}"),
        "source_tool": "github",
        "entity_type": ref_type,
        "entity_id":   entity_id,
        "version":     raw.get("master_branch"),
        "action":      action,
        "state_before": None,
        "state_after":  {"ref": ref, "ref_type": ref_type},
        "actor": {
            "id":    str((raw.get("sender") or {}).get("id", "")),
            "login": (raw.get("sender") or {}).get("login", ""),
            "type":  "user",
        },
        "occurred_at": datetime.now(timezone.utc).isoformat(),
        "received_at": raw.get("__unify_received_at", datetime.now(timezone.utc).isoformat()),
        "references":  _extract_references(ref),
        "raw_hash":    _raw_hash(raw),
        "raw_payload": raw,
    }


# ── Router: dispatch on event type ────────────────────────────────────────────

MAPPERS = {
    "pull_request": map_pull_request_event,
    "push":         map_push_event,
    "create":       map_ref_event,
    "delete":       map_ref_event,
}


def map_github_event(raw: dict) -> Optional[dict]:
    """
    Entry point: route to the correct mapper by event type.
    Returns None for unhandled event types (just log and ignore).
    """
    event_type = raw.get("__unify_event_type", "")
    mapper = MAPPERS.get(event_type)
    if mapper is None:
        print(f"[GitHub mapper] Unhandled event type: {event_type!r} — skipping")
        return None
    return mapper(raw)

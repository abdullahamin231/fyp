import re
from ..models import Tool, EntityType, Entity, Event

JIRA_RE = re.compile(r"[A-Z][A-Z0-9_]+-\d+")
FIGMA_RE = re.compile(r"figma\.com/(?:file|design)/([A-Za-z0-9]+)")


def extract_jira(text):
    if not text:
        return []
    return sorted(set(JIRA_RE.findall(text)))


def extract_figma(text):
    if not text:
        return []
    return sorted(set("fig:" + m for m in FIGMA_RE.findall(text)))


def _dedup(items):
    return sorted(set(items))


def normalize(raw):
    tool = raw.get("tool")
    if tool == Tool.GITHUB.value:
        return _norm_github(raw)
    if tool == Tool.JIRA.value:
        return _norm_jira(raw)
    if tool == Tool.FIGMA.value:
        return _norm_figma(raw)
    raise ValueError(f"unknown tool: {tool}")


def _norm_github(raw):
    pid = raw["id"]
    title = raw.get("title", pid)
    refs = extract_jira(title)
    commits = raw.get("commits", [])
    entity = Entity(
        id=pid,
        tool=Tool.GITHUB.value,
        type=EntityType.PULL_REQUEST.value,
        title=title,
        status=raw.get("status"),
        timestamp=raw.get("timestamp"),
        refs=_dedup(refs),
        raw=raw,
    )
    events = [
        Event(
            id=pid + "#opened",
            actor=raw.get("actor", ""),
            entity_id=pid,
            action="opened",
            timestamp=raw.get("timestamp"),
            references=extract_jira(title),
        )
    ]
    if raw.get("merged_at"):
        events.append(
            Event(
                id=pid + "#merged",
                actor=raw.get("actor", ""),
                entity_id=pid,
                action="merged",
                timestamp=raw["merged_at"],
                references=[],
            )
        )
    commit_entities = []
    commit_events = []
    for c in commits:
        cid = "gh:commit:" + c["sha"]
        crefs = extract_jira(c.get("message", ""))
        crefs.append(pid)
        ce = Entity(
            id=cid,
            tool=Tool.GITHUB.value,
            type=EntityType.COMMIT.value,
            title=c.get("message", cid),
            timestamp=c.get("timestamp"),
            refs=_dedup(crefs),
            raw={},
        )
        commit_entities.append(ce)
        commit_events.append(
            Event(
                id=cid,
                actor=raw.get("actor", ""),
                entity_id=cid,
                action="committed",
                timestamp=c.get("timestamp"),
                references=extract_jira(c.get("message", "")),
            )
        )
    return [entity] + commit_entities, events + commit_events


def _norm_jira(raw):
    tid = raw["id"]
    desc = raw.get("description", "")
    refs = extract_figma(desc)
    entity = Entity(
        id=tid,
        tool=Tool.JIRA.value,
        type=EntityType.TICKET.value,
        title=raw.get("title", tid),
        status=raw.get("status"),
        timestamp=raw.get("timestamp"),
        refs=_dedup(refs),
        raw=raw,
    )
    events = [
        Event(
            id=tid + "#" + raw.get("timestamp", "created"),
            actor=raw.get("actor", ""),
            entity_id=tid,
            action="transitioned:" + raw.get("status", "created"),
            timestamp=raw.get("timestamp"),
            references=extract_figma(desc),
        )
    ]
    return [entity], events


def _norm_figma(raw):
    fid = raw["id"]
    entity = Entity(
        id=fid,
        tool=Tool.FIGMA.value,
        type=EntityType.FIGMA_FRAME.value,
        title=raw.get("title", fid),
        status=raw.get("status"),
        timestamp=raw.get("timestamp"),
        refs=_dedup(raw.get("refs", [])),
        raw=raw,
    )
    events = [
        Event(
            id=fid + "#" + raw.get("action", "updated"),
            actor=raw.get("actor", "designer"),
            entity_id=fid,
            action=raw.get("action", "updated"),
            timestamp=raw.get("timestamp"),
            references=[],
        )
    ]
    return [entity], events

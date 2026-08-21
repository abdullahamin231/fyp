from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class Tool(str, Enum):
    FIGMA = "figma"
    GITHUB = "github"
    JIRA = "jira"


class EntityType(str, Enum):
    FIGMA_FRAME = "figma_frame"
    PULL_REQUEST = "pull_request"
    TICKET = "ticket"
    COMMIT = "commit"


@dataclass
class Entity:
    id: str
    tool: str
    type: str
    title: str
    status: Optional[str] = None
    timestamp: Optional[str] = None
    refs: list = field(default_factory=list)
    raw: dict = field(default_factory=dict)
    stale: bool = False
    stale_reason: Optional[str] = None


@dataclass
class Event:
    id: str
    actor: str
    entity_id: str
    action: str
    timestamp: str
    references: list = field(default_factory=list)
    # wall-clock time the event entered the store; stamped by the store on
    # insert so event->alert latency includes any queue/replay delay.
    ingested_at: Optional[str] = None


@dataclass
class Link:
    source: str
    target: str
    kind: str
    confidence: float
    provenance: str


@dataclass
class Suggestion:
    """A reference that could not be auto-resolved; queued for manual confirmation."""

    ref: str
    source_entity_id: str
    reason: str  # "unresolved" | "below_threshold"
    confidence: float
    status: str = "pending"  # pending | confirmed | rejected
    resolved_to: Optional[str] = None

    def to_dict(self):
        return {
            "ref": self.ref,
            "source_entity_id": self.source_entity_id,
            "reason": self.reason,
            "confidence": self.confidence,
            "status": self.status,
            "resolved_to": self.resolved_to,
        }


@dataclass
class Alert:
    rule: str
    entity_ids: list
    role: str
    severity: str
    message: str
    timestamp: str
    triggered_by: list = field(default_factory=list)
    latency_ms: Optional[float] = None

    @property
    def key(self):
        return (self.rule, tuple(sorted(self.entity_ids)))

    def to_dict(self):
        return {
            "rule": self.rule,
            "entity_ids": self.entity_ids,
            "role": self.role,
            "severity": self.severity,
            "message": self.message,
            "timestamp": self.timestamp,
            "triggered_by": self.triggered_by,
            "latency_ms": self.latency_ms,
        }


@dataclass
class Delivery:
    """One routed notification delivery (simulated channel write)."""

    rule: str
    entity_ids: list
    role: str
    channel: str
    status: str  # delivered | suppressed_threshold
    delivered_at: str

    def to_dict(self):
        return {
            "rule": self.rule,
            "entity_ids": self.entity_ids,
            "role": self.role,
            "channel": self.channel,
            "status": self.status,
            "delivered_at": self.delivered_at,
        }

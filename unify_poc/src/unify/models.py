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


@dataclass
class Event:
    id: str
    actor: str
    entity_id: str
    action: str
    timestamp: str
    references: list = field(default_factory=list)


@dataclass
class Link:
    source: str
    target: str
    kind: str
    confidence: float
    provenance: str


@dataclass
class Alert:
    rule: str
    entity_ids: list
    role: str
    severity: str
    message: str
    timestamp: str

    def to_dict(self):
        return {
            "rule": self.rule,
            "entity_ids": self.entity_ids,
            "role": self.role,
            "severity": self.severity,
            "message": self.message,
            "timestamp": self.timestamp,
        }

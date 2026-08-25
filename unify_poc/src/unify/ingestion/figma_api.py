"""Live Figma adapter — the same Adapter ABC swap demonstrated with GitHub.

Fetches a real Figma file (metadata + version history) into the raw schema
the figma fixture uses, so normalization/linking/conflict logic is untouched.
Requires a personal access token (FIGMA_TOKEN env var or constructor arg).
One record per file: the normalizer emits exactly one event per Figma
record, and conflict detection only needs the latest change timestamp.
"""

import json
import os
import urllib.request

from .adapter import Adapter
from .normalizer import FIGMA_RE

API_BASE = "https://api.figma.com/v1"
MAX_VERSIONS = 10


class FigmaAdapter(Adapter):
    def __init__(self, file_key, token=None):
        self.file_key = self.parse_file_key(file_key)
        self.token = token or os.environ.get("FIGMA_TOKEN")

    @staticmethod
    def parse_file_key(value):
        """Accept a bare file key or a full figma.com file/design URL."""
        m = FIGMA_RE.search(value)
        return m.group(1) if m else value.strip()

    def load_raw(self):
        meta = self._get(f"files/{self.file_key}?depth=1")
        versions = self._get(f"files/{self.file_key}/versions")
        return [self.map_file(self.file_key, meta, (versions.get("versions") or [])[:MAX_VERSIONS])]

    def _get(self, path):
        req = urllib.request.Request(
            f"{API_BASE}/{path}",
            headers={
                "X-Figma-Token": self.token or "",
                "User-Agent": "unify-poc",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                return json.load(resp)
        except Exception as e:
            raise RuntimeError(
                f"Figma API request failed for {path}: {e}. "
                f"Set FIGMA_TOKEN to a personal access token and check the "
                f"file key / network."
            ) from e

    @staticmethod
    def map_file(file_key, meta, versions):
        """Map one Figma API file (+ version history, newest first) to the
        raw schema. id is fig:<key> so Jira descriptions linking
        figma.com/design/<key>/... auto-link to it exactly like fixtures."""
        latest = versions[0] if versions else {}
        return {
            "tool": "figma",
            "id": f"fig:{file_key}",
            "title": meta.get("name") or f"fig:{file_key}",
            "action": "version_changed" if latest else "updated",
            "actor": (latest.get("user") or {}).get("handle", "") or "designer",
            "timestamp": meta.get("lastModified"),
            "status": "current",
            "refs": [],
            "version_label": latest.get("label"),
            "version_description": latest.get("description"),
        }

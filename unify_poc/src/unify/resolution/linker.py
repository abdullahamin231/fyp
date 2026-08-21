import json

from ..config import (
    AUTO_LINK_CONFIDENCE,
    AUTO_LINK_TRUST_THRESHOLD,
    MANUAL_LINK_CONFIDENCE,
)
from ..models import Link, Suggestion


class Linker:
    def __init__(self, store, manual_path=None, trust_threshold=AUTO_LINK_TRUST_THRESHOLD):
        self.store = store
        self.manual_path = manual_path
        self.trust_threshold = trust_threshold

    def link(self):
        """Auto-link from textual references; queue unresolvable or
        below-threshold refs as suggestions for manual confirmation
        (Section 4.1: automation vs human verification)."""
        self._auto_link()
        self._manual_link(confirm_suggestions=True)

    def _resolve_ref(self, ref):
        return self.store.get_entity(ref)

    def _auto_link(self):
        for e in self.store.all_entities():
            for ref in e.refs:
                target = self._resolve_ref(ref)
                if target and target.id != e.id:
                    if AUTO_LINK_CONFIDENCE < self.trust_threshold:
                        self.store.add_suggestion(
                            Suggestion(
                                ref=ref,
                                source_entity_id=e.id,
                                reason="below_threshold",
                                confidence=AUTO_LINK_CONFIDENCE,
                            )
                        )
                        continue
                    self.store.add_link(
                        Link(
                            source=e.id,
                            target=target.id,
                            kind="auto",
                            confidence=AUTO_LINK_CONFIDENCE,
                            provenance=f"reference:{ref}",
                        )
                    )
                elif target is None:
                    # referenced entity not ingested: never silently dropped,
                    # queued for manual confirmation instead.
                    self.store.add_suggestion(
                        Suggestion(
                            ref=ref,
                            source_entity_id=e.id,
                            reason="unresolved",
                            confidence=0.0,
                        )
                    )

    def _manual_link(self, confirm_suggestions=False):
        if not self.manual_path:
            return
        with open(self.manual_path) as f:
            pairs = json.load(f)
        for a, b in pairs:
            if self.store.get_entity(a) and self.store.get_entity(b):
                if confirm_suggestions:
                    for s in self.store.suggestions:
                        if s.status == "pending" and s.source_entity_id == a and s.ref == b:
                            s.status = "confirmed"
                            s.resolved_to = b
                self.store.add_link(
                    Link(
                        source=a,
                        target=b,
                        kind="manual",
                        confidence=MANUAL_LINK_CONFIDENCE,
                        provenance="manual",
                    )
                )

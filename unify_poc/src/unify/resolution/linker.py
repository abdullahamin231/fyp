import json
from ..config import AUTO_LINK_CONFIDENCE, MANUAL_LINK_CONFIDENCE
from ..models import Link


class Linker:
    def __init__(self, store, manual_path=None):
        self.store = store
        self.manual_path = manual_path

    def link(self):
        self._auto_link()
        self._manual_link()

    def _resolve_ref(self, ref):
        return self.store.get_entity(ref)

    def _auto_link(self):
        for e in self.store.all_entities():
            for ref in e.refs:
                target = self._resolve_ref(ref)
                if target and target.id != e.id:
                    self.store.add_link(
                        Link(
                            source=e.id,
                            target=target.id,
                            kind="auto",
                            confidence=AUTO_LINK_CONFIDENCE,
                            provenance=f"reference:{ref}",
                        )
                    )

    def _manual_link(self):
        if not self.manual_path:
            return
        with open(self.manual_path) as f:
            pairs = json.load(f)
        for a, b in pairs:
            if self.store.get_entity(a) and self.store.get_entity(b):
                self.store.add_link(
                    Link(
                        source=a,
                        target=b,
                        kind="manual",
                        confidence=MANUAL_LINK_CONFIDENCE,
                        provenance="manual",
                    )
                )

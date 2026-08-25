from unify.ingestion.figma_api import FigmaAdapter


def test_map_file_converts_api_payload_to_raw_schema():
    meta = {
        "name": "Login Screen",
        "lastModified": "2026-08-04T11:30:00Z",
    }
    versions = [
        {
            "id": "42",
            "label": "Rounded corners",
            "description": "",
            "created_at": "2026-08-04T11:29:00Z",
            "user": {"handle": "designer1", "id": "101"},
        },
        {
            "id": "41",
            "label": "First pass",
            "created_at": "2026-08-01T09:00:00Z",
            "user": {"handle": "designer2", "id": "102"},
        },
    ]
    raw = FigmaAdapter.map_file("ABC123", meta, versions)
    assert raw["tool"] == "figma"
    assert raw["id"] == "fig:ABC123"
    assert raw["title"] == "Login Screen"
    assert raw["action"] == "version_changed"
    assert raw["actor"] == "designer1"
    assert raw["timestamp"] == "2026-08-04T11:30:00Z"
    assert raw["status"] == "current"
    assert raw["version_label"] == "Rounded corners"


def test_map_file_without_versions_falls_back_to_updated():
    raw = FigmaAdapter.map_file("XYZ", {"name": "Empty"}, [])
    assert raw["action"] == "updated"
    assert raw["actor"] == "designer"
    assert raw["version_label"] is None


def test_parse_file_key_accepts_urls_and_bare_keys():
    url = "https://www.figma.com/design/ABC123/Login-Screen?node-id=4-2"
    assert FigmaAdapter.parse_file_key(url) == "ABC123"
    legacy = "https://www.figma.com/file/DEF456/Old"
    assert FigmaAdapter.parse_file_key(legacy) == "DEF456"
    assert FigmaAdapter.parse_file_key(" ABC123 ") == "ABC123"


def test_mapped_file_normalizes_and_links_like_fixtures():
    """A live-API payload mapped to the raw schema must flow through the same
    normalizer/linker and produce the same links a fixture would."""
    from unify.ingestion.fixtures import ingest_raw
    from unify.resolution.linker import Linker
    from unify.store.memory_store import MemoryStore

    raw = FigmaAdapter.map_file(
        "ABC123",
        {"name": "Login Screen", "lastModified": "2026-08-06T09:00:00Z"},
        [
            {
                "id": "9",
                "label": "tweak",
                "created_at": "2026-08-06T09:00:00Z",
                "user": {"handle": "designer1"},
            }
        ],
    )
    ticket = {
        "tool": "jira",
        "id": "PROJ-15",
        "title": "Build login screen",
        "description": "See https://www.figma.com/design/ABC123/Login-Screen",
        "actor": "pm1",
        "timestamp": "2026-08-01T10:00:00Z",
        "status": "In Progress",
    }
    store = MemoryStore()
    ingest_raw(store, [raw, ticket])
    Linker(store, manual_path=None).link()
    pairs = {tuple(sorted([l.source, l.target])) for l in store.links}
    assert tuple(sorted(["fig:ABC123", "PROJ-15"])) in pairs


def test_live_fetch_error_is_actionable():
    import pytest

    adapter = FigmaAdapter(
        "https://www.figma.com/design/definitelyNotARealFile0/Fake", token="invalid"
    )
    with pytest.raises(RuntimeError):
        adapter.load_raw()

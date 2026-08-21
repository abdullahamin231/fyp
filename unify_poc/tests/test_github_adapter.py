from unify.ingestion.github_api import GitHubAdapter


def test_map_pr_converts_api_payload_to_raw_schema():
    api_pr = {
        "number": 1337,
        "title": "Fix login bug (PROJ-15)",
        "user": {"login": "dev1"},
        "created_at": "2026-08-02T10:00:00Z",
        "state": "closed",
        "merged_at": "2026-08-03T14:00:00Z",
    }
    api_commits = [
        {
            "sha": "abcdef1234567890",
            "commit": {
                "message": "fix: login validation (PROJ-15)\n\nlonger body",
                "author": {"date": "2026-08-02T10:30:00Z"},
            },
        }
    ]
    raw = GitHubAdapter.map_pr(api_pr, api_commits)
    assert raw["tool"] == "github"
    assert raw["id"] == "gh:pr:1337"
    assert raw["status"] == "merged"
    assert raw["merged_at"] == "2026-08-03T14:00:00Z"
    assert raw["commits"][0] == {
        "sha": "abcdef12",
        "message": "fix: login validation (PROJ-15)",
        "timestamp": "2026-08-02T10:30:00Z",
    }


def test_mapped_pr_normalizes_and_links_like_fixtures():
    """A live-API payload mapped to the raw schema must flow through the same
    normalizer/linker and produce the same links a fixture would."""
    from unify.ingestion.fixtures import ingest_raw
    from unify.resolution.linker import Linker
    from unify.store.memory_store import MemoryStore

    raw = GitHubAdapter.map_pr(
        {
            "number": 42,
            "title": "Implement login form (PROJ-15)",
            "user": {"login": "dev1"},
            "created_at": "2026-08-02T10:00:00Z",
            "state": "closed",
            "merged_at": None,
        },
        [],
    )
    ticket = {
        "tool": "jira",
        "id": "PROJ-15",
        "title": "Build login screen",
        "description": "",
        "actor": "pm1",
        "timestamp": "2026-08-01T10:00:00Z",
        "status": "In Progress",
    }
    store = MemoryStore()
    ingest_raw(store, [raw, ticket])
    Linker(store, manual_path=None).link()
    pairs = {tuple(sorted([l.source, l.target])) for l in store.links}
    assert tuple(sorted(["gh:pr:42", "PROJ-15"])) in pairs


def test_live_fetch_error_is_actionable():
    import pytest

    adapter = GitHubAdapter("definitely-not-a-real-repo-xyz/none", token="invalid")
    with pytest.raises(RuntimeError):
        adapter.load_raw()

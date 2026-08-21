"""Live GitHub adapter — proves the Adapter ABC swap with a real API.

Fetches PRs + commits from the GitHub REST API into the same raw schema the
fixture files use, so normalization/linking/conflict logic is untouched.
Authentication is optional (GITHUB_TOKEN env var raises the rate limit for
public repos).
"""

import json
import os
import urllib.request

from .adapter import Adapter

API_BASE = "https://api.github.com"


class GitHubAdapter(Adapter):
    def __init__(self, repo, token=None, max_prs=5):
        self.repo = repo  # "owner/repo"
        self.token = token or os.environ.get("GITHUB_TOKEN")
        self.max_prs = max_prs

    def load_raw(self):
        prs = self._get(f"repos/{self.repo}/pulls?state=all&per_page={self.max_prs}")
        raws = []
        for pr in prs[: self.max_prs]:
            commits = self._get(
                f"repos/{self.repo}/pulls/{pr['number']}/commits?per_page=20"
            )
            raws.append(self.map_pr(pr, commits))
        return raws

    def _get(self, path):
        req = urllib.request.Request(
            f"{API_BASE}/{path}",
            headers={
                "Accept": "application/vnd.github+json",
                "User-Agent": "unify-poc",
                **({"Authorization": f"Bearer {self.token}"} if self.token else {}),
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                return json.load(resp)
        except Exception as e:
            raise RuntimeError(
                f"GitHub API request failed for {path}: {e}. "
                f"Set GITHUB_TOKEN or check network/rate limits."
            ) from e

    @staticmethod
    def map_pr(pr, commits):
        """Map one GitHub API PR (+ its commits) to Unify's raw schema."""
        merged_at = pr.get("merged_at")
        return {
            "tool": "github",
            "id": f"gh:pr:{pr['number']}",
            "title": pr.get("title") or "",
            "action": "merged" if merged_at else "opened",
            "actor": (pr.get("user") or {}).get("login", ""),
            "timestamp": pr.get("created_at"),
            "status": "merged" if merged_at else pr.get("state"),
            "merged_at": merged_at,
            "commits": [
                {
                    "sha": c["sha"][:8],
                    "message": (c.get("commit", {}).get("message") or "").splitlines()[0],
                    "timestamp": c.get("commit", {}).get("author", {}).get("date"),
                }
                for c in commits
            ],
        }

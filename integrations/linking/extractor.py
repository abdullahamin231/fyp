"""
Cross-tool Reference Extractor
================================
Pure string matching. No AI, no graph — just regex.

Extracts:
    - Jira keys from PR titles, bodies, branch names, commit messages
    - Figma URLs and file keys from Jira ticket descriptions
    - GitHub PR references (#123 or full URLs) from any text

Test against the fixture repo:
    python integrations/linking/extractor.py
"""

import re
from dataclasses import dataclass, field
from typing import Optional


# ── Compiled patterns ─────────────────────────────────────────────────────────

# Jira key: PROJECT-123 (1-10 uppercase letters, hyphen, digits)
# Case-insensitive match, then normalise to upper
JIRA_KEY = re.compile(
    r'(?<![A-Za-z0-9_])([A-Z][A-Z0-9]{1,9}-\d+)(?![A-Za-z0-9_])',
    re.IGNORECASE
)

# Figma file/design/proto URL — captures file key and optional node-id
FIGMA_FILE = re.compile(
    r'https://(?:www\.)?figma\.com/'
    r'(?:file|design|proto)/'
    r'(?P<file_key>[A-Za-z0-9_-]+)'
    r'(?:/(?P<slug>[^?#\s"<>\']*)?)?'
    r'(?:\?[^#\s"<>\']*node-id=(?P<node_id>[^&\s#"<>\']+))?',
    re.IGNORECASE
)

# GitHub PR URL (full)
GITHUB_PR_URL = re.compile(
    r'https://github\.com/'
    r'(?P<owner>[^/\s]+)/'
    r'(?P<repo>[^/\s]+)/'
    r'pull/'
    r'(?P<pr_num>\d+)'
)

# GitHub PR short reference (#123) — must be preceded by whitespace, start-of-line, or (, [
GITHUB_PR_SHORT = re.compile(
    r'(?:^|[\s(\[,])#(?P<pr_num>\d+)(?=[\s)\],.!?]|$)'
)

# GitHub commit SHA — full 40-char hex
GITHUB_SHA = re.compile(
    r'\b(?P<sha>[a-f0-9]{40})\b',
    re.IGNORECASE
)


# ── Data class ────────────────────────────────────────────────────────────────

@dataclass
class ExtractedReferences:
    jira_keys:       list[str]  = field(default_factory=list)
    figma_refs:      list[dict] = field(default_factory=list)   # {file_key, node_id, slug, raw_url}
    github_pr_urls:  list[str]  = field(default_factory=list)
    github_pr_nums:  list[int]  = field(default_factory=list)
    github_shas:     list[str]  = field(default_factory=list)

    def to_envelope_references(self) -> dict:
        """Return in the format expected by the event envelope schema."""
        return {
            "jira_keys":  self.jira_keys,
            "figma_urls": [f["file_key"] for f in self.figma_refs],
            "github_urls": self.github_pr_urls,
            "pr_numbers":  self.github_pr_nums,
        }

    def is_empty(self) -> bool:
        return not any([
            self.jira_keys, self.figma_refs,
            self.github_pr_urls, self.github_pr_nums, self.github_shas,
        ])


# ── Core extractor ────────────────────────────────────────────────────────────

def extract_references(
    text: str,
    context_repo: Optional[str] = None,  # "owner/repo" for resolving #123 short refs
) -> ExtractedReferences:
    """
    Extract all cross-tool references from a text string.

    Args:
        text:         Any text — PR title, body, branch name, commit message, ticket description.
        context_repo: "owner/repo" string for resolving #123-style short PR references.
                      If None, short refs are still extracted but without owner/repo context.

    Returns:
        ExtractedReferences with all found references, deduplicated.
    """
    refs = ExtractedReferences()
    if not text:
        return refs

    # ── Jira keys ─────────────────────────────────────────────────────────────
    seen_keys: set[str] = set()
    for m in JIRA_KEY.finditer(text):
        key = m.group(1).upper()
        if key not in seen_keys:
            seen_keys.add(key)
            refs.jira_keys.append(key)

    # ── Figma URLs ────────────────────────────────────────────────────────────
    seen_figma: set[tuple] = set()
    for m in FIGMA_FILE.finditer(text):
        key = (m.group("file_key"), m.group("node_id"))
        if key not in seen_figma:
            seen_figma.add(key)
            refs.figma_refs.append({
                "file_key": m.group("file_key"),
                "node_id":  m.group("node_id"),
                "slug":     m.group("slug"),
                "raw_url":  m.group(0),
            })

    # ── GitHub PR URLs (full) ─────────────────────────────────────────────────
    seen_prs: set[int] = set()
    for m in GITHUB_PR_URL.finditer(text):
        pr_num = int(m.group("pr_num"))
        if pr_num not in seen_prs:
            seen_prs.add(pr_num)
            refs.github_pr_urls.append(m.group(0))
            refs.github_pr_nums.append(pr_num)

    # ── GitHub PR short refs (#123) ───────────────────────────────────────────
    for m in GITHUB_PR_SHORT.finditer(text):
        pr_num = int(m.group("pr_num"))
        if pr_num not in seen_prs:
            seen_prs.add(pr_num)
            refs.github_pr_nums.append(pr_num)
            if context_repo:
                owner, repo = context_repo.split("/", 1)
                refs.github_pr_urls.append(
                    f"https://github.com/{owner}/{repo}/pull/{pr_num}"
                )

    # ── GitHub SHAs ───────────────────────────────────────────────────────────
    seen_shas: set[str] = set()
    for m in GITHUB_SHA.finditer(text):
        sha = m.group("sha").lower()
        if sha not in seen_shas:
            seen_shas.add(sha)
            refs.github_shas.append(sha)

    # Sort for determinism
    refs.jira_keys.sort()
    refs.github_pr_nums.sort()

    return refs


def extract_references_from_pr(
    title: str,
    body: str,
    branch_name: str,
    commit_messages: list[str],
    repo_full_name: str,
) -> ExtractedReferences:
    """
    Convenience wrapper: extract references from all PR-related text sources.
    Returns merged, deduplicated references.
    """
    all_text = " ".join(filter(None, [
        title,
        body,
        branch_name,
        *commit_messages,
    ]))
    return extract_references(all_text, context_repo=repo_full_name)


def extract_references_from_jira_issue(
    summary: str,
    description_text: str,    # plain text, already extracted from ADF
    comment_texts: list[str],
) -> ExtractedReferences:
    """
    Convenience wrapper: extract references from Jira issue fields.
    """
    all_text = " ".join(filter(None, [summary, description_text, *comment_texts]))
    return extract_references(all_text)


# ── Fixture test ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    """Test the extractor against fixture inputs that mirror the real fixture repo."""

    fixtures = [
        {
            "label":   "PR title with Jira key",
            "text":    "feat(UNIFY-5): implement event envelope mapper",
            "context": "team/unify",
        },
        {
            "label":   "PR body with Figma URL and Jira key",
            "text":    (
                "Closes UNIFY-12. \n\n"
                "Design: https://figma.com/file/ABC123xyz/Unify-Design?node-id=1%3A2\n\n"
                "Implements the login button."
            ),
            "context": "team/unify",
        },
        {
            "label":   "Branch name with Jira key",
            "text":    "refs/heads/feature/UNIFY-7-webhook-receiver",
            "context": "team/unify",
        },
        {
            "label":   "Commit message with Jira key and short PR ref",
            "text":    "Fix UNIFY-3 reference extraction\n\nRelated to #5\n\nCloses UNIFY-3",
            "context": "team/unify",
        },
        {
            "label":   "Full GitHub PR URL with Jira key",
            "text":    "https://github.com/team/unify/pull/42 implements UNIFY-9",
            "context": None,
        },
        {
            "label":   "Jira description with Figma and GitHub",
            "text":    (
                "Implementation tracked in https://github.com/team/unify/pull/15\n"
                "Figma: https://www.figma.com/design/XYZ987/Unify-Components?node-id=3:10"
            ),
            "context": None,
        },
        {
            "label":   "No references",
            "text":    "Update README with project overview.",
            "context": None,
        },
    ]

    print("=" * 60)
    print("Cross-tool Reference Extractor — Fixture Tests")
    print("=" * 60)
    all_passed = True
    for f in fixtures:
        refs = extract_references(f["text"], context_repo=f["context"])
        status = "PASS" if not (f["label"] == "No references" and not refs.is_empty()) else "FAIL"
        if f["label"] != "No references" and refs.is_empty():
            status = "WARN (no refs found)"
        all_passed = all_passed and status == "PASS"
        print(f"\n[{status}] {f['label']}")
        print(f"  Input:      {f['text'][:80]!r}")
        print(f"  jira_keys:  {refs.jira_keys}")
        print(f"  figma_refs: {[(r['file_key'], r['node_id']) for r in refs.figma_refs]}")
        print(f"  pr_nums:    {refs.github_pr_nums}")
        print(f"  pr_urls:    {refs.github_pr_urls}")

    print("\n" + "=" * 60)
    print("All tests passed." if all_passed else "Some tests had issues — review above.")

/**
 * Step 1 of deterministic linking (FR-04): find Jira issue keys in the text
 * of a pull request.
 *
 * A Jira key is a project prefix, a dash and an issue number, e.g. `UNI-123`.
 * We look in three places, the same three Jira's own GitHub integration
 * looks at: the PR title, the branch name and each commit message.
 *
 * This file does no I/O. It turns strings into a list of keys, so it can be
 * unit-tested on its own and explained line by line.
 */

/** Where in the pull request a key was found. Kept as provenance on the edge. */
export type KeySource = "title" | "branch" | `commit:${string}`;

export interface ExtractedKey {
  /** The issue key exactly as Jira writes it, e.g. `UNI-123`. */
  key: string;
  /** Every place the key appeared. One key can appear in several. */
  foundIn: KeySource[];
}

export interface PullRequestText {
  title: string;
  branch: string;
  commits: { sha: string; message: string }[];
}

/**
 * The key pattern.
 *
 *   (?<![A-Za-z0-9])   the key must not be glued to a letter/digit on the left
 *                      ("XUNI-1" is not UNI-1)
 *   ([A-Z][A-Z0-9]+)   project prefix: an uppercase letter, then uppercase
 *                      letters/digits (Jira's own rule for project keys)
 *   -                  the dash
 *   ([1-9][0-9]*)      issue number, no leading zero (Jira never makes one)
 *   (?![A-Za-z0-9])    must not run on into more letters/digits on the right
 *                      ("UNI-12abc" is not UNI-12)
 *
 * `-`, `/`, `_`, spaces, brackets and punctuation all count as boundaries, so
 * `feature/UNI-123-login`, `[UNI-123]` and `UNI-123: fix` all match.
 *
 * Matching is case-sensitive on purpose: Jira keys are always uppercase, and
 * accepting `uni-123` would also accept ordinary lowercase words like
 * `covid-19` and `utf-8`.
 */
const KEY_PATTERN = /(?<![A-Za-z0-9])([A-Z][A-Z0-9]+)-([1-9][0-9]*)(?![A-Za-z0-9])/g;

/**
 * Return every key in one piece of text, in order, without duplicates.
 *
 * `projectKeys` is the allow-list of Jira projects bound to this workspace
 * (e.g. `["UNI"]`). Without it, strings like `UTF-8`, `SHA-256` or `ISO-8601`
 * look exactly like issue keys. With it, only real project prefixes count.
 * Pass `null` to accept any prefix.
 */
export function findKeysInText(text: string, projectKeys: readonly string[] | null): string[] {
  const found: string[] = [];
  for (const match of text.matchAll(KEY_PATTERN)) {
    const project = match[1]!;
    const key = match[0];
    if (projectKeys !== null && !projectKeys.includes(project)) continue;
    if (!found.includes(key)) found.push(key);
  }
  return found;
}

/**
 * Collect the keys from the title, the branch and every commit message, and
 * merge them so each key appears once with the list of places it came from.
 */
export function extractJiraKeys(
  pr: PullRequestText,
  projectKeys: readonly string[] | null,
): ExtractedKey[] {
  // Map keeps insertion order, so the result follows title → branch → commits.
  const byKey = new Map<string, KeySource[]>();

  const record = (text: string, source: KeySource) => {
    for (const key of findKeysInText(text, projectKeys)) {
      const sources = byKey.get(key) ?? [];
      if (!sources.includes(source)) sources.push(source);
      byKey.set(key, sources);
    }
  };

  record(pr.title, "title");
  record(pr.branch, "branch");
  for (const commit of pr.commits) {
    // Short sha (7 chars) is what people recognise in git log.
    record(commit.message, `commit:${commit.sha.slice(0, 7)}`);
  }

  return [...byKey].map(([key, foundIn]) => ({ key, foundIn }));
}

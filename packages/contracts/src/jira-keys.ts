/**
 * Step 1 of deterministic linking (FR-04): find Jira issue keys in the text
 * of a pull request.
 *
 * A Jira key is a project prefix, a dash and an issue number, e.g. `UNI-123`.
 * We look where Jira's own GitHub integration looks (the PR title, the branch
 * name and each commit message) plus the PR description.
 *
 * Pure: strings in, keys out. The web ingestion path and the worker both call
 * this one function, so a PR is linked the same way wherever it is read.
 */

/** Where in the pull request a key was found. Kept as provenance on the edge. */
export type KeySource = "title" | "branch" | "body" | `commit:${string}`;

export interface ExtractedKey {
  /** The issue key exactly as Jira writes it, e.g. `UNI-123`. */
  key: string;
  /** Every place the key appeared. One key can appear in several. */
  foundIn: KeySource[];
}

export interface PullRequestText {
  title?: string | null;
  branch?: string | null;
  body?: string | null;
  commits?: readonly { sha: string; message: string }[];
}

/**
 *   (?<![A-Za-z0-9])   not glued to a letter/digit on the left ("XUNI-1" is not UNI-1)
 *   ([A-Z][A-Z0-9]+)   project prefix: Jira's own rule for project keys
 *   ([1-9][0-9]*)      issue number, no leading zero (Jira never makes one)
 *   (?![A-Za-z0-9])    not running on into letters/digits ("UNI-12abc" is not UNI-12)
 *
 * `-`, `/`, `_`, spaces, brackets and punctuation all count as boundaries, so
 * `feature/UNI-123-login`, `[UNI-123]` and `UNI-123: fix` all match. Matching
 * is case-sensitive on purpose: accepting `uni-123` would also accept ordinary
 * words like `covid-19` and `utf-8`.
 */
const KEY_PATTERN = /(?<![A-Za-z0-9])([A-Z][A-Z0-9]+)-([1-9][0-9]*)(?![A-Za-z0-9])/g;

/**
 * Every key in one piece of text, in order, without duplicates.
 *
 * `projectKeys` is the allow-list of Jira projects bound to the workspace
 * (e.g. `["UNI"]`). Without it, `UTF-8`, `SHA-256` or `ISO-8601` look exactly
 * like issue keys. Pass `null` to accept any prefix.
 */
export function findKeysInText(text: string, projectKeys: readonly string[] | null): string[] {
  const found: string[] = [];
  for (const match of text.matchAll(KEY_PATTERN)) {
    if (projectKeys !== null && !projectKeys.includes(match[1]!)) continue;
    if (!found.includes(match[0])) found.push(match[0]);
  }
  return found;
}

/**
 * Keys from the title, branch, body and every commit message, merged so each
 * key appears once with the places it came from, in that order.
 */
export function extractJiraKeys(pr: PullRequestText, projectKeys: readonly string[] | null): ExtractedKey[] {
  const byKey = new Map<string, KeySource[]>();
  const record = (text: string | null | undefined, source: KeySource) => {
    if (!text) return;
    for (const key of findKeysInText(text, projectKeys)) {
      const sources = byKey.get(key) ?? [];
      if (!sources.includes(source)) sources.push(source);
      byKey.set(key, sources);
    }
  };
  record(pr.title, "title");
  record(pr.branch, "branch");
  record(pr.body, "body");
  // Short sha (7 chars) is what people recognise in git log.
  for (const commit of pr.commits ?? []) record(commit.message, `commit:${commit.sha.slice(0, 7)}`);
  return [...byKey].map(([key, foundIn]) => ({ key, foundIn }));
}

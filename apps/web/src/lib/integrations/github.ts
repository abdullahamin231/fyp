/**
 * The few GitHub REST reads ingestion needs, with the workspace's own token.
 * https://docs.github.com/en/rest/pulls/pulls
 */

export interface GithubCommit {
  sha: string;
  message: string;
}

const PER_PAGE = 100;
/** A PR with more commits than this is linked from its title, branch and body plus the first pages. */
const MAX_PAGES = 3;

async function githubGet(token: string, path: string, fetchImpl: typeof fetch): Promise<unknown> {
  const response = await fetchImpl(`https://api.github.com${path}`, {
    headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28" },
  });
  if (!response.ok) throw new Error(`GitHub ${path} returned ${response.status}`);
  return response.json();
}

async function paged<T>(token: string, path: string, fetchImpl: typeof fetch): Promise<T[]> {
  const out: T[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const sep = path.includes("?") ? "&" : "?";
    const batch = (await githubGet(token, `${path}${sep}per_page=${PER_PAGE}&page=${page}`, fetchImpl)) as T[];
    out.push(...batch);
    if (batch.length < PER_PAGE) break;
  }
  return out;
}

export async function pullRequestCommits(
  token: string,
  repo: string,
  number: number,
  fetchImpl: typeof fetch = fetch,
): Promise<GithubCommit[]> {
  const rows = await paged<{ sha: string; commit: { message: string } }>(token, `/repos/${repo}/pulls/${number}/commits`, fetchImpl);
  return rows.map((row) => ({ sha: row.sha, message: row.commit.message }));
}

/** Open pull requests, in the same shape a `pull_request` webhook carries. */
export async function openPullRequests(token: string, repo: string, fetchImpl: typeof fetch = fetch): Promise<Record<string, unknown>[]> {
  return paged<Record<string, unknown>>(token, `/repos/${repo}/pulls?state=open`, fetchImpl);
}

/**
 * PostgREST puts an `.in()` filter in the GET query string, so a few hundred
 * UUIDs push the URL past what proxies accept. Every id-list read in this
 * folder goes through `selectInChunks` instead of a raw `.in()`.
 */
export const IN_CHUNK_SIZE = 100;

type Result = PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>;

export async function selectInChunks<T>(
  label: string,
  ids: readonly string[],
  query: (chunk: string[]) => Result,
): Promise<T[]> {
  const unique = [...new Set(ids)];
  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += IN_CHUNK_SIZE) chunks.push(unique.slice(i, i + IN_CHUNK_SIZE));
  const results = await Promise.all(chunks.map((chunk) => query(chunk)));
  return results.flatMap((res) => {
    if (res.error) throw new Error(`${label}: ${res.error.message}`);
    return (res.data ?? []) as T[];
  });
}

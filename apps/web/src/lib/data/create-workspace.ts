/**
 * Workspace creation, shared by `/workspaces/new` and the onboarding wizard.
 * Runs in the browser with the caller's session: `create_workspace` (00008)
 * inserts the row as `auth.uid()` and the trigger makes them owner.
 */

export interface CreatedWorkspace {
  id: string;
  name: string;
  slug: string;
}

type RpcClient = {
  rpc: (
    fn: string,
    args: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: { message: string; code?: string } | null }>;
};

/** Lowercase kebab-case, matching the workspaces slug CHECK constraint. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function createWorkspace(
  client: RpcClient,
  name: string,
  slug: string,
): Promise<{ ok: true; workspace: CreatedWorkspace } | { ok: false; error: string }> {
  const { data, error } = await client.rpc("create_workspace", { p_name: name.trim(), p_slug: slug });
  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? `Slug "${slug}" is already taken` : `Could not create workspace: ${error.message}`,
    };
  }
  const row = data as CreatedWorkspace;
  return { ok: true, workspace: { id: row.id, name: row.name, slug: row.slug } };
}

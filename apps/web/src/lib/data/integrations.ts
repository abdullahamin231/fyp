import { createClient } from "@/lib/supabase/server";
import type { IntegrationProvider } from "@/lib/integrations/types";
import type { WorkspaceRole } from "@/lib/types";

/**
 * Connection status for one workspace's GitHub, Jira and Figma integrations.
 *
 * Reads go through the RLS client, so only members of the workspace see
 * anything. Token columns are never selected: a row existing in
 * `integration_connections` is what "connected" means, and the ciphertext
 * stays on the server side of the database.
 */

export const PROVIDERS: IntegrationProvider[] = ["github", "jira", "figma"];

export type ProviderStatus = {
  provider: IntegrationProvider;
  connected: boolean;
  accountName: string | null;
  scopes: string[];
  connectedAt: string | null;
  /** Most recent webhook delivery received for this provider, if any. */
  lastDeliveryAt: string | null;
  deliveryCount: number;
};

export type WorkspaceIntegrations = {
  workspace: { id: string; name: string; slug: string; role: WorkspaceRole };
  providers: ProviderStatus[];
};

export async function getWorkspaceIntegrations(slug: string): Promise<WorkspaceIntegrations | null> {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return null;

  const ws = await client.from("workspaces").select("id, name, slug").eq("slug", slug).maybeSingle();
  if (ws.error) throw new Error(`workspaces: ${ws.error.message}`);
  if (!ws.data) return null;

  const member = await client
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", ws.data.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (member.error) throw new Error(`workspace_members: ${member.error.message}`);
  if (!member.data) return null;

  const [connections, deliveries] = await Promise.all([
    client
      .from("integration_connections")
      .select("provider, external_account_name, scopes, updated_at")
      .eq("workspace_id", ws.data.id),
    client
      .from("integration_deliveries")
      .select("provider, received_at")
      .eq("workspace_id", ws.data.id)
      .order("received_at", { ascending: false })
      .limit(500),
  ]);
  if (connections.error) throw new Error(`integration_connections: ${connections.error.message}`);
  if (deliveries.error) throw new Error(`integration_deliveries: ${deliveries.error.message}`);

  type ConnRow = { provider: IntegrationProvider; external_account_name: string | null; scopes: string[] | null; updated_at: string };
  type DelRow = { provider: IntegrationProvider; received_at: string };
  const conns = (connections.data ?? []) as ConnRow[];
  const dels = (deliveries.data ?? []) as DelRow[];

  return {
    workspace: { ...ws.data, role: member.data.role as WorkspaceRole },
    providers: PROVIDERS.map((provider) => {
      const conn = conns.find((c) => c.provider === provider);
      const mine = dels.filter((d) => d.provider === provider);
      return {
        provider,
        connected: !!conn,
        accountName: conn?.external_account_name ?? null,
        scopes: conn?.scopes ?? [],
        connectedAt: conn?.updated_at ?? null,
        lastDeliveryAt: mine[0]?.received_at ?? null,
        deliveryCount: mine.length,
      };
    }),
  };
}

import { createClient } from "@/lib/supabase/server";

/**
 * What the conflict page needs to offer a watch toggle: the artefact the
 * finding is about, and whether the signed-in member already watches it. The
 * member is matched to their Person node by stored auth user id, never by email.
 */
export async function loadWatchState(findingId: string): Promise<{ nodeId: string; watching: boolean } | null> {
  const client = await createClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return null;

  const finding = await client.from("findings").select("subject_node_id").eq("id", findingId).maybeSingle();
  if (finding.error || !finding.data) return null;
  const nodeId = (finding.data as { subject_node_id: string }).subject_node_id;

  const people = await client.from("nodes").select("id").eq("type", "Person").eq("payload->>userId", auth.user.id);
  const personIds = ((people.data ?? []) as { id: string }[]).map((row) => row.id);
  if (personIds.length === 0) return { nodeId, watching: false };

  const edge = await client.from("edges").select("id")
    .in("from_id", personIds).eq("to_id", nodeId).eq("type", "WATCHES").eq("link_state", "active").is("valid_to", null).limit(1);
  return { nodeId, watching: ((edge.data ?? []) as unknown[]).length > 0 };
}

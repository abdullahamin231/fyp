import type { NotificationChannel, PersonRole } from "@unify/contracts";

/** Role edges run person -> node; the other edge types link nodes (FR-14, §9.4). */
export type RoleEdgeType = "OWNS" | "ASSIGNED_TO" | "WATCHES";

export interface RoleEdge {
  type: RoleEdgeType;
  userId: string;
  nodeId: string;
}

/** Structural edge between nodes (PART_OF, CONSTRAINS, ...), traversed undirected. */
export interface NodeEdge {
  from: string;
  to: string;
}

export interface NotifyUser {
  id: string;
  role: PersonRole;
  /** Channels this user has not muted. */
  channels: NotificationChannel[];
}

export interface NotifyInput {
  nodeId: string;
  /** Roles the rule routes to. */
  roles: PersonRole[];
  /** Rule channels. */
  channels: NotificationChannel[];
  /** Bounded BFS depth, 1–2. */
  hops: number;
  roleEdges: RoleEdge[];
  nodeEdges: NodeEdge[];
  users: NotifyUser[];
}

export interface Recipient {
  userId: string;
  channels: NotificationChannel[];
  /** Fewest hops from the changed node to a node the user holds a role edge on. */
  distance: number;
  via: RoleEdgeType;
}

export type UnroutableReason = "no_role_edge" | "no_matching_user";

export type NotifyResolution =
  | { outcome: "routed"; nodeId: string; recipients: Recipient[] }
  | { outcome: "unroutable"; nodeId: string; reason: UnroutableReason };

export const MAX_HOPS = 2;

/** Nodes within `hops` of the start, with their shortest distance. */
function reachable(start: string, edges: NodeEdge[], hops: number): Map<string, number> {
  const adjacency = new Map<string, string[]>();
  for (const { from, to } of edges) {
    adjacency.set(from, [...(adjacency.get(from) ?? []), to]);
    adjacency.set(to, [...(adjacency.get(to) ?? []), from]);
  }
  const dist = new Map<string, number>([[start, 0]]);
  let frontier = [start];
  for (let depth = 1; depth <= hops; depth++) {
    const next: string[] = [];
    for (const node of frontier) {
      for (const neighbour of adjacency.get(node) ?? []) {
        if (dist.has(neighbour)) continue;
        dist.set(neighbour, depth);
        next.push(neighbour);
      }
    }
    frontier = next;
  }
  return dist;
}

// Direct responsibility outranks passive interest when one user holds several edges.
const PRIORITY: Record<RoleEdgeType, number> = { ASSIGNED_TO: 0, OWNS: 1, WATCHES: 2 };

/**
 * Resolve who to notify for a change on `nodeId`: a bounded walk from the node,
 * then per-user filtering by role and channel. Never returns an empty routed
 * result — a node nobody is responsible for is an explicit `unroutable` outcome.
 */
export function resolveNotifySet(input: NotifyInput): NotifyResolution {
  const hops = Math.min(Math.max(Math.trunc(input.hops), 1), MAX_HOPS);
  const reach = reachable(input.nodeId, input.nodeEdges, hops);
  const nearby = input.roleEdges.filter((edge) => reach.has(edge.nodeId));
  if (nearby.length === 0) return { outcome: "unroutable", nodeId: input.nodeId, reason: "no_role_edge" };

  const users = new Map(input.users.map((user) => [user.id, user]));
  const best = new Map<string, Recipient>();
  for (const edge of nearby) {
    const user = users.get(edge.userId);
    if (!user || !input.roles.includes(user.role)) continue;
    const channels = input.channels.filter((channel) => user.channels.includes(channel));
    if (channels.length === 0) continue;
    const distance = reach.get(edge.nodeId)!;
    const current = best.get(user.id);
    if (current && (current.distance < distance || (current.distance === distance && PRIORITY[current.via] <= PRIORITY[edge.type]))) continue;
    best.set(user.id, { userId: user.id, channels, distance, via: edge.type });
  }

  if (best.size === 0) return { outcome: "unroutable", nodeId: input.nodeId, reason: "no_matching_user" };
  const recipients = [...best.values()].sort((a, b) => a.distance - b.distance || a.userId.localeCompare(b.userId));
  return { outcome: "routed", nodeId: input.nodeId, recipients };
}

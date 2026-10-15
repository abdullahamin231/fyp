import type { Point } from "./geometry";
import type { ExplorerEdge, ExplorerNode } from "@/lib/domain/graph";

/**
 * Client-side layouts for the two graph explorers. Positions are node
 * **centres** in canvas pixels; the canvas pans and zooms, so nothing here is
 * squeezed to fit a fixed stage — every layout spaces nodes for legibility and
 * lets the viewport do the rest.
 */

export type LayoutMode = "layered" | "radial" | "force";

const COLUMN_GAP = 300;
const ROW_GAP = 92;
const LANE_GAP = 120;
const SWEEPS = 6;

/**
 * Left-to-right reading order of the evidence chain: the ticket, its criteria,
 * the design, the change and its commits, the code it touches, the tests that
 * exercise it.
 */
export function columnOf(node: ExplorerNode): number {
  switch (node.kind) {
    case "requirement":
      return node.kindLabel === "Criterion" ? 1 : 0;
    case "design":
      return 2;
    case "pr":
      return node.kindLabel === "Commit" ? 4 : 3;
    case "code":
      return 5;
    case "test":
      return 6;
    case "finding":
      return 7;
  }
}

function neighbours(edges: ExplorerEdge[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const edge of edges) {
    map.set(edge.from, [...(map.get(edge.from) ?? []), edge.to]);
    map.set(edge.to, [...(map.get(edge.to) ?? []), edge.from]);
  }
  return map;
}

/**
 * Column → lane-ordered node lists, each column sorted by the barycentre of
 * its neighbours (a few up-and-down sweeps), which keeps edges short and
 * crossings rare without a layout dependency.
 */
function orderedColumns(nodes: ExplorerNode[], edges: ExplorerEdge[]): ExplorerNode[][][] {
  const lanes = [...new Set(nodes.map((node) => node.subtitle))].sort();
  const adjacency = neighbours(edges);
  const columnCount = Math.max(0, ...nodes.map(columnOf)) + 1;

  // lane → column → nodes
  const grid: ExplorerNode[][][] = lanes.map(() =>
    Array.from({ length: columnCount }, () => [] as ExplorerNode[]),
  );
  const sorted = [...nodes].sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { numeric: true }),
  );
  for (const node of sorted) grid[lanes.indexOf(node.subtitle)][columnOf(node)].push(node);

  for (const lane of grid) {
    const rank = new Map<string, number>();
    const reindex = () =>
      lane.forEach((column) => column.forEach((node, index) => rank.set(node.id, index)));
    reindex();
    for (let sweep = 0; sweep < SWEEPS; sweep += 1) {
      const order = sweep % 2 === 0 ? lane : [...lane].reverse();
      for (const column of order) {
        const key = new Map<string, number>();
        for (const node of column) {
          const ranks = (adjacency.get(node.id) ?? [])
            .map((id) => rank.get(id))
            .filter((value): value is number => value !== undefined);
          key.set(
            node.id,
            ranks.length
              ? ranks.reduce((sum, value) => sum + value, 0) / ranks.length
              : rank.get(node.id)!,
          );
        }
        column.sort((a, b) => key.get(a.id)! - key.get(b.id)! || a.label.localeCompare(b.label));
        column.forEach((node, index) => rank.set(node.id, index));
      }
    }
  }
  return grid;
}

/** Columns by evidence role, one horizontal lane per workspace. */
export function layeredLayout(nodes: ExplorerNode[], edges: ExplorerEdge[]): Map<string, Point> {
  const positions = new Map<string, Point>();
  let laneTop = 0;
  for (const lane of orderedColumns(nodes, edges)) {
    const usedColumns = lane
      .map((column, index) => (column.length ? index : -1))
      .filter((i) => i >= 0);
    const tallest = Math.max(1, ...lane.map((column) => column.length));
    const laneHeight = tallest * ROW_GAP;
    lane.forEach((column, columnIndex) => {
      // Collapse empty columns so a graph without designs has no hole in it.
      const x = usedColumns.indexOf(columnIndex) * COLUMN_GAP;
      const top = laneTop + (laneHeight - column.length * ROW_GAP) / 2;
      column.forEach((node, row) => {
        positions.set(node.id, { x, y: top + row * ROW_GAP + ROW_GAP / 2 });
      });
    });
    laneTop += laneHeight + LANE_GAP;
  }
  return positions;
}

/** Concentric rings by evidence role — tickets at the hub, tests on the rim. */
export function radialLayout(nodes: ExplorerNode[], edges: ExplorerEdge[]): Map<string, Point> {
  const positions = new Map<string, Point>();
  const rings = new Map<number, ExplorerNode[]>();
  for (const lane of orderedColumns(nodes, edges)) {
    lane.forEach((column, index) => rings.set(index, [...(rings.get(index) ?? []), ...column]));
  }
  let radius = 0;
  for (const [, ring] of [...rings.entries()].sort((a, b) => a[0] - b[0])) {
    if (ring.length === 0) continue;
    if (radius === 0 && ring.length === 1) {
      positions.set(ring[0].id, { x: 0, y: 0 });
      radius = 220;
      continue;
    }
    // Grow the ring until neighbours on it are at least one card width apart.
    radius = Math.max(radius === 0 ? 160 : radius, (ring.length * 250) / (2 * Math.PI));
    ring.forEach((node, index) => {
      const angle = (index / ring.length) * Math.PI * 2 - Math.PI / 2;
      positions.set(node.id, { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
    });
    radius += 220;
  }
  return positions;
}

/**
 * Fruchterman–Reingold, seeded from the layered layout so it is deterministic:
 * the same graph always settles the same way.
 */
export function forceLayout(nodes: ExplorerNode[], edges: ExplorerEdge[]): Map<string, Point> {
  const seed = layeredLayout(nodes, edges);
  const ids = nodes.map((node) => node.id);
  const pos = ids.map((id) => ({ ...seed.get(id)! }));
  const index = new Map(ids.map((id, i) => [id, i]));
  const links = edges
    .map((edge) => [index.get(edge.from), index.get(edge.to)] as const)
    .filter(
      (pair): pair is readonly [number, number] => pair[0] !== undefined && pair[1] !== undefined,
    );

  const k = 230;
  const iterations = 220;
  let temperature = 160;
  for (let step = 0; step < iterations; step += 1) {
    const disp = pos.map(() => ({ x: 0, y: 0 }));
    for (let i = 0; i < pos.length; i += 1) {
      for (let j = i + 1; j < pos.length; j += 1) {
        let dx = pos[i].x - pos[j].x;
        let dy = pos[i].y - pos[j].y;
        if (dx === 0 && dy === 0) {
          dx = 0.01 * (i - j);
          dy = 0.01;
        }
        const distance = Math.hypot(dx, dy);
        const force = (k * k) / distance;
        disp[i].x += (dx / distance) * force;
        disp[i].y += (dy / distance) * force;
        disp[j].x -= (dx / distance) * force;
        disp[j].y -= (dy / distance) * force;
      }
    }
    for (const [a, b] of links) {
      const dx = pos[a].x - pos[b].x;
      const dy = pos[a].y - pos[b].y;
      const distance = Math.hypot(dx, dy) || 0.01;
      const force = (distance * distance) / k;
      disp[a].x -= (dx / distance) * force;
      disp[a].y -= (dy / distance) * force;
      disp[b].x += (dx / distance) * force;
      disp[b].y += (dy / distance) * force;
    }
    pos.forEach((point, i) => {
      const length = Math.hypot(disp[i].x, disp[i].y) || 1;
      point.x += (disp[i].x / length) * Math.min(length, temperature);
      point.y += (disp[i].y / length) * Math.min(length, temperature);
    });
    temperature = Math.max(2, temperature * 0.97);
  }
  return new Map(ids.map((id, i) => [id, { x: Math.round(pos[i].x), y: Math.round(pos[i].y) }]));
}

export function computeLayout(
  mode: LayoutMode,
  nodes: ExplorerNode[],
  edges: ExplorerEdge[],
): Map<string, Point> {
  if (mode === "radial") return radialLayout(nodes, edges);
  if (mode === "force") return forceLayout(nodes, edges);
  return layeredLayout(nodes, edges);
}

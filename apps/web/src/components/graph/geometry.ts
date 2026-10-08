export interface Point {
  x: number;
  y: number;
}

/**
 * Cubic S-curve between two node centres — the edge shape used by the Stitch
 * artefact-topology canvas. Straight lines (dx ≈ 0) fall out of the formula
 * naturally, so vertical pairs render clean too.
 */
export function edgePath(a: Point, b: Point): string {
  const dx = (b.x - a.x) * 0.5;
  return `M ${a.x},${a.y} C ${a.x + dx},${a.y} ${b.x - dx},${b.y} ${b.x},${b.y}`;
}

/** Point at t=0.5 of `edgePath` (== midpoint of the two centres). */
export function edgeMidpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** Midpoint nudged perpendicular to the edge so the label clears the stroke. */
export function edgeLabelAnchor(a: Point, b: Point, offset = 14): Point {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  return {
    x: (a.x + b.x) / 2 + (-dy / length) * offset,
    y: (a.y + b.y) / 2 + (dx / length) * offset,
  };
}

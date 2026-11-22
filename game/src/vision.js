// Vision cones and line of sight: the heart of the stealth rules.
// A watcher (guard or camera) sees the thief when he is inside the cone,
// close enough, and no solid cover crosses the line between them.

/** Smallest signed turn from angle a to angle b, in radians. */
export function angleDelta(a, b) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/** True when point (px,py) sits inside the cone cast from (x,y). */
export function pointInCone(x, y, facing, range, halfAngle, px, py) {
  const dx = px - x;
  const dy = py - y;
  const dist = Math.hypot(dx, dy);
  if (dist > range || dist < 1) return dist <= range && dist < 14;
  const to = Math.atan2(dy, dx);
  return Math.abs(angleDelta(facing, to)) <= halfAngle;
}

/** Does segment a-b cross rectangle r? Used to let cover block sight. */
export function segmentHitsRect(ax, ay, bx, by, r) {
  // A cheap, honest test: sample plus exact edge crossings via slab method.
  const dx = bx - ax;
  const dy = by - ay;
  let t0 = 0;
  let t1 = 1;
  const slabs = [
    [-dx, ax - r.x],
    [dx, (r.x + r.w) - ax],
    [-dy, ay - r.y],
    [dy, (r.y + r.h) - ay],
  ];
  for (const [p, q] of slabs) {
    if (Math.abs(p) < 1e-9) {
      if (q < 0) return false;
    } else {
      const t = q / p;
      if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
      else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
  }
  return t0 <= t1;
}

/** True when nothing solid stands between watcher and thief. */
export function hasLineOfSight(x, y, px, py, cover, vaultWalls) {
  for (const r of cover) {
    if (segmentHitsRect(x, y, px, py, r)) return false;
  }
  for (const w of vaultWalls) {
    if (segmentHitsRect(x, y, px, py, w)) return false;
  }
  return true;
}

/**
 * Can this watcher see the thief right now?
 * Sneaking shrinks the effective range: a low, slow thief is spotted later.
 */
export function watcherSeesThief(watcher, thief, cover, vaultWalls) {
  const range = thief.sneaking ? watcher.range * 0.72 : watcher.range;
  if (!pointInCone(watcher.x, watcher.y, watcher.facing, range, watcher.halfAngle, thief.x, thief.y)) {
    return false;
  }
  return hasLineOfSight(watcher.x, watcher.y, thief.x, thief.y, cover, vaultWalls);
}

/** The polygon a cone draws as, clipped simply at cover edges for looks. */
export function conePolygon(x, y, facing, range, halfAngle) {
  const steps = 14;
  const pts = [{ x, y }];
  for (let i = 0; i <= steps; i += 1) {
    const a = facing - halfAngle + (2 * halfAngle * i) / steps;
    pts.push({ x: x + Math.cos(a) * range, y: y + Math.sin(a) * range });
  }
  return pts;
}

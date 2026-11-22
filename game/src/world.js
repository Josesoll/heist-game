// The living hall: guards on patrol, sweeping cameras, loot and the thief.
// One job: hold and step the world state. Rules about alarm and winning live
// in game.js; drawing lives in render.js.
import { CAMERA, CAMERAS, CASH_BAGS, COVER, EXIT_ZONE, GUARD, PATROLS, STAR, THIEF, VAULT } from './config.js';
import { angleDelta } from './vision.js';

/** The vault as four wall segments, leaving the door gap open. */
export function buildVaultWalls() {
  const v = VAULT;
  const t = 10;
  return [
    { x: v.x, y: v.y, w: v.w, h: t, kind: 'vaultwall' },
    { x: v.x, y: v.y, w: t, h: v.h, kind: 'vaultwall' },
    { x: v.x + v.w - t, y: v.y, w: t, h: v.h, kind: 'vaultwall' },
    { x: v.x, y: v.y + v.h - t, w: v.doorX - v.x, h: t, kind: 'vaultwall' },
    { x: v.doorX + v.doorW, y: v.y + v.h - t, w: (v.x + v.w) - (v.doorX + v.doorW), h: t, kind: 'vaultwall' },
  ];
}

export function createWorld() {
  const guards = PATROLS.map((route, i) => ({
    x: route[0].x, y: route[0].y, route, leg: 0, pause: 0,
    facing: Math.atan2(route[1].y - route[0].y, route[1].x - route[0].x),
    range: GUARD.coneRange, halfAngle: GUARD.coneHalfAngle,
    sweepSeed: i * 1.7, alert: 0, kind: 'guard',
  }));
  const cameras = CAMERAS.map((c) => ({
    x: c.x, y: c.y, baseAngle: c.baseAngle, phase: c.phase,
    facing: c.baseAngle, range: CAMERA.coneRange, halfAngle: CAMERA.coneHalfAngle,
    disabled: 0, kind: 'camera',
  }));
  return {
    time: 0,
    thief: { x: THIEF.start.x, y: THIEF.start.y, facing: 0, moving: false, sneaking: false },
    guards,
    cameras,
    cover: COVER,
    vaultWalls: buildVaultWalls(),
    star: { ...STAR, taken: false },
    bags: CASH_BAGS.map((b) => ({ ...b, taken: false })),
    exit: { ...EXIT_ZONE },
    decoy: null,
  };
}

/** Move a point, stopping at cover, vault walls and the hall border. */
export function moveWithCollision(pos, dx, dy, radius, world) {
  const solids = [...world.cover, ...world.vaultWalls];
  const tryAxis = (nx, ny) => {
    if (nx < 40 + radius || nx > 1240 - radius || ny < 112 + radius || ny > 760 - radius) return false;
    for (const s of solids) {
      const cx = Math.max(s.x, Math.min(nx, s.x + s.w));
      const cy = Math.max(s.y, Math.min(ny, s.y + s.h));
      if (Math.hypot(nx - cx, ny - cy) < radius) return false;
    }
    return true;
  };
  if (tryAxis(pos.x + dx, pos.y)) pos.x += dx;
  if (tryAxis(pos.x, pos.y + dy)) pos.y += dy;
}

/** Step one guard along his patrol; a decoy or a glimpse turns his head. */
export function stepGuard(guard, dt, world) {
  const target = guard.route[(guard.leg + 1) % guard.route.length];
  if (guard.pause > 0) {
    guard.pause -= dt;
    guard.facing += Math.sin(world.time * 1.4 + guard.sweepSeed) * dt * 0.7;
    return;
  }
  let goal = target;
  if (world.decoy && Math.hypot(world.decoy.x - guard.x, world.decoy.y - guard.y) < 280) {
    goal = world.decoy;
  }
  const dx = goal.x - guard.x;
  const dy = goal.y - guard.y;
  const dist = Math.hypot(dx, dy);
  if (world.decoy && dist < 30) { guard.pause = Math.max(guard.pause, 0.4); return; }
  if (!world.decoy && dist < 8) {
    guard.leg = (guard.leg + 1) % guard.route.length;
    guard.pause = GUARD.pauseSeconds;
    return;
  }
  const wanted = Math.atan2(dy, dx);
  guard.facing += Math.max(-3.2 * dt, Math.min(3.2 * dt, angleDelta(guard.facing, wanted)));
  const speed = world.decoy ? GUARD.patrolSpeed * 1.25 : GUARD.patrolSpeed;
  guard.x += Math.cos(guard.facing) * Math.min(speed * dt, dist);
  guard.y += Math.sin(guard.facing) * Math.min(speed * dt, dist);
}

/** Cameras sweep on a slow sine; an EMP holds them dark for a few seconds. */
export function stepCamera(camera, dt, world) {
  if (camera.disabled > 0) camera.disabled -= dt;
  camera.facing = camera.baseAngle + Math.sin(world.time * CAMERA.sweepSpeed + camera.phase) * CAMERA.sweepArc;
}

export function stepWorld(world, dt) {
  world.time += dt;
  for (const g of world.guards) stepGuard(g, dt, world);
  for (const c of world.cameras) stepCamera(c, dt, world);
  if (world.decoy) {
    world.decoy.life -= dt;
    if (world.decoy.life <= 0) world.decoy = null;
  }
}

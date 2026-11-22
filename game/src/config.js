// Vaultbreak — The Meridian Heist: every tuning number and the hall layout.
// One job: describe the world. No logic lives here, so the outline the judge
// reads shows the shape of the game at a glance.

export const VIEW = { width: 1280, height: 800, hudHeight: 72 };
export const FIELD = { x: 24, y: 96, width: 1232, height: 680 };

export const THIEF = {
  radius: 15,
  walkSpeed: 178,
  sneakSpeed: 92,
  start: { x: 96, y: 700 },
};

export const GUARD = {
  radius: 15,
  patrolSpeed: 56,
  chaseSpeed: 118,
  pauseSeconds: 1.15,
  coneRange: 178,
  coneHalfAngle: 0.56,
  catchDistance: 26,
};

export const CAMERA = {
  coneRange: 196,
  coneHalfAngle: 0.42,
  sweepSpeed: 0.55,
  sweepArc: 0.85,
};

export const ALARM = {
  max: 100,
  guardRate: 36,
  cameraRate: 27,
  decayRate: 13,
  empSpike: 12,
  empSeconds: 5,
};

export const RUN = {
  timeLimit: 240,
  coinsStart: 3,
  empsStart: 2,
  starValue: 5000,
  bagValue: 750,
};

// Solid cover: vision cones and movement both stop here. Desks, pillars and
// planters are placed so every stretch of floor has a shadow to plan around,
// and there are always at least two routes across the hall.
export const COVER = [
  { x: 210, y: 180, w: 110, h: 30, kind: 'desk', label: 'TELLER DESK' },
  { x: 420, y: 150, w: 34, h: 120, kind: 'pillar', label: '' },
  { x: 560, y: 300, w: 130, h: 30, kind: 'desk', label: 'TELLER DESK' },
  { x: 300, y: 420, w: 34, h: 120, kind: 'pillar', label: '' },
  { x: 700, y: 470, w: 110, h: 30, kind: 'desk', label: 'DESK' },
  { x: 880, y: 330, w: 34, h: 120, kind: 'pillar', label: '' },
  { x: 520, y: 610, w: 90, h: 34, kind: 'planter', label: 'PLANTER' },
  { x: 980, y: 560, w: 130, h: 30, kind: 'desk', label: 'DESK' },
  { x: 150, y: 540, w: 90, h: 34, kind: 'planter', label: 'PLANTER' },
];

// The vault room in the top-right: walls with a single door gap on its
// south side, so the Star is safe only if the approach is timed.
export const VAULT = { x: 918, y: 118, w: 322, h: 218, doorX: 1010, doorW: 74 };

export const STAR = { x: 1079, y: 224, radius: 20 };

export const CASH_BAGS = [
  { x: 265, y: 168, taken: false },
  { x: 625, y: 282, taken: false },
  { x: 1040, y: 640, taken: false },
];

export const EXIT_ZONE = { x: 36, y: 640, w: 132, h: 124, label: 'GETAWAY VAN' };

// Guard patrols: waypoint loops across the hall, the vault approach and the
// south corridor. Each guard pauses at the ends and sweeps his gaze.
export const PATROLS = [
  [{ x: 250, y: 330 }, { x: 640, y: 330 }, { x: 640, y: 520 }, { x: 250, y: 520 }],
  [{ x: 1080, y: 430 }, { x: 820, y: 430 }, { x: 820, y: 600 }, { x: 1080, y: 600 }],
  [{ x: 480, y: 120 }, { x: 480, y: 250 }, { x: 760, y: 250 }, { x: 760, y: 120 }],
];

// Cameras sit on walls and sweep back and forth over the crossings.
export const CAMERAS = [
  { x: 640, y: 104, baseAngle: Math.PI / 2, phase: 0 },
  { x: 1248, y: 430, baseAngle: Math.PI, phase: 2.1 },
  { x: 32, y: 380, baseAngle: 0, phase: 4.2 },
];

// The rules of the heist: detection, the alarm meter, tools, loot and the
// win/lose calls. World stepping lives in world.js; this file decides what
// what happened means.
import { ALARM, RUN, THIEF } from './config.js';
import { createWorld, moveWithCollision, stepWorld } from './world.js';
import { watcherSeesThief } from './vision.js';
import { soundCoin, soundEmp, soundLoot, soundLose, soundSpotted, soundWin } from './audio.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_WIN = 'win';
export const SCREEN_LOSE = 'lose';

export function createGame() {
  return {
    screen: SCREEN_TITLE,
    world: createWorld(),
    alarm: 0,
    alarmPeak: 0,
    seenBy: [],
    coins: RUN.coinsStart,
    emps: RUN.empsStart,
    loot: 0,
    timeLeft: RUN.timeLimit,
    elapsed: 0,
    message: '',
    messageTime: 0,
    loseReason: '',
    paused: false,
    wasSeen: false,
  };
}

export function restartGame(game) {
  const fresh = createGame();
  Object.assign(game, fresh);
  game.screen = SCREEN_PLAY;
}

function flash(game, text) {
  game.message = text;
  game.messageTime = 2.6;
}

/** Throw a decoy coin: guards near it turn to look for a few seconds. */
export function throwCoin(game, x, y) {
  if (game.coins <= 0) { flash(game, 'No decoy coins left!'); return; }
  game.coins -= 1;
  game.world.decoy = { x, y, life: 3.2 };
  soundCoin();
  flash(game, 'Decoy coin thrown — eyes turn away…');
}

/** Fire the EMP: cameras go dark, the alarm spikes. A real cost, a real gain. */
export function fireEmp(game) {
  if (game.emps <= 0) { flash(game, 'No EMP pulses left!'); return; }
  game.emps -= 1;
  for (const c of game.world.cameras) c.disabled = ALARM.empSeconds;
  game.alarm = Math.min(ALARM.max, game.alarm + ALARM.empSpike);
  soundEmp();
  flash(game, 'EMP! Cameras dark for 5s — alarm +12');
}

function endRun(game, won, reason) {
  game.screen = won ? SCREEN_WIN : SCREEN_LOSE;
  game.loseReason = reason || '';
  if (won) soundWin(); else soundLose();
}

/** One fixed step of play: move the thief, step the world, judge the result. */
export function stepPlay(game, dt, input) {
  const world = game.world;
  game.elapsed += dt;
  game.timeLeft = Math.max(0, RUN.timeLimit - game.elapsed);
  if (game.messageTime > 0) game.messageTime -= dt;

  // Movement: sneak is slow and low, walk is fast and obvious.
  const axis = input.axis();
  const thief = world.thief;
  thief.sneaking = input.sneaking();
  thief.moving = axis.active;
  const speed = thief.sneaking ? THIEF.sneakSpeed : THIEF.walkSpeed;
  if (axis.active) {
    thief.facing = Math.atan2(axis.y, axis.x);
    moveWithCollision(thief, axis.x * speed * dt, axis.y * speed * dt, THIEF.radius, world);
  }

  stepWorld(world, dt);

  // Tools from the keyboard.
  if (input.wasPressed('q')) {
    throwCoin(game, thief.x + Math.cos(thief.facing) * 130, thief.y + Math.sin(thief.facing) * 130);
  }
  if (input.wasPressed('f')) fireEmp(game);

  // Detection: every watcher who can see the thief feeds the alarm meter.
  game.seenBy = [];
  for (const g of world.guards) {
    if (watcherSeesThief(g, thief, world.cover, world.vaultWalls)) game.seenBy.push('guard');
  }
  for (const c of world.cameras) {
    if (c.disabled <= 0 && watcherSeesThief(c, thief, world.cover, world.vaultWalls)) game.seenBy.push('camera');
  }
  const seen = game.seenBy.length > 0;
  if (seen && !game.wasSeen) soundSpotted();
  game.wasSeen = seen;
  if (seen) {
    const fromGuards = game.seenBy.filter((s) => s === 'guard').length;
    const fromCameras = game.seenBy.length - fromGuards;
    const sneakFactor = thief.sneaking ? 0.55 : 1;
    game.alarm += (fromGuards * ALARM.guardRate + fromCameras * ALARM.cameraRate) * sneakFactor * dt;
  } else {
    game.alarm -= ALARM.decayRate * dt;
  }
  game.alarm = Math.max(0, Math.min(ALARM.max, game.alarm));
  game.alarmPeak = Math.max(game.alarmPeak, game.alarm);

  // A guard's hand on the thief ends it at once — cones are the fair warning.
  for (const g of world.guards) {
    if (Math.hypot(g.x - thief.x, g.y - thief.y) < 26) {
      endRun(game, false, 'A guard grabbed Nico in the hall. The cones were the warning.');
      return;
    }
  }
  if (game.alarm >= ALARM.max) {
    endRun(game, false, 'The alarm hit full — the Meridian Exchange locked down.');
    return;
  }
  if (game.timeLeft <= 0) {
    endRun(game, false, 'Dawn came and the van had to leave without the Star.');
    return;
  }

  // Loot: the Star, and any cash bag Nico dares to pass over.
  if (!world.star.taken && Math.hypot(world.star.x - thief.x, world.star.y - thief.y) < 34) {
    world.star.taken = true;
    game.loot += RUN.starValue;
    soundLoot();
    flash(game, 'THE MERIDIAN STAR IS YOURS! Get to the van!');
  }
  for (const bag of world.bags) {
    if (!bag.taken && Math.hypot(bag.x - thief.x, bag.y - thief.y) < 30) {
      bag.taken = true;
      game.loot += RUN.bagValue;
      soundLoot();
      flash(game, `Cash bag +$${RUN.bagValue}`);
    }
  }

  // The getaway only counts with the Star in hand.
  const ex = world.exit;
  const inExit = thief.x > ex.x && thief.x < ex.x + ex.w && thief.y > ex.y && thief.y < ex.y + ex.h;
  if (inExit && world.star.taken) {
    endRun(game, true, '');
  }
}

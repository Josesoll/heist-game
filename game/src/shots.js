// Deterministic screenshot scenes, reached with ?shot=<name>.
// Each scene places the real actors of a real game, steps the real world
// forward a fixed amount, and leaves the frame exactly as a player would
// see it mid-run — the screenshots are renders of this code, nothing staged
// in an editor.
import { createGame, SCREEN_PLAY, SCREEN_WIN } from './game.js';

/** Fixed world steps so every capture of a scene is the same frame. */
function settle(game, seconds) {
  const dt = 1 / 60;
  const world = game.world;
  for (let i = 0; i < Math.round(seconds / dt); i += 1) {
    world.time += dt;
    for (const c of world.cameras) {
      c.facing = c.baseAngle + Math.sin(world.time * 0.55 + c.phase) * 0.85;
    }
  }
}

/** The cover frame: thief mid-crossing, every required element in view. */
export function stageHeistShot(game) {
  Object.assign(game, createGame());
  game.screen = SCREEN_PLAY;
  const w = game.world;
  w.thief.x = 505; w.thief.y = 452; w.thief.facing = 0.4;
  w.guards[0].x = 420; w.guards[0].y = 330; w.guards[0].facing = 2.6;
  w.guards[1].x = 950; w.guards[1].y = 520; w.guards[1].facing = Math.PI;
  w.guards[2].x = 700; w.guards[2].y = 170; w.guards[2].facing = 0.5;
  game.alarm = 34;
  game.loot = 750;
  w.bags[0].taken = true;
  game.timeLeft = 183;
  game.elapsed = 57;
  settle(game, 1.2);
}

/** Sneaking in a camera's blind moment, close to the vault door. */
export function stageSneakShot(game) {
  Object.assign(game, createGame());
  game.screen = SCREEN_PLAY;
  const w = game.world;
  w.thief.x = 872; w.thief.y = 392; w.thief.sneaking = true; w.thief.facing = 0.9;
  w.guards[0].x = 300; w.guards[0].y = 500; w.guards[0].facing = 0.2;
  w.guards[1].x = 1080; w.guards[1].y = 600; w.guards[1].facing = -1.8;
  w.guards[2].x = 560; w.guards[2].y = 200; w.guards[2].facing = 2.9;
  w.decoy = { x: 240, y: 300, life: 2.5 };
  game.coins = 2;
  game.alarm = 12;
  game.timeLeft = 141;
  game.elapsed = 99;
  settle(game, 2.4);
}

/** At the Star itself, alarm climbing — the tense second of the grab. */
export function stageLootShot(game) {
  Object.assign(game, createGame());
  game.screen = SCREEN_PLAY;
  const w = game.world;
  w.thief.x = 1028; w.thief.y = 268; w.thief.facing = -0.8;
  w.guards[0].x = 620; w.guards[0].y = 340; w.guards[0].facing = 1.2;
  w.guards[1].x = 900; w.guards[1].y = 470; w.guards[1].facing = -2.2;
  w.guards[2].x = 480; w.guards[2].y = 130; w.guards[2].facing = 0.1;
  game.alarm = 58;
  game.seenBy = ['camera'];
  game.message = 'Grab the Star — then RUN for the van!';
  game.messageTime = 99;
  game.timeLeft = 96;
  game.elapsed = 144;
  settle(game, 0.6);
}

/** The payoff frame: Star in hand, van reached, getaway screen over the hall. */
export function stageWinShot(game) {
  stageHeistShot(game);
  const w = game.world;
  w.star.taken = true;
  w.thief.x = 110; w.thief.y = 690;
  game.loot = 5750;
  game.alarm = 22;
  game.alarmPeak = 71;
  game.elapsed = 132;
  game.screen = SCREEN_WIN;
}

/** Pick a scene by name; unknown names fall back to the cover frame. */
export function stageShot(game, name) {
  if (name === 'sneak') stageSneakShot(game);
  else if (name === 'loot') stageLootShot(game);
  else if (name === 'win') stageWinShot(game);
  else stageHeistShot(game);
}

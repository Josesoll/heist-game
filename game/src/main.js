// Boot and frame loop: wire the canvas, input and screens together.
// A ?shot=<name> URL freezes a staged scene for screenshots; normal play
// runs the fixed-step loop below.
import { createGame, restartGame, stepPlay, throwCoin, SCREEN_LOSE, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './game.js';
import { createInput } from './input.js';
import { drawGame } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const game = createGame();
const input = createInput(canvas);

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
if (shotName) {
  stageShot(game, shotName);
  drawGame(ctx, game);
  document.title = `Vaultbreak — shot ${shotName}`;
} else {
  let last = performance.now();
  let acc = 0;
  const STEP = 1 / 60;

  function frame(now) {
    requestAnimationFrame(frame);
    acc += Math.min(0.1, (now - last) / 1000);
    last = now;
    while (acc >= STEP) {
      acc -= STEP;
      handleScreenKeys();
      if (game.screen === SCREEN_PLAY && !game.paused) stepPlay(game, STEP, input);
    }
    drawGame(ctx, game);
    if (status) {
      status.textContent = game.screen === SCREEN_PLAY
        ? `Alarm ${Math.round(game.alarm)} percent. Loot ${game.loot} dollars.`
        : `Vaultbreak: ${game.screen}`;
    }
  }

  function handleScreenKeys() {
    const clicked = input.takeClick();
    if (input.wasPressed('p') || input.wasPressed('escape')) {
      if (game.screen === SCREEN_PLAY) game.paused = !game.paused;
    }
    if (game.screen === SCREEN_TITLE && (clicked || input.wasPressed('enter'))) {
      restartGame(game);
      return;
    }
    if ((game.screen === SCREEN_WIN || game.screen === SCREEN_LOSE) && (clicked || input.wasPressed('r') || input.wasPressed('enter'))) {
      restartGame(game);
      return;
    }
    if (game.screen === SCREEN_PLAY) {
      if (input.wasPressed('r')) { restartGame(game); return; }
      // A click during play is a decoy toss, unless it lands on the HUD.
      if (clicked && clicked.y > 76 && !game.paused) throwCoin(game, clicked.x, clicked.y);
    }
  }

  requestAnimationFrame(frame);
}

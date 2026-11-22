// All drawing: the marble hall, vault, cover, vision cones, cameras, loot,
// the thief, and the HUD with its alarm meter. Nothing here changes state —
// render.js only shows what world.js and game.js decided.
import { FIELD, VAULT, VIEW } from './config.js';
import { SCREEN_LOSE, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './game.js';
import { conePolygon } from './vision.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawCone(ctx, watcher, colour) {
  const pts = conePolygon(watcher.x, watcher.y, watcher.facing, watcher.range, watcher.halfAngle);
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fillStyle = colour;
  ctx.fill();
}

function drawFloor(ctx, world) {
  ctx.fillStyle = '#101826';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  // Marble hall: large checker tiles with a gold runner down the middle.
  const tile = 56;
  for (let y = FIELD.y; y < FIELD.y + FIELD.height; y += tile) {
    for (let x = FIELD.x; x < FIELD.x + FIELD.width; x += tile) {
      const odd = ((x - FIELD.x) / tile + (y - FIELD.y) / tile) % 2 === 0;
      ctx.fillStyle = odd ? '#1b2740' : '#162136';
      ctx.fillRect(x, y, tile, tile);
    }
  }
  ctx.fillStyle = 'rgba(212,175,55,0.10)';
  ctx.fillRect(FIELD.x, 392, FIELD.width, 72);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 3;
  ctx.strokeRect(FIELD.x, FIELD.y, FIELD.width, FIELD.height);
  ctx.fillStyle = '#8fa3c8';
  ctx.font = '700 15px system-ui, sans-serif';
  ctx.fillText('MERIDIAN EXCHANGE — BANKING HALL', FIELD.x + 16, FIELD.y + 24);
}

function drawVault(ctx, world) {
  const v = VAULT;
  ctx.fillStyle = '#2a2118';
  ctx.fillRect(v.x, v.y, v.w, v.h);
  ctx.fillStyle = 'rgba(212,175,55,0.13)';
  ctx.fillRect(v.x + 12, v.y + 12, v.w - 24, v.h - 24);
  for (const w of world.vaultWalls) {
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(w.x, w.y, w.w, w.h);
  }
  ctx.fillStyle = '#ffe98a';
  ctx.font = '800 17px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★ VAULT ★', v.x + v.w / 2, v.y + 34);
  ctx.textAlign = 'left';
  // Door gap marker
  ctx.fillStyle = '#57e6a9';
  ctx.fillRect(v.doorX, v.y + v.h - 6, v.doorW, 6);
}

function drawCover(ctx, world) {
  for (const c of world.cover) {
    ctx.fillStyle = c.kind === 'pillar' ? '#3d4f73' : c.kind === 'planter' ? '#2c5a3a' : '#54432a';
    rr(ctx, c.x, c.y, c.w, c.h, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (c.label) {
      ctx.fillStyle = '#d8e2f2';
      ctx.font = '700 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.label, c.x + c.w / 2, c.y + c.h / 2 + 3);
      ctx.textAlign = 'left';
    }
  }
}

function drawExit(ctx, world) {
  const e = world.exit;
  ctx.fillStyle = '#123524';
  rr(ctx, e.x, e.y, e.w, e.h, 10);
  ctx.fill();
  ctx.strokeStyle = '#57e6a9';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = '#57e6a9';
  ctx.font = '900 28px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🚐', e.x + e.w / 2, e.y + 52);
  ctx.font = '800 13px system-ui, sans-serif';
  ctx.fillText('GETAWAY VAN', e.x + e.w / 2, e.y + 78);
  ctx.font = '700 11px system-ui, sans-serif';
  ctx.fillText(world.star.taken ? 'ESCAPE HERE!' : 'EXIT — NEED STAR', e.x + e.w / 2, e.y + 98);
  ctx.textAlign = 'left';
}

function drawLoot(ctx, world, time) {
  // Cash bags: green sacks with a $ — small, tempting, optional.
  for (const bag of world.bags) {
    if (bag.taken) continue;
    ctx.fillStyle = '#2fae5f';
    ctx.beginPath();
    ctx.arc(bag.x, bag.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#eafff1';
    ctx.font = '900 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('$', bag.x, bag.y + 5);
    ctx.textAlign = 'left';
  }
  // The Meridian Star: the glowing heart of the screenshot.
  if (!world.star.taken) {
    const s = world.star;
    const pulse = 1 + Math.sin(time * 4) * 0.12;
    const glow = ctx.createRadialGradient(s.x, s.y, 4, s.x, s.y, 58 * pulse);
    glow.addColorStop(0, 'rgba(255,233,138,0.95)');
    glow.addColorStop(0.45, 'rgba(255,190,40,0.45)');
    glow.addColorStop(1, 'rgba(255,190,40,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 58 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd83d';
    ctx.font = `${Math.round(44 * pulse)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('◆', s.x, s.y + 16);
    ctx.fillStyle = '#fff3b0';
    ctx.font = '900 13px system-ui, sans-serif';
    ctx.fillText('MERIDIAN STAR — LOOT $5,000', s.x, s.y + 52);
    ctx.textAlign = 'left';
  }
}

function drawGuardsAndCameras(ctx, world, game) {
  // Camera cones first (red), then guard cones (amber): danger reads at once.
  for (const c of world.cameras) {
    if (c.disabled <= 0) drawCone(ctx, c, 'rgba(255,64,64,0.20)');
  }
  for (const g of world.guards) {
    drawCone(ctx, g, game.seenBy.includes('guard') ? 'rgba(255,170,30,0.42)' : 'rgba(255,200,60,0.26)');
  }
  for (const c of world.cameras) {
    ctx.fillStyle = c.disabled > 0 ? '#555f6e' : '#ff4545';
    rr(ctx, c.x - 11, c.y - 11, 22, 22, 5);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '900 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CAM', c.x, c.y + 4);
    ctx.textAlign = 'left';
    if (c.disabled > 0) {
      ctx.fillStyle = '#ffd83d';
      ctx.font = '800 11px system-ui, sans-serif';
      ctx.fillText('OFF', c.x - 12, c.y - 16);
    }
  }
  for (const g of world.guards) {
    ctx.fillStyle = '#b3313a';
    ctx.beginPath();
    ctx.arc(g.x, g.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd9a0';
    ctx.beginPath();
    ctx.arc(g.x, g.y - 3, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c2f57';
    ctx.fillRect(g.x - 8, g.y - 13, 16, 5);
    ctx.fillStyle = '#fff';
    ctx.font = '800 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GUARD', g.x, g.y + 28);
    ctx.textAlign = 'left';
  }
}

function drawThief(ctx, world) {
  const t = world.thief;
  // Soft shadow ring so the thief pops against the marble.
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.arc(t.x, t.y + 3, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = t.sneaking ? '#274b63' : '#38b6d9';
  ctx.beginPath();
  ctx.arc(t.x, t.y, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#eafcff';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = '#10222e';
  ctx.beginPath();
  ctx.arc(t.x, t.y - 3, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '900 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(t.sneaking ? 'THIEF · SNEAKING' : 'THIEF', t.x, t.y + 30);
  ctx.textAlign = 'left';
  if (world.star.taken) {
    ctx.fillStyle = '#ffd83d';
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillText('◆', t.x + 10, t.y - 12);
  }
}

function drawDecoy(ctx, world) {
  if (!world.decoy) return;
  ctx.fillStyle = '#ffd83d';
  ctx.beginPath();
  ctx.arc(world.decoy.x, world.decoy.y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7a5b00';
  ctx.font = '900 10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('¢', world.decoy.x, world.decoy.y + 3);
  ctx.textAlign = 'left';
}

export function drawAlarmMeter(ctx, game, x, y, w) {
  ctx.fillStyle = '#0b1220';
  rr(ctx, x, y, w, 30, 8);
  ctx.fill();
  ctx.strokeStyle = game.alarm > 66 ? '#ff4545' : game.alarm > 33 ? '#ffb02e' : '#3ddc84';
  ctx.lineWidth = 2;
  ctx.stroke();
  const fill = (w - 8) * (game.alarm / 100);
  ctx.fillStyle = game.alarm > 66 ? '#ff4545' : game.alarm > 33 ? '#ffb02e' : '#3ddc84';
  if (fill > 2) { rr(ctx, x + 4, y + 4, fill, 22, 6); ctx.fill(); }
  ctx.fillStyle = '#fff';
  ctx.font = '900 15px system-ui, sans-serif';
  ctx.fillText(`🚨 ALARM ${Math.round(game.alarm)}%`, x + 12, y + 21);
}

export function drawHud(ctx, game) {
  ctx.fillStyle = '#0a0f1a';
  ctx.fillRect(0, 0, VIEW.width, VIEW.hudHeight);
  ctx.fillStyle = '#ffd83d';
  ctx.font = '900 24px system-ui, sans-serif';
  ctx.fillText('VAULTBREAK', 20, 32);
  ctx.fillStyle = '#9fb4d8';
  ctx.font = '700 12px system-ui, sans-serif';
  ctx.fillText('THE MERIDIAN HEIST', 20, 54);
  drawAlarmMeter(ctx, game, 250, 20, 300);
  ctx.fillStyle = '#fff';
  ctx.font = '800 17px system-ui, sans-serif';
  ctx.fillText(`💰 LOOT $${game.loot.toLocaleString()}`, 580, 42);
  const mm = Math.floor(Math.max(0, game.timeLeft) / 60);
  const ss = String(Math.floor(Math.max(0, game.timeLeft) % 60)).padStart(2, '0');
  ctx.fillText(`⏱ ${mm}:${ss}`, 790, 42);
  ctx.fillText(`🪙 x${game.coins}`, 900, 42);
  ctx.fillText(`⚡EMP x${game.emps}`, 1010, 42);
  ctx.fillStyle = game.world.star.taken ? '#57e6a9' : '#ffd83d';
  ctx.font = '800 14px system-ui, sans-serif';
  ctx.fillText(game.world.star.taken ? '★ STAR TAKEN — RUN!' : '★ STEAL THE STAR', 1120, 42);
  if (game.seenBy.length > 0) {
    ctx.fillStyle = '#ff4545';
    ctx.font = '900 19px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚠ SPOTTED! BREAK LINE OF SIGHT ⚠', VIEW.width / 2, VIEW.height - 14);
    ctx.textAlign = 'left';
  } else if (game.messageTime > 0 && game.message) {
    ctx.fillStyle = '#ffe98a';
    ctx.font = '800 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(game.message, VIEW.width / 2, VIEW.height - 14);
    ctx.textAlign = 'left';
  }
}

function drawOverlay(ctx, game) {
  ctx.fillStyle = 'rgba(5,8,16,0.72)';
  ctx.fillRect(0, VIEW.hudHeight, VIEW.width, VIEW.height - VIEW.hudHeight);
  ctx.textAlign = 'center';
  if (game.screen === SCREEN_TITLE) {
    ctx.fillStyle = '#ffd83d';
    ctx.font = '900 62px system-ui, sans-serif';
    ctx.fillText('VAULTBREAK', VIEW.width / 2, 300);
    ctx.fillStyle = '#fff';
    ctx.font = '800 24px system-ui, sans-serif';
    ctx.fillText('THE MERIDIAN HEIST — steal the Star, dodge every cone, reach the van', VIEW.width / 2, 348);
    ctx.font = '600 19px system-ui, sans-serif';
    ctx.fillText('WASD / Arrows move · Shift sneak · Click = decoy coin · F = EMP · E is automatic', VIEW.width / 2, 398);
    ctx.fillText('Yellow cones = guards · Red cones = cameras · Cover blocks sight', VIEW.width / 2, 432);
    ctx.fillStyle = '#57e6a9';
    ctx.font = '900 26px system-ui, sans-serif';
    ctx.fillText('CLICK OR PRESS ENTER TO START', VIEW.width / 2, 500);
  } else if (game.screen === SCREEN_WIN) {
    ctx.fillStyle = '#57e6a9';
    ctx.font = '900 58px system-ui, sans-serif';
    ctx.fillText('CLEAN GETAWAY! 🏆', VIEW.width / 2, 300);
    ctx.fillStyle = '#fff';
    ctx.font = '800 24px system-ui, sans-serif';
    ctx.fillText(`Loot $${game.loot.toLocaleString()} · Time ${Math.round(game.elapsed)}s · Peak alarm ${Math.round(game.alarmPeak)}%`, VIEW.width / 2, 356);
    ctx.fillText('Nico vanishes into the night with the Meridian Star.', VIEW.width / 2, 396);
    ctx.fillStyle = '#ffd83d';
    ctx.font = '900 24px system-ui, sans-serif';
    ctx.fillText('PRESS R OR CLICK TO PLAY AGAIN', VIEW.width / 2, 470);
  } else if (game.screen === SCREEN_LOSE) {
    ctx.fillStyle = '#ff5964';
    ctx.font = '900 58px system-ui, sans-serif';
    ctx.fillText('BUSTED! 🚨', VIEW.width / 2, 300);
    ctx.fillStyle = '#fff';
    ctx.font = '700 21px system-ui, sans-serif';
    ctx.fillText(game.loseReason, VIEW.width / 2, 356);
    ctx.fillText(`Loot carried: $${game.loot.toLocaleString()} · Peak alarm ${Math.round(game.alarmPeak)}%`, VIEW.width / 2, 396);
    ctx.fillStyle = '#ffd83d';
    ctx.font = '900 24px system-ui, sans-serif';
    ctx.fillText('PRESS R OR CLICK TO TRY AGAIN', VIEW.width / 2, 470);
  }
  ctx.textAlign = 'left';
}

/** Draw one whole frame: scene, actors, HUD, and any end overlay. */
export function drawGame(ctx, game) {
  const world = game.world;
  drawFloor(ctx, world);
  drawVault(ctx, world);
  drawExit(ctx, world);
  drawCover(ctx, world);
  drawLoot(ctx, world, world.time);
  drawGuardsAndCameras(ctx, world, game);
  drawDecoy(ctx, world);
  drawThief(ctx, world);
  drawHud(ctx, game);
  if (game.screen !== SCREEN_PLAY) drawOverlay(ctx, game);
  if (game.paused && game.screen === SCREEN_PLAY) {
    ctx.fillStyle = 'rgba(5,8,16,0.6)';
    ctx.fillRect(0, VIEW.hudHeight, VIEW.width, VIEW.height - VIEW.hudHeight);
    ctx.fillStyle = '#fff';
    ctx.font = '900 44px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', VIEW.width / 2, 420);
    ctx.textAlign = 'left';
  }
}

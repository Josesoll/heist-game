[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/Josesoll/heist-game/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/Josesoll/heist-game/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

# Vaultbreak — The Meridian Heist

An original top-down stealth heist game that runs entirely from static files
in a desktop browser. No build step, no network requests.

You are **Nico Vale**, a quiet professional hired to lift the **Meridian Star**,
a gold-and-teal gem locked in the vault of the Meridian Exchange. Cross the
marble banking hall, read the guards' patrols and the sweeping cameras, stay
out of every vision cone, grab the Star (and any cash bags you dare), and get
back to the getaway van before the alarm meter fills.

## How to play

- **Move:** WASD or arrow keys
- **Sneak:** hold Shift — slower, but you are harder to spot up close
- **Grab loot / use exit:** E, or walk onto it
- **Throw a decoy coin:** click anywhere, or press Q — guards turn to look
  (you carry 3 coins; a coin costs nothing but its noise pulls eyes your way)
- **EMP pulse:** F — kills the cameras for 5 seconds, but spikes the alarm
  by 12 (you carry 2 pulses)
- **Restart:** R &nbsp;•&nbsp; **Pause:** P or Esc

Being seen fills the **ALARM** meter. Hide and it drains. A full meter — or a
guard laying a hand on you — ends the run. Pillars, desks and planters are
cover: vision cones stop at them, so plan a route that keeps something solid
between you and every cone.

## Run it locally

```sh
node serve.ts
# then open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/`
to the output folder and writes `dossier.json` with the vendored
`vendor/makefun-game.ts` library, exactly as the make.fun kit requires.

## Layout

- `game/index.html` — the page, canvas and HUD shell
- `game/src/config.js` — hall layout, patrols, tuning
- `game/src/vision.js` — vision cones and line of sight
- `game/src/world.js` — guards, cameras, loot and cover state
- `game/src/render.js` — all drawing: floor, cones, HUD, alarm meter
- `game/src/game.js` — rules: detection, alarm, tools, win and lose
- `game/src/input.js` — keyboard and mouse
- `game/src/audio.js` — small original WebAudio bleeps, no audio files
- `game/src/shots.js` — deterministic scenes for the screenshots
- `game/src/main.js` — the frame loop

All art is drawn in code, all sounds are synthesized, and every name is
original to this game.

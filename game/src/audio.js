// Original synthesized sound: tiny WebAudio bleeps, no audio files at all.
// Every tone is a plain oscillator shape written for this game.

let ctx = null;

function tone(freq, seconds, type, gain, slideTo) {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + seconds);
    amp.gain.setValueAtTime(gain, ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + seconds);
    osc.connect(amp).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + seconds);
  } catch { /* sound is a garnish; silence never breaks the heist */ }
}

export function soundCoin() { tone(1180, 0.09, 'square', 0.05); setTimeout(() => tone(1560, 0.12, 'square', 0.05), 55); }
export function soundLoot() { tone(660, 0.1, 'triangle', 0.09); setTimeout(() => tone(990, 0.16, 'triangle', 0.09), 80); }
export function soundSpotted() { tone(220, 0.16, 'sawtooth', 0.06, 330); }
export function soundEmp() { tone(1400, 0.28, 'sawtooth', 0.05, 120); }
export function soundWin() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.18, 'triangle', 0.08), i * 110)); }
export function soundLose() { tone(320, 0.5, 'sawtooth', 0.07, 70); }

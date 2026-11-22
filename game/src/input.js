// Keyboard and mouse: WASD/arrows to move, Shift to sneak, click to toss a
// decoy coin where the pointer is, plus the one-key tools and restarts.

export function createInput(canvas) {
  const keys = new Set();
  const input = {
    keys,
    clickedAt: null,
    pressed: new Set(),
    axis() {
      let x = 0; let y = 0;
      if (keys.has('arrowleft') || keys.has('a')) x -= 1;
      if (keys.has('arrowright') || keys.has('d')) x += 1;
      if (keys.has('arrowup') || keys.has('w')) y -= 1;
      if (keys.has('arrowdown') || keys.has('s')) y += 1;
      const len = Math.hypot(x, y) || 1;
      return { x: x / len, y: y / len, active: x !== 0 || y !== 0 };
    },
    sneaking() { return keys.has('shift'); },
    takeClick() { const c = input.clickedAt; input.clickedAt = null; return c; },
    wasPressed(code) {
      if (!input.pressed.has(code)) return false;
      input.pressed.delete(code);
      return true;
    },
  };

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if (!keys.has(k)) input.pressed.add(k);
    keys.add(k);
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur', () => keys.clear());

  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    input.clickedAt = {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
    input.pressed.add('click');
  });
  return input;
}

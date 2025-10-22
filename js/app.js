// core engine: hi-dpi, undo/redo, pointer-events
window.core = (() => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  let painting = false;
  let lastX = 0, lastY = 0;
  
  /* 0.1 Утилиты */
const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

  /* 0. Заглушка до загрузки main.js (чтобы не было ReferenceError) */
  window.drawBrush = () => {};

  /* 1. Отключаем поведение Safari «только стилус» */
  canvas.style.touchAction = 'none';

  /* 2. Hi-DPI */
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }
  window.addEventListener('resize', resize);
  resize();

  /* 3. Undo/Redo (30 шагов) */
  const history = [];
  let step = -1;
  function saveState() {
    step++;
    if (step < history.length) history.length = step;
    history.push(canvas.toDataURL());
    if (history.length > 30) history.shift(), step--;
  }
  window.undo = () => {
    if (step > 0) {
      step--;
      const img = new Image();
      img.src = history[step];
      img.onload = () => (ctx.clearRect(0, 0, canvas.width, canvas.height), ctx.drawImage(img, 0, 0));
    }
  };
  window.redo = () => {
    if (step < history.length - 1) {
      step++;
      const img = new Image();
      img.src = history[step];
      img.onload = () => (ctx.clearRect(0, 0, canvas.width, canvas.height), ctx.drawImage(img, 0, 0));
    }
  };

  /* 4. Pointer-events: ПАЛЕЦ + СТИЛУС (passive: false) */
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  canvas.addEventListener('pointerdown', e => {
    painting = true;
    const p = getPos(e);
    lastX = p.x;
    lastY = p.y;
    window.drawBrush(p.x, p.y, e.pressure || 1);
    saveState();
  }, { passive: false });

  canvas.addEventListener('pointermove', e => {
    if (!painting) return;
    const p = getPos(e);
    window.drawBrush(p.x, p.y, e.pressure || 1);
    lastX = p.x;
    lastY = p.y;
  }, { passive: false });

  window.addEventListener('pointerup', () => {
    painting = false;
    window.lastFigure = null;
    window.lastRuler = null;
  });
  canvas.addEventListener('pointerleave', () => painting = false);

  /* 5. Публичное API */
  return { canvas, ctx, saveState };
})();

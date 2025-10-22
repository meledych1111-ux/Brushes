// js/app.js – минимальное ядро: слои, давление, 120 FPS
(() => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  let painting = false;
  let lastX = 0, lastY = 0;

  /* 0. Утилиты */
  const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

  /* 1. Отключаем поведение Safari «только стилус» */
  canvas.style.touchAction = 'none';

  /* 2. Hi-DPI + размеры */
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight - document.getElementById('toolbar').offsetHeight;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    if (window.Layers) window.Layers.resizeAll();
  }
  window.addEventListener('resize', resize);
  resize();

  /* 3. Плавная линия (интерполяция + давление) */
  window.drawLine = (x1, y1, x2, y2, pressure = 1) => {
    const dx = x2 - x1, dy = y2 - y1;
    const steps = Math.ceil(dist(x1, y1, x2, y2) / 2);
    const baseR = +sizeSlider.value;
    const baseOp = +opacitySlider.value;
    const r = Math.max(1, baseR * pressure);
    const op = Math.max(0.05, baseOp * pressure);
    const color = colorPicker.value;
    const tool = document.getElementById('toolSelect').value;
    const ctx = window.Layers.getActiveCtx();
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + dx * t;
      const y = y1 + dy * t;
      if (tool === 'brush') {
        const key = brushSelect.value;
        window.BRUSHES[key](ctx, x, y, r, color, op);
      } else if (window.Tools[tool]) {
        window.Tools[tool](ctx, x, y, r);
      }
    }
    window.Layers.composeLayers();
  };

  /* 4. ОДИН штрих (давление учтено) */
  window.drawBrush = (x, y, pressure = 1) => {
    const r = Math.max(1, +sizeSlider.value * pressure);
    const op = Math.max(0.05, +opacitySlider.value * pressure);
    const color = colorPicker.value;
    const tool = document.getElementById('toolSelect').value;
    const ctx = window.Layers.getActiveCtx();
    if (tool === 'brush') {
      const key = brushSelect.value;
      window.BRUSHES[key](ctx, x, y, r, color, op);
    } else if (window.Tools[tool]) {
      window.Tools[tool](ctx, x, y, r);
    }
    window.Layers.composeLayers();
  };

  /* 5. Pointer-events: ПАЛЕЦ + СТИЛУС (passive: false) */
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
  }, { passive: false });

  canvas.addEventListener('pointermove', e => {
    if (!painting) return;
    const p = getPos(e);
    window.drawLine(lastX, lastY, p.x, p.y, e.pressure || 1);
    lastX = p.x;
    lastY = p.y;
  }, { passive: false });

  window.addEventListener('pointerup', () => {
    painting = false;
  });
  canvas.addEventListener('pointerleave', () => painting = false);

  /* 6. Контролы */
  const colorPicker = document.getElementById('colorPicker');
  const sizeSlider = document.getElementById('sizeSlider');
  const sizeOut = document.getElementById('sizeOut');
  const brushSelect = document.getElementById('brushSelect');
  const clearBtn = document.getElementById('clearBtn');
  const saveBtn = document.getElementById('saveBtn');

  /* заполняем select */
  Object.keys(window.BRUSHES).forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    brushSelect.appendChild(opt);
  });
  brushSelect.value = 'Круглая';

  sizeSlider.oninput = () => sizeOut.value = sizeSlider.value;

  clearBtn.onclick = () => {
    const ctx = window.Layers.getActiveCtx();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    window.Layers.composeLayers();
  };
  saveBtn.onclick = () => {
    const link = document.createElement('a');
    link.download = 'art_' + Date.now() + '.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  /* 7. Сохранение состояния (30 шагов) */
  window.App = {
    canvas,
    ctx,
    getDpr: () => window.devicePixelRatio || 1,
    saveState: () => {
      const history = window.History || [];
      const step = window.HistoryStep || 0;
      history.length = step;
      history.push(canvas.toDataURL());
      if (history.length > 30) history.shift();
      window.History = history;
      window.HistoryStep = history.length;
    }
  };
})();

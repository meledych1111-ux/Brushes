(() => {
  const color = document.getElementById('colorPicker');
  const size = document.getElementById('sizeSlider');
  const sizeOut = document.getElementById('sizeOut');
  const opacity = document.getElementById('opacitySlider');
  const opacityOut = document.getElementById('opacityOut');
  const brushSelect = document.getElementById('brushSelect');
  const clearBtn = document.getElementById('clearBtn');
  const saveBtn = document.getElementById('saveBtn');
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');

  /* заполняем select 100 кистей */
  Object.keys(window.BRUSHES).forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    brushSelect.appendChild(opt);
  });

  /* рисуем линию интерполированно */
  window.drawLine = (x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1;
    const steps = Math.ceil(Math.hypot(dx, dy) / 2);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      window.drawBrush(x1 + dx * t, y1 + dy * t);
    }
  };

  /* один штрих */
  window.drawBrush = (x, y) => {
    const ctx = window.core.ctx;
    const r = +size.value;
    const col = color.value;
    const op = +opacity.value;
    const key = brushSelect.value;
    window.BRUSHES[key](ctx, x, y, r, col, op);
  };

  /* controls */
  size.oninput = () => sizeOut.value = size.value;
  opacity.oninput = () => opacityOut.value = opacity.value;
  clearBtn.onclick = () => {
    window.core.ctx.clearRect(0, 0, window.core.canvas.width, window.core.canvas.height);
    window.core.saveState();
  };
  saveBtn.onclick = () => {
    const link = document.createElement('a');
    link.download = 'art_' + Date.now() + '.png';
    link.href = window.core.canvas.toDataURL();
    link.click();
  };
  undoBtn.onclick = () => window.undo();
  redoBtn.onclick = () => window.redo();
})();

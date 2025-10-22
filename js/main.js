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
  window.drawLine = (x1, y1, x2, y2, pressure = 1) => {
    const dx = x2 - x1, dy = y2 - y1;
    const steps = Math.ceil(dist(x1, y1, x2, y2) / 2);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      window.drawBrush(x1 + dx * t, y1 + dy * t, pressure);
    }
  };

  /* один штрих с плавным давлением */
  window.drawBrush = (x, y, pressure = 1) => {
    const ctx = window.getActiveCtx();
    const baseR = +size.value;
    const baseOp = +opacity.value;
    // ПЛАВНОЕ ДАВЛЕНИЕ: радиус и прозрачность
    const r = Math.max(1, baseR * pressure);
    const op = Math.max(0.05, baseOp * pressure);
    const col = color.value;

    // линейки (Alt)
    if (window.altPressed && window.lastRuler) {
      const key = document.getElementById('rulerSelect').value;
      if (key !== 'none' && window.EXTRA2[key]) {
        window.EXTRA2[key](ctx, window.lastRuler.x, window.lastRuler.y, x, y, col, op);
        window.composeLayers();
        return;
      }
    }

    // базовая фигура (Shift)
    const fig = document.getElementById('figureSelect').value;
    if (fig !== 'none' && window.lastFigure) {
      if (window.EXTRA[fig]) {
        window.EXTRA[fig](ctx, window.lastFigure.x, window.lastFigure.y, x, y, col, op);
        window.composeLayers();
        return;
      }
    }

    // смешивание / ластик
    const blend = document.getElementById('blendEraserSelect').value;
    if (blend !== 'none' && window.EXTRA2[blend]) {
      window.EXTRA2[blend](ctx, x, y, r, col, op);
      window.composeLayers();
      return;
    }

    // природа
    const nat = document.getElementById('natureSelect').value;
    if (nat !== 'none' && window.EXTRA2[nat]) {
      window.EXTRA2[nat](ctx, x, y, r, col, op);
      window.composeLayers();
      return;
    }

    // платья
    const dr = document.getElementById('dressSelect').value;
    if (dr !== 'none' && window.EXTRA2[dr]) {
      window.EXTRA2[dr](ctx, x, y, r, col, op);
      window.composeLayers();
      return;
    }

    // обычная кисть
    const key = brushSelect.value;
    window.BRUSHES[key](ctx, x, y, r, col, op);
    window.composeLayers();
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

  /* слои */
  const addLayerBtn = document.getElementById('addLayerBtn');
  const delLayerBtn = document.getElementById('delLayerBtn');
  const layerSelect = document.getElementById('layerSelect');
  const layerOpacity = document.getElementById('layerOpacity');

  addLayerBtn.onclick = () => {
    const idx = window.layerData.length;
    window.createLayer();
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = `Layer-${idx + 1}`;
    layerSelect.appendChild(opt);
    layerSelect.value = idx;
    window.setActiveLayer(idx);
  };
  delLayerBtn.onclick = () => {
    if (window.layerData.length <= 1) return;
    window.layerData.pop();
    layerSelect.remove(layerSelect.length - 1);
    window.setActiveLayer(window.layerData.length - 1);
    window.composeLayers();
  };
  layerSelect.onchange = e => window.setActiveLayer(+e.target.value);
  layerOpacity.oninput = e => {
    const idx = +layerSelect.value;
    window.setLayerOpacity(idx, +e.target.value);
    window.composeLayers();
  };

  /* ластик */
  const eraserBtn = document.getElementById('eraserBtn');
  let eraserOn = false;
  eraserBtn.onclick = () => {
    eraserOn = !eraserOn;
    eraserBtn.classList.toggle('eraser-on', eraserOn);
    brushSelect.disabled = eraserOn;
    color.disabled = eraserOn;
  };

  /* Alt / Shift состояние + сохранение pointer */
  window.altPressed = false;
  window.lastRuler = null;
  window.lastFigure = null;
  window.lastPointer = { x: 0, y: 0 };

  window.addEventListener('keydown', e => {
    if (e.key === 'Shift') {
      const p = window.lastPointer;
      window.lastFigure = { x: p.x, y: p.y };
    }
    if (e.key === 'Alt') {
      window.altPressed = true;
      const p = window.lastPointer;
      window.lastRuler = { x: p.x, y: p.y };
    }
  });
  window.addEventListener('keyup', e => {
    if (e.key === 'Shift') window.lastFigure = null;
    if (e.key === 'Alt') {
      window.altPressed = false;
      window.lastRuler = null;
    }
  });
})();

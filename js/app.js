(() => {
  const canvas = document.getElementById('mainCanvas');
  const ctx = canvas.getContext('2d');

  let dpr = window.devicePixelRatio || 1;

  function viewportSize() {
    const w = window.innerWidth;
    const h = window.innerHeight - document.getElementById('toolbar').offsetHeight;
    return { w, h };
  }

  function resizeCanvas() {
    const { w, h } = viewportSize();
    dpr = window.devicePixelRatio || 1;

    // сохраняем текущий холст как изображение для безопасного ресайза
    const snapshot = canvas.width && canvas.height ? canvas.toDataURL('image/png') : null;

    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    if (snapshot) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        window.App.saveState(); // фиксируем состояние после ресайза
      };
      img.src = snapshot;
    }
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
    if (window.Layers && window.Layers.resizeAll) {
      window.Layers.resizeAll(); // ресайз дополнительных слоев
    }
  });

  // История
  const history = [];
  let historyStep = -1;

  function saveState() {
    const { w, h } = viewportSize();
    // снимаем состояния только с базового холста (сведённые слои)
    const dataUrl = canvas.toDataURL('image/png');
    if (historyStep < history.length - 1) history.splice(historyStep + 1);
    history.push({ dataUrl, w, h });
    historyStep++;
  }

  function restoreState(entry) {
    const img = new Image();
    img.onload = () => {
      const { w, h } = viewportSize();
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
    };
    img.src = entry.dataUrl;
  }

  function undo() {
    if (historyStep > 0) {
      historyStep--;
      restoreState(history[historyStep]);
    }
  }

  function redo() {
    if (historyStep < history.length - 1) {
      historyStep++;
      restoreState(history[historyStep]);
    }
  }

  function clearCanvas() {
    const { w, h } = viewportSize();
    ctx.clearRect(0, 0, w, h);
    saveState();
  }

  // Экспорт
  window.App = {
    canvas,
    ctx,
    saveState,
    undo,
    redo,
    clearCanvas,
    getDpr: () => dpr
  };

  // Инициализация
  resizeCanvas();
  saveState();
})();


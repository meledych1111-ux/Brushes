(() => {
  const layers = [];
  let activeIndex = 0;

  function createLayer(name = `Layer ${layers.length + 1}`) {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    resizeLayer(c);
    const layer = { name, canvas: c, ctx, opacity: 1 };
    layers.push(layer);
    activeIndex = layers.length - 1;
    composeLayers();
    updateLayerUI();
    return layer;
  }

  function resizeLayer(canvas) {
    const dpr = window.App ? window.App.getDpr() : (window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = window.innerHeight - document.getElementById('toolbar').offsetHeight;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  function resizeAll() {
    layers.forEach(l => resizeLayer(l.canvas));
    composeLayers();
  }

  function setOpacity(index, value) {
    if (layers[index]) {
      layers[index].opacity = value;
      composeLayers();
    }
  }

  function setActive(index) {
    if (index >= 0 && index < layers.length) activeIndex = index;
  }

  function getActiveCtx() {
    return layers[activeIndex]?.ctx || window.App.ctx;
  }

  function composeLayers() {
    const baseCtx = window.App.ctx;
    const baseCanvas = window.App.canvas;
    const w = baseCanvas.width / (window.App.getDpr ? window.App.getDpr() : 1);
    const h = baseCanvas.height / (window.App.getDpr ? window.App.getDpr() : 1);
    baseCtx.clearRect(0, 0, w, h);
    layers.forEach(l => {
      baseCtx.save();
      baseCtx.globalAlpha = l.opacity;
      baseCtx.drawImage(l.canvas, 0, 0, w, h);
      baseCtx.restore();
    });
  }

  function updateLayerUI() {
    const sel = document.getElementById('layerSelect');
    if (!sel) return;
    sel.innerHTML = '';
    layers.forEach((l, i) => {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = l.name;
      if (i === activeIndex) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  createLayer('Layer 1');

  window.Layers = {
    createLayer,
    setOpacity,
    setActive,
    getActiveCtx,
    composeLayers,
    resizeAll,
    get layers() { return layers; },
    get activeIndex() { return activeIndex; }
  };

  window.addEventListener('resize', resizeAll);

  const newBtn = document.getElementById('newLayerBtn');
  const layerSelect = document.getElementById('layerSelect');
  const layerOpacity = document.getElementById('layerOpacity');

  if (newBtn) {
    newBtn.addEventListener('click', () => {
      createLayer();
      window.App.saveState();
    });
  }
  if (layerSelect) {
    layerSelect.addEventListener('change', (e) => {
      const idx = parseInt(e.target.value, 10);
      setActive(idx);
    });
  }
  if (layerOpacity) {
    layerOpacity.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      setOpacity(activeIndex, val);
      window.App.saveState();
    });
  }
})();

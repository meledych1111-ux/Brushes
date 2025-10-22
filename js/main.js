(() => {
  const { canvas, saveState, undo, redo, clearCanvas } = window.App;

  const brushSelect   = document.getElementById('brushSelect');
  const toolSelect    = document.getElementById('toolSelect');
  const figureSelect  = document.getElementById('figureSelect');
  const colorPicker   = document.getElementById('colorPicker');
  const sizeRange     = document.getElementById('sizeRange');
  const opacityRange  = document.getElementById('opacityRange');

  // Заполнение списков
  Object.keys(window.BRUSHES).forEach(name => {
    const opt = document.createElement('option'); opt.value=name; opt.textContent=name;
    brushSelect.appendChild(opt);
  });

  ['Ластик','Смазка','Размытие','Линейка','Заливка','Стирание','Заливка (текстура)','Тень','Блик','Аниме-румянец','Аниме-блик'].forEach(name=>{
    const opt=document.createElement('option'); opt.value=name; opt.textContent=name;
    toolSelect.appendChild(opt);
  });

  Object.keys(window.FIGURES).forEach(name=>{
    const opt=document.createElement('option'); opt.value=name; opt.textContent=name;
    figureSelect.appendChild(opt);
  });

  // Состояние
  let drawing=false;
  let lastX=0,lastY=0;

  // Pointer Events
  canvas.addEventListener('pointerdown', e=>{
    e.preventDefault();
    drawing=true;
    const rect=canvas.getBoundingClientRect();
    lastX=e.clientX-rect.left;
    lastY=e.clientY-rect.top;

    const tool   = toolSelect.value;
    const brush  = brushSelect.value;
    const figure = figureSelect.value;
    const color  = colorPicker.value;

    // давление
    let pressure = e.pressure;
    if (!pressure || pressure <= 0) pressure = 1;

    const size   = parseInt(sizeRange.value,10) * pressure;
    const op     = parseFloat(opacityRange.value) * pressure;

    const ctxActive = Layers.getActiveCtx();

    if (figure !== '') {
      window.FIGURES[figure](ctxActive, lastX, lastY, size, color, op);
      Layers.composeLayers();
      saveState();
      drawing = false;
    } else if (tool === 'Заливка') {
      Tools.floodFill(ctxActive, Math.floor(lastX), Math.floor(lastY), hexToRgb(color));
      drawing = false;
    } else if (tool === 'Стирание') {
      Tools.floodErase(ctxActive, Math.floor(lastX), Math.floor(lastY));
      drawing = false;
    } else if (tool === 'Заливка (текстура)') {
      const tmp=document.createElement('canvas'); tmp.width=32; tmp.height=32;
      const tctx=tmp.getContext('2d');
      window.BRUSHES[brush](tctx,16,16,12,color,op);
      Tools.floodFillTexture(ctxActive, Math.floor(lastX), Math.floor(lastY), tmp);
      drawing = false;
    }
  });

  canvas.addEventListener('pointermove', e=>{
    if (!drawing) return;
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let pressure = e.pressure;
    if (!pressure || pressure <= 0) pressure = 1;

    const tool  = toolSelect.value;
    const brush = brushSelect.value;
    const color = colorPicker.value;
    const size  = parseInt(sizeRange.value,10) * pressure;
    const op    = parseFloat(opacityRange.value) * pressure;

    const ctxActive = Layers.getActiveCtx();

    if (tool === 'Ластик') {
      Tools.eraser(ctxActive, x, y, size);
    } else if (tool === 'Смазка') {
      Tools.smudge(ctxActive, x, y, size);
    } else if (tool === 'Размытие') {
      Tools.blur(ctxActive, x, y, size);
    } else if (tool === 'Линейка') {
      Tools.lineTool(ctxActive, lastX, lastY, x, y, color, Math.max(1, size/4));
    } else if (tool === 'Тень') {
      Tools.addShadow(ctxActive, x, y, size);
    } else if (tool === 'Блик') {
      Tools.addHighlight(ctxActive, x, y, size);
    } else if (tool === 'Аниме-румянец') {
      Tools.animeBlush(ctxActive, x, y, size);
    } else if (tool === 'Аниме-блик') {
      Tools.animeEyeHighlight(ctxActive, x, y, size);
    } else {
      if (window.BRUSHES[brush]) {
        // интерполяция для плавности
        const steps = Math.max(1, Math.floor(Math.hypot(x-lastX, y-lastY) / 2));
        for (let i=1; i<=steps; i++) {
          const xi = lastX + (x-lastX)*i/steps;
          const yi = lastY + (y-lastY)*i/steps;
          window.BRUSHES[brush](ctxActive, xi, yi, size, color, op);
        }
      }
    }

    lastX = x; lastY = y;
  });

  canvas.addEventListener('pointerup', ()=>{
    if (drawing) { Layers.composeLayers(); saveState(); drawing = false; }
  });
  canvas.addEventListener('pointerleave', ()=>{
    if (drawing) { Layers.composeLayers(); saveState(); drawing = false; }
  });

  // Кнопки
  document.getElementById('undoBtn').addEventListener('click', undo);
  document.getElementById('redoBtn').addEventListener('click', redo);
  document.getElementById('clearBtn').addEventListener('click', ()=>{
    Layers.layers.forEach(l => {
      const w = canvas.width / window.App.getDpr();
      const h = canvas.height / window.App.getDpr();
      l.ctx.clearRect(0,0,w,h);
    });
    Layers.composeLayers();
    saveState();
  });

  // Сохранение / Поделиться
  document.getElementById('saveBtn').addEventListener('click', ()=>{
    Layers.composeLayers();
    if (navigator.share && canvas.toBlob) {
      canvas.toBlob(blob=>{
        const file = new File([blob], "drawing.png", {type:"image/png"});
        navigator.share({ files: [file], title: "Мой рисунок" }).catch(()=>{});
      });
    } else {
      const link=document.createElement('a');
      link.download='drawing.png';
      link.href=canvas.toDataURL('image/png');
      link.click();
    }
  });

  function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1),16);
    return [(bigint>>16)&255,(bigint>>8)&255,bigint&255];
  }
})();

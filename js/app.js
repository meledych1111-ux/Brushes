// js/app.js – финальная версия с кистями, фигурами, слоями и экспортом
(() => {
  console.log('🔄 Starting ArtFlow Pro...');

  const canvas = document.getElementById('canvas');
  if (!canvas) { console.error('❌ Canvas not found'); return; }
  const ctx = canvas.getContext('2d');
  if (!ctx) { console.error('❌ Context not available'); return; }

  let painting = false;
  let lastX = 0, lastY = 0;
  let currentTool = 'brush';
  let currentBrush = 'Круглая';
  let history = [];
  let historyStep = 0;

  function init() {
    if (!window.Layers) {
      window.Layers = {
        getActiveCtx: () => ctx,
        composeLayers: () => {},
        resizeAll: () => {},
        createLayer: () => {}
      };
    }
    setupCanvas();
    setupUI();
    setupEventListeners();
    console.log('✅ ArtFlow Pro initialized');
  }

  function setupCanvas() {
    const container = document.querySelector('.canvas-container');
    let width = 800, height = 600;
    if (container) {
      const rect = container.getBoundingClientRect();
      if (rect.width > 100 && rect.height > 100) {
        width = rect.width; height = rect.height;
      }
    }
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.fillStyle = '#fff';
    ctx.fillRect(0,0,width,height);
    saveState();
  }

  function setupEventListeners() {
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    canvas.addEventListener('touchstart', handleTouchStart, { passive:false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive:false });
    canvas.addEventListener('touchend', handleTouchEnd);

    window.addEventListener('resize', ()=>setTimeout(setupCanvas,100));
  }

  function handleMouseDown(e) {
    e.preventDefault();
    painting = true;
    const pos = getCanvasPosition(e);
    lastX = pos.x; lastY = pos.y;
    drawBrush(pos.x, pos.y, null, null, e.pressure>0?e.pressure:1);
  }

  function handleMouseMove(e) {
    if (!painting) return;
    e.preventDefault();
    const pos = getCanvasPosition(e);
    let pressure = e.pressure;
    if (!pressure || pressure <= 0) pressure = 1;
    drawLine(lastX, lastY, pos.x, pos.y, pressure);
    lastX = pos.x; lastY = pos.y;
  }

  function handleMouseUp() {
    if (painting) { painting=false; saveState(); }
  }

  function handleTouchStart(e) {
    e.preventDefault();
    painting = true;
    const touch = e.touches[0];
    const pos = getCanvasPosition(touch);
    lastX = pos.x; lastY = pos.y;
    drawBrush(pos.x, pos.y, null, null, 1);
  }

  function handleTouchMove(e) {
    if (!painting) return;
    e.preventDefault();
    const touch = e.touches[0];
    const pos = getCanvasPosition(touch);
    drawLine(lastX, lastY, pos.x, pos.y, 1);
    lastX = pos.x; lastY = pos.y;
  }

  function handleTouchEnd() {
    if (painting) { painting=false; saveState(); }
  }

  // === Рисование ===
  function drawLine(x1,y1,x2,y2,pressure=1) {
    const dx=x2-x1, dy=y2-y1;
    const dist=Math.sqrt(dx*dx+dy*dy);
    const steps=Math.max(1,Math.floor(dist/2));
    for(let i=0;i<=steps;i++){
      const t=i/steps;
      const x=x1+dx*t, y=y1+dy*t;
      drawBrush(x,y,null,null,pressure);
    }
  }

  function drawBrush(x,y,x2=null,y2=null,pressure=1) {
    const size=getBrushSize()*pressure;
    const opacity=getBrushOpacity()*pressure;
    const color=getCurrentColor();
    const ctxActive = (window.Layers && window.Layers.getActiveCtx()) || ctx;

    try {
      if (currentTool==='brush') {
        if (window.BRUSHES && window.BRUSHES[currentBrush]) {
          window.BRUSHES[currentBrush](ctxActive,x,y,size,color,opacity);
        } else drawFallbackBrush(x,y,size,color,opacity);
      }
      else if (currentTool==='shape' && window.currentShape) {
        if (window.FIGURES && window.FIGURES[window.currentShape]) {
          window.FIGURES[window.currentShape](ctxActive,x,y,size,color,opacity);
        }
      }
      else if (currentTool==='stamp' && window.currentStamp) {
        if (window.FIGURES && window.FIGURES[window.currentStamp]) {
          window.FIGURES[window.currentStamp](ctxActive,x,y,size,color,opacity);
        }
      }
      else if (window.Tools && window.Tools[currentTool]) {
        if (x2!==null && y2!==null) {
          window.Tools[currentTool](ctxActive,x,y,x2,y2,color,opacity);
        } else {
          window.Tools[currentTool](ctxActive,x,y,size,color,opacity);
        }
      }
      else if (currentTool==='eraser') {
        drawEraser(ctxActive,x,y,size,opacity);
      }
      else if (currentTool==='3d' && window.THREE_D_TOOLS) {
        window.THREE_D_TOOLS.createSphere(ctxActive,x,y,size,color,'top-left');
      }
    } catch(err){
      console.error('❌ draw error',err);
      drawFallbackBrush(x,y,size,color,opacity);
    }
  }

  function drawFallbackBrush(x,y,r,color,op){
    ctx.save(); ctx.globalAlpha=op; ctx.fillStyle=color;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); ctx.restore();
  }
  function drawEraser(ctxActive,x,y,r,op){
    ctxActive.save(); ctxActive.globalCompositeOperation='destination-out';
    ctxActive.globalAlpha=op; ctxActive.beginPath(); ctxActive.arc(x,y,r,0,Math.PI*2); ctxActive.fill(); ctxActive.restore();
  }

  // === Вспомогательные ===
  function getCanvasPosition(e){
    const rect=canvas.getBoundingClientRect();
    return {x:e.clientX-rect.left, y:e.clientY-rect.top};
  }
  function getCurrentColor(){ const el=document.getElementById('colorPicker'); return el?el.value:'#000'; }
  function getBrushSize(){ const el=document.getElementById('sizeSlider'); return el?parseInt(el.value):20; }
  function getBrushOpacity(){ const el=document.getElementById('opacitySlider'); return el?parseInt(el.value)/100:1; }

  // === История ===
  function saveState(){
    history.length=historyStep;
    history.push(canvas.toDataURL());
    if(history.length>30) history.shift();
    historyStep=history.length;
  }
  function undo(){ if(historyStep>1){ historyStep--; restoreState(); } }
  function redo(){ if(historyStep<history.length){ historyStep++; restoreState(); } }
  function restoreState(){
    if(historyStep>0 && history[historyStep-1]){
      const img=new Image();
      img.onload=()=>{ ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0); };
      img.src=history[historyStep-1];
    }
  }

  // === UI ===
  function setupUI(){
    setupActions();
  }

  function setupActions() {
    // Очистка активного слоя
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const ctxActive = (window.Layers && window.Layers.getActiveCtx()) || ctx;
        ctxActive.clearRect(0, 0, canvas.width, canvas.height);
        if (window.Layers) window.Layers.composeLayers();
        saveState();
        console.log('✅ Active layer cleared');
      });
    }

    // Быстрое сохранение PNG
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
      save
              });
    }

    // Экспорт в выбранный формат
    const exportBtn = document.getElementById('exportBtn');
    const exportFmt = document.getElementById('exportFormat');
    if (exportBtn && exportFmt) {
      exportBtn.addEventListener('click', () => {
        const fmt = exportFmt.value || 'png';
        canvas.toBlob(blob => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `artflow-${Date.now()}.${fmt}`;
          a.click();
          console.log(`📤 Exported as ${fmt.toUpperCase()}`);
        }, `image/${fmt}`, 0.95);
      });
    }

    // Undo/Redo
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    if (undoBtn) undoBtn.addEventListener('click', undo);
    if (redoBtn) redoBtn.addEventListener('click', redo);

    // Новый слой
    const newLayerBtn = document.getElementById('newLayerBtn');
    if (newLayerBtn) {
      newLayerBtn.addEventListener('click', () => {
        if (window.Layers && window.Layers.createLayer) {
          window.Layers.createLayer();
        } else {
          console.log('📝 Layers system not available');
        }
      });
    }
  }

  // === Запуск ===
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Глобальный интерфейс
  window.App = {
    canvas,
    ctx,
    saveState,
    undo,
    redo,
    getCurrentTool: () => currentTool,
    getCurrentBrush: () => currentBrush
  };

  console.log('🚀 ArtFlow Pro loaded successfully');
})();

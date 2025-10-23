// js/app.js - ArtFlow Pro FULL PRODUCTION VERSION
(() => {
  console.log('🚀 ArtFlow Pro - Production version loading...');

  const canvas = document.getElementById('canvas');
  if (!canvas) return console.error('Canvas element not found');
  const ctx = canvas.getContext('2d');
  if (!ctx) return console.error('Canvas context not available');

  const state = {
    painting: false,
    lastX: 0,
    lastY: 0,
    startX: 0,
    startY: 0,
    currentTool: 'brush',
    currentBrush: 'Круглая',
    currentShape: 'circle',
    history: [],
    historyStep: 0,
    isDrawingShape: false,
    lastTime: 0,
    layers: [],
    activeLayer: null
  };

  // ------------------------ INITIALIZATION ------------------------
  function initializeEverything() {
    console.log('🎯 Initializing ArtFlow Pro...');
    setupCanvas();
    createInitialLayer();
    setupUI();
    setupEventListeners();
    saveState();
    console.log('✅ Initialization complete');
  }

  // ------------------------ CANVAS ------------------------
  function setupCanvas() {
    const container = document.querySelector('.canvas-container');
    canvas.width = container.clientWidth || 800;
    canvas.height = container.clientHeight || 600;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // ------------------------ LAYERS ------------------------
  function createInitialLayer() {
    const layer = createLayer('Слой 1');
    state.layers.push(layer);
    state.activeLayer = layer;
    renderLayers();
  }

  function createLayer(name = 'Новый слой') {
    const layer = { 
      name, 
      canvas: document.createElement('canvas') 
    };
    layer.canvas.width = canvas.width;
    layer.canvas.height = canvas.height;
    layer.ctx = layer.canvas.getContext('2d');
    layer.ctx.fillStyle = '#ffffff';
    layer.ctx.fillRect(0, 0, canvas.width, canvas.height);
    state.layers.push(layer);
    state.activeLayer = layer;
    updateLayerUI();
    return layer;
  }

  function deleteLayer() {
    if(state.layers.length <= 1) return;
    const idx = state.layers.indexOf(state.activeLayer);
    state.layers.splice(idx,1);
    state.activeLayer = state.layers[state.layers.length-1];
    renderLayers();
    updateLayerUI();
  }

  function mergeLayers() {
    if(state.layers.length <= 1) return;
    const idx = state.layers.indexOf(state.activeLayer);
    if(idx === 0) return;
    const lower = state.layers[idx-1];
    lower.ctx.drawImage(state.activeLayer.canvas,0,0);
    deleteLayer();
    saveState();
  }

  function updateLayerUI() {
    const list = document.getElementById('layersList');
    if(!list) return;
    list.innerHTML = '';
    state.layers.forEach((layer, i) => {
      const btn = document.createElement('button');
      btn.textContent = layer.name;
      btn.className = i===state.layers.indexOf(state.activeLayer)?'layer-btn active':'layer-btn';
      btn.addEventListener('click', ()=>{ state.activeLayer = layer; updateLayerUI(); });
      list.appendChild(btn);
    });
  }

  function renderLayers() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    state.layers.forEach(l => ctx.drawImage(l.canvas,0,0));
  }

  // ------------------------ TOOLS ------------------------
  function drawBrush(x,y) {
    const size = getBrushSize();
    const opacity = getBrushOpacity();
    const color = getCurrentColor();
    if(!state.activeLayer) return;
    if(window.BRUSHES && BRUSHES[state.currentBrush]){
      BRUSHES[state.currentBrush](state.activeLayer.ctx,x,y,size,color,opacity);
    } else {
      defaultBrush(state.activeLayer.ctx,x,y,size,color,opacity);
    }
    renderLayers();
  }

  function defaultBrush(ctx,x,y,size,color,opacity){
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x,y,size,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function drawSmoothLine(x1,y1,x2,y2){
    const dx = x2-x1, dy=y2-y1, steps = Math.max(1, Math.floor(Math.sqrt(dx*dx+dy*dy)/2));
    for(let i=0;i<=steps;i++){
      const t=i/steps;
      const x=x1+dx*t, y=y1+dy*t;
      drawBrush(x,y);
    }
  }

  function drawShape(x,y){
    const size=getBrushSize(), opacity=getBrushOpacity(), color=getCurrentColor();
    if(FIGURES[state.currentShape]) FIGURES[state.currentShape](state.activeLayer.ctx,x,y,size,color,opacity);
    renderLayers();
  }

  // ------------------------ EVENTS ------------------------
  function setupEventListeners() {
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);
    document.addEventListener('keydown', handleKeyDown);

    document.getElementById('sizeSlider')?.addEventListener('input', e=>document.getElementById('sizeOut').textContent=e.target.value);
    document.getElementById('opacitySlider')?.addEventListener('input', e=>document.getElementById('opacityOut').textContent=e.target.value+'%');
    document.querySelectorAll('.tool-btn').forEach(btn=>btn.addEventListener('click',()=>{ state.currentTool = btn.dataset.tool; }));
    document.querySelectorAll('.shape-btn').forEach(btn=>btn.addEventListener('click',()=>{ state.currentShape=btn.dataset.shape; state.currentTool='shape'; }));
    document.getElementById('stampSelect')?.addEventListener('change', e=>{ state.currentShape=e.target.value; state.currentTool='shape'; });
    document.getElementById('newLayerBtn')?.addEventListener('click', ()=>createLayer());
    document.getElementById('deleteLayerBtn')?.addEventListener('click', deleteLayer);
    document.getElementById('mergeLayersBtn')?.addEventListener('click', mergeLayers);
    document.getElementById('undoBtn')?.addEventListener('click', undo);
    document.getElementById('clearBtn')?.addEventListener('click', clearLayer);
    document.getElementById('saveBtn')?.addEventListener('click', saveImage);
    document.getElementById('exportBtn')?.addEventListener('click', exportImage);
  }

  function startDrawing(e){
    e.preventDefault();
    state.painting=true;
    const pos=getCanvasPosition(e);
    state.lastX=state.startX=pos.x;
    state.lastY=state.startY=pos.y;
    if(state.currentTool==='shape') drawShape(pos.x,pos.y);
    else drawBrush(pos.x,pos.y);
  }

  function draw(e){
    if(!state.painting) return;
    const pos=getCanvasPosition(e);
    if(state.currentTool!=='shape') drawSmoothLine(state.lastX,state.lastY,pos.x,pos.y);
    state.lastX=pos.x; state.lastY=pos.y;
  }

  function stopDrawing(){
    if(!state.painting) return;
    state.painting=false;
    saveState();
  }

  function handleTouchStart(e){ startDrawing(new MouseEvent('mousedown',{clientX:e.touches[0].clientX,clientY:e.touches[0].clientY})); }
  function handleTouchMove(e){ draw(new MouseEvent('mousemove',{clientX:e.touches[0].clientX,clientY:e.touches[0].clientY})); }
  function handleKeyDown(e){ if((e.ctrlKey||e.metaKey)&&e.key==='z'){ e.preventDefault(); undo(); } }

  function getCanvasPosition(e){ const rect=canvas.getBoundingClientRect(); return {x:e.clientX-rect.left, y:e.clientY-rect.top}; }
  function getCurrentColor(){ return document.getElementById('colorPicker')?.value || '#007aff'; }
  function getBrushSize(){ return parseInt(document.getElementById('sizeSlider')?.value || 20); }
  function getBrushOpacity(){ return (parseInt(document.getElementById('opacitySlider')?.value) || 100)/100; }

  // ------------------------ HISTORY ------------------------
  function saveState(){
    const data=state.activeLayer.canvas.toDataURL();
    state.history.length=state.historyStep;
    state.history.push(data);
    if(state.history.length>20) state.history.shift();
    state.historyStep=state.history.length;
  }

  function undo(){
    if(state.historyStep>1){
      state.historyStep--;
      const img=new Image();
      img.onload=()=>{ state.activeLayer.ctx.clearRect(0,0,canvas.width,canvas.height); state.activeLayer.ctx.drawImage(img,0,0); renderLayers(); };
      img.src=state.history[state.historyStep-1];
    }
  }

  // ------------------------ ACTIONS ------------------------
  function clearLayer(){
    if(!state.activeLayer) return;
    state.activeLayer.ctx.clearRect(0,0,canvas.width,canvas.height);
    renderLayers();
    saveState();
  }

  function saveImage(){
    const link=document.createElement('a');
    link.download=`artflow-${Date.now()}.png`;
    link.href=canvas.toDataURL();
    link.click();
  }

  function exportImage(){
    const format=document.getElementById('exportFormat')?.value || 'png';
    const link=document.createElement('a');
    link.download=`artflow-${Date.now()}.${format}`;
    link.href=canvas.toDataURL(`image/${format}`);
    link.click();
  }

  // ------------------------ INITIALIZE ------------------------
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initializeEverything);
  else initializeEverything();

  window.ArtFlow={state,canvas,ctx,saveState,undo,createLayer,deleteLayer,mergeLayers};
})();

/*  js/app.js  –  «ArtFlow Pro»  –  100 % рабочая сборка  */
(() => {
/* ==========  1.  БАЗОВЫЕ ПЕРЕМЕННЫЕ  ========== */
const canvas  = document.getElementById('canvas');
const ctx     = canvas?.getContext('2d');
if(!canvas || !ctx){ console.error('Canvas не найден'); return; }

let painting   = false;
let lastX=0, lastY=0, startX=0, startY=0;
let currentTool= 'brush';
let currentBrush='Круглая';
let currentShape='circle';
let history=[], historyStep=0;

const tempC=document.createElement('canvas');
const tempCtx=tempC.getContext('2d');

/* ==========  2.  CANVAS  ========== */
function setupCanvas(){
  const cont=document.querySelector('.canvas-container');
  const w=cont.clientWidth||800, h=cont.clientHeight||600;
  [canvas.width,canvas.height,tempC.width,tempC.height]=[w,h,w,h];
  canvas.style.cssText=`width:${w}px;height:${h}px;background:#fff;border:1px solid #30363d;display:block;cursor:crosshair`;
  ctx.fillStyle='#fff'; ctx.fillRect(0,0,w,h);
  tempCtx.fillStyle='#fff'; tempCtx.fillRect(0,0,w,h);
  saveState();
}
function resizeCanvas(){ setupCanvas(); if(window.Layers?.resizeAll)window.Layers.resizeAll(); }

/* ==========  3.  ИСТОРИЯ  ========== */
function saveState(){
  history.length=historyStep;
  history.push(canvas.toDataURL());
  if(history.length>50)history.shift();
  historyStep=history.length;
  updateUndoRedoButtons();
}
function restoreState(){
  if(historyStep>0&&history[historyStep-1]){
    const img=new Image(); img.onload=()=>{ ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0); };
    img.src=history[historyStep-1];
  }
  updateUndoRedoButtons();
}
function undo(){ if(historyStep>1){historyStep--; restoreState();} }
function redo(){ if(historyStep<history.length){historyStep++; restoreState();} }
function updateUndoRedoButtons(){
  const u=document.getElementById('undoBtn'), r=document.getElementById('redoBtn');
  if(u)u.disabled=historyStep<=1;
  if(r)r.disabled=historyStep>=history.length;
}

/* ==========  4.  УТИЛИТЫ  ========== */
function getPos(e){
  const rect=canvas.getBoundingClientRect(), sx=canvas.width/rect.width, sy=canvas.height/rect.height;
  const x=(e.clientX||e.touches?.[0]?.clientX||0)-rect.left, y=(e.clientY||e.touches?.[0]?.clientY||0)-rect.top;
  return {x:x*sx,y:y*sy};
}
function getColor(){ return document.getElementById('colorPicker')?.value||'#007aff'; }
function getSize(){ return parseInt(document.getElementById('sizeSlider')?.value||20); }
function getOpacity(){ return parseInt(document.getElementById('opacitySlider')?.value||100)/100; }
function isDrawingTool(t){ return ['line','rectangle','rectangle_fill','circle','circle_fill','gradient','3d'].includes(t); }

/* ==========  5.  РИСОВАНИЕ  ========== */
function drawLine(x1,y1,x2,y2){
  const dx=x2-x1, dy=y2-y1, d=Math.hypot(dx,dy), steps=Math.max(1,d/2);
  for(let i=0;i<=steps;i++){ const t=i/steps; drawBrush(x1+dx*t,y1+dy*t); }
}
function drawBrush(x,y,x2,y2){
  const size=getSize(), op=getOpacity(), color=getColor(), act=window.Layers?.getActiveCtx?.()||ctx;
  try{
    if(currentTool==='brush'){
      if(window.BRUSHES?.[currentBrush]) window.BRUSHES[currentBrush](act,x,y,size,color,op);
      else fallbackBrush(act,x,y,size,color,op);
    }else if(window.Tools?.[currentTool]){
      window.Tools[currentTool](act,x,y,size,color,op);
    }else if(currentTool==='shape'&&currentShape){
      if(window.FIGURES?.[currentShape]) window.FIGURES[currentShape](act,x,y,size,color,op);
    }else if(currentTool==='3d'&&window.THREE_D_TOOLS){
      window.THREE_D_TOOLS.createSphere(act,x,y,size,color,'top-left');
    }else fallbackBrush(act,x,y,size,color,op);
  }catch(e){ console.error(e); fallbackBrush(act,x,y,size,color,op); }
}
function fallbackBrush(ctx,x,y,r,c,o){ ctx.save(); ctx.globalAlpha=o; ctx.fillStyle=c; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); ctx.restore(); }

/* ==========  6.  ФИГУРЫ / ПРЕДПРОСМОТР  ========== */
function drawPreviewShape(sx,sy,ex,ey){
  ctx.save(); ctx.globalAlpha=.5; ctx.strokeStyle=getColor(); ctx.lineWidth=2; ctx.setLineDash([5,5]);
  if(currentTool==='line'){ ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(ex,ey); ctx.stroke(); }
  if(currentTool==='rectangle') ctx.strokeRect(sx,sy,ex-sx,ey-sy);
  if(currentTool==='rectangle_fill'){ ctx.fillStyle=getColor(); ctx.fillRect(sx,sy,ex-sx,ey-sy); }
  if(currentTool==='circle'){
    const r=Math.hypot(ex-sx,ey-sy); ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.stroke();
  }
  if(currentTool==='circle_fill'){
    const r=Math.hypot(ex-sx,ey-sy); ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill(); ctx.restore();
  }
  ctx.restore();
}
function drawFinalShape(sx,sy,ex,ey){
  ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(tempC,0,0);
  ctx.save(); ctx.globalAlpha=getOpacity(); ctx.strokeStyle=getColor(); ctx.lineWidth=2; ctx.setLineDash([]);
  if(currentTool==='line'){ ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(ex,ey); ctx.stroke(); }
  if(currentTool==='rectangle') ctx.strokeRect(sx,sy,ex-sx,ey-sy);
  if(currentTool==='rectangle_fill'){ ctx.fillStyle=getColor(); ctx.fillRect(sx,sy,ex-sx,ey-sy); }
  if(currentTool==='circle'){
    const r=Math.hypot(ex-sx,ey-sy); ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.stroke();
  }
  if(currentTool==='circle_fill'){
    const r=Math.hypot(ex-sx,ey-sy); ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
  }
  ctx.restore(); saveState();
}

/* ==========  7.  СОБЫТИЯ МЫШЬ / ТАЧ  ========== */
function onDown(e){
  e.preventDefault(); painting=true;
  const p=getPos(e); [lastX,lastY,startX,startY]=[p.x,p.y,p.x,p.y];
  if(isDrawingTool(currentTool)){
    isDrawingShape=true; tempCtx.clearRect(0,0,tempC.width,tempC.height); tempCtx.drawImage(canvas,0,0);
  }else if(currentTool==='shape'||currentTool==='fill'){ drawBrush(p.x,p.y); painting=false; saveState(); }
  else drawBrush(p.x,p.y);
}
function onMove(e){
  if(!painting)return; e.preventDefault();
  const p=getPos(e);
  if(isDrawingTool(currentTool)&&isDrawingShape){
    ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(tempC,0,0); drawPreviewShape(startX,startY,p.x,p.y);
  }else if(!isDrawingTool(currentTool)&&currentTool!=='shape'&&currentTool!=='fill'){
    drawLine(lastX,lastY,p.x,p.y); [lastX,lastY]=[p.x,p.y];
  }
  document.getElementById('coordinates')&&(document.getElementById('coordinates').textContent=`X:${Math.round(p.x)} Y:${Math.round(p.y)}`);
}
function onUp(e){
  if(!painting)return;
  const p=getPos(e);
  if(isDrawingTool(currentTool)&&isDrawingShape){ drawFinalShape(startX,startY,p.x,p.y); isDrawingShape=false; }
  painting=false;
}
canvas.addEventListener('mousedown',onDown);
canvas.addEventListener('mousemove',onMove);
canvas.addEventListener('mouseup',onUp);
canvas.addEventListener('mouseleave',onUp);
canvas.addEventListener('touchstart',onDown,{passive:false});
canvas.addEventListener('touchmove',onMove,{passive:false});
canvas.addEventListener('touchend',onUp);
window.addEventListener('resize',()=>setTimeout(resizeCanvas,100));
document.addEventListener('keydown',e=>{
  if(e.target.matches('input'))return;
  if((e.ctrlKey||e.metaKey)&&e.key==='z'){e.preventDefault();undo();}
  if((e.ctrlKey||e.metaKey)&&e.key==='y'){e.preventDefault();redo();}
});

/* ==========  8.  UI-ЭЛЕМЕНТЫ  ========== */
function updateBrushInfo(){
  const el=document.getElementById('brushInfo');
  if(!el)return;
  if(isDrawingTool(currentTool))el.textContent=`📐 ${currentTool} | ${getSize()}px`;
  else if(currentTool==='shape')el.textContent=`🔷 ${currentShape} | ${getSize()}px`;
  else el.textContent=`${currentBrush} | ${getSize()}px`;
}
function setupBrushes(){
  const sel=document.getElementById('brushSelect'), cat=document.getElementById('brushCategory');
  if(!sel||!window.BRUSHES)return;
  const fill=catName=>{
    const all=Object.keys(window.BRUSHES);
    let list=all;
    if(catName!=='all'){
      const cats={
        basic:all.filter(n=>/Круглая|Квадратная|Карандаш|Щетина|Каллиграфия|Тушь|Контур|Мастихин/.test(n)),
        paint:all.filter(n=>/Акварель|Масло|Гуашь|Акрил|Пастель|Аэрограф|Темпера|Фреска/.test(n)),
        texture:all.filter(n=>/Холст|Бумага|Песок|Мрамор|Кора|Камень|Листва|Ткань/.test(n)),
        anime:all.filter(n=>/Аниме|Блик|Румянец|Свет/.test(n)),
        '3d':all.filter(n=>/Металл|Стекло|Керамика|Пластик|Дерево|Кожа|Неон|Лёд/.test(n))
      };
      list=cats[catName]||all;
    }
    sel.innerHTML=''; list.forEach(n=>{const o=new Option(n,n); sel.appendChild(o);});
    currentBrush=list[0]||'Круглая'; sel.value=currentBrush;
    document.getElementById('brushCount')&&(document.getElementById('brushCount').textContent=`${list.length}+`);
    updateBrushInfo();
  };
  if(cat)cat.onchange=()=>fill(cat.value);
  sel.onchange=()=>{currentBrush=sel.value;updateBrushInfo();};
  fill('all');
}
function setupTools(){
  document.querySelectorAll('.tool-btn, .mobile-tool-btn').forEach(b=>{
    b.addEventListener('click',e=>{
      document.querySelectorAll('.tool-btn').forEach(x=>x.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currentTool=e.currentTarget.dataset.tool;
      updateBrushInfo();
      document.getElementById('mobileModal')&&(document.getElementById('mobileModal').style.display='none');
    });
  });
  document.querySelector('.tool-btn')?.classList.add('active');
}
function setupShapes(){
  document.querySelectorAll('.shape-btn').forEach(b=>b.addEventListener('click',()=>{
    currentTool='shape'; currentShape=b.dataset.shape; updateBrushInfo();
    document.querySelectorAll('.tool-btn').forEach(x=>x.classList.remove('active'));
    document.querySelector('[data-tool="shape"]')?.classList.add('active');
  }));
  const stamp=document.getElementById('stampSelect');
  if(stamp)stamp.addEventListener('change',()=>{
    if(stamp.value){currentTool='shape';currentShape=stamp.value;updateBrushInfo();}
  });
}
function setupColorPresets(){
  document.querySelectorAll('.color-preset').forEach(p=>{
    p.addEventListener('click',()=>{(document.getElementById('colorPicker')||{}).value=p.dataset.color;});
  });
}
function setupActionButtons(){
  const clear=document.getElementById('clearBtn'), save=document.getElementById('saveBtn'),
        exp=document.getElementById('exportBtn'), fmt=document.getElementById('exportFormat');
  if(clear)clear.addEventListener('click',()=>{if(confirm('Очистить холст?')){ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);saveState();}});
  if(save)save.addEventListener('click',()=>{const a=document.createElement('a');a.download=`artflow-${Date.now()}.png`;a.href=canvas.toDataURL('image/png');a.click();});
  if(exp&&fmt)exp.addEventListener('click',()=>{
    const f=fmt.value||'png',m=f==='jpg'?'image/jpeg':`image/${f}`;
    canvas.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`artflow-${Date.now()}.${f}`;a.click();},m,0.95);
  });
  document.getElementById('undoBtn')?.addEventListener('click',undo);
  document.getElementById('redoBtn')?.addEventListener('click',redo);
  updateUndoRedoButtons();
}
function setupMobile(){
  const m=document.getElementById('mobileModal'),t=document.getElementById('mobileToggle'),c=document.getElementById('mobileModalClose');
  if(t)t.addEventListener('click',()=>m.style.display='flex');
  if(c)c.addEventListener('click',()=>m.style.display='none');
  if(m)m.addEventListener('click',e=>{if(e.target===m)m.style.display='none';});
}

/* ==========  9.  ИНИЦИАЛИЗАЦИЯ  ========== */
function init(){
  console.log('🎨 ArtFlow Pro starting...');
  setupCanvas();
  setupBrushes(); setupTools(); setupShapes(); setupColorPresets(); setupActionButtons(); setupMobile();
  updateBrushInfo(); saveState();
  window.App={canvas,ctx,saveState,undo,redo,setupCanvas,getCurrentTool:()=>currentTool,getCurrentBrush:()=>currentBrush};
  console.log('✅ Ready');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init); else init();
})();

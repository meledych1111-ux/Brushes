(() => {
  const { canvas, saveState } = window.App;

  // Ластик
  function eraser(ctx, x, y, r) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  // Смазка
  function smudge(ctx, x, y, r) {
    const img = ctx.getImageData(x-r, y-r, r*2, r*2);
    ctx.putImageData(img, x-r+Math.random()*2-1, y-r+Math.random()*2-1);
  }

  // Размытие (без выхода за границы массива)
  function blur(ctx, x, y, r) {
    const w = Math.max(1, r*2), h = Math.max(1, r*2);
    const img = ctx.getImageData(x-r, y-r, w, h);
    const data = img.data;
    for (let y0=0; y0<h; y0++){
      for (let x0=0; x0<w; x0++){
        const i = (y0*w + x0) * 4;
        const right = x0+1 < w ? i+4 : i;
        const down  = y0+1 < h ? i + w*4 : i;
        data[i]   = (data[i]   + data[right] + data[down]) / 3;
        data[i+1] = (data[i+1] + data[right+1] + data[down+1]) / 3;
        data[i+2] = (data[i+2] + data[right+2] + data[down+2]) / 3;
      }
    }
    ctx.putImageData(img, x-r, y-r);
  }

  // Линейка
  function lineTool(ctx, x1,y1,x2,y2,color,width) {
    ctx.save();
    ctx.strokeStyle=color;
    ctx.lineWidth=width;
    ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
    ctx.restore();
  }

  // Заливка (простой алгоритм со scanline-расширением)
  function floodFill(ctx, startX, startY, fillColor) {
    const w = canvas.width;
    const h = canvas.height;
    const dpr = window.App.getDpr();
    // координаты преобразуем в пиксели буфера
    const sx = Math.floor(startX * dpr);
    const sy = Math.floor(startY * dpr);

    const imgData = ctx.getImageData(0,0,w,h);
    const data = imgData.data;

    function colorAt(x,y){ const off = (y*w + x)*4; return [data[off],data[off+1],data[off+2],data[off+3]]; }
    function setColor(x,y,c){ const off = (y*w + x)*4; data[off]=c[0]; data[off+1]=c[1]; data[off+2]=c[2]; data[off+3]=255; }
    function isSame(c1,c2,t=20){ return Math.abs(c1[0]-c2[0])<=t && Math.abs(c1[1]-c2[1])<=t && Math.abs(c1[2]-c2[2])<=t; }

    const target = colorAt(sx, sy);
    if (isSame(target, [fillColor[0], fillColor[1], fillColor[2], 255])) return;

    const stack = [[sx, sy]];
    while (stack.length) {
      const [x, y] = stack.pop();
      // влево
      let xl = x;
      while (xl >= 0 && isSame(colorAt(xl, y), target)) { setColor(xl, y, fillColor); xl--; }
      // вправо
      let xr = x + 1;
      while (xr < w && isSame(colorAt(xr, y), target)) { setColor(xr, y, fillColor); xr++; }
      // вверх/вниз проверяем полосы
      for (let xx = xl+1; xx < xr; xx++) {
        if (y > 0 && isSame(colorAt(xx, y-1), target)) stack.push([xx, y-1]);
        if (y < h-1 && isSame(colorAt(xx, y+1), target)) stack.push([xx, y+1]);
      }
    }
    ctx.putImageData(imgData,0,0);
    window.Layers.composeLayers(); // убедиться, что базовый холст свёл слои
    saveState();
  }

  // Стирание по контуру
  function floodErase(ctx, startX, startY) {
    const w = canvas.width;
    const h = canvas.height;
    const dpr = window.App.getDpr();
    const sx = Math.floor(startX * dpr);
    const sy = Math.floor(startY * dpr);

    const imgData = ctx.getImageData(0,0,w,h);
    const data = imgData.data;

    function colorAt(x,y){ const off = (y*w + x)*4; return [data[off],data[off+1],data[off+2],data[off+3]]; }
    function setAlpha0(x,y){ const off = (y*w + x)*4; data[off+3]=0; }
    function isSame(c1,c2,t=20){ return Math.abs(c1[0]-c2[0])<=t && Math.abs(c1[1]-c2[1])<=t && Math.abs(c1[2]-c2[2])<=t; }

    const target = colorAt(sx, sy);
    const stack = [[sx, sy]];
    while (stack.length) {
      const [x, y] = stack.pop();
      // влево
      let xl = x;
      while (xl >= 0 && isSame(colorAt(xl, y), target)) { setAlpha0(xl, y); xl--; }
      // вправо
      let xr = x + 1;
      while (xr < w && isSame(colorAt(xr, y), target)) { setAlpha0(xr, y); xr++; }
      // вверх/вниз
      for (let xx = xl+1; xx < xr; xx++) {
        if (y > 0 && isSame(colorAt(xx, y-1), target)) stack.push([xx, y-1]);
        if (y < h-1 && isSame(colorAt(xx, y+1), target)) stack.push([xx, y+1]);
      }
    }
    ctx.putImageData(imgData,0,0);
    window.Layers.composeLayers();
    saveState();
  }

  // Заливка текстурой
  function floodFillTexture(ctx, startX, startY, patternCanvas) {
    const pattern = ctx.createPattern(patternCanvas, 'repeat');
    // создаём маску заливки на временном холсте
    const tmp = document.createElement('canvas');
    tmp.width = canvas.width;
    tmp.height = canvas.height;
    const tctx = tmp.getContext('2d');

    // копия текущего изображения
    const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
    tctx.putImageData(imgData,0,0);

    // в маске красим целевую область белым
    floodFill(tctx, startX, startY, [255,255,255]);

    // применяем паттерн через source-in
    ctx.save();
    ctx.fillStyle = pattern;
    ctx.globalCompositeOperation = 'source-in';
    ctx.drawImage(tmp, 0, 0);
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.restore();

    window.Layers.composeLayers();
    saveState();
  }

  // Тени и блики
  function addShadow(ctx,x,y,r) {
    ctx.save();
    const grad=ctx.createRadialGradient(x,y,r*0.5,x,y,r*1.5);
    grad.addColorStop(0,'rgba(0,0,0,0.3)');
    grad.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=grad;
    ctx.beginPath();
    ctx.arc(x,y,r*1.5,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function addHighlight(ctx,x,y,r) {
    ctx.save();
    const grad=ctx.createRadialGradient(x-r*0.3,y-r*0.3,0,x-r*0.3,y-r*0.3,r*0.5);
    grad.addColorStop(0,'rgba(255,255,255,0.8)');
    grad.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=grad;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  // Аниме-эффекты
  function animeBlush(ctx,x,y,r, color='rgba(255,100,120,0.4)') {
    ctx.save();
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.ellipse(x,y,r*1.2,r*0.5,0,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function animeEyeHighlight(ctx,x,y,r) {
    ctx.save();
    ctx.fillStyle='rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(x-r*0.3,y-r*0.3,r*0.2,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  window.Tools = {
    eraser, smudge, blur, lineTool,
    floodFill, floodErase, floodFillTexture,
    addShadow, addHighlight,
    animeBlush, animeEyeHighlight
  };
})();

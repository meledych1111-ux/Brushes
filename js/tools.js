(() => {
  const rand = n => (Math.random() - 0.5) * n;

  /* ========== 4 БАЗОВЫХ ИНСТРУМЕНТА ========== */
  const Tools = {
    eraser: (ctx, x, y, r) => {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    smudge: (ctx, x, y, r) => {
      const img = ctx.getImageData(x - r, y - r, r * 2, r * 2);
      ctx.putImageData(img, x - r + rand(2), y - r + rand(2));
    },
    blur: (ctx, x, y, r) => {
      const w = Math.max(1, r * 2);
      const h = Math.max(1, r * 2);
      const img = ctx.getImageData(x - r, y - r, w, h);
      const data = img.data;
      for (let y0 = 0; y0 < h; y0++) {
        for (let x0 = 0; x0 < w; x0++) {
          const i = (y0 * w + x0) * 4;
          const right = x0 + 1 < w ? i + 4 : i;
          const down = y0 + 1 < h ? i + w * 4 : i;
          data[i] = (data[i] + data[right] + data[down]) / 3;
          data[i + 1] = (data[i + 1] + data[right + 1] + data[down + 1]) / 3;
          data[i + 2] = (data[i + 2] + data[right + 2] + data[down + 2]) / 3;
        }
      }
      ctx.putImageData(img, x - r, y - r);
    },
    lineTool: (ctx, x1, y1, x2, y2, color, width) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    }
  };

  window.Tools = Tools;
})();

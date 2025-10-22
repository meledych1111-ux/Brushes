(() => {
  const rand = n => (Math.random() - 0.5) * n;
  const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

  const EXTRA = {
    head3d: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op * 0.3;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(x + r * 0.4, y + r * 0.2, r * 0.5, r * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = op * 0.5;
      ctx.beginPath();
      ctx.ellipse(x - r * 0.2, y - r * 0.4, r * 0.3, r * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
    },
    eye: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(x, y, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
    },
    hair: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.strokeStyle = color;
      ctx.lineWidth = r / 5;
      for (let i = 0; i < 20; i++) {
        const ang = rand(0.8) - Math.PI / 2;
        const len = r * (0.8 + Math.random() * 0.7);
        ctx.beginPath();
        ctx.moveTo(x + rand(r * 0.3), y);
        ctx.quadraticCurveTo(
          x + rand(r * 0.4), y - len * 0.6,
          x + rand(r * 0.3), y - len
        );
        ctx.stroke();
      }
    },
    skin: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op * 0.4;
      ctx.fillStyle = color;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
      ctx.globalAlpha = op * 0.2;
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc(x + rand(r), y + rand(r), 1, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    lips: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = op * 0.6;
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.ellipse(x - r * 0.3, y - r * 0.2, r * 0.4, r * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
    },
    planar: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.fillStyle = color;
      ctx.fillRect(x - r, y - r * 0.2, r * 2, r * 0.4);
    },
    triangle3d: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op * 0.3;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 4);
      ctx.lineTo(x - r * 0.7 + 4, y + r * 0.7 + 4);
      ctx.lineTo(x + r * 0.7 + 4, y + r * 0.7 + 4);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = op;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x - r * 0.7, y + r * 0.7);
      ctx.lineTo(x + r * 0.7, y + r * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = op * 0.5;
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x - r * 0.3, y);
      ctx.lineTo(x + r * 0.3, y);
      ctx.closePath();
      ctx.fill();
    },
    sphere3d: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op * 0.3;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(x + r * 0.3, y + r * 0.3, r * 0.8, r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = op;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = op * 0.6;
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    },
    smudge: (ctx, x, y, r, color, op) => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = op * 0.3;
      const w = ctx.canvas.width, h = ctx.canvas.height;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.clip();
      ctx.drawImage(ctx.canvas,
        x - r, y - r, r * 2, r * 2,
        x - r + rand(r * 0.3), y - r + rand(r * 0.3), r * 2, r * 2);
      ctx.restore();
    },
    pixel: (ctx, x, y, r, color, op) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = op;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
      ctx.globalCompositeOperation = 'source-over';
    },
    metal: (ctx, x, y, r, color, op) => {
      const g = ctx.createLinearGradient(x - r, y, x + r, y);
      g.addColorStop(0, 'rgba(255,255,255,' + op + ')');
      g.addColorStop(0.5, color);
      g.addColorStop(1, 'rgba(0,0,0,' + op + ')');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    },
    velvet3d: (ctx, x, y, r, color, op) => {
      for (let i = 0; i < 10; i++) {
        ctx.globalAlpha = op * 0.3;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + rand(r * 0.6), y + rand(r * 0.6), r * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    /* 30 заглушек до 50 уникальных */
    ...Object.fromEntries(
      Array.from({ length: 30 }, (_, i) => [
        `texture${(i + 20).toString().padStart(2, '0')}`,
        (ctx, x, y, r, color, op) => {
          const list = ['metal', 'velvet3d', 'smudge', 'sphere3d', 'triangle3d'];
          const key = list[i % list.length];
          EXTRA[key](ctx, x, y, r, color, op);
        }
      ])
    )
  };

  /* ========== СЛОИ ========== */
  const layerData = [];
  let activeLayer = 0;

  function createLayer() {
    const c = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    const rect = window.core.canvas.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    const cx = c.getContext('2d');
    cx.scale(dpr, dpr);
    layerData.push({ canvas: c, ctx: cx });
    return layerData.length - 1;
  }
  createLayer();

  window.setActiveLayer = idx => {
    activeLayer = idx;
    document.getElementById('layerSelect').value = idx;
  };
  window.getActiveCtx = () => layerData[activeLayer].ctx;

  window.setLayerOpacity = (idx, alpha) => {
    layerData[idx].canvas.style.opacity = alpha;
  };

  window.composeLayers = () => {
    const main = window.core.ctx;
    main.clearRect(0, 0, main.canvas.width, main.canvas.height);
    layerData.forEach(layer => {
      main.drawImage(layer.canvas, 0, 0);
    });
  };

  /* ========== ЛАСТИКИ ========== */
  const erasers = {
    soft: (ctx, x, y, r, op) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = op * 0.04;
      for (let i = r; i > 0; i -= 2) {
        ctx.beginPath();
        ctx.arc(x, y, i, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    },
    hard: (ctx, x, y, r, op) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = op;
      ctx.fillRect(x - r, y - r * 0.2, r * 2, r * 0.4);
      ctx.globalCompositeOperation = 'source-over';
    },
    smudge: EXTRA.smudge,
    pixel: (ctx, x, y, r, op) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = op;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  /* ========== БАЗОВЫЕ ФИГУРЫ (Shift) ========== */
  const figures = {
    none: () => {},
    head: (ctx, x1, y1, x2, y2) => {
      const r = dist(x1, y1, x2, y2) / 2;
      EXTRA.head3d(ctx, (x1 + x2) / 2, (y1 + y2) / 2, r, ctx.fillStyle, ctx.globalAlpha);
    },
    circle: (ctx, x1, y1, x2, y2) => {
      const r = dist(x1, y1, x2, y2);
      EXTRA.sphere3d(ctx, x1, y1, r, ctx.fillStyle, ctx.globalAlpha);
    },
    triangle: (ctx, x1, y1, x2, y2) => {
      const r = dist(x1, y1, x2, y2);
      EXTRA.triangle3d(ctx, x1, y1, r, ctx.fillStyle, ctx.globalAlpha);
    }
  };

  /* ========== ЭКСПОРТ ========== */
  window.EXTRA = EXTRA;
  window.erasers = erasers;
  window.figures = figures;
  window.layerData = layerData;
  window.setActiveLayer = window.setActiveLayer;
  window.getActiveCtx = window.getActiveCtx;
  window.composeLayers = window.composeLayers;
})();

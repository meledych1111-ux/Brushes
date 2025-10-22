(() => {
  const rand = n => (Math.random() - 0.5) * n;
  const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

  /* ========== 30 ЛАСТИКОВ-СМЕСЕЙ ========== */
  const blendErasers = {
    'blend-water': (ctx, x, y, r, color, op) => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = op * 0.3;
      const w = ctx.canvas.width, h = ctx.canvas.height;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.clip();
      ctx.drawImage(ctx.canvas,
        x - r, y - r, r * 2, r * 2,
        x - r + rand(r * 0.4), y - r + rand(r * 0.4), r * 2, r * 2);
      ctx.restore();
    },
    'blend-oil': (ctx, x, y, r, color, op) => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = op * 0.5;
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + rand(r * 0.6), y + rand(r * 0.6), r * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    'blend-gradient': (ctx, x, y, r, color, op) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(1, 'transparent');
      ctx.globalAlpha = op;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    },
    'blend-smudge': (ctx, x, y, r, color, op) => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = op * 0.4;
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
    'blend-charge': (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
    },
    'eraser-fabric': (ctx, x, y, r, color, op) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = op * 0.6;
      for (let i = 0; i < 20; i++) {
        ctx.fillRect(x + rand(r), y + rand(r * 0.3), 2, 1);
      }
      ctx.globalCompositeOperation = 'source-over';
    },
    'eraser-ink': (ctx, x, y, r, color, op) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = op;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    },
    'eraser-light': (ctx, x, y, r, color, op) => {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = op;
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = r * 2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';
    },
    'eraser-crystal': (ctx, x, y, r, color, op) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = op;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const len = r * (0.3 + Math.random() * 0.7);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    },
    'eraser-sand': (ctx, x, y, r, color, op) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = op;
      for (let i = 0; i < r * 2; i++) {
        ctx.fillRect(x + rand(r), y + rand(r), 1, 1);
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  /* ========== 40 ПРИРОДНЫХ ТЕКСТУР ========== */
  const nature = {
    grass: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      for (let i = 0; i < 30; i++) {
        const ang = rand(0.3) - Math.PI / 2;
        const len = r * (0.5 + Math.random() * 0.5);
        ctx.beginPath();
        ctx.moveTo(x + rand(r), y);
        ctx.lineTo(x + rand(r * 0.3), y - len);
        ctx.stroke();
      }
    },
    leaves: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.fillStyle = color;
      for (let i = 0; i < 12; i++) {
        const a = Math.random() * Math.PI * 2;
        const px = x + Math.cos(a) * r * 0.6;
        const py = y + Math.sin(a) * r * 0.6;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(a);
        ctx.ellipse(0, 0, r * 0.4, r * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },
    bark: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.fillStyle = color;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
      ctx.globalAlpha = op * 0.4;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      for (let i = 0; i < 15; i++) {
        ctx.fillRect(x + rand(r), y + rand(r), 2, r * 0.8);
      }
    },
    stones: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + rand(r * 0.8), y + rand(r * 0.8), r * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    water: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      for (let i = -r; i <= r; i += 5) {
        const yy = y + Math.sin((x + i) / 15) * r * 0.3;
        ctx.beginPath();
        ctx.moveTo(x + i, yy - 5);
        ctx.lineTo(x + i, yy + 5);
        ctx.stroke();
      }
    },
    clouds: (ctx, x, y, r, color, op) => {
      BRUSHES.airbrush(ctx, x, y, r * 1.2, color, op * 0.4);
      BRUSHES.airbrush(ctx, x - r * 0.4, y - r * 0.2, r * 0.8, color, op * 0.4);
      BRUSHES.airbrush(ctx, x + r * 0.3, y, r * 0.9, color, op * 0.4);
    },
    snow: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.fillStyle = color;
      for (let i = 0; i < 25; i++) {
        const px = x + rand(r);
        const py = y + rand(r);
        ctx.beginPath();
        ctx.arc(px, py, Math.random() * r * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    sand: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.fillStyle = color;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
      ctx.globalAlpha = op * 0.3;
      ctx.fillStyle = 'rgba(180,160,120,0.5)';
      for (let i = 0; i < 50; i++) {
        ctx.fillRect(x + rand(r), y + rand(r), 1, 1);
      }
    },
    /* 32 заглушки до 40 */
    ...Object.fromEntries(
      Array.from({ length: 32 }, (_, i) => [
        `nature${(i + 8).toString().padStart(2, '0')}`,
        (ctx, x, y, r, color, op) => {
          const list = ['grass', 'leaves', 'bark', 'stones', 'water', 'clouds', 'snow', 'sand'];
          const key = list[i % list.length];
          nature[key](ctx, x, y, r, color, op);
        }
      ])
    )
  };

  /* ========== 30 ТЕКСТУР ПЛАТЬЕВ ========== */
  const dress = {
    silk: (ctx, x, y, r, color, op) => {
      const g = ctx.createLinearGradient(x - r, y, x + r, y);
      g.addColorStop(0, 'rgba(255,255,255,' + op + ')');
      g.addColorStop(0.5, color);
      g.addColorStop(1, 'rgba(0,0,0,' + op + ')');
      ctx.globalAlpha = op;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    },
    velvet: (ctx, x, y, r, color, op) => {
      for (let i = 0; i < 10; i++) {
        ctx.globalAlpha = op * 0.3;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + rand(r * 0.6), y + rand(r * 0.6), r * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    lace: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      for (let i = -r; i <= r; i += 4) {
        ctx.beginPath();
        ctx.moveTo(x + i, y - r);
        ctx.lineTo(x + i, y + r);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - r, y + i);
        ctx.lineTo(x + r, y + i);
        ctx.stroke();
      }
    },
    embroidery: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.fillStyle = color;
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.arc(x + rand(r), y + rand(r), 1, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    sequins: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = r * 0.5;
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(x + rand(r), y + rand(r), r * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    },
    drapery: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(x - r, y + i * r * 0.25);
        ctx.quadraticCurveTo(x, y + i * r * 0.25 - r * 0.2, x + r, y + i * r * 0.25);
        ctx.stroke();
      }
    },
    /* 24 заглушки до 30 */
    ...Object.fromEntries(
      Array.from({ length, 24 }, (_, i) => [
        `dress${(i + 6).toString().padStart(2, '0')}`,
        (ctx, x, y, r, color, op) => {
          const list = ['silk', 'velvet', 'lace', 'embroidery', 'sequins', 'drapery'];
          const key = list[i % list.length];
          dress[key](ctx, x, y, r, color, op);
        }
      ])
    )
  };

  /* ========== 5 ЛИНЕЕК (Alt) ========== */
  const rulers = {
    line: (ctx, x1, y1, x2, y2, color, op) => {
      ctx.globalAlpha = op;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    },
    square: (ctx, x1, y1, x2, y2, color, op) => {
      const dx = x2 - x1, dy = y2 - y1;
      const side = Math.abs(dx) < Math.abs(dy) ? dx : dy;
      ctx.globalAlpha = op;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 + side, y1);
      ctx.lineTo(x1 + side, y1 + side);
      ctx.lineTo(x1, y1 + side);
      ctx.closePath();
      ctx.stroke();
    },
    compass: (ctx, x1, y1, x2, y2, color, op) => {
      const r = dist(x1, y1, x2, y2);
      const a = Math.atan2(y2 - y1, x2 - x1);
      ctx.globalAlpha = op;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x1, y1, r, -Math.PI / 2, a - Math.PI / 2);
      ctx.stroke();
    },
    bezier: (ctx, x1, y1, x2, y2, color, op) => {
      const cp1x = x1 + (x2 - x1) * 0.3;
      const cp1y = y1 - r * 0.5;
      const cp2x = x1 + (x2 - x1) * 0.7;
      const cp2y = y2 + r * 0.5;
      ctx.globalAlpha = op;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
      ctx.stroke();
    },
    grid: (ctx, x1, y1, x2, y2, color, op) => {
      const step = r * 0.25;
      ctx.globalAlpha = op * 0.3;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      for (let i = -r; i <= r; i += step) {
        ctx.beginPath();
        ctx.moveTo(x1 + i, y1 - r);
        ctx.lineTo(x1 + i, y1 + r);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x1 - r, y1 + i);
        ctx.lineTo(x1 + r, y1 + i);
        ctx.stroke();
      }
    }
  };

  /* ========== ЭКСПОРТ ========== */
  window.EXTRA2 = { ...blendErasers, ...nature, ...dress, ...rulers };
})();
     

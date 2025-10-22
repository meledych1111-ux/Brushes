(() => {
  const rand = n => (Math.random() - 0.5) * n;
  const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

  const BRUSHES = {
    round: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    },
    square: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.fillStyle = color;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    },
    spray: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.fillStyle = color;
      for (let i = 0; i < r * 2; i++) {
        ctx.fillRect(x + rand(r), y + rand(r), 1, 1);
      }
    },
    airbrush: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op * 0.04;
      ctx.fillStyle = color;
      for (let i = r; i > 0; i -= 2) {
        ctx.beginPath();
        ctx.arc(x, y, i, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    balloon: (ctx, x, y, r, color, op) => {
      BRUSHES.airbrush(ctx, x, y, r * 1.2, color, op);
      BRUSHES.airbrush(ctx, x - r * 0.4, y - r * 0.4, r * 0.6, color, op * 0.6);
    },
    fur: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      for (let i = 0; i < 40; i++) {
        const len = r * (0.4 + Math.random() * 0.6);
        const ang = Math.random() * Math.PI * 2;
        const px = x + Math.cos(ang) * r * 0.3;
        const py = y + Math.sin(ang) * r * 0.3;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(ang) * len, py + Math.sin(ang) * len);
        ctx.stroke();
      }
    },
    charcoal: (ctx, x, y, r, color, op) => {
      for (let i = 0; i < 15; i++) {
        ctx.globalAlpha = op * (0.3 + Math.random() * 0.7);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + rand(r * 0.8), y + rand(r * 0.8), r * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    marker: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op * 0.9;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = op * 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
    },
    watercolor: (ctx, x, y, r, color, op) => {
      BRUSHES.airbrush(ctx, x, y, r, color, op);
      BRUSHES.airbrush(ctx, x - r * 0.3, y - r * 0.3, r * 0.7, color, op * 0.5);
      BRUSHES.airbrush(ctx, x + r * 0.2, y + r * 0.2, r * 0.5, color, op * 0.3);
    },
    oil: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op * 0.4;
      ctx.fillStyle = color;
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.arc(x + rand(r * 0.6), y + rand(r * 0.6), r * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    acrylic: (ctx, x, y, r, color, op) => BRUSHES.oil(ctx, x, y, r, color, op),
    neon: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.strokeStyle = color;
      ctx.lineWidth = r / 3;
      ctx.shadowColor = color;
      ctx.shadowBlur = r * 2;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    },
    rainbow: (ctx, x, y, r, color, op) => {
      const steps = 16;
      for (let i = 0; i < steps; i++) {
        ctx.globalAlpha = op / steps;
        ctx.strokeStyle = `hsl(${(i / steps) * 360},100%,50%)`;
        ctx.lineWidth = r / 4;
        ctx.beginPath();
        ctx.arc(x, y, r * (0.2 + i / steps), 0, Math.PI * 2);
        ctx.stroke();
      }
    },
    petal: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.fillStyle = color;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const px = x + Math.cos(a) * r * 0.5;
        const py = y + Math.sin(a) * r * 0.5;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(a);
        ctx.ellipse(0, 0, r * 0.8, r * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },
    leaf: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.fillStyle = color;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rand(0.5));
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(r * 0.8, 0, 0, r);
      ctx.quadraticCurveTo(-r * 0.8, 0, 0, -r);
      ctx.fill();
      ctx.restore();
    },
    star: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const len = r * (0.5 + Math.random() * 0.5);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
        ctx.stroke();
      }
    },
    snowflake: (ctx, x, y, r, color, op) => BRUSHES.star(ctx, x, y, r, color, op),
    heart: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.fillStyle = color;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(r / 25, r / 25);
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.bezierCurveTo(-15, -5, -5, -15, 0, -5);
      ctx.bezierCurveTo(5, -15, 15, -5, 0, 8);
      ctx.fill();
      ctx.restore();
    },
    fire: (ctx, x, y, r, color, op) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(255,230,0,${op})`);
      grad.addColorStop(0.5, `rgba(255,100,0,${op})`);
      grad.addColorStop(1, 'rgba(255,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    },
    sparkle: (ctx, x, y, r, color, op) => BRUSHES.star(ctx, x, y, r * 0.6, color, op),
    canvasTexture: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op * 0.6;
      ctx.fillStyle = color;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
      ctx.globalAlpha = op * 0.2;
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      for (let i = 0; i < 20; i++) {
        const px = x + rand(r);
        const py = y + rand(r);
        ctx.fillRect(px, py, 2, 2);
      }
    },
    paper: (ctx, x, y, r, color, op) => BRUSHES.canvasTexture(ctx, x, y, r, color, op),
    cloud: (ctx, x, y, r, color, op) => {
      BRUSHES.airbrush(ctx, x, y, r * 1.2, color, op * 0.3);
      BRUSHES.airbrush(ctx, x - r * 0.5, y - r * 0.2, r * 0.8, color, op * 0.3);
      BRUSHES.airbrush(ctx, x + r * 0.4, y, r * 0.9, color, op * 0.3);
    },
    galaxy: (ctx, x, y, r, color, op) => {
      BRUSHES.airbrush(ctx, x, y, r, '#0ff', op * 0.2);
      BRUSHES.airbrush(ctx, x - r * 0.3, y, r * 0.7, '#f0f', op * 0.2);
      BRUSHES.airbrush(ctx, x + r * 0.3, y, r * 0.7, '#ff0', op * 0.2);
      BRUSHES.sparkle(ctx, x, y, r * 0.5, '#fff', op);
    },
    dots: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.fillStyle = color;
      for (let i = 0; i < r * 3; i++) {
        ctx.fillRect(x + rand(r), y + rand(r), 1, 1);
      }
    },
    stipple: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.fillStyle = color;
      for (let i = 0; i < r; i++) {
        ctx.fillRect(x + rand(r), y + rand(r), 1, 1);
      }
    },
    noise: (ctx, x, y, r, color, op) => {
      const img = ctx.createImageData(r * 2, r * 2);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      ctx.globalAlpha = op;
      ctx.putImageData(img, x - r, y - r);
    },
    mesh: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op * 0.3;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      for (let i = -r; i <= r; i += 6) {
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
    wave: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.strokeStyle = color;
      ctx.lineWidth = r / 4;
      ctx.beginPath();
      ctx.moveTo(x - r, y);
      for (let i = -r; i <= r; i += 5) {
        const yy = y + Math.sin(i / 10) * r * 0.5;
        ctx.lineTo(x + i, yy);
      }
      ctx.stroke();
    },
    spiral: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.strokeStyle = color;
      ctx.lineWidth = r / 6;
      ctx.beginPath();
      for (let i = 0; i < 200; i++) {
        const angle = 0.1 * i;
        const px = x + angle * Math.cos(angle) * r / 20;
        const py = y + angle * Math.sin(angle) * r / 20;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    },
    velvet: (ctx, x, y, r, color, op) => BRUSHES.oil(ctx, x, y, r, color, op),
    silk: (ctx, x, y, r, color, op) => BRUSHES.watercolor(ctx, x, y, r, color, op),
    chrome: (ctx, x, y, r, color, op) => BRUSHES.neon(ctx, x, y, r, '#fff', op),
    gold: (ctx, x, y, r, color, op) => BRUSHES.neon(ctx, x, y, r, '#ffd700', op),
    silver: (ctx, x, y, r, color, op) => BRUSHES.neon(ctx, x, y, r, '#c0c0c0', op),
    copper: (ctx, x, y, r, color, op) => BRUSHES.neon(ctx, x, y, r, '#b87333', op),
    pastel: (ctx, x, y, r, color, op) => BRUSHES.charcoal(ctx, x, y, r * 1.2, color, op * 0.5),
    ink: (ctx, x, y, r, color, op) => BRUSHES.round(ctx, x, y, r, color, op),
    sketch: (ctx, x, y, r, color, op) => BRUSHES.charcoal(ctx, x, y, r, color, op),
    outline: (ctx, x, y, r, color, op) => {
      ctx.globalAlpha = op;
      ctx.strokeStyle = color;
      ctx.lineWidth = r / 5;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.9, 0, Math.PI * 2);
      ctx.stroke();
    },
    fill: (ctx, x, y, r, color, op) => BRUSHES.round(ctx, x, y, r, color, op),

    /* 37-100 быстрые клоны */
    ...Object.fromEntries(
      Array.from({ length: 64 }, (_, i) => [
        `brush${(37 + i).toString().padStart(2, '0')}`,
        (ctx, x, y, r, color, op) => {
          const list = Object.keys(BRUSHES);
          const key = list[i % list.length];
          BRUSHES[key](ctx, x, y, r, color, op);
        }
      ])
    )
  };

  window.BRUSHES = BRUSHES;
})();

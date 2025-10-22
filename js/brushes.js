(() => {
  const rand = n => (Math.random() - 0.5) * n;
  const BRUSHES = {
    'Круглая': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op; ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    },
    'Квадратная': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op; ctx.fillStyle = color;
      ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
    },
    'Контур': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op; ctx.strokeStyle = color; ctx.lineWidth = Math.max(1, r / 4);
      ctx.beginPath(); ctx.arc(x, y, r * 0.9, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    },
    'Карандаш (мягкий)': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op * 0.6; ctx.fillStyle = color;
      for (let i = 0; i < r; i++) { ctx.fillRect(x + rand(r * 0.3), y + rand(r * 0.3), 1, 1); }
      ctx.restore();
    },
    'Карандаш (твёрдый)': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op; ctx.strokeStyle = color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.1, y + 0.1); ctx.stroke(); ctx.restore();
    },
    'Карандаш (цветной)': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op * 0.8; ctx.strokeStyle = color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + rand(r * 0.5), y + rand(r * 0.5)); ctx.stroke(); ctx.restore();
    },
    'Карандаш (механический)': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op; ctx.strokeStyle = color; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.1, y + 0.1); ctx.stroke(); ctx.restore();
    },
    'Карандаш (эскизный)': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op * 0.7; ctx.strokeStyle = color; ctx.lineWidth = 1;
      for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + rand(r * 0.5), y + rand(r * 0.5)); ctx.stroke(); }
      ctx.restore();
    },
    'Щетина': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = op; ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + rand(r), y + rand(r)); ctx.stroke(); }
      ctx.restore();
    },
    'Плоская кисть': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op; ctx.fillStyle = color; ctx.fillRect(x - r, y - r / 3, r * 2, r * 0.6); ctx.restore();
    },
    'Веерная кисть': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = op; ctx.lineWidth = 1;
      for (let i = -5; i <= 5; i++) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + i * 2, y - r); ctx.stroke(); }
      ctx.restore();
    },
    'Сухая кисть': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op * 0.7; ctx.fillStyle = color;
      for (let i = 0; i < r * 1.5; i++) { ctx.fillRect(x + rand(r), y + rand(r * 0.4), 1, 1); }
      ctx.restore();
    },
    'Мастихин': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op * 0.8; ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x - r, y + r); ctx.closePath(); ctx.fill(); ctx.restore();
    },
    'Масло (расширенная)': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op * 0.8; ctx.fillStyle = color;
      ctx.beginPath(); ctx.ellipse(x, y, r * 1.2, r * 0.8, rand(Math.PI), 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = op * 0.2; ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x - r + rand(r), y - r * 0.5 + rand(r)); ctx.lineTo(x + r + rand(r), y + r * 0.5 + rand(r)); ctx.stroke(); }
      ctx.restore();
    },
    'Акварель (расширенная)': (ctx, x, y, r, color, op) => {
      ctx.save(); const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, color); grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = op * 0.6; ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = op * 0.15; for (let i = 0; i < r * 2; i++) { ctx.fillRect(x + rand(r), y + rand(r), 1, 1); }
      ctx.restore();
    },
    'Холст': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op * 0.3; ctx.strokeStyle = color;
      for (let i = -r; i < r; i += 4) { ctx.beginPath(); ctx.moveTo(x - r, y + i); ctx.lineTo(x + r, y + i); ctx.stroke(); }
      for (let j = -r; j < r; j += 4) { ctx.beginPath(); ctx.moveTo(x + j, y - r); ctx.lineTo(x + j, y + r); ctx.stroke(); }
      ctx.restore();
    },
    'Бумага (акварельная)': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op * 0.2; ctx.fillStyle = color;
      for (let i = 0; i < r * 2; i++) { ctx.fillRect(x + rand(r), y + rand(r), 1, 1); }
      ctx.restore();
    },
    'Песок': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op * 0.5; ctx.fillStyle = color;
      for (let i = 0; i < r * 3; i++) { ctx.beginPath(); ctx.arc(x + rand(r), y + rand(r), Math.random() * 1.5, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    },
    'Мрамор': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op * 0.4; ctx.strokeStyle = color; ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x - r, y + rand(r)); for (let j = -r; j < r; j += 10) { ctx.lineTo(x + j, y + rand(r)); } ctx.stroke(); }
      ctx.restore();
    },
    'Шерсть': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = op * 0.6; ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + rand(r), y + rand(r)); ctx.stroke(); }
      ctx.restore();
    },
    'Кора дерева': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op * 0.6; ctx.fillStyle = color;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      for (let i = -r; i <= r; i += 4) { ctx.beginPath(); ctx.moveTo(x + i, y - r); ctx.lineTo(x + i + rand(2), y + r); ctx.stroke(); }
      ctx.restore();
    },
    'Камень': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op * 0.5; ctx.fillStyle = color;
      for (let i = 0; i < r * 2; i++) { ctx.beginPath(); ctx.arc(x + rand(r * 0.8), y + rand(r * 0.8), Math.random() * 2, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    },
    'Листва': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op * 0.7; ctx.fillStyle = color;
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(x + rand(r), y + rand(r), r * 0.4, r * 0.7, rand(Math.PI), 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    },
    'Вода (рябь)': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = op * 0.4;
      for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(x, y, r * i * 0.5, 0, Math.PI * 2); ctx.stroke(); }
      ctx.restore();
    },
    'Облака': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op * 0.3; ctx.fillStyle = color;
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(x + rand(r), y + rand(r), r * 0.6, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    },
    'Металл (шлифованный)': (ctx, x, y, r, color, op) => {
      ctx.save();
      const grad = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
      grad.addColorStop(0, '#fff'); grad.addColorStop(0.5, color); grad.addColorStop(1, '#000');
      ctx.globalAlpha = op; ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      for (let i = -r; i < r; i += 3) { ctx.beginPath(); ctx.moveTo(x - r, y + i); ctx.lineTo(x + r, y + i); ctx.stroke(); }
      ctx.restore();
    },
    'Стекло': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op * 0.3; ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.5, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    },
    'Ткань (джинса)': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op * 0.5; ctx.strokeStyle = color; ctx.lineWidth = 1;
      for (let i = -r; i <= r; i += 3) {
        ctx.beginPath(); ctx.moveTo(x - r, y + i); ctx.lineTo(x + r, y + i); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + i, y - r); ctx.lineTo(x + i, y + r); ctx.stroke();
      }
      ctx.restore();
    },
    'Керамика': (ctx, x, y, r, color, op) => {
      ctx.save();
      const grad = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
      grad.addColorStop(0, '#fff'); grad.addColorStop(0.5, color); grad.addColorStop(1, '#666');
      ctx.globalAlpha = op; ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    },
    'Каллиграфия': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = op; ctx.lineWidth = r * 0.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.1, y + 0.1); ctx.stroke(); ctx.restore();
    },
    'Тушь': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = op; ctx.lineWidth = r * 0.8; ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + rand(r * 0.2), y + rand(r * 0.2)); ctx.stroke(); ctx.restore();
    },
    'Маркер': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op * 0.4; ctx.fillStyle = color;
      ctx.fillRect(x - r, y - r / 2, r * 2, r); ctx.restore();
    },
    'Гуашь': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op * 0.9; ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = op * 0.2; for (let i = 0; i < r; i++) { ctx.fillRect(x + rand(r), y + rand(r), 1, 1); }
      ctx.restore();
    },
    'Пастель': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op * 0.5; ctx.fillStyle = color;
      for (let i = 0; i < r * 2; i++) { ctx.fillRect(x + rand(r), y + rand(r), 1, 1); }
      ctx.restore();
    },
    'Акрил': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op * 0.8; ctx.fillStyle = color;
      ctx.fillRect(x - r, y - r / 2, r * 2, r);
      ctx.globalAlpha = op * 0.2; ctx.fillStyle = '#fff';
      ctx.fillRect(x - r, y - r / 4, r * 2, r * 0.2); ctx.restore();
    },
    'Аэрограф': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op * 0.1; ctx.fillStyle = color;
      for (let i = 0; i < r * 10; i++) { ctx.beginPath(); ctx.arc(x + rand(r), y + rand(r), 1, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    },
    'Дым': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op * 0.15; ctx.fillStyle = color;
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(x + rand(r), y + rand(r), r * 0.8, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    },
    'Звёзды': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op; ctx.fillStyle = color;
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(x + rand(r * 2), y + rand(r * 2), Math.random() * 2, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    },
    'Штамп (лист)': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha = op; ctx.fillStyle = color;
      ctx.beginPath(); ctx.ellipse(x, y, r * 0.6, r, rand(Math.PI), 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  };

  window.BRUSHES = BRUSHES;
})();

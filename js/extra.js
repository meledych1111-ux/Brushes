(() => {
  const rand = n => (Math.random() - 0.5) * n;

  const FIGURES = {
    'Круг': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha=op; ctx.fillStyle=color;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); ctx.restore();
    },
    'Сфера': (ctx, x, y, r, color, op) => {
      ctx.save();
      const grad = ctx.createRadialGradient(x-r*0.3,y-r*0.3,r*0.2,x,y,r);
      grad.addColorStop(0,'#fff'); grad.addColorStop(0.3,color); grad.addColorStop(1,'#000');
      ctx.globalAlpha=op; ctx.fillStyle=grad;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); ctx.restore();
    },
    'Треугольник': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha=op; ctx.fillStyle=color;
      ctx.beginPath(); ctx.moveTo(x, y-r); ctx.lineTo(x-r, y+r); ctx.lineTo(x+r, y+r);
      ctx.closePath(); ctx.fill(); ctx.restore();
    },
    'Голова': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha=op; ctx.fillStyle=color;
      ctx.beginPath(); ctx.ellipse(x, y, r*0.8, r, 0, 0, Math.PI*2); ctx.fill(); ctx.restore();
    },
    'Глаз': (ctx, x, y, r, color, op) => {
      ctx.save();
      ctx.globalAlpha = op; ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(x, y, r*1.2, r*0.8, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r*0.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(x, y, r*0.2, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    },
    'Волосы': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.strokeStyle=color; ctx.globalAlpha=op; ctx.lineWidth=2;
      for (let i=0;i<10;i++){
        ctx.beginPath(); ctx.moveTo(x+rand(r), y+rand(r*0.2));
        ctx.quadraticCurveTo(x+rand(r*0.5), y-r*1.5, x+rand(r), y-r*2);
        ctx.stroke();
      }
      ctx.restore();
    },
    'Губы': (ctx, x, y, r, color, op) => {
      ctx.save(); ctx.globalAlpha=op; ctx.fillStyle=color;
      ctx.beginPath(); ctx.ellipse(x, y, r, r*0.5, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle='#000'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x-r, y); ctx.lineTo(x+r, y); ctx.stroke();
      ctx.restore();
    }
  };

  window.FIGURES = FIGURES;
})();

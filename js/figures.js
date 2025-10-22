// js/figures.js - готовые фигуры и штампы
(() => {
    const MATH_PI_2 = Math.PI * 2;
    const MATH_PI = Math.PI;
    const rand = (n) => (Math.random() - 0.5) * n;

    const FIGURES = {
        'Круг': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, MATH_PI_2);
            ctx.fill();
            ctx.restore();
        },

        'Квадрат': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color;
            ctx.fillRect(x - r, y - r, r * 2, r * 2);
            ctx.restore();
        },

        'Треугольник': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x, y - r);
            ctx.lineTo(x - r, y + r);
            ctx.lineTo(x + r, y + r);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        },

        'Сердце': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.bezierCurveTo(x, y - r/2, x - r, y - r, x - r, y);
            ctx.bezierCurveTo(x - r, y + r/2, x, y + r, x, y + r);
            ctx.bezierCurveTo(x, y + r, x + r, y + r/2, x + r, y);
            ctx.bezierCurveTo(x + r, y - r, x, y - r/2, x, y);
            ctx.fill();
            ctx.restore();
        },

        'Звезда': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 2 * MATH_PI / 5) - MATH_PI/2;
                const x1 = x + Math.cos(angle) * r;
                const y1 = y + Math.sin(angle) * r;
                const x2 = x + Math.cos(angle + MATH_PI/5) * r/2;
                const y2 = y + Math.sin(angle + MATH_PI/5) * r/2;
                
                if (i === 0) ctx.moveTo(x1, y1);
                else ctx.lineTo(x1, y1);
                ctx.lineTo(x2, y2);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        },

        'Смайлик': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            
            // Лицо
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, MATH_PI_2);
            ctx.fill();
            
            // Глаза
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(x - r/3, y - r/4, r/8, 0, MATH_PI_2);
            ctx.arc(x + r/3, y - r/4, r/8, 0, MATH_PI_2);
            ctx.fill();
            
            // Улыбка
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, r/2, 0.2, MATH_PI - 0.2);
            ctx.stroke();
            
            ctx.restore();
        }
    };

    window.FIGURES = FIGURES;
})();

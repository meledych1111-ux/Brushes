// js/hair-brushes-realistic.js
(() => {
    console.log('💇 Loading direction-accurate hair brushes...');

    if (!window.BRUSHES) window.BRUSHES = {};

    // === Утилиты ===
    const rand = (a, b) => a + Math.random() * (b - a);

    function lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    function darkenColor(color, percent) {
        return lightenColor(color, -percent);
    }

    // === Основная функция для пряди волос ===
    function drawHairStrand(ctx, x, y, size, color, opacity, direction, segments = 3) {
        const length = size * rand(1.5, 2.5);
        const width = size * rand(0.05, 0.08);

        // Цветовой градиент вдоль направления
        const grad = ctx.createLinearGradient(x, y, x + Math.cos(direction) * length, y + Math.sin(direction) * length);
        grad.addColorStop(0, darkenColor(color, 10));
        grad.addColorStop(1, lightenColor(color, 20));

        ctx.strokeStyle = grad;
        ctx.lineWidth = width;
        ctx.globalAlpha = opacity;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(x, y);

        // Лёгкое колебание внутри направления (естественность без отклонений вбок)
        for (let i = 1; i <= segments; i++) {
            const progress = i / segments;
            const offset = Math.sin(progress * Math.PI * 2) * size * 0.05; // микроволна
            const nx = x + Math.cos(direction) * length * progress - Math.sin(direction) * offset;
            const ny = y + Math.sin(direction) * length * progress + Math.cos(direction) * offset;
            ctx.lineTo(nx, ny);
        }

        ctx.stroke();
    }

    // === Кисти ===
    const ACCURATE_HAIR_BRUSHES = {
        'Волосы (реалистичные, по направлению)': (ctx, x, y, size, color, opacity, direction = -Math.PI / 2) => {
            ctx.save();
            for (let i = 0; i < 10; i++) {
                const offsetX = Math.cos(direction + Math.PI / 2) * rand(-size * 0.1, size * 0.1);
                const offsetY = Math.sin(direction + Math.PI / 2) * rand(-size * 0.1, size * 0.1);
                drawHairStrand(ctx, x + offsetX, y + offsetY, size, color, opacity * rand(0.8, 1), direction);
            }
            ctx.restore();
        },

        'Волосы (тонкие по направлению)': (ctx, x, y, size, color, opacity, direction = -Math.PI / 2) => {
            ctx.save();
            for (let i = 0; i < 6; i++) {
                const offsetX = Math.cos(direction + Math.PI / 2) * rand(-size * 0.05, size * 0.05);
                const offsetY = Math.sin(direction + Math.PI / 2) * rand(-size * 0.05, size * 0.05);
                drawHairStrand(ctx, x + offsetX, y + offsetY, size * 0.8, color, opacity, direction);
            }
            ctx.restore();
        },

        'Волосы (густые по направлению)': (ctx, x, y, size, color, opacity, direction = -Math.PI / 2) => {
            ctx.save();
            for (let i = 0; i < 18; i++) {
                const offsetX = Math.cos(direction + Math.PI / 2) * rand(-size * 0.2, size * 0.2);
                const offsetY = Math.sin(direction + Math.PI / 2) * rand(-size * 0.2, size * 0.2);
                drawHairStrand(ctx, x + offsetX, y + offsetY, size, color, opacity * rand(0.7, 1), direction);
            }
            ctx.restore();
        },
    };

    Object.assign(window.BRUSHES, ACCURATE_HAIR_BRUSHES);
    console.log(`💇 Added ${Object.keys(ACCURATE_HAIR_BRUSHES).length} direction-accurate hair brushes`);
})();

// js/hair-brushes.js - КИСТИ ДЛЯ РИСОВАНИЯ ВОЛОС
(() => {
    console.log('💇 Loading hair brushes...');
    
    // Если BRUSHES еще не существует, создаем его
    if (!window.BRUSHES) window.BRUSHES = {};
    
    // === СПЕЦИАЛИЗИРОВАННЫЕ КИСТИ ДЛЯ ВОЛОС ===
    const HAIR_BRUSHES = {
        // Основные кисти для волос
        'Волосы (тонкие)': (ctx, x, y, size, color, opacity) => {
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(1, size * 0.1);
            ctx.lineCap = 'round';
            
            // Рисуем несколько тонких волосинок
            for (let i = 0; i < 3; i++) {
                const angle = -Math.PI/6 + (Math.random() * Math.PI/3);
                const length = size * (2 + Math.random() * 2);
                const curve = size * 0.5 * (Math.random() - 0.5);
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.quadraticCurveTo(
                    x + Math.cos(angle) * length * 0.3 + curve,
                    y + Math.sin(angle) * length * 0.3,
                    x + Math.cos(angle) * length,
                    y + Math.sin(angle) * length
                );
                ctx.stroke();
            }
            ctx.restore();
        },
        
        'Волосы (густые)': (ctx, x, y, size, color, opacity) => {
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(1, size * 0.15);
            ctx.lineCap = 'round';
            
            // Больше волосинок для густоты
            for (let i = 0; i < 8; i++) {
                const angle = -Math.PI/4 + (Math.random() * Math.PI/2);
                const length = size * (1.5 + Math.random() * 1.5);
                const curve = size * 0.3 * (Math.random() - 0.5);
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.quadraticCurveTo(
                    x + Math.cos(angle) * length * 0.4 + curve,
                    y + Math.sin(angle) * length * 0.4,
                    x + Math.cos(angle) * length,
                    y + Math.sin(angle) * length
                );
                ctx.stroke();
            }
            ctx.restore();
        },
        
        'Волосы (волнистые)': (ctx, x, y, size, color, opacity) => {
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(1, size * 0.12);
            ctx.lineCap = 'round';
            
            for (let i = 0; i < 5; i++) {
                const angle = -Math.PI/5 + (Math.random() * Math.PI/2.5);
                const length = size * (2.5 + Math.random() * 1.5);
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                
                // Создаем волнистый эффект
                for (let j = 1; j <= 3; j++) {
                    const segmentLength = length / 3;
                    const wave = size * 0.2 * Math.sin(j * 1.5);
                    ctx.lineTo(
                        x + Math.cos(angle) * segmentLength * j + wave,
                        y + Math.sin(angle) * segmentLength * j
                    );
                }
                ctx.stroke();
            }
            ctx.restore();
        },
        
        'Волосы (кудрявые)': (ctx, x, y, size, color, opacity) => {
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(1, size * 0.08);
            ctx.lineCap = 'round';
            
            for (let i = 0; i < 6; i++) {
                const startAngle = Math.random() * Math.PI * 2;
                const curlRadius = size * (0.3 + Math.random() * 0.3);
                const curls = 2 + Math.floor(Math.random() * 3);
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                
                // Рисуем завитки
                for (let curl = 0; curl < curls; curl++) {
                    for (let a = 0; a <= Math.PI * 2; a += 0.5) {
                        const curlX = x + Math.cos(startAngle + a) * curlRadius * (curl + 1);
                        const curlY = y + Math.sin(startAngle + a) * curlRadius * (curl + 1);
                        ctx.lineTo(curlX, curlY);
                    }
                }
                ctx.stroke();
            }
            ctx.restore();
        },
        
        'Волосы (прямые)': (ctx, x, y, size, color, opacity) => {
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(1, size * 0.1);
            ctx.lineCap = 'round';
            
            // Прямые волосы с небольшим разбросом
            for (let i = 0; i < 4; i++) {
                const angle = -Math.PI/8 + (Math.random() * Math.PI/4);
                const length = size * (3 + Math.random() * 2);
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(
                    x + Math.cos(angle) * length,
                    y + Math.sin(angle) * length
                );
                ctx.stroke();
            }
            ctx.restore();
        },
        
        'Волосы (мелирование)': (ctx, x, y, size, color, opacity) => {
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.lineCap = 'round';
            
            const baseColor = color;
            const highlightColor = lightenColor(color, 40);
            
            for (let i = 0; i < 5; i++) {
                const angle = -Math.PI/6 + (Math.random() * Math.PI/3);
                const length = size * (2 + Math.random() * 2);
                
                // Чередуем цвета для эффекта мелирования
                ctx.strokeStyle = Math.random() > 0.7 ? highlightColor : baseColor;
                ctx.lineWidth = Math.max(1, size * 0.1 * (0.8 + Math.random() * 0.4));
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(
                    x + Math.cos(angle) * length,
                    y + Math.sin(angle) * length
                );
                ctx.stroke();
            }
            ctx.restore();
        },
        
        'Волосы (челка)': (ctx, x, y, size, color, opacity) => {
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(1, size * 0.15);
            ctx.lineCap = 'round';
            
            // Волосы челки - более короткие и густые
            for (let i = 0; i < 12; i++) {
                const angle = -Math.PI/2 - Math.PI/8 + (Math.random() * Math.PI/4);
                const length = size * (1 + Math.random() * 1.5);
                const curve = size * 0.2 * (Math.random() - 0.5);
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.quadraticCurveTo(
                    x + Math.cos(angle) * length * 0.5 + curve,
                    y + Math.sin(angle) * length * 0.5,
                    x + Math.cos(angle) * length,
                    y + Math.sin(angle) * length
                );
                ctx.stroke();
            }
            ctx.restore();
        },
        
        'Волосы (концы)': (ctx, x, y, size, color, opacity) => {
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(1, size * 0.08);
            ctx.lineCap = 'round';
            
            // Тонкие кончики волос
            for (let i = 0; i < 8; i++) {
                const angle = Math.random() * Math.PI * 2;
                const length = size * (1 + Math.random() * 2);
                
                // Начинаем не из центра, а с некоторого расстояния
                const startDist = size * 0.5;
                const startX = x + Math.cos(angle) * startDist;
                const startY = y + Math.sin(angle) * startDist;
                
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(
                    startX + Math.cos(angle) * length,
                    startY + Math.sin(angle) * length
                );
                ctx.stroke();
            }
            ctx.restore();
        },
        
        'Волосы (аниме)': (ctx, x, y, size, color, opacity) => {
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(2, size * 0.2);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            // Стилизованные аниме-волосы
            for (let i = 0; i < 4; i++) {
                const angle = -Math.PI/3 + (Math.random() * Math.PI/1.5);
                const length = size * (2 + Math.random() * 2);
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                
                // Резкие изгибы как в аниме
                const midX = x + Math.cos(angle) * length * 0.6;
                const midY = y + Math.sin(angle) * length * 0.6;
                const endX = x + Math.cos(angle + 0.3) * length;
                const endY = y + Math.sin(angle + 0.3) * length;
                
                ctx.lineTo(midX, midY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
            ctx.restore();
        },
        
        'Волосы (пучок)': (ctx, x, y, size, color, opacity) => {
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(1, size * 0.12);
            ctx.lineCap = 'round';
            
            // Волосы собранные в пучок
            for (let i = 0; i < 15; i++) {
                const startAngle = Math.random() * Math.PI * 2;
                const startDist = size * 0.3;
                const startX = x + Math.cos(startAngle) * startDist;
                const startY = y + Math.sin(startAngle) * startDist;
                
                const endAngle = startAngle + (Math.random() - 0.5) * 0.5;
                const length = size * (0.8 + Math.random() * 1.2);
                
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(
                    startX + Math.cos(endAngle) * length,
                    startY + Math.sin(endAngle) * length
                );
                ctx.stroke();
            }
            ctx.restore();
        }

    };
    
    // Вспомогательная функция для осветления цвета
    function lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
    
    // Добавляем кисти для волос в общую коллекцию
    Object.assign(window.BRUSHES, HAIR_BRUSHES);
    
    console.log(`💇 Added ${Object.keys(HAIR_BRUSHES).length} hair brushes`);
    console.log('🎨 Total brushes:', Object.keys(window.BRUSHES).length);
    
})();

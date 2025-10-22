// js/tools.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
(() => {
    const MATH_PI_2 = Math.PI * 2;

    const Tools = {
        // Ластик - УПРОЩЕННЫЙ И РАБОЧИЙ
        eraser: (ctx, x, y, size, color, opacity) => {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.globalAlpha = opacity || 0.8;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, MATH_PI_2);
            ctx.fill();
            ctx.restore();
        },

        // Размытие - ИСПРАВЛЕННОЕ
        blur: (ctx, x, y, size, color, opacity) => {
            try {
                // Получаем область вокруг точки
                const blurSize = Math.max(5, size);
                const imgData = ctx.getImageData(x - blurSize, y - blurSize, blurSize * 2, blurSize * 2);
                const data = imgData.data;
                
                // Простое размытие - усреднение соседних пикселей
                for (let i = 4; i < data.length - 4; i += 4) {
                    // Усредняем с соседями
                    data[i] = (data[i] + data[i - 4] + data[i + 4]) / 3;     // R
                    data[i + 1] = (data[i + 1] + data[i - 3] + data[i + 5]) / 3; // G  
                    data[i + 2] = (data[i + 2] + data[i - 2] + data[i + 6]) / 3; // B
                }
                
                ctx.putImageData(imgData, x - blurSize, y - blurSize);
            } catch (e) {
                console.log('Blur out of canvas bounds');
            }
        },

        // Смазка - УПРОЩЕННАЯ
        smudge: (ctx, x, y, size, color, opacity) => {
            try {
                const smudgeSize = Math.max(8, size);
                // Просто копируем область со смещением
                const imgData = ctx.getImageData(x - smudgeSize, y - smudgeSize, smudgeSize * 2, smudgeSize * 2);
                ctx.putImageData(imgData, x - smudgeSize + 2, y - smudgeSize + 2);
            } catch (e) {
                console.log('Smudge out of canvas bounds');
            }
        },

        // Градиент - ПРОСТОЙ И РАБОЧИЙ
        gradient: (ctx, x1, y1, x2, y2, color, opacity) => {
            ctx.save();
            
            // Берем второй цвет из интерфейса или используем белый
            const secondaryColor = document.getElementById('secondaryColorPicker')?.value || '#ffffff';
            
            const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, secondaryColor);
            
            ctx.globalAlpha = opacity || 1;
            ctx.fillStyle = gradient;
            ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
            
            ctx.restore();
        },

        // Заливка - УПРОЩЕННАЯ
        fill: (ctx, startX, startY, size, color, opacity) => {
            // Простая заливка всего холста для тестирования
            ctx.save();
            ctx.globalAlpha = opacity || 1;
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
        },

        // Осветление
        lighten: (ctx, x, y, size, color, opacity) => {
            ctx.save();
            ctx.globalCompositeOperation = 'lighten';
            ctx.globalAlpha = (opacity || 0.5) * 0.3;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, MATH_PI_2);
            ctx.fill();
            ctx.restore();
        },

        // Затемнение  
        darken: (ctx, x, y, size, color, opacity) => {
            ctx.save();
            ctx.globalCompositeOperation = 'darken';
            ctx.globalAlpha = (opacity || 0.5) * 0.3;
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, MATH_PI_2);
            ctx.fill();
            ctx.restore();
        }
    };

    window.Tools = Tools;
    console.log('✅ Tools loaded:', Object.keys(Tools));
})();

// js/tools.js - расширенные инструменты с исправленным размытием
(() => {
    const MATH_PI_2 = Math.PI * 2;

    const Tools = {
        // Ластик
        eraser: (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.globalAlpha = op || 0.8;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, MATH_PI_2);
            ctx.fill();
            ctx.restore();
        },

        // Смазка (улучшенная)
        smudge: (ctx, x, y, r, color, op) => {
            const size = Math.max(10, r * 2);
            const dpr = window.devicePixelRatio || 1;
            
            try {
                // Создаем временный canvas для смазки
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = size * dpr;
                tempCanvas.height = size * dpr;
                tempCtx.scale(dpr, dpr);
                
                // Копируем область для смазки
                const imgData = ctx.getImageData(
                    (x - size/2) * dpr, 
                    (y - size/2) * dpr, 
                    size * dpr, 
                    size * dpr
                );
                tempCtx.putImageData(imgData, 0, 0);
                
                // Применяем размытие Гаусса
                tempCtx.globalAlpha = 0.7;
                for (let i = 0; i < 2; i++) {
                    tempCtx.drawImage(tempCanvas, 1, 1, size-2, size-2, 0, 0, size, size);
                }
                
                // Возвращаем смазанную область со смещением
                ctx.globalAlpha = op || 0.5;
                ctx.drawImage(tempCanvas, x - size/2 + 2, y - size/2 + 2, size, size);
                ctx.globalAlpha = 1;
            } catch (e) {
                console.log('Smudge out of bounds');
            }
        },

        // Размытие (исправленное)
        blur: (ctx, x, y, r, color, op) => {
            const size = Math.max(8, r);
            const dpr = window.devicePixelRatio || 1;
            
            try {
                // Получаем область для размытия
                const imgData = ctx.getImageData(
                    (x - size) * dpr, 
                    (y - size) * dpr, 
                    size * 2 * dpr, 
                    size * 2 * dpr
                );
                const data = imgData.data;
                const width = size * 2 * dpr;
                const height = size * 2 * dpr;
                
                // Применяем размытие по Гауссу 3x3
                const tempData = new Uint8ClampedArray(data);
                
                for (let y = 1; y < height - 1; y++) {
                    for (let x = 1; x < width - 1; x++) {
                        const idx = (y * width + x) * 4;
                        
                        let r = 0, g = 0, b = 0, a = 0;
                        let count = 0;
                        
                        // Ядро размытия 3x3
                        for (let dy = -1; dy <= 1; dy++) {
                            for (let dx = -1; dx <= 1; dx++) {
                                const didx = ((y + dy) * width + (x + dx)) * 4;
                                r += tempData[didx];
                                g += tempData[didx + 1];
                                b += tempData[didx + 2];
                                a += tempData[didx + 3];
                                count++;
                            }
                        }
                        
                        data[idx] = r / count;
                        data[idx + 1] = g / count;
                        data[idx + 2] = b / count;
                        data[idx + 3] = a / count;
                    }
                }
                
                // Возвращаем размытое изображение
                ctx.putImageData(imgData, (x - size) * dpr, (y - size) * dpr);
            } catch (e) {
                console.log('Blur out of bounds');
            }
        },

        // Заливка
        fill: (ctx, startX, startY, r, color, op) => {
            const canvas = ctx.canvas;
            const dpr = window.devicePixelRatio || 1;
            const width = canvas.width / dpr;
            const height = canvas.height / dpr;
            
            try {
                // Получаем данные изображения
                const imageData = ctx.getImageData(0, 0, width * dpr, height * dpr);
                const data = imageData.data;
                
                const startPos = (Math.floor(startY) * width + Math.floor(startX)) * 4;
                const targetColor = {
                    r: data[startPos],
                    g: data[startPos + 1],
                    b: data[startPos + 2],
                    a: data[startPos + 3]
                };
                
                const fillR = parseInt(color[0]) || 0;
                const fillG = parseInt(color[1]) || 0;
                const fillB = parseInt(color[2]) || 0;
                
                const stack = [[Math.floor(startX), Math.floor(startY)]];
                const visited = new Set();
                
                while (stack.length > 0) {
                    const [x, y] = stack.pop();
                    const pos = (y * width + x) * 4;
                    
                    if (x < 0 || x >= width || y < 0 || y >= height) continue;
                    if (visited.has(`${x},${y}`)) continue;
                    
                    // Проверяем соответствие целевому цвету с допуском
                    if (Math.abs(data[pos] - targetColor.r) < 10 &&
                        Math.abs(data[pos + 1] - targetColor.g) < 10 &&
                        Math.abs(data[pos + 2] - targetColor.b) < 10 &&
                        Math.abs(data[pos + 3] - targetColor.a) < 10) {
                        
                        // Заливаем
                        data[pos] = fillR;
                        data[pos + 1] = fillG;
                        data[pos + 2] = fillB;
                        data[pos + 3] = 255;
                        
                        visited.add(`${x},${y}`);
                        
                        // Добавляем соседей
                        stack.push([x + 1, y]);
                        stack.push([x - 1, y]);
                        stack.push([x, y + 1]);
                        stack.push([x, y - 1]);
                    }
                }
                
                ctx.putImageData(imageData, 0, 0);
            } catch (e) {
                console.log('Flood fill error:', e);
            }
        },

        // Градиент
        gradient: (ctx, x1, y1, x2, y2, color, op) => {
            ctx.save();
            const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
            const secondaryColor = document.getElementById('secondaryColorPicker')?.value || '#ffffff';
            
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, secondaryColor);
            
            ctx.globalAlpha = op || 1;
            ctx.fillStyle = gradient;
            ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
            ctx.restore();
        },

        // Осветление
        lighten: (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalCompositeOperation = 'lighten';
            ctx.globalAlpha = op * 0.3 || 0.1;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, r, 0, MATH_PI_2);
            ctx.fill();
            ctx.restore();
        },

        // Затемнение
        darken: (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalCompositeOperation = 'darken';
            ctx.globalAlpha = op * 0.3 || 0.1;
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(x, y, r, 0, MATH_PI_2);
            ctx.fill();
            ctx.restore();
        },

        // Увеличение насыщенности
        saturate: (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalCompositeOperation = 'saturation';
            ctx.globalAlpha = op * 0.5 || 0.2;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, r, 0, MATH_PI_2);
            ctx.fill();
            ctx.restore();
        },

        // Уменьшение насыщенности
        desaturate: (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalCompositeOperation = 'saturation';
            ctx.globalAlpha = op * 0.5 || 0.2;
            ctx.fillStyle = '#808080';
            ctx.beginPath();
            ctx.arc(x, y, r, 0, MATH_PI_2);
            ctx.fill();
            ctx.restore();
        }
    };

    window.Tools = Tools;
})();

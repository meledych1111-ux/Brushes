// js/tools.js - инструменты редактирования
(() => {
    const MATH_PI_2 = Math.PI * 2;
    const rand = (n) => (Math.random() - 0.5) * n;

    const Tools = {
        // Ластик
        eraser: (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.globalAlpha = op || 1;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, MATH_PI_2);
            ctx.fill();
            ctx.restore();
        },

        // Смазка
        smudge: (ctx, x, y, r, color, op) => {
            const size = Math.max(5, r * 2);
            try {
                const imgData = ctx.getImageData(x - size/2, y - size/2, size, size);
                const data = imgData.data;
                
                // Простой эффект смазки - смещение пикселей
                for (let i = 0; i < data.length; i += 4) {
                    if (Math.random() > 0.7) {
                        const shift = Math.floor(Math.random() * 8);
                        if (i + shift * 4 < data.length) {
                            data[i] = data[i + shift * 4];
                            data[i + 1] = data[i + 1 + shift * 4];
                            data[i + 2] = data[i + 2 + shift * 4];
                        }
                    }
                }
                
                ctx.putImageData(imgData, x - size/2 + rand(3), y - size/2 + rand(3));
            } catch (e) {
                console.log('Smudge out of bounds');
            }
        },

        // Размытие
        blur: (ctx, x, y, r, color, op) => {
            const size = Math.max(3, r);
            try {
                const imgData = ctx.getImageData(x - size, y - size, size * 2, size * 2);
                const data = imgData.data;
                const tempData = new Uint8ClampedArray(data);
                
                for (let y = 1; y < size * 2 - 1; y++) {
                    for (let x = 1; x < size * 2 - 1; x++) {
                        const i = (y * size * 2 + x) * 4;
                        
                        // Простое размытие 3x3
                        let r = 0, g = 0, b = 0, a = 0;
                        let count = 0;
                        
                        for (let dy = -1; dy <= 1; dy++) {
                            for (let dx = -1; dx <= 1; dx++) {
                                const di = ((y + dy) * size * 2 + (x + dx)) * 4;
                                r += tempData[di];
                                g += tempData[di + 1];
                                b += tempData[di + 2];
                                a += tempData[di + 3];
                                count++;
                            }
                        }
                        
                        data[i] = r / count;
                        data[i + 1] = g / count;
                        data[i + 2] = b / count;
                        data[i + 3] = a / count;
                    }
                }
                
                ctx.putImageData(imgData, x - size, y - size);
            } catch (e) {
                console.log('Blur out of bounds');
            }
        },

        // Линия (для инструмента линейки)
        lineTool: (ctx, x1, y1, x2, y2, color, width) => {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.restore();
        },

        // Заливка (простая реализация)
        floodFill: (ctx, startX, startY, fillColor) => {
            const canvas = ctx.canvas;
            const width = canvas.width;
            const height = canvas.height;
            
            try {
                const imageData = ctx.getImageData(0, 0, width, height);
                const data = imageData.data;
                
                const startPos = (startY * width + startX) * 4;
                const targetColor = {
                    r: data[startPos],
                    g: data[startPos + 1],
                    b: data[startPos + 2],
                    a: data[startPos + 3]
                };
                
                const fillR = parseInt(fillColor[0]);
                const fillG = parseInt(fillColor[1]);
                const fillB = parseInt(fillColor[2]);
                
                const stack = [[startX, startY]];
                const visited = new Set();
                
                while (stack.length > 0) {
                    const [x, y] = stack.pop();
                    const pos = (y * width + x) * 4;
                    
                    if (x < 0 || x >= width || y < 0 || y >= height) continue;
                    if (visited.has(`${x},${y}`)) continue;
                    
                    // Проверяем соответствие целевому цвету
                    if (data[pos] === targetColor.r &&
                        data[pos + 1] === targetColor.g &&
                        data[pos + 2] === targetColor.b &&
                        data[pos + 3] === targetColor.a) {
                        
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
        }
    };

    // Вспомогательная функция для преобразования hex в RGB
    window.hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : [0, 0, 0];
    };

    window.Tools = Tools;
})();

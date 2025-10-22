// js/anime.js - инструменты для создания аниме-арта
(() => {
    const MATH_PI_2 = Math.PI * 2;
    const MATH_PI = Math.PI;
    const rand = (n) => (Math.random() - 0.5) * n;

    const ANIME_TOOLS = {
        // Аниме-глаза с автоматической симметрией
        createAnimeEyes: (ctx, faceX, faceY, faceWidth, eyeColor = '#87CEEB') => {
            ctx.save();
            
            const eyeSpacing = faceWidth * 0.3;
            const eyeY = faceY - faceWidth * 0.1;
            const eyeSize = faceWidth * 0.15;
            
            // Левый глаз
            drawAnimeEye(ctx, faceX - eyeSpacing, eyeY, eyeSize, eyeColor);
            
            // Правый глаз
            drawAnimeEye(ctx, faceX + eyeSpacing, eyeY, eyeSize, eyeColor);
            
            ctx.restore();
        },

        // Аниме-волосы с различными стилями
        createAnimeHair: (ctx, headX, headY, headRadius, style = 'default', hairColor = '#8B4513') => {
            ctx.save();
            
            switch (style) {
                case 'spiky':
                    drawSpikyHair(ctx, headX, headY, headRadius, hairColor);
                    break;
                case 'long':
                    drawLongHair(ctx, headX, headY, headRadius, hairColor);
                    break;
                case 'twintails':
                    drawTwinTails(ctx, headX, headY, headRadius, hairColor);
                    break;
                default:
                    drawDefaultHair(ctx, headX, headY, headRadius, hairColor);
            }
            
            ctx.restore();
        },

        // Аниме-румянец
        createAnimeBlush: (ctx, faceX, faceY, faceWidth, intensity = 0.6) => {
            ctx.save();
            
            const blushColor = '#FFB6C1';
            const blushSize = faceWidth * 0.15;
            const blushOffset = faceWidth * 0.25;
            
            // Левый румянец
            const gradient1 = ctx.createRadialGradient(
                faceX - blushOffset, faceY, 0,
                faceX - blushOffset, faceY, blushSize
            );
            gradient1.addColorStop(0, blushColor);
            gradient1.addColorStop(1, 'rgba(255,255,255,0)');
            
            ctx.globalAlpha = intensity;
            ctx.fillStyle = gradient1;
            ctx.beginPath();
            ctx.arc(faceX - blushOffset, faceY, blushSize, 0, MATH_PI_2);
            ctx.fill();
            
            // Правый румянец
            const gradient2 = ctx.createRadialGradient(
                faceX + blushOffset, faceY, 0,
                faceX + blushOffset, faceY, blushSize
            );
            gradient2.addColorStop(0, blushColor);
            gradient2.addColorStop(1, 'rgba(255,255,255,0)');
            
            ctx.fillStyle = gradient2;
            ctx.beginPath();
            ctx.arc(faceX + blushOffset, faceY, blushSize, 0, MATH_PI_2);
            ctx.fill();
            
            ctx.restore();
        },

        // Аниме-блики (эффект "sparkle")
        createSparkleEffect: (ctx, x, y, size, count = 5) => {
            ctx.save();
            
            for (let i = 0; i < count; i++) {
                const sparkleX = x + rand(size * 2);
                const sparkleY = y + rand(size * 2);
                const sparkleSize = size * (0.1 + Math.random() * 0.3);
                
                drawSparkle(ctx, sparkleX, sparkleY, sparkleSize);
            }
            
            ctx.restore();
        },

        // Аниме-контур (чистые черные линии)
        createAnimeOutline: (ctx, points, lineWidth = 2) => {
            ctx.save();
            
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            points.forEach((point, index) => {
                if (index === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            });
            
            ctx.stroke();
            ctx.restore();
        },

        // Селёдочный тон (screentone) для аниме
        createScreentone: (ctx, x, y, width, height, pattern = 'dots', density = 0.3) => {
            ctx.save();
            
            ctx.fillStyle = '#000000';
            ctx.globalAlpha = 0.3;
            
            switch (pattern) {
                case 'dots':
                    createDotScreentone(ctx, x, y, width, height, density);
                    break;
                case 'lines':
                    createLineScreentone(ctx, x, y, width, height, density);
                    break;
                case 'cross':
                    createCrossScreentone(ctx, x, y, width, height, density);
                    break;
            }
            
            ctx.restore();
        },

        // Аниме-тень для создания объема
        createAnimeShadow: (ctx, shape, lightDirection = 'top-left') => {
            ctx.save();
            
            // Создаем тень в зависимости от направления света
            const shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.fillStyle = shadowColor;
            
            // Смещение тени в зависимости от направления света
            let offsetX = 0, offsetY = 0;
            switch (lightDirection) {
                case 'top-left':
                    offsetX = 2;
                    offsetY = 2;
                    break;
                case 'top-right':
                    offsetX = -2;
                    offsetY = 2;
                    break;
                case 'bottom-left':
                    offsetX = 2;
                    offsetY = -2;
                    break;
                case 'bottom-right':
                    offsetX = -2;
                    offsetY = -2;
                    break;
            }
            
            // Применяем тень к фигуре
            ctx.translate(offsetX, offsetY);
            shape(ctx);
            ctx.translate(-offsetX, -offsetY);
            
            ctx.restore();
        }
    };

    // Вспомогательные функции для аниме-арта
    function drawAnimeEye(ctx, x, y, size, color) {
        // Белок глаза
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.ellipse(x, y, size * 1.2, size * 0.8, 0, 0, MATH_PI_2);
        ctx.fill();
        ctx.stroke();
        
        // Радужка
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.6, 0, MATH_PI_2);
        ctx.fill();
        
        // Зрачок
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x, y, size * 0.3, 0, MATH_PI_2);
        ctx.fill();
        
        // Блики
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x - size * 0.2, y - size * 0.2, size * 0.15, 0, MATH_PI_2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x + size * 0.1, y - size * 0.1, size * 0.08, 0, MATH_PI_2);
        ctx.fill();
        
        // Ресницы (верхние)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
            const angle = -MATH_PI/4 + (i / 2) * (MATH_PI/4);
            const length = size * 0.4;
            
            ctx.beginPath();
            ctx.moveTo(x - size * 0.8, y - size * 0.3);
            ctx.lineTo(
                x - size * 0.8 + Math.cos(angle) * length,
                y - size * 0.3 + Math.sin(angle) * length
            );
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(x + size * 0.8, y - size * 0.3);
            ctx.lineTo(
                x + size * 0.8 + Math.cos(Math.PI - angle) * length,
                y - size * 0.3 + Math.sin(Math.PI - angle) * length
            );
            ctx.stroke();
        }
    }

    function drawDefaultHair(ctx, x, y, radius, color) {
        ctx.fillStyle = color;
        ctx.strokeStyle = darkenColor(color, 20);
        ctx.lineWidth = 2;
        
        // Основная масса волос
        ctx.beginPath();
        ctx.arc(x, y - radius * 0.2, radius * 1.1, MATH_PI, 0, false);
        ctx.arc(x, y + radius * 0.3, radius * 0.9, 0, MATH_PI, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Отдельные пряди
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        for (let i = 0; i < 8; i++) {
            const angle = -MATH_PI/3 + (i / 7) * (2 * MATH_PI/3);
            const length = radius * (0.8 + Math.random() * 0.4);
            
            ctx.beginPath();
            ctx.moveTo(x, y - radius * 0.1);
            ctx.quadraticCurveTo(
                x + Math.cos(angle) * length/2 + rand(radius * 0.2),
                y + Math.sin(angle) * length/2 + rand(radius * 0.1),
                x + Math.cos(angle) * length,
                y + Math.sin(angle) * length
            );
            ctx.stroke();
        }
    }

    function drawSpikyHair(ctx, x, y, radius, color) {
        ctx.fillStyle = color;
        ctx.strokeStyle = darkenColor(color, 20);
        ctx.lineWidth = 2;
        
        // Основание волос
        ctx.beginPath();
        ctx.arc(x, y - radius * 0.1, radius * 1.1, MATH_PI, 0, false);
        ctx.arc(x, y + radius * 0.2, radius * 0.8, 0, MATH_PI, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Шипы-пряди
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        
        const spikes = 12;
        for (let i = 0; i < spikes; i++) {
            const baseAngle = (i / spikes) * MATH_PI_2;
            const spikeLength = radius * (0.5 + Math.random() * 0.5);
            const spikeAngle = baseAngle - MATH_PI/2;
            
            // Основной шип
            ctx.beginPath();
            ctx.moveTo(
                x + Math.cos(baseAngle) * radius * 0.9,
                y + Math.sin(baseAngle) * radius * 0.9 - radius * 0.2
            );
            ctx.lineTo(
                x + Math.cos(spikeAngle) * spikeLength,
                y + Math.sin(spikeAngle) * spikeLength - radius * 0.2
            );
            ctx.stroke();
            
            // Вторичные маленькие шипы
            for (let j = 0; j < 2; j++) {
                const smallAngle = spikeAngle + (Math.random() - 0.5) * 0.5;
                const smallLength = spikeLength * (0.3 + Math.random() * 0.2);
                
                ctx.beginPath();
                ctx.moveTo(
                    x + Math.cos(baseAngle) * radius * 0.9,
                    y + Math.sin(baseAngle) * radius * 0.9 - radius * 0.2
                );
                ctx.lineTo(
                    x + Math.cos(smallAngle) * smallLength,
                    y + Math.sin(smallAngle) * smallLength - radius * 0.2
                );
                ctx.stroke();
            }
        }
    }

    function drawLongHair(ctx, x, y, radius, color) {
        ctx.fillStyle = color;
        ctx.strokeStyle = darkenColor(color, 20);
        ctx.lineWidth = 2;
        
        // Верхняя часть волос
        ctx.beginPath();
        ctx.arc(x, y - radius * 0.1, radius * 1.1, MATH_PI, 0, false);
        ctx.fill();
        ctx.stroke();
        
        // Длинные пряди
        ctx.strokeStyle = color;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        
        for (let i = 0; i < 6; i++) {
            const angle = -MATH_PI/4 + (i / 5) * (MATH_PI/2);
            const length = radius * (2 + Math.random() * 1);
            
            ctx.beginPath();
            ctx.moveTo(x, y + radius * 0.2);
            ctx.quadraticCurveTo(
                x + Math.cos(angle) * length/3 + rand(radius * 0.3),
                y + radius * 0.5,
                x + Math.cos(angle) * length,
                y + length
            );
            ctx.stroke();
        }
        
        // Более тонкие пряди
        ctx.lineWidth = 3;
        for (let i = 0; i < 8; i++) {
            const angle = -MATH_PI/3 + (i / 7) * (2 * MATH_PI/3);
            const length = radius * (1.5 + Math.random() * 1);
            
            ctx.beginPath();
            ctx.moveTo(x, y + radius * 0.2);
            ctx.quadraticCurveTo(
                x + Math.cos(angle) * length/2 + rand(radius * 0.2),
                y + radius * 0.8,
                x + Math.cos(angle) * length,
                y + length * 0.8
            );
            ctx.stroke();
        }
    }

    function drawTwinTails(ctx, x, y, radius, color) {
        ctx.fillStyle = color;
        ctx.strokeStyle = darkenColor(color, 20);
        ctx.lineWidth = 2;
        
        // Основные волосы
        ctx.beginPath();
        ctx.arc(x, y - radius * 0.1, radius * 1.1, MATH_PI, 0, false);
        ctx.arc(x, y + radius * 0.2, radius * 0.8, 0, MATH_PI, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Хвостики
        const tailOffset = radius * 0.8;
        
        // Левый хвостик
        drawHairTail(ctx, x - tailOffset, y + radius * 0.3, radius * 0.7, color);
        
        // Правый хвостик
        drawHairTail(ctx, x + tailOffset, y + radius * 0.3, radius * 0.7, color);
    }

    function drawHairTail(ctx, x, y, size, color) {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = size * 0.3;
        ctx.lineCap = 'round';
        
        // Основание хвостика
        ctx.beginPath();
        ctx.arc(x, y, size * 0.4, 0, MATH_PI_2);
        ctx.fill();
        
        // Пряди хвостика
        for (let i = 0; i < 5; i++) {
            const angle = -MATH_PI/2 + (i / 4) * (MATH_PI/2);
            const length = size * (1.5 + Math.random() * 0.5);
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(
                x + Math.cos(angle) * length/2 + rand(size * 0.3),
                y + Math.sin(angle) * length/2,
                x + Math.cos(angle) * length,
                y + Math.sin(angle) * length
            );
            ctx.stroke();
        }
    }

    function drawSparkle(ctx, x, y, size) {
        ctx.save();
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.fillStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        
        // Центральная точка
        ctx.beginPath();
        ctx.arc(x, y, size * 0.2, 0, MATH_PI_2);
        ctx.fill();
        
        // Основные лучи
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * MATH_PI_2;
            const length = size * 0.8;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                x + Math.cos(angle) * length,
                y + Math.sin(angle) * length
            );
            ctx.stroke();
            
            // Конец луча
            ctx.beginPath();
            ctx.arc(
                x + Math.cos(angle) * length,
                y + Math.sin(angle) * length,
                size * 0.1,
                0,
                MATH_PI_2
            );
            ctx.fill();
        }
        
        // Диагональные лучи (короче)
        for (let i = 0; i < 4; i++) {
            const angle = MATH_PI/4 + (i / 4) * MATH_PI_2;
            const length = size * 0.5;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                x + Math.cos(angle) * length,
                y + Math.sin(angle) * length
            );
            ctx.stroke();
        }
        
        ctx.restore();
    }

    function createDotScreentone(ctx, x, y, width, height, density) {
        const dotSpacing = 8 / density;
        const dotSize = 1 * density;
        
        for (let posY = y; posY < y + height; posY += dotSpacing) {
            for (let posX = x; posX < x + width; posX += dotSpacing) {
                if (Math.random() < density) {
                    ctx.beginPath();
                    ctx.arc(posX, posY, dotSize, 0, MATH_PI_2);
                    ctx.fill();
                }
            }
        }
    }

    function createLineScreentone(ctx, x, y, width, height, density) {
        const lineSpacing = 6 / density;
        const lineWidth = 0.5 * density;
        
        ctx.lineWidth = lineWidth;
        
        // Горизонтальные линии
        for (let posY = y; posY < y + height; posY += lineSpacing) {
            ctx.beginPath();
            ctx.moveTo(x, posY);
            ctx.lineTo(x + width, posY);
            ctx.stroke();
        }
    }

    function createCrossScreentone(ctx, x, y, width, height, density) {
        const spacing = 8 / density;
        const lineWidth = 0.3 * density;
        
        ctx.lineWidth = lineWidth;
        
        // Горизонтальные линии
        for (let posY = y; posY < y + height; posY += spacing) {
            ctx.beginPath();
            ctx.moveTo(x, posY);
            ctx.lineTo(x + width, posY);
            ctx.stroke();
        }
        
        // Вертикальные линии
        for (let posX = x; posX < x + width; posX += spacing) {
            ctx.beginPath();
            ctx.moveTo(posX, y);
            ctx.lineTo(posX, y + height);
            ctx.stroke();
        }
    }

    // Вспомогательная функция для затемнения цвета
    function darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return '#' + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }

    window.ANIME_TOOLS = ANIME_TOOLS;
    console.log('Anime tools loaded successfully');
})();

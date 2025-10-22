// js/textures.js - текстуры для одежды и материалов
(() => {
    const MATH_PI_2 = Math.PI * 2;
    const rand = (n) => (Math.random() - 0.5) * n;

    const TEXTURES = {
        // === ТЕКСТУРЫ ОДЕЖДЫ ===
        'denim': (ctx, x, y, width, height, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            
            // Основной цвет джинсы
            ctx.fillStyle = color || '#191970';
            ctx.fillRect(x, y, width, height);
            
            // Тканевая текстура
            ctx.strokeStyle = 'rgba(0, 0, 50, 0.3)';
            ctx.lineWidth = 1;
            
            // Вертикальные линии (основа)
            for (let i = x; i < x + width; i += 3) {
                ctx.beginPath();
                ctx.moveTo(i, y);
                ctx.lineTo(i, y + height);
                ctx.stroke();
            }
            
            // Горизонтальные линии (уток)
            for (let j = y; j < y + height; j += 3) {
                ctx.beginPath();
                ctx.moveTo(x, j);
                ctx.lineTo(x + width, j);
                ctx.stroke();
            }
            
            // Потертости
            ctx.globalAlpha = op * 0.2;
            ctx.fillStyle = 'rgba(100, 100, 150, 0.3)';
            for (let k = 0; k < 20; k++) {
                const wearX = x + Math.random() * width;
                const wearY = y + Math.random() * height;
                const wearSize = 5 + Math.random() * 15;
                ctx.beginPath();
                ctx.arc(wearX, wearY, wearSize, 0, MATH_PI_2);
                ctx.fill();
            }
            
            ctx.restore();
        },

        'cotton': (ctx, x, y, width, height, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            
            // Основной цвет хлопка
            ctx.fillStyle = color || '#F5F5DC';
            ctx.fillRect(x, y, width, height);
            
            // Мягкая тканевая текстура
            ctx.globalAlpha = op * 0.3;
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.lineWidth = 0.5;
            
            // Случайные волокна
            for (let i = 0; i < 50; i++) {
                const startX = x + Math.random() * width;
                const startY = y + Math.random() * height;
                const length = 5 + Math.random() * 10;
                const angle = Math.random() * MATH_PI_2;
                
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(
                    startX + Math.cos(angle) * length,
                    startY + Math.sin(angle) * length
                );
                ctx.stroke();
            }
            
            // Точки-ворсинки
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            for (let j = 0; j < 30; j++) {
                const pileX = x + Math.random() * width;
                const pileY = y + Math.random() * height;
                ctx.beginPath();
                ctx.arc(pileX, pileY, 0.5 + Math.random(), 0, MATH_PI_2);
                ctx.fill();
            }
            
            ctx.restore();
        },

        'silk': (ctx, x, y, width, height, color, op) => {
            ctx.save();
            
            // Шелковистый градиент
            const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
            gradient.addColorStop(0, lightenColor(color, 20));
            gradient.addColorStop(0.5, color);
            gradient.addColorStop(1, darkenColor(color, 10));
            
            ctx.globalAlpha = op;
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, width, height);
            
            // Блики шелка
            ctx.globalAlpha = op * 0.4;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            
            for (let i = 0; i < 3; i++) {
                const shineX = x + Math.random() * width;
                const shineY = y + Math.random() * height;
                const shineWidth = 10 + Math.random() * 20;
                const shineHeight = 2 + Math.random() * 5;
                
                ctx.beginPath();
                ctx.ellipse(shineX, shineY, shineWidth, shineHeight, Math.random() * MATH_PI_2, 0, MATH_PI_2);
                ctx.fill();
            }
            
            // Тонкие линии переплетения
            ctx.globalAlpha = op * 0.1;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 0.3;
            
            for (let j = x; j < x + width; j += 4) {
                ctx.beginPath();
                ctx.moveTo(j, y);
                ctx.lineTo(j, y + height);
                ctx.stroke();
            }
            
            ctx.restore();
        },

        'leather': (ctx, x, y, width, height, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            
            // Основной цвет кожи
            ctx.fillStyle = color || '#8B4513';
            ctx.fillRect(x, y, width, height);
            
            // Текстура пор
            ctx.globalAlpha = op * 0.3;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            
            for (let i = 0; i < 100; i++) {
                const poreX = x + Math.random() * width;
                const poreY = y + Math.random() * height;
                const poreSize = 0.5 + Math.random() * 1.5;
                
                ctx.beginPath();
                ctx.arc(poreX, poreY, poreSize, 0, MATH_PI_2);
                ctx.fill();
            }
            
            // Естественные складки и морщины
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 0.5;
            
            for (let j = 0; j < 15; j++) {
                const foldX = x + Math.random() * width;
                const foldY = y + Math.random() * height;
                const foldLength = 10 + Math.random() * 20;
                const foldAngle = Math.random() * MATH_PI_2;
                
                ctx.beginPath();
                ctx.moveTo(foldX, foldY);
                ctx.lineTo(
                    foldX + Math.cos(foldAngle) * foldLength,
                    foldY + Math.sin(foldAngle) * foldLength
                );
                ctx.stroke();
            }
            
            // Глянцевые блики
            ctx.globalAlpha = op * 0.2;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            
            const shineX = x + width * 0.7;
            const shineY = y + height * 0.3;
            const shineGradient = ctx.createRadialGradient(shineX, shineY, 0, shineX, shineY, width * 0.3);
            shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
            shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = shineGradient;
            ctx.beginPath();
            ctx.arc(shineX, shineY, width * 0.3, 0, MATH_PI_2);
            ctx.fill();
            
            ctx.restore();
        },

        'wool': (ctx, x, y, width, height, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            
            // Основной цвет шерсти
            ctx.fillStyle = color || '#F5F5F5';
            ctx.fillRect(x, y, width, height);
            
            // Ворсистая текстура
            ctx.globalAlpha = op * 0.6;
            
            for (let i = 0; i < 200; i++) {
                const fiberX = x + Math.random() * width;
                const fiberY = y + Math.random() * height;
                const fiberLength = 3 + Math.random() * 8;
                const fiberAngle = Math.random() * MATH_PI_2;
                const fiberColor = Math.random() > 0.7 ? 
                    lightenColor(color, 10) : 
                    darkenColor(color, 5);
                
                ctx.strokeStyle = fiberColor;
                ctx.lineWidth = 0.3 + Math.random() * 0.7;
                ctx.lineCap = 'round';
                
                ctx.beginPath();
                ctx.moveTo(fiberX, fiberY);
                ctx.lineTo(
                    fiberX + Math.cos(fiberAngle) * fiberLength,
                    fiberY + Math.sin(fiberAngle) * fiberLength
                );
                ctx.stroke();
            }
            
            // Клубки волокон
            ctx.globalAlpha = op * 0.4;
            for (let j = 0; j < 10; j++) {
                const bundleX = x + Math.random() * width;
                const bundleY = y + Math.random() * height;
                const bundleSize = 2 + Math.random() * 4;
                
                for (let k = 0; k < 5; k++) {
                    const angle = (k / 5) * MATH_PI_2;
                    ctx.beginPath();
                    ctx.arc(
                        bundleX + Math.cos(angle) * bundleSize * 0.5,
                        bundleY + Math.sin(angle) * bundleSize * 0.5,
                        bundleSize * 0.3,
                        0,
                        MATH_PI_2
                    );
                    ctx.fillStyle = darkenColor(color, 5);
                    ctx.fill();
                }
            }
            
            ctx.restore();
        },

        // === ТЕКСТУРЫ МАТЕРИАЛОВ ===
        'wood': (ctx, x, y, width, height, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            
            // Основной цвет дерева
            const woodColor = color || '#8B4513';
            ctx.fillStyle = woodColor;
            ctx.fillRect(x, y, width, height);
            
            // Годовые кольца
            ctx.strokeStyle = darkenColor(woodColor, 15);
            ctx.lineWidth = 1;
            
            const centerX = x + width / 2;
            const centerY = y + height / 2;
            const maxRadius = Math.min(width, height) / 2;
            
            for (let r = maxRadius * 0.2; r < maxRadius; r += maxRadius * 0.1) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, r, 0, MATH_PI_2);
                ctx.stroke();
            }
            
            // Волокна дерева
            ctx.strokeStyle = darkenColor(woodColor, 10);
            ctx.lineWidth = 0.5;
            
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * MATH_PI_2;
                const startR = Math.random() * maxRadius * 0.5;
                const endR = maxRadius * (0.5 + Math.random() * 0.5);
                
                ctx.beginPath();
                ctx.moveTo(
                    centerX + Math.cos(angle) * startR,
                    centerY + Math.sin(angle) * startR
                );
                ctx.lineTo(
                    centerX + Math.cos(angle) * endR,
                    centerY + Math.sin(angle) * endR
                );
                ctx.stroke();
            }
            
            // Сучки и узлы
            ctx.globalAlpha = op * 0.8;
            for (let j = 0; j < 3; j++) {
                const knotX = x + Math.random() * width;
                const knotY = y + Math.random() * height;
                const knotSize = 3 + Math.random() * 7;
                
                ctx.fillStyle = darkenColor(woodColor, 25);
                ctx.beginPath();
                ctx.arc(knotX, knotY, knotSize, 0, MATH_PI_2);
                ctx.fill();
                
                // Трещины вокруг сучка
                ctx.strokeStyle = darkenColor(woodColor, 30);
                ctx.lineWidth = 0.3;
                for (let k = 0; k < 4; k++) {
                    const crackAngle = Math.random() * MATH_PI_2;
                    const crackLength = knotSize * (1 + Math.random());
                    
                    ctx.beginPath();
                    ctx.moveTo(knotX, knotY);
                    ctx.lineTo(
                        knotX + Math.cos(crackAngle) * crackLength,
                        knotY + Math.sin(crackAngle) * crackLength
                    );
                    ctx.stroke();
                }
            }
            
            ctx.restore();
        },

        'metal': (ctx, x, y, width, height, color, op) => {
            ctx.save();
            
            // Металлический градиент
            const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
            gradient.addColorStop(0, lightenColor(color, 30));
            gradient.addColorStop(0.3, color);
            gradient.addColorStop(0.7, darkenColor(color, 15));
            gradient.addColorStop(1, lightenColor(color, 10));
            
            ctx.globalAlpha = op;
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, width, height);
            
            // Блики и отражения
            ctx.globalAlpha = op * 0.6;
            
            // Горизонтальные блики
            const shineGradient = ctx.createLinearGradient(x, y, x, y + height);
            shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            shineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
            shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0.4)');
            
            ctx.fillStyle = shineGradient;
            ctx.fillRect(x, y, width, height);
            
            // Вертикальные штрихи обработки
            ctx.globalAlpha = op * 0.3;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 0.5;
            
            for (let i = x; i < x + width; i += 2) {
                ctx.beginPath();
                ctx.moveTo(i, y);
                ctx.lineTo(i, y + height);
                ctx.stroke();
            }
            
            // Точки-неровности
            ctx.globalAlpha = op * 0.2;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            
            for (let j = 0; j < 50; j++) {
                const spotX = x + Math.random() * width;
                const spotY = y + Math.random() * height;
                const spotSize = 0.3 + Math.random() * 0.7;
                
                ctx.beginPath();
                ctx.arc(spotX, spotY, spotSize, 0, MATH_PI_2);
                ctx.fill();
            }
            
            ctx.restore();
        },

        'glass': (ctx, x, y, width, height, color, op) => {
            ctx.save();
            
            // Прозрачный стеклянный цвет
            const glassColor = color || 'rgba(200, 230, 255, 0.3)';
            ctx.globalAlpha = op * 0.4;
            ctx.fillStyle = glassColor;
            ctx.fillRect(x, y, width, height);
            
            // Блики и преломления
            ctx.globalAlpha = op * 0.6;
            
            // Основной блик
            const shineGradient = ctx.createRadialGradient(
                x + width * 0.3, y + height * 0.3, 0,
                x + width * 0.3, y + height * 0.3, width * 0.5
            );
            shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = shineGradient;
            ctx.beginPath();
            ctx.arc(x + width * 0.3, y + height * 0.3, width * 0.5, 0, MATH_PI_2);
            ctx.fill();
            
            // Вторичные блики
            ctx.globalAlpha = op * 0.4;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            
            for (let i = 0; i < 3; i++) {
                const spotX = x + Math.random() * width;
                const spotY = y + Math.random() * height;
                const spotSize = 5 + Math.random() * 10;
                
                ctx.beginPath();
                ctx.arc(spotX, spotY, spotSize, 0, MATH_PI_2);
                ctx.fill();
            }
            
            // Края стекла (более плотные)
            ctx.globalAlpha = op * 0.2;
            ctx.strokeStyle = 'rgba(150, 180, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);
            
            // Внутренние отражения
            ctx.globalAlpha = op * 0.1;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            
            for (let j = 0; j < 5; j++) {
                const reflectX = x + Math.random() * width;
                const reflectY = y + Math.random() * height;
                const reflectLength = 10 + Math.random() * 20;
                
                ctx.beginPath();
                ctx.moveTo(reflectX, reflectY);
                ctx.lineTo(reflectX + reflectLength, reflectY + reflectLength);
                ctx.stroke();
            }
            
            ctx.restore();
        }
    };

    // Вспомогательные функции для работы с цветами
    function lightenColor(color, percent) {
        if (color.startsWith('rgba')) {
            const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/);
            if (match) {
                const r = Math.min(255, parseInt(match[1]) + percent * 2.55);
                const g = Math.min(255, parseInt(match[2]) + percent * 2.55);
                const b = Math.min(255, parseInt(match[3]) + percent * 2.55);
                const a = match[4] || 1;
                return `rgba(${r}, ${g}, ${b}, ${a})`;
            }
        }
        
        // Для hex цветов
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }

    function darkenColor(color, percent) {
        if (color.startsWith('rgba')) {
            const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/);
            if (match) {
                const r = Math.max(0, parseInt(match[1]) - percent * 2.55);
                const g = Math.max(0, parseInt(match[2]) - percent * 2.55);
                const b = Math.max(0, parseInt(match[3]) - percent * 2.55);
                const a = match[4] || 1;
                return `rgba(${r}, ${g}, ${b}, ${a})`;
            }
        }
        
        // Для hex цветов
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

    // Функция для применения текстуры к области
    window.applyTexture = (textureType, ctx, x, y, width, height, color, opacity) => {
        if (TEXTURES[textureType]) {
            TEXTURES[textureType](ctx, x, y, width, height, color, opacity);
            return true;
        }
        return false;
    };

    window.TEXTURES = TEXTURES;
    console.log(`Loaded ${Object.keys(TEXTURES).length} textures`);
})();

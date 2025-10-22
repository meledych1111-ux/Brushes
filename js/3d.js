// js/3d.js - 3D инструменты и эффекты для создания объема
(() => {
    const MATH_PI_2 = Math.PI * 2;
    const MATH_PI = Math.PI;

    const THREE_D_TOOLS = {
        // Создание 3D-сферы с освещением
        createSphere: (ctx, x, y, radius, color, lightDirection = 'top-left') => {
            ctx.save();
            
            // Основная сфера
            const gradient = ctx.createRadialGradient(
                x - radius * 0.3, y - radius * 0.3, 0,
                x, y, radius
            );
            
            // Настройка градиента в зависимости от направления света
            switch (lightDirection) {
                case 'top-left':
                    gradient.addColorStop(0, lightenColor(color, 40));
                    gradient.addColorStop(0.7, color);
                    gradient.addColorStop(1, darkenColor(color, 20));
                    break;
                case 'top-right':
                    gradient.addColorStop(0, lightenColor(color, 40));
                    gradient.addColorStop(0.3, color);
                    gradient.addColorStop(1, darkenColor(color, 20));
                    break;
                case 'bottom-left':
                    gradient.addColorStop(0, color);
                    gradient.addColorStop(0.7, darkenColor(color, 20));
                    gradient.addColorStop(1, darkenColor(color, 40));
                    break;
                case 'bottom-right':
                    gradient.addColorStop(0, color);
                    gradient.addColorStop(0.3, darkenColor(color, 20));
                    gradient.addColorStop(1, darkenColor(color, 40));
                    break;
            }
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, MATH_PI_2);
            ctx.fill();
            
            // Блик
            const highlightGradient = ctx.createRadialGradient(
                x - radius * 0.2, y - radius * 0.2, 0,
                x - radius * 0.2, y - radius * 0.2, radius * 0.3
            );
            highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = highlightGradient;
            ctx.beginPath();
            ctx.arc(x - radius * 0.2, y - radius * 0.2, radius * 0.3, 0, MATH_PI_2);
            ctx.fill();
            
            // Тень под сферой
            const shadowGradient = ctx.createRadialGradient(
                x, y + radius * 0.8, 0,
                x, y + radius * 0.8, radius * 0.8
            );
            shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
            shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = shadowGradient;
            ctx.beginPath();
            ctx.arc(x, y + radius * 0.8, radius * 0.8, 0, MATH_PI_2);
            ctx.fill();
            
            ctx.restore();
        },

        // Создание 3D-куба
        createCube: (ctx, x, y, size, color, rotation = 0) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            
            const faceColors = {
                front: color,
                top: lightenColor(color, 30),
                right: darkenColor(color, 15),
                left: darkenColor(color, 25)
            };
            
            // Передняя грань
            ctx.fillStyle = faceColors.front;
            ctx.fillRect(-size/2, -size/2, size, size);
            
            // Верхняя грань
            ctx.fillStyle = faceColors.top;
            ctx.beginPath();
            ctx.moveTo(-size/2, -size/2);
            ctx.lineTo(0, -size);
            ctx.lineTo(size/2, -size/2);
            ctx.lineTo(-size/2, -size/2);
            ctx.fill();
            
            // Правая грань
            ctx.fillStyle = faceColors.right;
            ctx.beginPath();
            ctx.moveTo(size/2, -size/2);
            ctx.lineTo(size/2, size/2);
            ctx.lineTo(0, size);
            ctx.lineTo(0, 0);
            ctx.lineTo(size/2, -size/2);
            ctx.fill();
            
            // Левая грань
            ctx.fillStyle = faceColors.left;
            ctx.beginPath();
            ctx.moveTo(-size/2, -size/2);
            ctx.lineTo(-size/2, size/2);
            ctx.lineTo(0, size);
            ctx.lineTo(0, 0);
            ctx.lineTo(-size/2, -size/2);
            ctx.fill();
            
            // Контуры
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            
            // Передняя грань
            ctx.strokeRect(-size/2, -size/2, size, size);
            
            // Верхняя грань
            ctx.beginPath();
            ctx.moveTo(-size/2, -size/2);
            ctx.lineTo(0, -size);
            ctx.lineTo(size/2, -size/2);
            ctx.stroke();
            
            // Боковые грани
            ctx.beginPath();
            ctx.moveTo(size/2, -size/2);
            ctx.lineTo(size/2, size/2);
            ctx.lineTo(0, size);
            ctx.lineTo(0, 0);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(-size/2, -size/2);
            ctx.lineTo(-size/2, size/2);
            ctx.lineTo(0, size);
            ctx.stroke();
            
            ctx.restore();
        },

        // Создание 3D-цилиндра
        createCylinder: (ctx, x, y, radius, height, color) => {
            ctx.save();
            
            // Боковая поверхность
            const sideGradient = ctx.createLinearGradient(x - radius, y, x + radius, y);
            sideGradient.addColorStop(0, darkenColor(color, 20));
            sideGradient.addColorStop(0.5, color);
            sideGradient.addColorStop(1, darkenColor(color, 20));
            
            ctx.fillStyle = sideGradient;
            ctx.fillRect(x - radius, y - height/2, radius * 2, height);
            
            // Верхний эллипс
            const topGradient = ctx.createRadialGradient(x, y - height/2, 0, x, y - height/2, radius);
            topGradient.addColorStop(0, lightenColor(color, 40));
            topGradient.addColorStop(1, color);
            
            ctx.fillStyle = topGradient;
            ctx.beginPath();
            ctx.ellipse(x, y - height/2, radius, radius * 0.3, 0, 0, MATH_PI_2);
            ctx.fill();
            
            // Нижний эллипс
            const bottomGradient = ctx.createRadialGradient(x, y + height/2, 0, x, y + height/2, radius);
            bottomGradient.addColorStop(0, darkenColor(color, 10));
            bottomGradient.addColorStop(1, darkenColor(color, 30));
            
            ctx.fillStyle = bottomGradient;
            ctx.beginPath();
            ctx.ellipse(x, y + height/2, radius, radius * 0.3, 0, 0, MATH_PI_2);
            ctx.fill();
            
            // Контуры
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            
            // Боковые линии
            ctx.beginPath();
            ctx.moveTo(x - radius, y - height/2);
            ctx.lineTo(x - radius, y + height/2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(x + radius, y - height/2);
            ctx.lineTo(x + radius, y + height/2);
            ctx.stroke();
            
            // Эллипсы
            ctx.beginPath();
            ctx.ellipse(x, y - height/2, radius, radius * 0.3, 0, 0, MATH_PI_2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.ellipse(x, y + height/2, radius, radius * 0.3, 0, 0, MATH_PI_2);
            ctx.stroke();
            
            ctx.restore();
        },

        // Создание 3D-пирамиды
        createPyramid: (ctx, x, y, baseSize, height, color) => {
            ctx.save();
            
            // Боковые грани
            const faces = [
                { // Передняя грань
                    points: [
                        {x: x, y: y - height/2},
                        {x: x - baseSize/2, y: y + height/2},
                        {x: x + baseSize/2, y: y + height/2}
                    ],
                    color: color
                },
                { // Левая грань
                    points: [
                        {x: x, y: y - height/2},
                        {x: x - baseSize/2, y: y + height/2},
                        {x: x, y: y + height/2 - baseSize/4}
                    ],
                    color: darkenColor(color, 15)
                },
                { // Правая грань
                    points: [
                        {x: x, y: y - height/2},
                        {x: x + baseSize/2, y: y + height/2},
                        {x: x, y: y + height/2 - baseSize/4}
                    ],
                    color: lightenColor(color, 10)
                }
            ];
            
            // Рисуем грани с учетом глубины (задние сначала)
            faces.sort((a, b) => {
                const aDepth = a.points.reduce((sum, p) => sum + p.y, 0) / a.points.length;
                const bDepth = b.points.reduce((sum, p) => sum + p.y, 0) / b.points.length;
                return bDepth - aDepth;
            });
            
            faces.forEach(face => {
                ctx.fillStyle = face.color;
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 1;
                
                ctx.beginPath();
                face.points.forEach((point, index) => {
                    if (index === 0) {
                        ctx.moveTo(point.x, point.y);
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                });
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            });
            
            ctx.restore();
        },

        // Добавление объема к 2D-фигуре
        addVolume: (ctx, shapeFunction, x, y, size, color, lightDirection = 'top-left') => {
            ctx.save();
            
            // Сначала рисуем тень
            ctx.save();
            ctx.translate(2, 2);
            ctx.globalAlpha = 0.3;
            shapeFunction(ctx, x, y, size, darkenColor(color, 40));
            ctx.restore();
            
            // Затем основную фигуру с градиентом
            const gradient = createLightGradient(ctx, x, y, size, color, lightDirection);
            ctx.fillStyle = gradient;
            shapeFunction(ctx, x, y, size, color);
            
            // Добавляем блик
            ctx.save();
            const highlightGradient = createHighlightGradient(ctx, x, y, size, lightDirection);
            ctx.fillStyle = highlightGradient;
            ctx.globalCompositeOperation = 'screen';
            shapeFunction(ctx, x, y, size * 0.7, '#FFFFFF');
            ctx.restore();
            
            ctx.restore();
        },

        // Создание 3D-текста
        create3DText: (ctx, text, x, y, fontSize, color, depth = 5) => {
            ctx.save();
            
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Рисуем задние части (для объема)
            for (let i = depth; i > 0; i--) {
                ctx.fillStyle = darkenColor(color, i * 3);
                ctx.fillText(text, x + i, y + i);
            }
            
            // Основной текст
            const textGradient = ctx.createLinearGradient(x, y - fontSize/2, x, y + fontSize/2);
            textGradient.addColorStop(0, lightenColor(color, 20));
            textGradient.addColorStop(1, color);
            
            ctx.fillStyle = textGradient;
            ctx.fillText(text, x, y);
            
            // Блик на тексте
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillText(text, x - 1, y - 1);
            
            ctx.restore();
        },

        // Создание отражающей поверхности
        createReflection: (ctx, shapeFunction, x, y, size, reflectHeight = 30) => {
            ctx.save();
            
            // Сохраняем текущее состояние canvas
            const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            // Рисуем оригинальную фигуру
            shapeFunction(ctx, x, y, size);
            
            // Создаем отражение
            ctx.globalAlpha = 0.3;
            ctx.translate(0, reflectHeight);
            ctx.scale(1, -0.5);
            
            // Маска для градиентного исчезновения отражения
            const gradient = ctx.createLinearGradient(x - size, y, x - size, y + reflectHeight);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.globalCompositeOperation = 'destination-in';
            ctx.fillStyle = gradient;
            ctx.fillRect(x - size * 2, y - size, size * 4, reflectHeight * 2);
            
            // Восстанавливаем нормальный режим смешивания и рисуем отражение
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 0.2;
            shapeFunction(ctx, x, y, size);
            
            ctx.restore();
        }
    };

    // Вспомогательные функции для 3D-эффектов
    function createLightGradient(ctx, x, y, size, color, lightDirection) {
        let gradient;
        
        switch (lightDirection) {
            case 'top-left':
                gradient = ctx.createRadialGradient(
                    x - size * 0.3, y - size * 0.3, 0,
                    x, y, size
                );
                break;
            case 'top-right':
                gradient = ctx.createRadialGradient(
                    x + size * 0.3, y - size * 0.3, 0,
                    x, y, size
                );
                break;
            case 'bottom-left':
                gradient = ctx.createRadialGradient(
                    x - size * 0.3, y + size * 0.3, 0,
                    x, y, size
                );
                break;
            case 'bottom-right':
                gradient = ctx.createRadialGradient(
                    x + size * 0.3, y + size * 0.3, 0,
                    x, y, size
                );
                break;
            default:
                gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        }
        
        gradient.addColorStop(0, lightenColor(color, 30));
        gradient.addColorStop(0.7, color);
        gradient.addColorStop(1, darkenColor(color, 20));
        
        return gradient;
    }

    function createHighlightGradient(ctx, x, y, size, lightDirection) {
        let gradient;
        let highlightX, highlightY;
        
        switch (lightDirection) {
            case 'top-left':
                highlightX = x - size * 0.2;
                highlightY = y - size * 0.2;
                break;
            case 'top-right':
                highlightX = x + size * 0.2;
                highlightY = y - size * 0.2;
                break;
            case 'bottom-left':
                highlightX = x - size * 0.2;
                highlightY = y + size * 0.2;
                break;
            case 'bottom-right':
                highlightX = x + size * 0.2;
                highlightY = y + size * 0.2;
                break;
            default:
                highlightX = x - size * 0.2;
                highlightY = y - size * 0.2;
        }
        
        gradient = ctx.createRadialGradient(
            highlightX, highlightY, 0,
            highlightX, highlightY, size * 0.5
        );
        
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        return gradient;
    }

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

    window.THREE_D_TOOLS = THREE_D_TOOLS;
    console.log('3D tools loaded successfully');
})();

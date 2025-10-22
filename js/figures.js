// js/figures.js - расширенные фигуры и штампы для аниме, одежды и 3D
(() => {
    const MATH_PI_2 = Math.PI * 2;
    const MATH_PI = Math.PI;
    const rand = (n) => (Math.random() - 0.5) * n;

    const FIGURES = {
        // === БАЗОВЫЕ ФИГУРЫ ===
        'circle': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, MATH_PI_2);
            ctx.fill();
            ctx.restore();
        },

        'square': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color;
            ctx.fillRect(x - r, y - r, r * 2, r * 2);
            ctx.restore();
        },

        'triangle': (ctx, x, y, r, color, op) => {
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

        'star': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color;
            ctx.beginPath();
            
            for (let i = 0; i < 5; i++) {
                const outerAngle = (i * 2 * MATH_PI / 5) - MATH_PI/2;
                const innerAngle = outerAngle + MATH_PI/5;
                
                const x1 = x + Math.cos(outerAngle) * r;
                const y1 = y + Math.sin(outerAngle) * r;
                const x2 = x + Math.cos(innerAngle) * (r/2);
                const y2 = y + Math.sin(innerAngle) * (r/2);
                
                if (i === 0) ctx.moveTo(x1, y1);
                else ctx.lineTo(x1, y1);
                ctx.lineTo(x2, y2);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        },

        'heart': (ctx, x, y, r, color, op) => {
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

        'line': (ctx, x1, y1, x2, y2, color, width) => {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = width || 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.restore();
        },

        // === АНИМЕ ЭЛЕМЕНТЫ ===
        'anime_eye': (ctx, x, y, r, color, op) => {
            ctx.save();
            const eyeColor = color || '#87CEEB';
            
            // Белок глаза
            ctx.globalAlpha = op;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.ellipse(x, y, r * 1.2, r * 0.8, 0, 0, MATH_PI_2);
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Радужка
            ctx.fillStyle = eyeColor;
            ctx.beginPath();
            ctx.arc(x, y, r * 0.6, 0, MATH_PI_2);
            ctx.fill();

            // Зрачок
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(x, y, r * 0.3, 0, MATH_PI_2);
            ctx.fill();

            // Блики
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.15, 0, MATH_PI_2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(x + r * 0.1, y - r * 0.1, r * 0.08, 0, MATH_PI_2);
            ctx.fill();

            ctx.restore();
        },

        'anime_hair': (ctx, x, y, r, color, op) => {
            ctx.save();
            const hairColor = color || '#8B4513';
            
            ctx.globalAlpha = op;
            ctx.strokeStyle = hairColor;
            ctx.fillStyle = hairColor;
            ctx.lineWidth = Math.max(2, r / 4);
            ctx.lineCap = 'round';

            // Основные пряди
            for (let i = 0; i < 8; i++) {
                const angle = -MATH_PI/3 + (i / 7) * (2 * MATH_PI/3);
                const length = r * (1 + Math.random() * 0.5);
                const curl = r * 0.3;
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.quadraticCurveTo(
                    x + Math.cos(angle) * length/2 + rand(curl),
                    y + Math.sin(angle) * length/2 + rand(curl),
                    x + Math.cos(angle) * length,
                    y + Math.sin(angle) * length
                );
                ctx.stroke();
            }

            // Объем волос
            ctx.globalAlpha = op * 0.7;
            ctx.beginPath();
            ctx.arc(x, y - r * 0.5, r * 0.8, MATH_PI, MATH_PI_2, true);
            ctx.fill();

            ctx.restore();
        },

        'anime_mouth': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.strokeStyle = color || '#FF69B4';
            ctx.fillStyle = color || '#FF69B4';
            ctx.lineWidth = 2;

            // Рот (улыбка)
            ctx.beginPath();
            ctx.arc(x, y, r * 0.6, 0.2, MATH_PI - 0.2, false);
            ctx.stroke();

            // Внутренняя часть рта
            ctx.globalAlpha = op * 0.8;
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(x, y + r * 0.1, r * 0.4, 0.1, MATH_PI - 0.1, false);
            ctx.fill();

            ctx.restore();
        },

        'anime_blush': (ctx, x, y, r, color, op) => {
            ctx.save();
            const blushColor = '#FFB6C1';
            
            // Левый румянец
            ctx.globalAlpha = op * 0.4;
            const gradient1 = ctx.createRadialGradient(x - r, y, 0, x - r, y, r * 1.5);
            gradient1.addColorStop(0, blushColor);
            gradient1.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = gradient1;
            ctx.beginPath();
            ctx.arc(x - r, y, r * 1.5, 0, MATH_PI_2);
            ctx.fill();

            // Правый румянец
            const gradient2 = ctx.createRadialGradient(x + r, y, 0, x + r, y, r * 1.5);
            gradient2.addColorStop(0, blushColor);
            gradient2.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = gradient2;
            ctx.beginPath();
            ctx.arc(x + r, y, r * 1.5, 0, MATH_PI_2);
            ctx.fill();

            ctx.restore();
        },

        // === ОДЕЖДА ===
        'clothing_t-shirt': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color || '#1E90FF';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;

            // Основная часть футболки
            ctx.beginPath();
            ctx.moveTo(x - r * 1.5, y);
            ctx.lineTo(x - r, y - r * 1.2);
            ctx.lineTo(x + r, y - r * 1.2);
            ctx.lineTo(x + r * 1.5, y);
            ctx.lineTo(x + r * 1.2, y + r * 1.5);
            ctx.lineTo(x - r * 1.2, y + r * 1.5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Рукава
            ctx.beginPath();
            ctx.arc(x - r * 1.5, y, r * 0.8, MATH_PI/2, MATH_PI * 1.5);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(x + r * 1.5, y, r * 0.8, -MATH_PI/2, MATH_PI/2);
            ctx.stroke();

            // Вырез горловины
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(x, y - r * 0.8, r * 0.4, 0, MATH_PI_2);
            ctx.fill();

            ctx.restore();
        },

        'clothing_dress': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color || '#FF69B4';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;

            // Платье
            ctx.beginPath();
            ctx.moveTo(x - r, y - r * 1.5);
            ctx.lineTo(x + r, y - r * 1.5);
            ctx.lineTo(x + r * 1.2, y + r * 2);
            ctx.lineTo(x - r * 1.2, y + r * 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Талия
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(x, y, r * 1.1, r * 0.3, 0, 0, MATH_PI_2);
            ctx.stroke();

            ctx.restore();
        },

        'clothing_jeans': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color || '#191970';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;

            // Штанины
            ctx.beginPath();
            ctx.moveTo(x - r * 0.8, y - r);
            ctx.lineTo(x - r * 0.4, y + r * 1.5);
            ctx.lineTo(x - r * 1.2, y + r * 1.5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x + r * 0.8, y - r);
            ctx.lineTo(x + r * 1.2, y + r * 1.5);
            ctx.lineTo(x + r * 0.4, y + r * 1.5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Пояс
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.rect(x - r * 0.8, y - r * 1.2, r * 1.6, r * 0.2);
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        },

        'clothing_hat': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color || '#FF0000';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;

            // Поля шляпы
            ctx.beginPath();
            ctx.arc(x, y, r * 1.5, 0, MATH_PI_2);
            ctx.fill();
            ctx.stroke();

            // Тулья
            ctx.fillStyle = color || '#8B0000';
            ctx.beginPath();
            ctx.arc(x, y, r * 0.8, 0, MATH_PI_2);
            ctx.fill();
            ctx.stroke();

            // Верх шляпы
            ctx.beginPath();
            ctx.arc(x, y - r * 0.5, r * 0.3, 0, MATH_PI_2);
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        },

        // === ПРИРОДА ===
        'nature_leaf': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color || '#228B22';
            ctx.strokeStyle = '#006400';
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(x, y - r);
            ctx.bezierCurveTo(x - r, y - r/2, x - r/2, y + r, x, y + r/2);
            ctx.bezierCurveTo(x + r/2, y + r, x + r, y - r/2, x, y - r);
            ctx.fill();
            ctx.stroke();

            // Прожилки
            ctx.strokeStyle = '#32CD32';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x, y - r);
            ctx.lineTo(x, y + r/2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x, y - r/2);
            ctx.lineTo(x - r/2, y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x, y - r/2);
            ctx.lineTo(x + r/2, y);
            ctx.stroke();

            ctx.restore();
        },

        'nature_flower': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;

            // Лепестки
            ctx.fillStyle = color || '#FF69B4';
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * MATH_PI_2;
                ctx.beginPath();
                ctx.ellipse(
                    x + Math.cos(angle) * r * 0.8,
                    y + Math.sin(angle) * r * 0.8,
                    r * 0.6,
                    r * 0.3,
                    angle,
                    0,
                    MATH_PI_2
                );
                ctx.fill();
            }

            // Центр цветка
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(x, y, r * 0.3, 0, MATH_PI_2);
            ctx.fill();

            ctx.restore();
        },

        'nature_tree': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;

            // Ствол
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x - r * 0.2, y - r, r * 0.4, r * 1.5);

            // Крона
            ctx.fillStyle = color || '#228B22';
            ctx.beginPath();
            ctx.arc(x, y - r * 1.2, r * 0.8, 0, MATH_PI_2);
            ctx.arc(x - r * 0.6, y - r * 1.5, r * 0.6, 0, MATH_PI_2);
            ctx.arc(x + r * 0.6, y - r * 1.5, r * 0.6, 0, MATH_PI_2);
            ctx.fill();

            ctx.restore();
        },

        'nature_cloud': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color || '#FFFFFF';
            ctx.strokeStyle = '#F0F0F0';
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.arc(x - r * 0.5, y, r * 0.6, 0, MATH_PI_2);
            ctx.arc(x + r * 0.5, y, r * 0.6, 0, MATH_PI_2);
            ctx.arc(x, y - r * 0.3, r * 0.7, 0, MATH_PI_2);
            ctx.arc(x - r * 0.8, y, r * 0.5, 0, MATH_PI_2);
            ctx.arc(x + r * 0.8, y, r * 0.5, 0, MATH_PI_2);
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        },

        // === АРХИТЕКТУРА ===
        'arch_house': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;

            // Основной корпус
            ctx.fillStyle = color || '#FFE4C4';
            ctx.fillRect(x - r, y - r, r * 2, r * 1.5);

            // Крыша
            ctx.fillStyle = '#8B0000';
            ctx.beginPath();
            ctx.moveTo(x - r * 1.2, y - r);
            ctx.lineTo(x, y - r * 1.8);
            ctx.lineTo(x + r * 1.2, y - r);
            ctx.closePath();
            ctx.fill();

            // Окна
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(x - r * 0.6, y - r * 0.5, r * 0.4, r * 0.4);
            ctx.fillRect(x + r * 0.2, y - r * 0.5, r * 0.4, r * 0.4);

            // Дверь
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x - r * 0.2, y + r * 0.2, r * 0.4, r * 0.8);

            ctx.restore();
        },

        'arch_tower': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;

            // Основание башни
            ctx.fillStyle = color || '#C0C0C0';
            ctx.fillRect(x - r * 0.5, y, r, r * 2);

            // Верх башни
            ctx.beginPath();
            ctx.moveTo(x - r * 0.7, y);
            ctx.lineTo(x, y - r * 0.8);
            ctx.lineTo(x + r * 0.7, y);
            ctx.closePath();
            ctx.fill();

            // Окна башни
            ctx.fillStyle = '#FFFF00';
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(x - r * 0.2, y + r * 0.3 + i * r * 0.6, r * 0.4, r * 0.3);
            }

            ctx.restore();
        },

        // === ЭФФЕКТЫ ===
        'effect_sparkle': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.strokeStyle = color || '#FFFFFF';
            ctx.fillStyle = color || '#FFFFFF';
            ctx.lineWidth = 1;

            // Центральная точка
            ctx.beginPath();
            ctx.arc(x, y, r * 0.1, 0, MATH_PI_2);
            ctx.fill();

            // Лучи
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * MATH_PI_2;
                const length = r * (0.5 + Math.random() * 0.5);
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(
                    x + Math.cos(angle) * length,
                    y + Math.sin(angle) * length
                );
                ctx.stroke();

                // Конечные точки лучей
                ctx.beginPath();
                ctx.arc(
                    x + Math.cos(angle) * length,
                    y + Math.sin(angle) * length,
                    r * 0.05,
                    0,
                    MATH_PI_2
                );
                ctx.fill();
            }

            ctx.restore();
        },

        'effect_bubble': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;

            // Внешний круг (пузырь)
            ctx.strokeStyle = color || '#87CEEB';
            ctx.fillStyle = 'rgba(135, 206, 235, 0.1)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, MATH_PI_2);
            ctx.fill();
            ctx.stroke();

            // Блик
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.2, 0, MATH_PI_2);
            ctx.fill();

            ctx.restore();
        },

        'effect_fire': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;

            // Основание огня
            const gradient = ctx.createRadialGradient(x, y + r * 0.5, 0, x, y, r * 1.2);
            gradient.addColorStop(0, '#FFFF00');
            gradient.addColorStop(0.5, '#FF4500');
            gradient.addColorStop(1, '#8B0000');

            ctx.fillStyle = gradient;
            
            // Форма пламени
            ctx.beginPath();
            ctx.moveTo(x, y - r * 1.5);
            for (let i = 0; i < 5; i++) {
                const angle = (i / 4) * MATH_PI;
                const flameR = r * (0.8 + Math.random() * 0.4);
                const flameX = x + Math.cos(angle) * flameR;
                const flameY = y - r * 0.5 + Math.sin(angle) * flameR * 0.3;
                if (i === 0) ctx.moveTo(flameX, flameY);
                else ctx.lineTo(flameX, flameY);
            }
            ctx.closePath();
            ctx.fill();

            // Языки пламени
            ctx.fillStyle = '#FFFF00';
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(x + rand(r * 0.5), y - r * (1 + Math.random()), r * 0.3, 0, MATH_PI_2);
                ctx.fill();
            }

            ctx.restore();
        }
    };

    // Функция для применения штампа
    window.applyStamp = (stampType, ctx, x, y, size, color, opacity) => {
        if (FIGURES[stampType]) {
            FIGURES[stampType](ctx, x, y, size, color, opacity);
            return true;
        }
        return false;
    };

    // Функция для получения списка доступных штампов по категории
    window.getStampsByCategory = (category) => {
        const stamps = {
            'basic': ['circle', 'square', 'triangle', 'star', 'heart', 'line'],
            'anime': ['anime_eye', 'anime_hair', 'anime_mouth', 'anime_blush'],
            'clothing': ['clothing_t-shirt', 'clothing_dress', 'clothing_jeans', 'clothing_hat'],
            'nature': ['nature_leaf', 'nature_flower', 'nature_tree', 'nature_cloud'],
            'architecture': ['arch_house', 'arch_tower'],
            'effects': ['effect_sparkle', 'effect_bubble', 'effect_fire']
        };
        
        return stamps[category] || stamps.basic;
    };

    window.FIGURES = FIGURES;
    console.log(`Loaded ${Object.keys(FIGURES).length} figures and stamps`);
})();

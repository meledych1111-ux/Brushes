// js/brushes.js - коллекция кистей
(() => {
    // Константы для оптимизации
    const MATH_PI_2 = Math.PI * 2;
    const MATH_PI = Math.PI;
    
    // Оптимизированные функции
    const rand = (n) => (Math.random() - 0.5) * n;
    const randPos = (n) => Math.random() * n;
    
    // Утилиты для создания путей
    const createArc = (ctx, x, y, r) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, MATH_PI_2);
    };
    
    const createEllipse = (ctx, x, y, rx, ry, rotation = 0) => {
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, rotation, 0, MATH_PI_2);
    };

    const BRUSHES = {
        'Круглая': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color;
            createArc(ctx, x, y, r);
            ctx.fill();
            ctx.restore();
        },
        
        'Мягкая круглая': (ctx, x, y, r, color, op) => {
            ctx.save();
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.globalAlpha = op;
            ctx.fillStyle = gradient;
            createArc(ctx, x, y, r);
            ctx.fill();
            ctx.restore();
        },
        
        'Квадратная': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color;
            ctx.fillRect(x - r, y - r, r * 2, r * 2);
            ctx.restore();
        },
        
        'Контур': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(1, r / 4);
            createArc(ctx, x, y, r * 0.9);
            ctx.stroke();
            ctx.restore();
        },
        
        'Карандаш (мягкий)': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.6;
            ctx.fillStyle = color;
            const points = Math.max(3, r * 2);
            for (let i = 0; i < points; i++) {
                ctx.fillRect(x + rand(r * 0.3), y + rand(r * 0.3), 1, 1);
            }
            ctx.restore();
        },
        
        'Карандаш (твёрдый)': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x - 0.5, y - 0.5);
            ctx.lineTo(x + 0.5, y + 0.5);
            ctx.stroke();
            ctx.restore();
        },
        
        'Щетина': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.globalAlpha = op;
            ctx.lineWidth = 1;
            ctx.lineCap = 'round';
            const bristles = Math.max(4, r / 2);
            for (let i = 0; i < bristles; i++) {
                ctx.beginPath();
                ctx.moveTo(x + rand(r * 0.3), y + rand(r * 0.3));
                ctx.lineTo(x + rand(r), y + rand(r));
                ctx.stroke();
            }
            ctx.restore();
        },
        
        'Плоская кисть': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color;
            const width = r * 2;
            const height = r * 0.6;
            ctx.fillRect(x - width/2, y - height/2, width, height);
            ctx.restore();
        },
        
        'Веерная кисть': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.globalAlpha = op;
            ctx.lineWidth = Math.max(1, r / 8);
            ctx.lineCap = 'round';
            const fans = 11;
            for (let i = 0; i < fans; i++) {
                const angle = -MATH_PI/4 + (i / (fans - 1)) * (MATH_PI/2);
                const length = r * (0.7 + Math.random() * 0.3);
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
        
        'Сухая кисть': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.7;
            ctx.fillStyle = color;
            const points = Math.max(5, r * 1.5);
            for (let i = 0; i < points; i++) {
                ctx.fillRect(
                    x + rand(r * 1.2), 
                    y + rand(r * 0.4), 
                    0.5 + Math.random(), 
                    0.5 + Math.random()
                );
            }
            ctx.restore();
        },
        
        'Акварель': (ctx, x, y, r, color, op) => {
            ctx.save();
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.7, color.replace('rgb', 'rgba').replace(')', ',0.6)'));
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            
            ctx.globalAlpha = op * 0.8;
            ctx.fillStyle = gradient;
            createArc(ctx, x, y, r);
            ctx.fill();
            
            // Текстура бумаги
            ctx.globalAlpha = op * 0.1;
            for (let i = 0; i < r * 1.5; i++) {
                ctx.fillRect(x + rand(r * 1.5), y + rand(r * 1.5), 1, 1);
            }
            ctx.restore();
        },
        
        'Масло': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.9;
            ctx.fillStyle = color;
            
            // Основная форма
            createEllipse(ctx, x, y, r * 1.1, r * 0.8, rand(0.5));
            ctx.fill();
            
            // Блики
            ctx.globalAlpha = op * 0.3;
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(x - r + rand(r), y - r * 0.5 + rand(r));
                ctx.lineTo(x + r + rand(r), y + r * 0.5 + rand(r));
                ctx.stroke();
            }
            ctx.restore();
        },
        
        'Аэрограф': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.15;
            ctx.fillStyle = color;
            const points = Math.max(20, r * 8);
            for (let i = 0; i < points; i++) {
                const sprayR = randPos(r * 1.5);
                const sprayAngle = randPos(MATH_PI_2);
                const sprayX = x + Math.cos(sprayAngle) * sprayR;
                const sprayY = y + Math.sin(sprayAngle) * sprayR;
                const size = 0.5 + Math.random() * 1.5;
                createArc(ctx, sprayX, sprayY, size);
                ctx.fill();
            }
            ctx.restore();
        },
        
        'Маркер': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.4;
            ctx.fillStyle = color;
            const width = r * 2.2;
            const height = r * 0.8;
            ctx.fillRect(x - width/2, y - height/2, width, height);
            
            // Более насыщенный центр
            ctx.globalAlpha = op * 0.3;
            ctx.fillStyle = color;
            ctx.fillRect(x - width/3, y - height/3, width * 0.66, height * 0.66);
            ctx.restore();
        },
        
        'Пастель': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.5;
            ctx.fillStyle = color;
            const points = Math.max(8, r * 2.5);
            for (let i = 0; i < points; i++) {
                const grainSize = 0.8 + Math.random() * 1.5;
                ctx.fillRect(
                    x + rand(r * 1.3), 
                    y + rand(r * 1.3), 
                    grainSize, 
                    grainSize
                );
            }
            ctx.restore();
        },
        
        'Гуашь': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.95;
            ctx.fillStyle = color;
            createArc(ctx, x, y, r * 0.9);
            ctx.fill();
            
            // Текстура
            ctx.globalAlpha = op * 0.2;
            for (let i = 0; i < r; i++) {
                ctx.fillRect(x + rand(r * 1.2), y + rand(r * 1.2), 1, 1);
            }
            ctx.restore();
        },
        
        'Текстурная': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color;
            
            // Создаем текстуру холста
            for (let i = 0; i < 15; i++) {
                const texX = x + rand(r * 0.8);
                const texY = y + rand(r * 0.8);
                const texR = r * (0.3 + Math.random() * 0.4);
                createArc(ctx, texX, texY, texR);
                ctx.fill();
            }
            ctx.restore();
        },
        
        'Звёздная': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color;
            
            const stars = Math.max(3, r / 4);
            for (let i = 0; i < stars; i++) {
                const starX = x + rand(r * 2);
                const starY = y + rand(r * 2);
                const starSize = Math.random() * 2 + 0.5;
                
                createArc(ctx, starX, starY, starSize);
                ctx.fill();
                
                // Лучи
                if (Math.random() > 0.7) {
                    ctx.beginPath();
                    ctx.moveTo(starX - starSize * 2, starY);
                    ctx.lineTo(starX + starSize * 2, starY);
                    ctx.moveTo(starX, starY - starSize * 2);
                    ctx.lineTo(starX, starY + starSize * 2);
                    ctx.stroke();
                }
            }
            ctx.restore();
        },
        
        'Неон': (ctx, x, y, r, color, op) => {
            ctx.save();
            
            // Внешнее свечение
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, r * 1.5);
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.6, color.replace('rgb', 'rgba').replace(')', ',0.3)'));
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            
            ctx.globalAlpha = op * 0.7;
            ctx.fillStyle = gradient;
            createArc(ctx, x, y, r * 1.5);
            ctx.fill();
            
            // Яркий центр
            ctx.globalAlpha = op;
            ctx.fillStyle = color;
            createArc(ctx, x, y, r * 0.3);
            ctx.fill();
            
            ctx.restore();
        },
        
        'Хаки': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            
            // Случайные линии в стиле хаки
            for (let i = 0; i < 8; i++) {
                ctx.beginPath();
                const startAngle = randPos(MATH_PI_2);
                const endAngle = startAngle + (Math.PI / 4) + rand(0.5);
                const radius = r * (0.3 + Math.random() * 0.7);
                
                ctx.arc(x, y, radius, startAngle, endAngle);
                ctx.stroke();
            }
            ctx.restore();
        }

    };

    window.BRUSHES = BRUSHES;
})();

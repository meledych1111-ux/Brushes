// js/brushes.js - расширенная коллекция из 60+ кистей
(() => {
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
        // === БАЗОВЫЕ КИСТИ (15) ===
        'Круглая': (ctx, x, y, r, color, op, hardness = 1) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color;
            createArc(ctx, x, y, r * hardness);
            ctx.fill();
            ctx.restore();
        },
        
        'Мягкая круглая': (ctx, x, y, r, color, op) => {
            ctx.save();
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.7, color.replace('rgb', 'rgba').replace(')', ',0.3)'));
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
        
        'Карандаш (цветной)': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.8;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + rand(r * 0.5), y + rand(r * 0.5));
            ctx.stroke();
            ctx.restore();
        },
        
        'Карандаш (механический)': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 0.1, y + 0.1);
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
        
        'Мастихин': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.8;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x - r, y - r);
            ctx.lineTo(x + r, y);
            ctx.lineTo(x - r, y + r);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        },
        
        'Каллиграфия': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.globalAlpha = op;
            ctx.lineWidth = r * 0.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 0.1, y + 0.1);
            ctx.stroke();
            ctx.restore();
        },
        
        'Тушь': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.globalAlpha = op;
            ctx.lineWidth = r * 0.8;
            ctx.lineCap = 'butt';
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + rand(r * 0.2), y + rand(r * 0.2));
            ctx.stroke();
            ctx.restore();
        },

        // === ЖИВОПИСЬ (15) ===
        'Акварель (мягкая)': (ctx, x, y, r, color, op) => {
            ctx.save();
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.7, color.replace('rgb', 'rgba').replace(')', ',0.4)'));
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            
            ctx.globalAlpha = op * 0.6;
            ctx.fillStyle = gradient;
            createArc(ctx, x, y, r);
            ctx.fill();
            
            // Текстура бумаги
            ctx.globalAlpha = op * 0.15;
            for (let i = 0; i < r * 2; i++) {
                ctx.fillRect(x + rand(r), y + rand(r), 1, 1);
            }
            ctx.restore();
        },
        
        'Акварель (текстурированная)': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.7;
            ctx.fillStyle = color;
            
            // Создаем текстуру акварели
            for (let i = 0; i < 8; i++) {
                const texX = x + rand(r * 0.6);
                const texY = y + rand(r * 0.6);
                const texR = r * (0.3 + Math.random() * 0.4);
                createArc(ctx, texX, texY, texR);
                ctx.fill();
            }
            ctx.restore();
        },
        
        'Масло (густая)': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.9;
            ctx.fillStyle = color;
            
            // Основная форма
            createEllipse(ctx, x, y, r * 1.1, r * 0.8, rand(0.5));
            ctx.fill();
            
            // Фактура мазка
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
        
        'Масло (импасто)': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color;
            
            // Создаем объемный мазок
            for (let i = 0; i < 5; i++) {
                const impastoX = x + rand(r * 0.8);
                const impastoY = y + rand(r * 0.8);
                const impastoR = r * (0.2 + Math.random() * 0.3);
                
                // Блик на мазке
                const gradient = ctx.createRadialGradient(
                    impastoX - impastoR*0.3, impastoY - impastoR*0.3, 0,
                    impastoX, impastoY, impastoR
                );
                gradient.addColorStop(0, '#fff');
                gradient.addColorStop(0.3, color);
                gradient.addColorStop(1, '#000');
                
                ctx.fillStyle = gradient;
                createArc(ctx, impastoX, impastoY, impastoR);
                ctx.fill();
            }
            ctx.restore();
        },
        
        'Гуашь': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.95;
            ctx.fillStyle = color;
            createArc(ctx, x, y, r * 0.9);
            ctx.fill();
            
            // Матовая текстура
            ctx.globalAlpha = op * 0.2;
            for (let i = 0; i < r; i++) {
                ctx.fillRect(x + rand(r * 1.2), y + rand(r * 1.2), 1, 1);
            }
            ctx.restore();
        },
        
        'Акрил': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.9;
            ctx.fillStyle = color;
            ctx.fillRect(x - r, y - r / 2, r * 2, r);
            
            // Глянцевый блик
            ctx.globalAlpha = op * 0.3;
            ctx.fillStyle = '#fff';
            ctx.fillRect(x - r, y - r / 4, r * 2, r * 0.2);
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
        
        'Спрей': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.1;
            ctx.fillStyle = color;
            
            // Центральное пятно
            for (let i = 0; i < r * 15; i++) {
                const sprayX = x + rand(r);
                const sprayY = y + rand(r);
                createArc(ctx, sprayX, sprayY, 0.5 + Math.random());
                ctx.fill();
            }
            
            // Рассеивание
            ctx.globalAlpha = op * 0.05;
            for (let i = 0; i < r * 10; i++) {
                const sprayX = x + rand(r * 3);
                const sprayY = y + rand(r * 3);
                createArc(ctx, sprayX, sprayY, Math.random());
                ctx.fill();
            }
            ctx.restore();
        },
        
        'Темпера': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.8;
            ctx.fillStyle = color;
            
            // Плотное покрытие с легкой текстурой
            createArc(ctx, x, y, r);
            ctx.fill();
            
            // Мелкая текстура
            ctx.globalAlpha = op * 0.1;
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.5;
            for (let i = 0; i < 8; i++) {
                ctx.beginPath();
                ctx.moveTo(x + rand(r), y + rand(r));
                ctx.lineTo(x + rand(r), y + rand(r));
                ctx.stroke();
            }
            ctx.restore();
        },
        
        'Фреска': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.6;
            ctx.fillStyle = color;
            
            // Неровное покрытие как у фрески
            for (let i = 0; i < 12; i++) {
                const patchX = x + rand(r * 0.8);
                const patchY = y + rand(r * 0.8);
                const patchR = r * (0.2 + Math.random() * 0.3);
                createArc(ctx, patchX, patchY, patchR);
                ctx.fill();
            }
            ctx.restore();
        },
        
        'Энкаустика': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            
            // Восковая текстура с бликами
            const gradient = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.5, lightenColor(color, 30));
            gradient.addColorStop(1, color);
            
            ctx.fillStyle = gradient;
            createArc(ctx, x, y, r * 0.8);
            ctx.fill();
            
            // Блики
            ctx.globalAlpha = op * 0.4;
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            createArc(ctx, x - r*0.3, y - r*0.3, r*0.2);
            ctx.fill();
            ctx.restore();
        },
        
        'Акварельный карандаш': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.7;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            
            // Гранулированные линии
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(x + rand(r*0.2), y + rand(r*0.2));
                ctx.lineTo(x + rand(r*0.8), y + rand(r*0.8));
                ctx.stroke();
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
        
        'Сангина': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.6;
            ctx.fillStyle = color;
            
            // Мелкие частицы как у сангины
            const particles = Math.max(5, r * 3);
            for (let i = 0; i < particles; i++) {
                const partX = x + rand(r);
                const partY = y + rand(r);
                const partSize = 0.5 + Math.random() * 1.5;
                createArc(ctx, partX, partY, partSize);
                ctx.fill();
            }
            ctx.restore();
        },

        // === ТЕКСТУРЫ (10) ===
        'Холст': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.3;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            
            // Тканевая текстура
            for (let i = -r; i < r; i += 4) {
                ctx.beginPath();
                ctx.moveTo(x - r, y + i);
                ctx.lineTo(x + r, y + i);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(x + i, y - r);
                ctx.lineTo(x + i, y + r);
                ctx.stroke();
            }
            ctx.restore();
        },
        
        'Бумага (акварельная)': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.2;
            ctx.fillStyle = color;
            for (let i = 0; i < r * 2; i++) {
                ctx.fillRect(x + rand(r), y + rand(r), 1, 1);
            }
            ctx.restore();
        },
        
        'Песок': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.5;
            ctx.fillStyle = color;
            for (let i = 0; i < r * 3; i++) {
                ctx.beginPath();
                ctx.arc(x + rand(r), y + rand(r), Math.random() * 1.5, 0, MATH_PI_2);
                ctx.fill();
            }
            ctx.restore();
        },
        
        'Мрамор': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.4;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.moveTo(x - r, y + rand(r));
                for (let j = -r; j < r; j += 10) {
                    ctx.lineTo(x + j, y + rand(r));
                }
                ctx.stroke();
            }
            ctx.restore();
        },
        
        'Кора дерева': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.6;
            ctx.fillStyle = color;
            ctx.fillRect(x - r, y - r, r * 2, r * 2);
            
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 1;
            for (let i = -r; i <= r; i += 4) {
                ctx.beginPath();
                ctx.moveTo(x + i, y - r);
                ctx.lineTo(x + i + rand(2), y + r);
                ctx.stroke();
            }
            ctx.restore();
        },
        
        'Камень': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.5;
            ctx.fillStyle = color;
            for (let i = 0; i < r * 2; i++) {
                ctx.beginPath();
                ctx.arc(x + rand(r * 0.8), y + rand(r * 0.8), Math.random() * 2, 0, MATH_PI_2);
                ctx.fill();
            }
            ctx.restore();
        },
        
        'Листва': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.7;
            ctx.fillStyle = color;
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.ellipse(x + rand(r), y + rand(r), r * 0.4, r * 0.7, rand(MATH_PI), 0, MATH_PI_2);
                ctx.fill();
            }
            ctx.restore();
        },
        
        'Вода (рябь)': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.globalAlpha = op * 0.4;
            ctx.lineWidth = 1;
            for (let i = 1; i <= 3; i++) {
                ctx.beginPath();
                ctx.arc(x, y, r * i * 0.5, 0, MATH_PI_2);
                ctx.stroke();
            }
            ctx.restore();
        },
        
        'Облака': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.3;
            ctx.fillStyle = color;
            for (let i = 0; i < 6; i++) {
                ctx.beginPath();
                ctx.arc(x + rand(r), y + rand(r), r * 0.6, 0, MATH_PI_2);
                ctx.fill();
            }
            ctx.restore();
        },
        
        'Ткань (джинса)': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.5;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            for (let i = -r; i <= r; i += 3) {
                ctx.beginPath();
                ctx.moveTo(x - r, y + i);
                ctx.lineTo(x + r, y + i);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x + i, y - r);
                ctx.lineTo(x + i, y + r);
                ctx.stroke();
            }
            ctx.restore();
        },

        // === АНИМЕ (10) ===
        'Аниме-линия': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.globalAlpha = op;
            ctx.lineWidth = Math.max(1, r / 3);
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x - 1, y);
            ctx.lineTo(x + 1, y);
            ctx.stroke();
            ctx.restore();
        },
        
        'Аниме-тень': (ctx, x, y, r, color, op) => {
            ctx.save();
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
            gradient.addColorStop(0, color.replace('rgb', 'rgba').replace(')', ',0.8)'));
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.globalAlpha = op * 0.6;
            ctx.fillStyle = gradient;
            createArc(ctx, x, y, r);
            ctx.fill();
            ctx.restore();
        },
        
        'Аниме-блик': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.9;
            ctx.fillStyle = '#ffffff';
            
            // Основной блик
            createArc(ctx, x, y, r * 0.3);
            ctx.fill();
            
            // Вторичный блик
            ctx.globalAlpha = op * 0.6;
            createArc(ctx, x - r*0.2, y - r*0.2, r * 0.15);
            ctx.fill();
            ctx.restore();
        },
        
        'Аниме-румянец': (ctx, x, y, r, color, op) => {
            ctx.save();
            const blushColor = color.includes('#ff') ? color : '#ffb6c1';
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
            gradient.addColorStop(0, blushColor.replace('rgb', 'rgba').replace(')', ',0.7)'));
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.globalAlpha = op * 0.4;
            ctx.fillStyle = gradient;
            createArc(ctx, x, y, r);
            ctx.fill();
            ctx.restore();
        },
        
        'Аниме-волосы': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.globalAlpha = op;
            ctx.lineWidth = Math.max(1, r / 5);
            ctx.lineCap = 'round';
            
            // Пряди волос
            for (let i = 0; i < 8; i++) {
                const angle = rand(MATH_PI);
                const length = r * (0.5 + Math.random());
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
        
        'Аниме-свет': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.3;
            ctx.fillStyle = '#ffff00';
            
            // Лучевой эффект
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * MATH_PI_2;
                const length = r * 1.5;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(
                    x + Math.cos(angle) * length,
                    y + Math.sin(angle) * length
                );
                ctx.lineTo(
                    x + Math.cos(angle + 0.2) * length * 0.7,
                    y + Math.sin(angle + 0.2) * length * 0.7
                );
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        },
        
        'Аниме-искры': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = '#ffff00';
            
            // Мелкие искры
            for (let i = 0; i < 12; i++) {
                const sparkX = x + rand(r * 2);
                const sparkY = y + rand(r * 2);
                const sparkSize = 0.5 + Math.random();
                
                ctx.beginPath();
                ctx.moveTo(sparkX, sparkY - sparkSize);
                ctx.lineTo(sparkX + sparkSize, sparkY);
                ctx.lineTo(sparkX, sparkY + sparkSize);
                ctx.lineTo(sparkX - sparkSize, sparkY);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        },
        
        'Аниме-контур': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.strokeStyle = '#000000';
            ctx.globalAlpha = op;
            ctx.lineWidth = Math.max(2, r / 4);
            ctx.lineCap = 'square';
            ctx.beginPath();
            ctx.moveTo(x - 1, y - 1);
            ctx.lineTo(x + 1, y + 1);
            ctx.stroke();
            ctx.restore();
        },
        
        'Аниме-заливка': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color;
            
            // Плоская заливка с четкими краями
            createArc(ctx, x, y, r);
            ctx.fill();
            
            // Легкая тень для объема
            ctx.globalAlpha = op * 0.3;
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            createArc(ctx, x + r*0.2, y + r*0.2, r*0.8);
            ctx.fill();
            ctx.restore();
        },
        
        'Аниме-текстура': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.8;
            ctx.fillStyle = color;
            
            // Точковая текстура для аниме
            for (let i = 0; i < r * 1.5; i++) {
                const dotX = x + rand(r);
                const dotY = y + rand(r);
                const dotSize = 0.3 + Math.random() * 0.7;
                createArc(ctx, dotX, dotY, dotSize);
                ctx.fill();
            }
            ctx.restore();
        },

        // === 3D МАТЕРИАЛЫ (10) ===
        'Металл (шлифованный)': (ctx, x, y, r, color, op) => {
            ctx.save();
            const grad = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.5, color);
            grad.addColorStop(1, '#000');
            ctx.globalAlpha = op;
            ctx.fillStyle = grad;
            createArc(ctx, x, y, r);
            ctx.fill();
            
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 1;
            for (let i = -r; i < r; i += 3) {
                ctx.beginPath();
                ctx.moveTo(x - r, y + i);
                ctx.lineTo(x + r, y + i);
                ctx.stroke();
            }
            ctx.restore();
        },
        
        'Стекло': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op * 0.3;
            ctx.fillStyle = color;
            createArc(ctx, x, y, r);
            ctx.fill();
            
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.5, 0, MATH_PI_2);
            ctx.stroke();
            ctx.restore();
        },
        
        'Керамика': (ctx, x, y, r, color, op) => {
            ctx.save();
            const grad = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.5, color);
            grad.addColorStop(1, '#666');
            ctx.globalAlpha = op;
            ctx.fillStyle = grad;
            createArc(ctx, x, y, r);
            ctx.fill();
            ctx.restore();
        },
        
        'Пластик': (ctx, x, y, r, color, op) => {
            ctx.save();
            const grad = ctx.createRadialGradient(x - r*0.3, y - r*0.3, 0, x, y, r);
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.3, lightenColor(color, 20));
            grad.addColorStop(1, color);
            ctx.globalAlpha = op;
            ctx.fillStyle = grad;
            createArc(ctx, x, y, r);
            ctx.fill();
            ctx.restore();
        },
        
        'Дерево': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color;
            ctx.fillRect(x - r, y - r, r * 2, r * 2);
            
            // Текстура древесины
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 1;
            for (let i = -r; i <= r; i += 2) {
                ctx.beginPath();
                ctx.moveTo(x + i, y - r);
                ctx.lineTo(x + i + rand(1), y + r);
                ctx.stroke();
            }
            ctx.restore();
        },
        
        'Кожа': (ctx, x, y, r, color, op) => {
            ctx.save();
            ctx.globalAlpha = op;
            ctx.fillStyle = color;
            createArc(ctx, x, y, r);
            ctx.fill();
            
            // Поры кожи
            ctx.globalAlpha = op * 0.3;
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            for (let i = 0; i < r; i++) {
                const poreX = x + rand(r * 0.8);
                const poreY = y + rand(r * 0.8);
                createArc(ctx, poreX, poreY, 0.3);
                ctx.fill();
            }
            ctx.restore();
        },
        
        'Вода (3D)': (ctx, x, y, r, color, op) => {
            ctx.save();
            const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
            grad.addColorStop(0, 'rgba(255,255,255,0.8)');
            grad.addColorStop(0.5, color);
            grad.addColorStop(1, 'rgba(0,0,100,0.5)');
            ctx.globalAlpha = op * 0.7;
            ctx.fillStyle = grad;
            createArc(ctx, x, y, r);
            ctx.fill();
            
            // Волны
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            for (let i = 1; i <= 2; i++) {
                ctx.beginPath();
                ctx.arc(x, y, r * i * 0.6, 0, MATH_PI);
                ctx.stroke();
            }
            ctx.restore();
        },
        
        'Огонь': (ctx, x, y, r, color, op) => {
            ctx.save();
            const grad = ctx.createRadialGradient(x, y - r*0.5, 0, x, y + r, r);
            grad.addColorStop(0, '#ffff00');
            grad.addColorStop(0.5, '#ff6600');
            grad.addColorStop(1, '#660000');
            ctx.globalAlpha = op;
            ctx.fillStyle = grad;
            
            // Форма пламени
            ctx.beginPath();
            ctx.moveTo(x, y - r);
            ctx.bezierCurveTo(x - r, y - r*0.5, x - r*0.5, y + r, x, y + r*0.5);
            ctx.bezierCurveTo(x + r*0.5, y + r, x + r, y - r*0.5, x, y - r);
            ctx.fill();
            ctx.restore();
        },
        
        'Лёд': (ctx, x, y, r, color, op) => {
            ctx.save();
            const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
            grad.addColorStop(0, 'rgba(255,255,255,0.9)');
            grad.addColorStop(0.7, 'rgba(200,230,255,0.7)');
            grad.addColorStop(1, 'rgba(150,200,255,0.5)');
            ctx.globalAlpha = op;
            ctx.fillStyle = grad;
            createArc(ctx, x, y, r);
            ctx.fill();
            
            // Кристаллические блики
            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * MATH_PI_2;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(
                    x + Math.cos(angle) * r,
                    y + Math.sin(angle) * r
                );
                ctx.stroke();
            }
            ctx.restore();
        },
        
        'Неон (3D)': (ctx, x, y, r, color, op) => {
            ctx.save();
            
            // Внешнее свечение
            const outerGrad = ctx.createRadialGradient(x, y, 0, x, y, r * 1.5);
            outerGrad.addColorStop(0, color);
            outerGrad.addColorStop(0.6, color.replace('rgb', 'rgba').replace(')', ',0.3)'));
            outerGrad.addColorStop(1, 'rgba(255,255,255,0)');
            
            ctx.globalAlpha = op * 0.7;
            ctx.fillStyle = outerGrad;
            createArc(ctx, x, y, r * 1.5);
            ctx.fill();
            
            // Яркий центр
            const innerGrad = ctx.createRadialGradient(x, y, 0, x, y, r * 0.5);
            innerGrad.addColorStop(0, '#ffffff');
            innerGrad.addColorStop(1, color);
            
            ctx.globalAlpha = op;
            ctx.fillStyle = innerGrad;
            createArc(ctx, x, y, r * 0.5);
            ctx.fill();
            
            ctx.restore();
        }
    };

    // Вспомогательная функция для осветления цвета
    function lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }

    window.BRUSHES = BRUSHES;
    console.log(`Loaded ${Object.keys(BRUSHES).length} brushes`);
})();

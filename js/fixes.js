// js/fixes.js - ИСПРАВЛЕНИЯ ДЛЯ ВСЕХ ПРОБЛЕМ
(() => {
    console.log('🔧 Loading fixes...');
    
    // === ИСПРАВЛЕНИЕ ШТАМПОВ И ФИГУР ===
    function fixShapesAndStamps() {
        console.log('🔷 Fixing shapes and stamps...');
        
        // Добавляем обработчики для штампов
        const stampSelect = document.getElementById('stampSelect');
        if (stampSelect) {
            stampSelect.addEventListener('change', function(e) {
                if (e.target.value) {
                    // Активируем инструмент фигур при выборе штампа
                    const shapeTool = document.querySelector('[data-tool="shape"]');
                    if (shapeTool) {
                        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
                        shapeTool.classList.add('active');
                    }
                    
                    // Устанавливаем текущий инструмент и фигуру
                    if (window.App) {
                        window.App.currentTool = 'shape';
                        window.App.currentShape = e.target.value;
                    }
                    
                    console.log('🎨 Selected stamp:', e.target.value);
                }
            });
        }
        
        // Добавляем обработчики для кнопок фигур
        const shapeButtons = document.querySelectorAll('.shape-btn');
        shapeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Активируем инструмент фигур
                const shapeTool = document.querySelector('[data-tool="shape"]');
                if (shapeTool) {
                    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                    shapeTool.classList.add('active');
                }
                
                // Устанавливаем текущий инструмент и фигуру
                if (window.App) {
                    window.App.currentTool = 'shape';
                    window.App.currentShape = this.dataset.shape;
                }
                
                console.log('🔷 Selected shape:', this.dataset.shape);
            });
        });
    }
    
    // === ИСПРАВЛЕНИЕ ИНСТРУМЕНТОВ ЧЕРЧЕНИЯ ===
    function fixDrawingTools() {
        console.log('📐 Fixing drawing tools...');
        
        const advancedToolSelect = document.getElementById('advancedToolSelect');
        if (advancedToolSelect) {
            advancedToolSelect.addEventListener('change', function(e) {
                if (e.target.value) {
                    // Активируем выбранный инструмент
                    if (window.App) {
                        window.App.currentTool = e.target.value;
                    }
                    
                    // Находим и активируем соответствующую кнопку
                    const toolBtn = document.querySelector(`[data-tool="${e.target.value}"]`);
                    if (toolBtn) {
                        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
                        toolBtn.classList.add('active');
                    }
                    
                    console.log('📐 Selected drawing tool:', e.target.value);
                }
            });
        }
    }
    
    // === УЛУЧШЕННЫЕ ЭФФЕКТЫ С МЯГКИМИ КРАЯМИ ===
    function createSoftEffects() {
        console.log('🎭 Creating soft effects...');
        
        // Мягкое размытие
        window.softBlur = {
            apply: function(ctx, x, y, size, color, opacity) {
                const blurSize = Math.max(10, size * 1.2);
                ctx.save();
                
                // Создаем мягкий круговой эффект
                for (let i = 0; i < 5; i++) {
                    const offsetX = (Math.random() - 0.5) * size * 0.3;
                    const offsetY = (Math.random() - 0.5) * size * 0.3;
                    const radius = blurSize * (0.3 + Math.random() * 0.4);
                    const alpha = opacity * 0.2 * (0.5 + Math.random() * 0.5);
                    
                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                ctx.restore();
            }
        };
        
        // Мягкая смазка
        window.softSmudge = {
            lastPositions: [],
            apply: function(ctx, x, y, size, color, opacity) {
                ctx.save();
                
                // Сохраняем позиции для плавности
                this.lastPositions.push({x, y});
                if (this.lastPositions.length > 5) {
                    this.lastPositions.shift();
                }
                
                // Рисуем плавные следы
                const smudgeSize = Math.max(8, size * 0.8);
                const intensity = opacity * 0.6;
                
                for (let i = 0; i < this.lastPositions.length; i++) {
                    const pos = this.lastPositions[i];
                    const alpha = intensity * (i / this.lastPositions.length);
                    
                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = color;
                    
                    // Мягкие круги разного размера
                    for (let j = 0; j < 3; j++) {
                        const offsetX = (Math.random() - 0.5) * smudgeSize;
                        const offsetY = (Math.random() - 0.5) * smudgeSize;
                        const radius = smudgeSize * (0.2 + Math.random() * 0.3);
                        
                        ctx.beginPath();
                        ctx.arc(pos.x + offsetX, pos.y + offsetY, radius, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                
                ctx.restore();
            }
        };
        
        // Заменяем старые эффекты на улучшенные
        if (window.Tools) {
            window.Tools.blur = window.softBlur.apply;
            window.Tools.smudge = window.softSmudge.apply;
        }
    }
    
    // === ИСПРАВЛЕНИЕ ГРАДИЕНТА ===
    function fixGradient() {
        console.log('🌈 Fixing gradient...');
        
        // Добавляем обработчик для градиента
        const gradientTool = document.querySelector('[data-tool="gradient"]');
        if (gradientTool) {
            gradientTool.addEventListener('click', function() {
                console.log('🌈 Gradient tool activated');
                
                // Убедимся что градиент доступен
                if (window.Tools && !window.Tools.gradient) {
                    window.Tools.gradient = function(ctx, startX, startY, endX, endY, color, opacity) {
                        const secondaryColor = document.getElementById('secondaryColorPicker')?.value || '#ffffff';
                        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
                        gradient.addColorStop(0, color);
                        gradient.addColorStop(1, secondaryColor);
                        
                        ctx.save();
                        ctx.globalAlpha = opacity || 1;
                        ctx.fillStyle = gradient;
                        ctx.fillRect(Math.min(startX, endX), Math.min(startY, endY), 
                                    Math.abs(endX - startX), Math.abs(endY - startY));
                        ctx.restore();
                    };
                }
            });
        }
    }
    
    // === ДОБАВЛЕНИЕ АНИМЕ ШТАМПОВ ===
    function addAnimeStamps() {
        console.log('🎌 Adding anime stamps...');
        
        if (!window.FIGURES) window.FIGURES = {};
        
        // Аниме глаз
        window.FIGURES.anime_eye = function(ctx, x, y, size, color, opacity) {
            ctx.save();
            ctx.globalAlpha = opacity;
            
            // Основной глаз
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(x, y, size, size * 0.7, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Радужка
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Зрачок
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(x, y, size * 0.2, 0, Math.PI * 2);
            ctx.fill();
            
            // Блик
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x - size * 0.2, y - size * 0.2, size * 0.1, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        };
        
        // Аниме волосы
        window.FIGURES.anime_hair = function(ctx, x, y, size, color, opacity) {
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = size * 0.1;
            
            // Рисуем несколько прядей волос
            for (let i = 0; i < 5; i++) {
                const angle = -Math.PI/4 + (i / 4) * (Math.PI/2);
                const length = size * (1 + Math.random() * 0.5);
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(
                    x + Math.cos(angle) * length,
                    y + Math.sin(angle) * length
                );
                ctx.stroke();
            }
            
            ctx.restore();
        };
        
        // Добавляем другие аниме штампы
        window.FIGURES.sparkle = function(ctx, x, y, size, color, opacity) {
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.fillStyle = '#ffff00';
            
            // Рисуем звездочку-блеск
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI) / 2;
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(angle);
                
                ctx.beginPath();
                ctx.moveTo(0, -size);
                ctx.lineTo(size * 0.3, -size * 0.3);
                ctx.lineTo(size, 0);
                ctx.lineTo(size * 0.3, size * 0.3);
                ctx.lineTo(0, size);
                ctx.lineTo(-size * 0.3, size * 0.3);
                ctx.lineTo(-size, 0);
                ctx.lineTo(-size * 0.3, -size * 0.3);
                ctx.closePath();
                ctx.fill();
                
                ctx.restore();
            }
            
            ctx.restore();
        };
    }
    
    // === ЗАПУСК ВСЕХ ИСПРАВЛЕНИЙ ===
    function applyAllFixes() {
        console.log('🚀 Applying all fixes...');
        
        fixShapesAndStamps();
        fixDrawingTools();
        createSoftEffects();
        fixGradient();
        addAnimeStamps();
        
        console.log('✅ All fixes applied!');
    }
    
    // Запускаем исправления когда DOM готов
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyAllFixes);
    } else {
        applyAllFixes();
    }
    
})();

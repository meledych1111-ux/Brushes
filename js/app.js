// js/app.js - ПОЛНОСТЬЮ ПЕРЕРАБОТАННАЯ ВЕРСИЯ
(() => {
    console.log('🔄 Starting ArtFlow Pro - COMPLETE REWRITE...');

    const canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error('❌ Canvas element not found');
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('❌ Canvas context not available');
        return;
    }

    // === ГЛАВНОЕ СОСТОЯНИЕ ПРИЛОЖЕНИЯ ===
    const state = {
        painting: false,
        lastX: 0, lastY: 0,
        startX: 0, startY: 0,
        currentTool: 'brush',
        currentBrush: 'Круглая',
        currentShape: 'circle',
        history: [],
        historyStep: 0,
        isDrawingShape: false,
        lastTime: 0
    };

    // === ИНИЦИАЛИЗАЦИЯ ВСЕГО СРАЗУ ===
    function initializeEverything() {
        console.log('🎯 Initializing EVERYTHING...');
        
        // 1. Создаем все модули если их нет
        createAllModules();
        
        // 2. Настраиваем canvas
        setupCanvas();
        
        // 3. Настраиваем ВСЕ обработчики
        setupAllEventListeners();
        
        // 4. Настраиваем ВСЕ UI элементы
        setupCompleteUI();
        
        // 5. Сохраняем начальное состояние
        saveState();
        
        console.log('✅ EVERYTHING initialized!');
    }

    // === СОЗДАЕМ ВСЕ МОДУЛИ ===
    function createAllModules() {
        console.log('📦 Creating all modules...');
        
        // Кисти (используем из brushes.js или создаем базовые)
        if (!window.BRUSHES) {
            console.warn('Creating basic brushes');
            window.BRUSHES = {
                'Круглая': (ctx, x, y, size, color, opacity) => {
                    ctx.save();
                    ctx.globalAlpha = opacity;
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            };
        }

        // Инструменты - СОЗДАЕМ ВСЕ СРАЗУ
        window.Tools = {
            // Ластик
            eraser: (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalCompositeOperation = 'destination-out';
                ctx.globalAlpha = opacity || 0.8;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            },

            // МЯГКОЕ размытие
            blur: (ctx, x, y, size, color, opacity) => {
                ctx.save();
                const blurSize = Math.max(10, size * 1.2);
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
            },

            // МЯГКАЯ смазка
            smudge: (ctx, x, y, size, color, opacity) => {
                ctx.save();
                const smudgeSize = Math.max(8, size * 0.8);
                const intensity = opacity * 0.6;
                
                for (let i = 0; i < 5; i++) {
                    const alpha = intensity * (i / 5);
                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = color;
                    
                    for (let j = 0; j < 3; j++) {
                        const offsetX = (Math.random() - 0.5) * smudgeSize;
                        const offsetY = (Math.random() - 0.5) * smudgeSize;
                        const radius = smudgeSize * (0.2 + Math.random() * 0.3);
                        
                        ctx.beginPath();
                        ctx.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                ctx.restore();
            },

            // Заливка
            fill: (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity || 1;
                ctx.fillStyle = color;
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.restore();
            },

            // Градиент - РАБОЧИЙ
            gradient: (ctx, startX, startY, endX, endY, color, opacity) => {
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
            }
        };

        // Фигуры и штампы - СОЗДАЕМ ВСЕ
        window.FIGURES = {
            // Базовые фигуры
            circle: (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            },
            square: (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.fillStyle = color;
                ctx.fillRect(x - size, y - size, size * 2, size * 2);
                ctx.restore();
            },
            triangle: (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(x, y - size);
                ctx.lineTo(x - size, y + size);
                ctx.lineTo(x + size, y + size);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            },
            star: (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.fillStyle = color;
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
                    const x1 = x + Math.cos(angle) * size;
                    const y1 = y + Math.sin(angle) * size;
                    
                    if (i === 0) ctx.moveTo(x1, y1);
                    else ctx.lineTo(x1, y1);
                    
                    const innerAngle = angle + Math.PI / 5;
                    const x2 = x + Math.cos(innerAngle) * size * 0.5;
                    const y2 = y + Math.sin(innerAngle) * size * 0.5;
                    ctx.lineTo(x2, y2);
                }
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            },

            // АНИМЕ ШТАМПЫ - РАБОЧИЕ
            anime_eye: (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity;
                
                // Основной глаз
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.ellipse(x, y, size, size * 0.7, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Радужка
                ctx.fillStyle = color || '#007aff';
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
            },

            anime_hair: (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.strokeStyle = color || '#8B4513';
                ctx.lineWidth = size * 0.1;
                ctx.lineCap = 'round';
                
                // Рисуем несколько прядей волос
                for (let i = 0; i < 5; i++) {
                    const angle = -Math.PI/4 + (i / 4) * (Math.PI/2);
                    const length = size * (1 + Math.random() * 0.5);
                    
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
                    ctx.stroke();
                }
                ctx.restore();
            },

            sparkle: (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.fillStyle = '#ffff00';
                
                // Рисуем блеск
                for (let i = 0; i < 4; i++) {
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(i * Math.PI / 2);
                    
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
            }
        };

        // Инструменты для черчения
        window.DrawingTools = {
            line: {
                preview: (ctx, startX, startY, endX, endY, color, opacity) => {
                    drawLine(ctx, startX, startY, endX, endY, color, opacity * 0.7);
                },
                final: (ctx, startX, startY, endX, endY, color, opacity) => {
                    drawLine(ctx, startX, startY, endX, endY, color, opacity);
                }
            },
            rectangle: {
                preview: (ctx, startX, startY, endX, endY, color, opacity) => {
                    drawRectangle(ctx, startX, startY, endX, endY, color, opacity * 0.7, true);
                },
                final: (ctx, startX, startY, endX, endY, color, opacity) => {
                    drawRectangle(ctx, startX, startY, endX, endY, color, opacity, false);
                }
            },
            rectangle_fill: {
                preview: (ctx, startX, startY, endX, endY, color, opacity) => {
                    drawRectangleFill(ctx, startX, startY, endX, endY, color, opacity * 0.5);
                },
                final: (ctx, startX, startY, endX, endY, color, opacity) => {
                    drawRectangleFill(ctx, startX, startY, endX, endY, color, opacity);
                }
            },
            circle: {
                preview: (ctx, startX, startY, endX, endY, color, opacity) => {
                    drawCircle(ctx, startX, startY, endX, endY, color, opacity * 0.7, true);
                },
                final: (ctx, startX, startY, endX, endY, color, opacity) => {
                    drawCircle(ctx, startX, startY, endX, endY, color, opacity, false);
                }
            },
            circle_fill: {
                preview: (ctx, startX, startY, endX, endY, color, opacity) => {
                    drawCircleFill(ctx, startX, startY, endX, endY, color, opacity * 0.5);
                },
                final: (ctx, startX, startY, endX, endY, color, opacity) => {
                    drawCircleFill(ctx, startX, startY, endX, endY, color, opacity);
                }
            },
            gradient: {
                preview: (ctx, startX, startY, endX, endY, color, opacity) => {
                    window.Tools.gradient(ctx, startX, startY, endX, endY, color, opacity * 0.7);
                },
                final: (ctx, startX, startY, endX, endY, color, opacity) => {
                    window.Tools.gradient(ctx, startX, startY, endX, endY, color, opacity);
                }
            }
        };

        // Простые функции для рисования фигур
        function drawLine(ctx, startX, startY, endX, endY, color, opacity) {
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            ctx.restore();
        }

        function drawRectangle(ctx, startX, startY, endX, endY, color, opacity, isPreview) {
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            if (isPreview) ctx.setLineDash([5, 5]);
            ctx.strokeRect(startX, startY, endX - startX, endY - startY);
            ctx.restore();
        }

        function drawRectangleFill(ctx, startX, startY, endX, endY, color, opacity) {
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.fillStyle = color;
            ctx.fillRect(startX, startY, endX - startX, endY - startY);
            ctx.restore();
        }

        function drawCircle(ctx, startX, startY, endX, endY, color, opacity, isPreview) {
            const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            if (isPreview) ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        function drawCircleFill(ctx, startX, startY, endX, endY, color, opacity) {
            const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // === НАСТРОЙКА CANVAS ===
    function setupCanvas() {
        const container = document.querySelector('.canvas-container');
        if (!container) return;

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 600;
        
        canvas.width = width;
        canvas.height = height;
        
        // Очищаем белым
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
    }

    // === ВСЕ ОБРАБОТЧИКИ СОБЫТИЙ ===
    function setupAllEventListeners() {
        console.log('🎮 Setting up ALL event listeners...');
        
        // Рисование на canvas
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        
        // Touch события
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchmove', handleTouchMove);
        canvas.addEventListener('touchend', stopDrawing);
        
        // Горячие клавиши
        document.addEventListener('keydown', handleKeyDown);
    }

    function startDrawing(e) {
        e.preventDefault();
        state.painting = true;
        
        const pos = getCanvasPosition(e);
        state.lastX = pos.x;
        state.lastY = pos.y;
        state.startX = pos.x;
        state.startY = pos.y;
        
        console.log('🎨 Start drawing with:', state.currentTool);
        
        // Если это фигура - начинаем предпросмотр
        if (isDrawingTool(state.currentTool)) {
            state.isDrawingShape = true;
        } else if (state.currentTool === 'shape') {
            // Штампы и фигуры - рисуем сразу
            drawShape(pos.x, pos.y);
            state.painting = false;
            saveState();
        } else {
            // Обычные инструменты - рисуем первую точку
            drawBrush(pos.x, pos.y);
        }
    }

    function draw(e) {
        if (!state.painting) return;
        e.preventDefault();
        
        const pos = getCanvasPosition(e);
        const currentTime = Date.now();
        
        // Ограничиваем FPS для плавности
        if (currentTime - state.lastTime < 16) return;
        state.lastTime = currentTime;
        
        if (isDrawingTool(state.currentTool) && state.isDrawingShape) {
            // Предпросмотр фигуры
            drawPreviewShape(state.startX, state.startY, pos.x, pos.y);
        } else if (!isDrawingTool(state.currentTool) && state.currentTool !== 'shape') {
            // Обычное рисование
            drawSmoothLine(state.lastX, state.lastY, pos.x, pos.y);
            state.lastX = pos.x;
            state.lastY = pos.y;
        }
        
        updateCoordinates(pos);
    }

    function drawSmoothLine(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(1, Math.floor(distance / 2));
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = x1 + dx * t;
            const y = y1 + dy * t;
            drawBrush(x, y);
        }
    }

    function stopDrawing() {
        if (state.painting) {
            if (isDrawingTool(state.currentTool) && state.isDrawingShape) {
                // Завершаем рисование фигуры
                drawFinalShape(state.startX, state.startY, state.lastX, state.lastY);
                state.isDrawingShape = false;
                saveState();
            } else if (state.currentTool === 'brush' || state.currentTool === 'eraser') {
                saveState();
            }
            
            state.painting = false;
        }
    }

    function handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        startDrawing(mouseEvent);
    }

    function handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        draw(mouseEvent);
    }

    function handleKeyDown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            undo();
        }
    }

    // === ФУНКЦИИ РИСОВАНИЯ ===
    function drawBrush(x, y) {
        const size = getBrushSize();
        const opacity = getBrushOpacity();
        const color = getCurrentColor();
        
        try {
            if (state.currentTool === 'brush') {
                if (window.BRUSHES && window.BRUSHES[state.currentBrush]) {
                    window.BRUSHES[state.currentBrush](ctx, x, y, size, color, opacity);
                } else {
                    drawBasicBrush(x, y, size, color, opacity);
                }
            } else if (window.Tools && window.Tools[state.currentTool]) {
                window.Tools[state.currentTool](ctx, x, y, size, color, opacity);
            } else {
                drawBasicBrush(x, y, size, color, opacity);
            }
        } catch (error) {
            console.error('❌ Drawing error:', error);
            drawBasicBrush(x, y, size, color, opacity);
        }
    }

    function drawBasicBrush(x, y, size, color, opacity) {
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawShape(x, y) {
        const size = getBrushSize();
        const opacity = getBrushOpacity();
        const color = getCurrentColor();
        
        if (window.FIGURES && window.FIGURES[state.currentShape]) {
            window.FIGURES[state.currentShape](ctx, x, y, size, color, opacity);
        } else {
            drawBasicBrush(x, y, size, color, opacity);
        }
    }

    function drawPreviewShape(startX, startY, endX, endY) {
        const color = getCurrentColor();
        const opacity = getBrushOpacity();
        
        if (window.DrawingTools && window.DrawingTools[state.currentTool]) {
            window.DrawingTools[state.currentTool].preview(ctx, startX, startY, endX, endY, color, opacity);
        }
    }

    function drawFinalShape(startX, startY, endX, endY) {
        const color = getCurrentColor();
        const opacity = getBrushOpacity();
        
        if (window.DrawingTools && window.DrawingTools[state.currentTool]) {
            window.DrawingTools[state.currentTool].final(ctx, startX, startY, endX, endY, color, opacity);
        }
    }

    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
    function getCanvasPosition(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    function getCurrentColor() {
        const colorPicker = document.getElementById('colorPicker') || document.getElementById('quickColor');
        return colorPicker ? colorPicker.value : '#007aff';
    }

    function getBrushSize() {
        const slider = document.getElementById('sizeSlider');
        return slider ? parseInt(slider.value) : 20;
    }

    function getBrushOpacity() {
        const slider = document.getElementById('opacitySlider');
        return slider ? parseInt(slider.value) / 100 : 1;
    }

    function isDrawingTool(tool) {
        const drawingTools = ['line', 'rectangle', 'rectangle_fill', 'circle', 'circle_fill', 'gradient'];
        return drawingTools.includes(tool);
    }

    function updateCoordinates(pos) {
        const coordsEl = document.getElementById('coordinates');
        if (coordsEl) {
            coordsEl.textContent = `X: ${Math.round(pos.x)}, Y: ${Math.round(pos.y)}`;
        }
    }

    // === ИСТОРИЯ ===
    function saveState() {
        state.history.length = state.historyStep;
        state.history.push(canvas.toDataURL());
        if (state.history.length > 20) state.history.shift();
        state.historyStep = state.history.length;
        updateUndoRedoButtons();
    }

    function undo() {
        if (state.historyStep > 1) {
            state.historyStep--;
            restoreState();
            updateUndoRedoButtons();
        }
    }

    function restoreState() {
        if (state.historyStep > 0 && state.history[state.historyStep - 1]) {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = state.history[state.historyStep - 1];
        }
    }

    function updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undoBtn');
        if (undoBtn) {
            undoBtn.disabled = state.historyStep <= 1;
        }
    }

    // === ПОЛНАЯ НАСТРОЙКА UI ===
    function setupCompleteUI() {
        console.log('🎛️ Setting up COMPLETE UI...');
        
        setupBrushes();
        setupTools();
        setupDrawingTools();
        setupShapesAndStamps();
        setupColorPresets();
        setupSliders();
        setupActionButtons();
        
        updateBrushInfo();
    }

    function setupBrushes() {
        const brushSelect = document.getElementById('brushSelect');
        const brushCount = document.getElementById('brushCount');
        
        if (brushSelect && window.BRUSHES) {
            const brushes = Object.keys(window.BRUSHES);
            
            brushSelect.innerHTML = '';
            brushes.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                brushSelect.appendChild(option);
            });
            
            if (brushes.length > 0) {
                state.currentBrush = brushes[0];
                brushSelect.value = state.currentBrush;
            }
            
            brushSelect.addEventListener('change', (e) => {
                state.currentBrush = e.target.value;
                updateBrushInfo();
            });

            if (brushCount) {
                brushCount.textContent = `${brushes.length}+`;
            }
        }
    }

    function setupTools() {
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                toolButtons.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                state.currentTool = e.currentTarget.dataset.tool;
                updateBrushInfo();
            });
        });

        if (toolButtons[0]) {
            toolButtons[0].classList.add('active');
        }
    }

    function setupDrawingTools() {
        const advancedToolSelect = document.getElementById('advancedToolSelect');
        if (advancedToolSelect) {
            // Очищаем и добавляем инструменты
            advancedToolSelect.innerHTML = `
                <option value="">Дополнительные инструменты...</option>
                <option value="line">📏 Линия</option>
                <option value="rectangle">⬜ Прямоугольник</option>
                <option value="rectangle_fill">🟦 Залитый прямоугольник</option>
                <option value="circle">⭕ Круг</option>
                <option value="circle_fill">🔵 Залитый круг</option>
                <option value="gradient">🌈 Градиент</option>
            `;

            advancedToolSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    state.currentTool = e.target.value;
                    
                    // Активируем соответствующую кнопку если есть
                    const toolBtn = document.querySelector(`[data-tool="${e.target.value}"]`);
                    if (toolBtn) {
                        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
                        toolBtn.classList.add('active');
                    }
                    
                    updateBrushInfo();
                    console.log('📐 Selected drawing tool:', e.target.value);
                }
            });
        }
    }

    function setupShapesAndStamps() {
        console.log('🔷 Setting up shapes and stamps...');
        
        // Кнопки фигур
        const shapeButtons = document.querySelectorAll('.shape-btn');
        shapeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                state.currentTool = 'shape';
                state.currentShape = this.dataset.shape;
                
                // Активируем инструмент фигур
                const shapeTool = document.querySelector('[data-tool="shape"]');
                if (shapeTool) {
                    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                    shapeTool.classList.add('active');
                }
                
                updateBrushInfo();
                console.log('🔷 Selected shape:', this.dataset.shape);
            });
        });

        // Выпадающий список штампов
        const stampSelect = document.getElementById('stampSelect');
        if (stampSelect) {
            stampSelect.addEventListener('change', function(e) {
                if (e.target.value) {
                    state.currentTool = 'shape';
                    state.currentShape = e.target.value;
                    
                    // Активируем инструмент фигур
                    const shapeTool = document.querySelector('[data-tool="shape"]');
                    if (shapeTool) {
                        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                        shapeTool.classList.add('active');
                    }
                    
                    updateBrushInfo();
                    console.log('🎨 Selected stamp:', e.target.value);
                }
            });
        }
    }

    function setupColorPresets() {
        const presets = document.querySelectorAll('.color-preset');
        const colorPicker = document.getElementById('colorPicker');
        
        presets.forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.dataset.color;
                if (colorPicker && color) {
                    colorPicker.value = color;
                }
            });
        });
    }

    function setupSliders() {
        const sizeSlider = document.getElementById('sizeSlider');
        const sizeOut = document.getElementById('sizeOut');
        if (sizeSlider && sizeOut) {
            sizeSlider.addEventListener('input', () => {
                sizeOut.textContent = sizeSlider.value;
                updateBrushInfo();
            });
            sizeOut.textContent = sizeSlider.value;
        }

        const opacitySlider = document.getElementById('opacitySlider');
        const opacityOut = document.getElementById('opacityOut');
        if (opacitySlider && opacityOut) {
            opacitySlider.addEventListener('input', () => {
                opacityOut.textContent = opacitySlider.value + '%';
            });
            opacityOut.textContent = opacitySlider.value + '%';
        }
    }

    function setupActionButtons() {
        // Очистка
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Очистить холст?')) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    saveState();
                }
            });
        }

        // Сохранение
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const link = document.createElement('a');
                link.download = `artflow-${Date.now()}.png`;
                link.href = canvas.toDataURL();
                link.click();
            });
        }

        // Undo
        const undoBtn = document.getElementById('undoBtn');
        if (undoBtn) undoBtn.addEventListener('click', undo);

        updateUndoRedoButtons();
    }

    function updateBrushInfo() {
        const brushInfo = document.getElementById('brushInfo');
        if (brushInfo) {
            if (isDrawingTool(state.currentTool)) {
                brushInfo.textContent = `📐 ${state.currentTool} | ${getBrushSize()}px`;
            } else if (state.currentTool === 'shape') {
                brushInfo.textContent = `🔷 ${state.currentShape} | ${getBrushSize()}px`;
            } else {
                brushInfo.textContent = `${state.currentBrush} | ${getBrushSize()}px`;
            }
        }
    }

    // === ЗАПУСК ПРИЛОЖЕНИЯ ===
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEverything);
    } else {
        initializeEverything();
    }

    // Глобальный интерфейс для отладки
    window.ArtFlow = {
        state: state,
        canvas: canvas,
        ctx: ctx,
        saveState: saveState,
        undo: undo
    };

    console.log('🚀 ArtFlow Pro - COMPLETE REWRITE LOADED!');
})();

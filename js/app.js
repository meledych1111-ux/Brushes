// js/app.js - ПОЛНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ
(() => {
    console.log('🔄 Starting ArtFlow Pro...');

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

    // Состояние приложения
    let painting = false;
    let lastX = 0, lastY = 0;
    let startX = 0, startY = 0;
    let currentTool = 'brush';
    let currentBrush = 'Круглая';
    let currentShape = 'circle';
    let history = [];
    let historyStep = 0;
    let isDrawingShape = false;
    let tempCanvas = document.createElement('canvas');
    let tempCtx = tempCanvas.getContext('2d');

    // Создаем базовые кисти сразу
    function createBasicBrushes() {
        console.log('🎨 Creating basic brushes...');
        
        window.BRUSHES = {
            'Круглая': (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            },
            'Квадратная': (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.fillStyle = color;
                ctx.fillRect(x - size, y - size, size * 2, size * 2);
                ctx.restore();
            },
            'Мягкая': (ctx, x, y, size, color, opacity) => {
                ctx.save();
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
                gradient.addColorStop(0, color);
                gradient.addColorStop(1, 'transparent');
                ctx.globalAlpha = opacity;
                ctx.fillStyle = gradient;
                ctx.fillRect(x - size, y - size, size * 2, size * 2);
                ctx.restore();
            },
            'Карандаш': (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.strokeStyle = color;
                ctx.lineWidth = Math.max(1, size / 3);
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                ctx.moveTo(x - 1, y);
                ctx.lineTo(x + 1, y);
                ctx.stroke();
                ctx.restore();
            },
            'Акварель': (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity * 0.7;
                ctx.fillStyle = color;
                
                for (let i = 0; i < 8; i++) {
                    const offsetX = (Math.random() - 0.5) * size * 0.8;
                    const offsetY = (Math.random() - 0.5) * size * 0.8;
                    const radius = size * (0.3 + Math.random() * 0.4);
                    
                    ctx.beginPath();
                    ctx.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            },
            'Щетина': (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.strokeStyle = color;
                ctx.lineWidth = Math.max(1, size / 4);
                ctx.lineCap = 'round';
                
                for (let i = 0; i < 5; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const length = size * (0.5 + Math.random() * 0.5);
                    const endX = x + Math.cos(angle) * length;
                    const endY = y + Math.sin(angle) * length;
                    
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                }
                ctx.restore();
            }
        };
        
        console.log('✅ Basic brushes created:', Object.keys(window.BRUSHES));
    }

    // Создаем инструменты для черчения фигур
    function createDrawingTools() {
        console.log('📐 Creating drawing tools...');
        
        window.DrawingTools = {
            // Линия
            'line': (ctx, startX, startY, endX, endY, color, opacity) => {
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
            },

            // Прямоугольник
            'rectangle': (ctx, startX, startY, endX, endY, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.strokeRect(startX, startY, endX - startX, endY - startY);
                ctx.restore();
            },

            // Залитый прямоугольник
            'rectangle_fill': (ctx, startX, startY, endX, endY, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.fillStyle = color;
                ctx.fillRect(startX, startY, endX - startX, endY - startY);
                ctx.restore();
            },

            // Круг
            'circle': (ctx, startX, startY, endX, endY, color, opacity) => {
                const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(startX, startY, radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            },

            // Залитый круг
            'circle_fill': (ctx, startX, startY, endX, endY, color, opacity) => {
                const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(startX, startY, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            },

            // Треугольник
            'triangle': (ctx, startX, startY, endX, endY, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.lineTo(startX * 2 - endX, endY);
                ctx.closePath();
                ctx.stroke();
                ctx.restore();
            },

            // Залитый треугольник
            'triangle_fill': (ctx, startX, startY, endX, endY, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.lineTo(startX * 2 - endX, endY);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            },

            // Градиент
            'gradient': (ctx, startX, startY, endX, endY, color, opacity) => {
                const secondaryColor = document.getElementById('secondaryColorPicker')?.value || '#ffffff';
                const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
                gradient.addColorStop(0, color);
                gradient.addColorStop(1, secondaryColor);
                
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.fillStyle = gradient;
                ctx.fillRect(Math.min(startX, endX), Math.min(startY, endY), 
                            Math.abs(endX - startX), Math.abs(endY - startY));
                ctx.restore();
            }
        };
        
        console.log('✅ Drawing tools created:', Object.keys(window.DrawingTools));
    }

    // Создаем базовые инструменты
    function createBasicTools() {
        console.log('🛠️ Creating basic tools...');
        
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

            // Размытие
            blur: (ctx, x, y, size, color, opacity) => {
                try {
                    const blurSize = Math.max(5, size);
                    const imgData = ctx.getImageData(x - blurSize, y - blurSize, blurSize * 2, blurSize * 2);
                    const data = imgData.data;
                    
                    for (let i = 4; i < data.length - 4; i += 4) {
                        data[i] = (data[i] + data[i - 4] + data[i + 4]) / 3;
                        data[i + 1] = (data[i + 1] + data[i - 3] + data[i + 5]) / 3;
                        data[i + 2] = (data[i + 2] + data[i - 2] + data[i + 6]) / 3;
                    }
                    
                    ctx.putImageData(imgData, x - blurSize, y - blurSize);
                } catch (e) {
                    console.log('Blur out of canvas bounds');
                }
            },

            // Смазка
            smudge: (ctx, x, y, size, color, opacity) => {
                try {
                    const smudgeSize = Math.max(8, size);
                    const imgData = ctx.getImageData(x - smudgeSize, y - smudgeSize, smudgeSize * 2, smudgeSize * 2);
                    ctx.putImageData(imgData, x - smudgeSize + 2, y - smudgeSize + 2);
                } catch (e) {
                    console.log('Smudge out of canvas bounds');
                }
            },

            // Заливка
            fill: (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity || 1;
                ctx.fillStyle = color;
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.restore();
            }
        };
        
        console.log('✅ Basic tools created:', Object.keys(window.Tools));
    }

    /* 1. Инициализация приложения */
    function init() {
        console.log('🎨 Initializing ArtFlow Pro...');
        
        // Сначала создаем базовые кисти и инструменты
        createBasicBrushes();
        createDrawingTools();
        createBasicTools();
        
        // Инициализируем временный canvas
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        
        // Затем настраиваем canvas
        setupCanvas();
        
        // Затем UI
        setupUI();
        
        // И только потом события
        setupEventListeners();
        
        // Сохраняем начальное состояние
        saveState();
        
        console.log('✅ ArtFlow Pro initialized successfully');
    }

    /* 2. Настройка Canvas */
    function setupCanvas() {
        console.log('📐 Setting up canvas...');
        
        const container = document.querySelector('.canvas-container');
        if (!container) {
            console.error('❌ Canvas container not found');
            return;
        }

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 600;

        console.log('📦 Canvas size:', width + 'x' + height);
        
        // Устанавливаем размеры
        canvas.width = width;
        canvas.height = height;
        tempCanvas.width = width;
        tempCanvas.height = height;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        // Очищаем и заливаем белым
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        tempCtx.fillStyle = '#FFFFFF';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        console.log('✅ Canvas setup completed');
    }

    /* 3. Обработчики событий */
    function setupEventListeners() {
        console.log('🎮 Setting up event listeners...');
        
        // Mouse events
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseUp);
        
        // Touch events для мобильных
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd);
        
        // Resize
        window.addEventListener('resize', handleResize);
        
        // Keyboard
        document.addEventListener('keydown', handleKeyDown);
        
        console.log('✅ Event listeners setup completed');
    }

    function handleMouseDown(e) {
        e.preventDefault();
        painting = true;
        
        const pos = getCanvasPosition(e);
        lastX = pos.x;
        lastY = pos.y;
        startX = pos.x;
        startY = pos.y;
        
        console.log('🖱️ Mouse down at:', pos.x, pos.y, 'Tool:', currentTool);
        
        if (isDrawingTool(currentTool)) {
            isDrawingShape = true;
            // Сохраняем текущее состояние для предпросмотра
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(canvas, 0, 0);
        } else if (currentTool === 'shape') {
            // Рисуем фигуру из FIGURES
            drawShape(pos.x, pos.y);
            painting = false;
            saveState();
        } else if (currentTool === 'fill') {
            // Заливка всего холста
            drawBrush(pos.x, pos.y);
            painting = false;
            saveState();
        } else {
            // Обычное рисование кистью
            drawBrush(pos.x, pos.y);
        }
    }

    function handleMouseMove(e) {
        if (!painting) return;
        e.preventDefault();
        
        const pos = getCanvasPosition(e);
        
        if (isDrawingTool(currentTool) && isDrawingShape) {
            // Предпросмотр фигуры
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(tempCanvas, 0, 0);
            drawPreviewShape(startX, startY, pos.x, pos.y);
        } else if (!isDrawingTool(currentTool) && currentTool !== 'shape' && currentTool !== 'fill') {
            // Обычное рисование
            drawLine(lastX, lastY, pos.x, pos.y);
            lastX = pos.x;
            lastY = pos.y;
        }
        
        // Обновляем координаты
        updateCoordinates(pos);
    }

    function handleMouseUp() {
        if (painting) {
            if (isDrawingTool(currentTool) && isDrawingShape) {
                // Завершаем рисование фигуры
                const endX = lastX;
                const endY = lastY;
                drawFinalShape(startX, startY, endX, endY);
                isDrawingShape = false;
            }
            
            painting = false;
            if (!isDrawingTool(currentTool) && currentTool !== 'shape' && currentTool !== 'fill') {
                saveState();
            }
            console.log('🖱️ Painting stopped');
        }
    }

    function handleTouchStart(e) {
        e.preventDefault();
        painting = true;
        
        const touch = e.touches[0];
        const pos = getCanvasPosition(touch);
        lastX = pos.x;
        lastY = pos.y;
        startX = pos.x;
        startY = pos.y;
        
        if (isDrawingTool(currentTool)) {
            isDrawingShape = true;
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(canvas, 0, 0);
        } else if (currentTool === 'shape') {
            drawShape(pos.x, pos.y);
            painting = false;
            saveState();
        } else if (currentTool === 'fill') {
            drawBrush(pos.x, pos.y);
            painting = false;
            saveState();
        } else {
            drawBrush(pos.x, pos.y);
        }
    }

    function handleTouchMove(e) {
        if (!painting) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const pos = getCanvasPosition(touch);
        
        if (isDrawingTool(currentTool) && isDrawingShape) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(tempCanvas, 0, 0);
            drawPreviewShape(startX, startY, pos.x, pos.y);
        } else if (!isDrawingTool(currentTool) && currentTool !== 'shape' && currentTool !== 'fill') {
            drawLine(lastX, lastY, pos.x, pos.y);
            lastX = pos.x;
            lastY = pos.y;
        }
        
        updateCoordinates(pos);
    }

    function handleTouchEnd() {
        if (painting) {
            if (isDrawingTool(currentTool) && isDrawingShape) {
                drawFinalShape(startX, startY, lastX, lastY);
                isDrawingShape = false;
            }
            
            painting = false;
            if (!isDrawingTool(currentTool) && currentTool !== 'shape' && currentTool !== 'fill') {
                saveState();
            }
        }
    }

    function handleResize() {
        setTimeout(() => {
            setupCanvas();
        }, 100);
    }

    function handleKeyDown(e) {
        // Ctrl+Z для отмены
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            undo();
        }
        // Ctrl+Y для повтора
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            redo();
        }
    }

    function updateCoordinates(pos) {
        const coordsEl = document.getElementById('coordinates');
        if (coordsEl) {
            coordsEl.textContent = `X: ${Math.round(pos.x)}, Y: ${Math.round(pos.y)}`;
        }
    }

    // Проверка, является ли инструмент инструментом для черчения фигур
    function isDrawingTool(tool) {
        const drawingTools = ['line', 'rectangle', 'rectangle_fill', 'circle', 'circle_fill', 'triangle', 'triangle_fill', 'gradient'];
        return drawingTools.includes(tool);
    }

    /* 4. Функции рисования */
    function drawLine(x1, y1, x2, y2) {
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

    function drawBrush(x, y) {
        const size = getBrushSize();
        const opacity = getBrushOpacity();
        const color = getCurrentColor();
        
        try {
            if (currentTool === 'brush') {
                if (window.BRUSHES && window.BRUSHES[currentBrush]) {
                    window.BRUSHES[currentBrush](ctx, x, y, size, color, opacity);
                } else {
                    drawFallbackBrush(x, y, size, color, opacity);
                }
            } else if (window.Tools && window.Tools[currentTool]) {
                window.Tools[currentTool](ctx, x, y, size, color, opacity);
            } else {
                drawFallbackBrush(x, y, size, color, opacity);
            }
        } catch (error) {
            console.error('❌ Error drawing:', error);
            drawFallbackBrush(x, y, size, color, opacity);
        }
    }

    // Рисование фигуры из FIGURES
    function drawShape(x, y) {
        const size = getBrushSize();
        const opacity = getBrushOpacity();
        const color = getCurrentColor();
        
        if (window.FIGURES && window.FIGURES[currentShape]) {
            window.FIGURES[currentShape](ctx, x, y, size, color, opacity);
        } else {
            console.warn('Фигура не найдена:', currentShape);
            drawFallbackBrush(x, y, size, color, opacity);
        }
    }

    // Предпросмотр фигуры
    function drawPreviewShape(startX, startY, endX, endY) {
        const color = getCurrentColor();
        const opacity = getBrushOpacity() * 0.7;
        
        if (window.DrawingTools && window.DrawingTools[currentTool]) {
            window.DrawingTools[currentTool](ctx, startX, startY, endX, endY, color, opacity);
        }
    }

    // Финальное рисование фигуры
    function drawFinalShape(startX, startY, endX, endY) {
        const color = getCurrentColor();
        const opacity = getBrushOpacity();
        
        if (window.DrawingTools && window.DrawingTools[currentTool]) {
            window.DrawingTools[currentTool](ctx, startX, startY, endX, endY, color, opacity);
        }
    }

    function drawFallbackBrush(x, y, size, color, opacity) {
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    /* 5. Вспомогательные функции */
    function getCanvasPosition(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
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

    /* 6. История действий */
    function saveState() {
        history.length = historyStep;
        history.push(canvas.toDataURL());
        if (history.length > 50) history.shift();
        historyStep = history.length;
        updateUndoRedoButtons();
    }

    function undo() {
        if (historyStep > 1) {
            historyStep--;
            restoreState();
            updateUndoRedoButtons();
        }
    }

    function redo() {
        if (historyStep < history.length) {
            historyStep++;
            restoreState();
            updateUndoRedoButtons();
        }
    }

    function restoreState() {
        if (historyStep > 0 && history[historyStep - 1]) {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = history[historyStep - 1];
        }
    }

    function updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        
        if (undoBtn) {
            undoBtn.disabled = historyStep <= 1;
            undoBtn.style.opacity = historyStep <= 1 ? '0.5' : '1';
        }
        
        if (redoBtn) {
            redoBtn.disabled = historyStep >= history.length;
            redoBtn.style.opacity = historyStep >= history.length ? '0.5' : '1';
        }
    }

    /* 7. Настройка интерфейса */
    function setupUI() {
        console.log('⚙️ Setting up UI...');
        
        setupBrushes();
        setupTools();
        setupDrawingTools();
        setupShapes();
        setupColorPresets();
        setupSliders();
        setupActionButtons();
        setupMobileUI();
        
        console.log('✅ UI setup completed');
    }

    function setupBrushes() {
        const brushSelect = document.getElementById('brushSelect');
        const brushCategory = document.getElementById('brushCategory');
        
        if (brushSelect) {
            // Загружаем кисти
            loadBrushes();
            
            // Обработчик категорий
            if (brushCategory) {
                brushCategory.addEventListener('change', (e) => {
                    updateBrushList(e.target.value);
                });
            }

            // Обработчик выбора кисти
            brushSelect.addEventListener('change', (e) => {
                currentBrush = e.target.value;
                console.log('🖌️ Selected brush:', currentBrush);
                updateBrushInfo();
            });
        }
    }

    function setupDrawingTools() {
        // Добавляем инструменты для черчения в выпадающий список
        const advancedToolSelect = document.getElementById('advancedToolSelect');
        if (advancedToolSelect) {
            const drawingTools = [
                {value: 'line', text: '📏 Линия'},
                {value: 'rectangle', text: '⬜ Прямоугольник'},
                {value: 'rectangle_fill', text: '🟦 Залитый прямоугольник'},
                {value: 'circle', text: '⭕ Круг'},
                {value: 'circle_fill', text: '🔵 Залитый круг'},
                {value: 'triangle', text: '🔺 Треугольник'},
                {value: 'triangle_fill', text: '🟩 Залитый треугольник'},
                {value: 'gradient', text: '🌈 Градиент'}
            ];

            drawingTools.forEach(tool => {
                const option = document.createElement('option');
                option.value = tool.value;
                option.textContent = tool.text;
                advancedToolSelect.appendChild(option);
            });

            // Обработчик выбора инструмента
            advancedToolSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    currentTool = e.target.value;
                    console.log('📐 Selected drawing tool:', currentTool);
                    updateBrushInfo();
                }
            });
        }
    }

    function setupShapes() {
        const shapeButtons = document.querySelectorAll('.shape-btn');
        shapeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                currentTool = 'shape';
                currentShape = this.dataset.shape;
                console.log('🔷 Selected shape:', currentShape);
                updateBrushInfo();
                
                // Активируем инструмент фигур
                const shapeTool = document.querySelector('[data-tool="shape"]');
                if (shapeTool) {
                    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                    shapeTool.classList.add('active');
                }
            });
        });

        // Штампы
        const stampSelect = document.getElementById('stampSelect');
        if (stampSelect) {
            stampSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    currentTool = 'shape';
                    currentShape = e.target.value;
                    console.log('🏷️ Selected stamp:', currentShape);
                    updateBrushInfo();
                    
                    const shapeTool = document.querySelector('[data-tool="shape"]');
                    if (shapeTool) {
                        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                        shapeTool.classList.add('active');
                    }
                }
            });
        }
    }

    function loadBrushes() {
        console.log('📥 Loading brushes...');
        
        if (window.BRUSHES && Object.keys(window.BRUSHES).length > 0) {
            console.log('✅ Brushes loaded:', Object.keys(window.BRUSHES));
            updateBrushList('all');
        } else {
            console.error('❌ No brushes available');
        }
    }

    function updateBrushList(category = 'all') {
        const brushSelect = document.getElementById('brushSelect');
        const brushCount = document.getElementById('brushCount');
        
        if (!brushSelect || !window.BRUSHES) return;

        const allBrushes = Object.keys(window.BRUSHES);

        // Очищаем и заполняем список
        brushSelect.innerHTML = '';
        allBrushes.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            brushSelect.appendChild(option);
        });

        // Устанавливаем текущую кисть
        if (allBrushes.length > 0) {
            currentBrush = allBrushes[0];
            brushSelect.value = currentBrush;
        }

        // Обновляем счетчик
        if (brushCount) {
            brushCount.textContent = `${allBrushes.length}+`;
        }

        updateBrushInfo();
    }

    function setupTools() {
        const toolButtons = document.querySelectorAll('.tool-btn, .mobile-tool-btn');
        if (toolButtons.length === 0) {
            console.error('❌ No tool buttons found');
            return;
        }

        toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                toolButtons.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                currentTool = e.currentTarget.dataset.tool;
                console.log('🔧 Selected tool:', currentTool);
                updateBrushInfo();
                
                // Закрываем мобильное меню если открыто
                const mobileModal = document.getElementById('mobileModal');
                if (mobileModal) {
                    mobileModal.style.display = 'none';
                }
            });
        });

        // Активируем первую кнопку
        if (toolButtons[0]) {
            toolButtons[0].classList.add('active');
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
                    console.log('🎨 Selected color:', color);
                }
            });
        });
    }

    function setupSliders() {
        // Размер кисти
        const sizeSlider = document.getElementById('sizeSlider');
        const sizeOut = document.getElementById('sizeOut');
        if (sizeSlider && sizeOut) {
            sizeSlider.addEventListener('input', () => {
                sizeOut.textContent = sizeSlider.value;
                updateBrushInfo();
            });
            sizeOut.textContent = sizeSlider.value;
        }

        // Прозрачность
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
        // Очистка холста
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Очистить весь холст?')) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    saveState();
                    console.log('✅ Canvas cleared');
                }
            });
        }

        // Сохранение
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const link = document.createElement('a');
                link.download = `artflow-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                console.log('💾 Image saved as PNG');
            });
        }

        // Экспорт
        const exportBtn = document.getElementById('exportBtn');
        const exportFormat = document.getElementById('exportFormat');
        if (exportBtn && exportFormat) {
            exportBtn.addEventListener('click', () => {
                const format = exportFormat.value || 'png';
                const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
                
                canvas.toBlob(blob => {
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `artflow-${Date.now()}.${format}`;
                    a.click();
                    URL.revokeObjectURL(a.href);
                    console.log(`📤 Exported as ${format.toUpperCase()}`);
                }, mimeType, 0.95);
            });
        }

        // Undo/Redo
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        if (undoBtn) undoBtn.addEventListener('click', undo);
        if (redoBtn) redoBtn.addEventListener('click', redo);

        // Новый слой
        const newLayerBtn = document.getElementById('newLayerBtn');
        if (newLayerBtn) {
            newLayerBtn.addEventListener('click', () => {
                if (window.Layers && window.Layers.createLayer) {
                    window.Layers.createLayer();
                } else {
                    console.log('📝 Creating simple layer');
                    alert('Слой создан! В полной версии доступна продвинутая система слоев.');
                }
            });
        }

        // Инициализация состояния кнопок
        updateUndoRedoButtons();
    }

    function setupMobileUI() {
        const mobileToggle = document.getElementById('mobileToggle');
        const mobileModal = document.getElementById('mobileModal');
        const mobileModalClose = document.getElementById('mobileModalClose');
        
        if (mobileToggle && mobileModal) {
            mobileToggle.addEventListener('click', () => {
                mobileModal.style.display = 'flex';
            });
        }
        
        if (mobileModalClose) {
            mobileModalClose.addEventListener('click', () => {
                mobileModal.style.display = 'none';
            });
        }
        
        // Закрытие модального окна при клике вне его
        if (mobileModal) {
            mobileModal.addEventListener('click', (e) => {
                if (e.target === mobileModal) {
                    mobileModal.style.display = 'none';
                }
            });
        }
    }

    function updateBrushInfo() {
        const brushInfo = document.getElementById('brushInfo');
        if (brushInfo) {
            if (isDrawingTool(currentTool)) {
                brushInfo.textContent = `📐 ${currentTool} | ${getBrushSize()}px`;
            } else if (currentTool === 'shape') {
                brushInfo.textContent = `🔷 ${currentShape} | ${getBrushSize()}px`;
            } else {
                brushInfo.textContent = `${currentBrush} | ${getBrushSize()}px`;
            }
        }
    }

    /* 8. Запуск приложения */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Глобальный интерфейс для отладки
    window.ArtFlow = {
        version: '1.0',
        testDrawing: () => {
            console.log('🎨 Testing drawing tools...');
            console.log('📐 Available drawing tools:', window.DrawingTools ? Object.keys(window.DrawingTools) : 'NONE');
            console.log('🖌️ Available brushes:', window.BRUSHES ? Object.keys(window.BRUSHES) : 'NONE');
            console.log('🔧 Available tools:', window.Tools ? Object.keys(window.Tools) : 'NONE');
            console.log('🔷 Available figures:', window.FIGURES ? Object.keys(window.FIGURES) : 'NONE');
        },
        clear: () => {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            saveState();
            console.log('✅ Canvas cleared');
        }
    };

    console.log('🚀 ArtFlow Pro loaded successfully');
})();

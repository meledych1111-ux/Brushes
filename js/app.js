// js/app.js - ПОЛНОСТЬЮ РАБОЧАЯ ВЕРСИЯ С ВСЕМИ МОДУЛЯМИ
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

    // === ИНИЦИАЛИЗАЦИЯ ВСЕХ МОДУЛЕЙ ===
    function initializeAllModules() {
        console.log('📦 Initializing all modules...');
        
        // Ждем загрузки всех модулей
        const modules = [
            'BRUSHES', 'FIGURES', 'Tools', 'ANIME_TOOLS', 
            'THREE_D_TOOLS', 'TEXTURES', 'Layers'
        ];
        
        let loadedModules = 0;
        const totalModules = modules.length;
        
        const checkModules = setInterval(() => {
            const loaded = modules.filter(module => window[module]).length;
            
            if (loaded === totalModules) {
                clearInterval(checkModules);
                console.log('✅ All modules loaded successfully');
                setupUI();
            } else if (loaded > loadedModules) {
                loadedModules = loaded;
                console.log(`📥 Loaded ${loaded}/${totalModules} modules`);
            }
        }, 100);
        
        // Таймаут на случай если модули не загрузятся
        setTimeout(() => {
            clearInterval(checkModules);
            if (loadedModules < totalModules) {
                console.warn(`⚠️ Some modules failed to load (${loadedModules}/${totalModules})`);
                setupUI(); // Все равно запускаем UI
            }
        }, 3000);
    }

    // === НАСТРОЙКА CANVAS ===
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

    // === ОБРАБОТЧИКИ СОБЫТИЙ ===
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

    function handleMouseUp(e) {
        if (painting) {
            const pos = getCanvasPosition(e);
            
            if (isDrawingTool(currentTool) && isDrawingShape) {
                // Завершаем рисование фигуры
                drawFinalShape(startX, startY, pos.x, pos.y);
                isDrawingShape = false;
                saveState();
            }
            
            painting = false;
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

    function handleTouchEnd(e) {
        if (painting) {
            const touch = e.changedTouches[0];
            const pos = getCanvasPosition(touch);
            
            if (isDrawingTool(currentTool) && isDrawingShape) {
                drawFinalShape(startX, startY, pos.x, pos.y);
                isDrawingShape = false;
                saveState();
            }
            
            painting = false;
        }
    }

    function handleResize() {
        setTimeout(() => {
            setupCanvas();
            if (window.Layers && window.Layers.resizeAll) {
                window.Layers.resizeAll();
            }
        }, 100);
    }

    function handleKeyDown(e) {
        // Ctrl+Z для отмены
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            undo();
        }
        // Ctrl+Y для повтора
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
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

    // === ФУНКЦИИ РИСОВАНИЯ ===
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
        
        // Получаем активный контекст (из слоев или основной)
        const ctxActive = (window.Layers && window.Layers.getActiveCtx()) || ctx;
        
        try {
            if (currentTool === 'brush') {
                if (window.BRUSHES && window.BRUSHES[currentBrush]) {
                    window.BRUSHES[currentBrush](ctxActive, x, y, size, color, opacity);
                } else {
                    drawFallbackBrush(ctxActive, x, y, size, color, opacity);
                }
            } else if (window.Tools && window.Tools[currentTool]) {
                window.Tools[currentTool](ctxActive, x, y, size, color, opacity);
            } else {
                drawFallbackBrush(ctxActive, x, y, size, color, opacity);
            }
        } catch (error) {
            console.error('❌ Error drawing:', error);
            drawFallbackBrush(ctxActive, x, y, size, color, opacity);
        }
    }

    function drawShape(x, y) {
        const size = getBrushSize();
        const opacity = getBrushOpacity();
        const color = getCurrentColor();
        const ctxActive = (window.Layers && window.Layers.getActiveCtx()) || ctx;
        
        if (window.FIGURES && window.FIGURES[currentShape]) {
            window.FIGURES[currentShape](ctxActive, x, y, size, color, opacity);
        } else {
            console.warn('Фигура не найдена:', currentShape);
            drawFallbackBrush(ctxActive, x, y, size, color, opacity);
        }
    }

    function drawPreviewShape(startX, startY, endX, endY) {
        const color = getCurrentColor();
        const opacity = getBrushOpacity();
        const ctxActive = (window.Layers && window.Layers.getActiveCtx()) || ctx;
        
        if (window.DrawingTools && window.DrawingTools[currentTool]) {
            window.DrawingTools[currentTool].preview(ctxActive, startX, startY, endX, endY, color, opacity);
        }
    }

    function drawFinalShape(startX, startY, endX, endY) {
        const color = getCurrentColor();
        const opacity = getBrushOpacity();
        const ctxActive = (window.Layers && window.Layers.getActiveCtx()) || ctx;
        
        if (window.DrawingTools && window.DrawingTools[currentTool]) {
            window.DrawingTools[currentTool].final(ctxActive, startX, startY, endX, endY, color, opacity);
        }
    }

    function drawFallbackBrush(ctxActive, x, y, size, color, opacity) {
        ctxActive.save();
        ctxActive.globalAlpha = opacity;
        ctxActive.fillStyle = color;
        ctxActive.beginPath();
        ctxActive.arc(x, y, size, 0, Math.PI * 2);
        ctxActive.fill();
        ctxActive.restore();
    }

    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
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

    function isDrawingTool(tool) {
        const drawingTools = ['line', 'rectangle', 'rectangle_fill', 'circle', 'circle_fill', 'triangle', 'triangle_fill', 'gradient'];
        return drawingTools.includes(tool);
    }

    // === ИСТОРИЯ ДЕЙСТВИЙ ===
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

    // === НАСТРОЙКА ИНСТРУМЕНТОВ ДЛЯ ЧЕРЧЕНИЯ ===
    function createDrawingTools() {
        console.log('📐 Creating drawing tools...');
        
        window.DrawingTools = {
            'line': {
                preview: (ctx, startX, startY, endX, endY, color, opacity) => {
                    ctx.save();
                    ctx.globalAlpha = opacity * 0.7;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                    ctx.restore();
                },
                final: (ctx, startX, startY, endX, endY, color, opacity) => {
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
            },
            'rectangle': {
                preview: (ctx, startX, startY, endX, endY, color, opacity) => {
                    ctx.save();
                    ctx.globalAlpha = opacity * 0.7;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 5]);
                    ctx.strokeRect(startX, startY, endX - startX, endY - startY);
                    ctx.restore();
                },
                final: (ctx, startX, startY, endX, endY, color, opacity) => {
                    ctx.save();
                    ctx.globalAlpha = opacity;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.strokeRect(startX, startY, endX - startX, endY - startY);
                    ctx.restore();
                }
            },
            'rectangle_fill': {
                preview: (ctx, startX, startY, endX, endY, color, opacity) => {
                    ctx.save();
                    ctx.globalAlpha = opacity * 0.5;
                    ctx.fillStyle = color;
                    ctx.fillRect(startX, startY, endX - startX, endY - startY);
                    ctx.restore();
                },
                final: (ctx, startX, startY, endX, endY, color, opacity) => {
                    ctx.save();
                    ctx.globalAlpha = opacity;
                    ctx.fillStyle = color;
                    ctx.fillRect(startX, startY, endX - startX, endY - startY);
                    ctx.restore();
                }
            },
            'circle': {
                preview: (ctx, startX, startY, endX, endY, color, opacity) => {
                    const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                    ctx.save();
                    ctx.globalAlpha = opacity * 0.7;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                },
                final: (ctx, startX, startY, endX, endY, color, opacity) => {
                    const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                    ctx.save();
                    ctx.globalAlpha = opacity;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }
            },
            'circle_fill': {
                preview: (ctx, startX, startY, endX, endY, color, opacity) => {
                    const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                    ctx.save();
                    ctx.globalAlpha = opacity * 0.5;
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                },
                final: (ctx, startX, startY, endX, endY, color, opacity) => {
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
        };
        
        console.log('✅ Drawing tools created');
    }

    // === НАСТРОЙКА UI ===
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
            // Сразу заполняем список кистей
            updateBrushList('all');
            
            if (brushCategory) {
                brushCategory.addEventListener('change', (e) => {
                    updateBrushList(e.target.value);
                });
            }

            brushSelect.addEventListener('change', (e) => {
                currentBrush = e.target.value;
                updateBrushInfo();
            });
        }
    }

    function updateBrushList(category = 'all') {
        const brushSelect = document.getElementById('brushSelect');
        const brushCount = document.getElementById('brushCount');
        
        if (!brushSelect || !window.BRUSHES) return;

        const allBrushes = Object.keys(window.BRUSHES);
        let filteredBrushes = allBrushes;

        // Фильтрация по категориям
        if (category !== 'all') {
            const categories = {
                'basic': allBrushes.filter(name => 
                    name.includes('Круглая') || name.includes('Квадратная') || 
                    name.includes('Карандаш') || name.includes('Щетина') ||
                    name.includes('Каллиграфия') || name.includes('Тушь') ||
                    name.includes('Контур') || name.includes('Мастихин')
                ),
                'paint': allBrushes.filter(name => 
                    name.includes('Акварель') || name.includes('Масло') || 
                    name.includes('Гуашь') || name.includes('Акрил') ||
                    name.includes('Пастель') || name.includes('Аэрограф') ||
                    name.includes('Темпера') || name.includes('Фреска')
                ),
                'texture': allBrushes.filter(name => 
                    name.includes('Холст') || name.includes('Бумага') || 
                    name.includes('Песок') || name.includes('Мрамор') ||
                    name.includes('Кора') || name.includes('Камень') ||
                    name.includes('Листва') || name.includes('Ткань')
                ),
                'anime': allBrushes.filter(name => 
                    name.includes('Аниме') || name.includes('Блик') ||
                    name.includes('Румянец') || name.includes('Свет')
                ),
                '3d': allBrushes.filter(name => 
                    name.includes('Металл') || name.includes('Стекло') || 
                    name.includes('Керамика') || name.includes('Пластик') ||
                    name.includes('Дерево') || name.includes('Кожа') ||
                    name.includes('Неон') || name.includes('Лёд')
                )
            };
            
            filteredBrushes = categories[category] || allBrushes;
        }

        // Заполняем список
        brushSelect.innerHTML = '';
        filteredBrushes.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            brushSelect.appendChild(option);
        });

        // Устанавливаем текущую кисть
        if (filteredBrushes.length > 0) {
            currentBrush = filteredBrushes[0];
            brushSelect.value = currentBrush;
        }

        // Обновляем счетчик
        if (brushCount) {
            brushCount.textContent = `${filteredBrushes.length}+`;
        }

        updateBrushInfo();
    }

    function setupDrawingTools() {
        const advancedToolSelect = document.getElementById('advancedToolSelect');
        if (advancedToolSelect) {
            const drawingTools = [
                {value: 'line', text: '📏 Линия'},
                {value: 'rectangle', text: '⬜ Прямоугольник'},
                {value: 'rectangle_fill', text: '🟦 Залитый прямоугольник'},
                {value: 'circle', text: '⭕ Круг'},
                {value: 'circle_fill', text: '🔵 Залитый круг'}
            ];

            drawingTools.forEach(tool => {
                const option = document.createElement('option');
                option.value = tool.value;
                option.textContent = tool.text;
                advancedToolSelect.appendChild(option);
            });

            advancedToolSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    currentTool = e.target.value;
                    updateBrushInfo();
                }
            });
        }
    }

    function setupTools() {
        const toolButtons = document.querySelectorAll('.tool-btn, .mobile-tool-btn');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                toolButtons.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                currentTool = e.currentTarget.dataset.tool;
                updateBrushInfo();
                
                const mobileModal = document.getElementById('mobileModal');
                if (mobileModal) mobileModal.style.display = 'none';
            });
        });

        if (toolButtons[0]) toolButtons[0].classList.add('active');
    }

    function setupShapes() {
        const shapeButtons = document.querySelectorAll('.shape-btn');
        shapeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                currentTool = 'shape';
                currentShape = this.dataset.shape;
                updateBrushInfo();
                
                const shapeTool = document.querySelector('[data-tool="shape"]');
                if (shapeTool) {
                    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                    shapeTool.classList.add('active');
                }
            });
        });

        const stampSelect = document.getElementById('stampSelect');
        if (stampSelect) {
            stampSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    currentTool = 'shape';
                    currentShape = e.target.value;
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
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Очистить весь холст?')) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    saveState();
                }
            });
        }

        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const link = document.createElement('a');
                link.download = `artflow-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }

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

        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        if (undoBtn) undoBtn.addEventListener('click', undo);
        if (redoBtn) redoBtn.addEventListener('click', redo);

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

    // === ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ===
    function init() {
        console.log('🎨 Initializing ArtFlow Pro...');
        
        // Создаем инструменты для черчения
        createDrawingTools();
        
        // Настраиваем canvas
        setupCanvas();
        
        // Инициализируем все модули
        initializeAllModules();
        
        // Настраиваем события
        setupEventListeners();
        
        // Сохраняем начальное состояние
        saveState();
        
        console.log('✅ ArtFlow Pro initialized successfully');
    }

    // === ЗАПУСК ПРИЛОЖЕНИЯ ===
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Глобальный интерфейс для других модулей
    window.App = {
        canvas,
        ctx,
        saveState,
        undo,
        redo,
        setupCanvas,
        getCurrentTool: () => currentTool,
        getCurrentBrush: () => currentBrush,
        getCurrentColor,
        getBrushSize,
        getBrushOpacity
    };

    console.log('🚀 ArtFlow Pro loaded successfully');
})();

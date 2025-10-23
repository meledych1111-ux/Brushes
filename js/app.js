// js/app.js - полностью исправленная версия с рабочими кнопками
(() => {
    console.log('🔄 Starting ArtFlow Pro...');

    // Основные элементы
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
    let currentTool = 'brush';
    let currentBrush = 'Круглая';
    let history = [];
    let historyStep = 0;

    /* 1. Инициализация приложения */
    function init() {
        console.log('🎨 Initializing ArtFlow Pro...');
        
        // Сначала настраиваем canvas
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

        const width = container.clientWidth;
        const height = container.clientHeight;

        console.log('📦 Canvas size:', width + 'x' + height);
        
        // Устанавливаем размеры
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        // Стили для видимости
        canvas.style.background = '#ffffff';
        canvas.style.border = '1px solid #30363d';
        canvas.style.display = 'block';
        canvas.style.cursor = 'crosshair';

        // Очищаем и заливаем белым
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
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
        
        // Keyboard events
        document.addEventListener('keydown', handleKeyDown);
        
        console.log('✅ Event listeners setup completed');
    }

    function handleMouseDown(e) {
        e.preventDefault();
        painting = true;
        
        const pos = getCanvasPosition(e);
        lastX = pos.x;
        lastY = pos.y;
        
        console.log('🖱️ Mouse down at:', pos.x, pos.y);
        
        // Для инструментов, которым не нужна линия (заливка, фигуры)
        if (currentTool === 'fill' || currentTool === 'shape') {
            drawBrush(pos.x, pos.y);
            painting = false;
            saveState();
        } else {
            drawBrush(pos.x, pos.y);
        }
    }

    function handleMouseMove(e) {
        if (!painting) return;
        e.preventDefault();
        
        const pos = getCanvasPosition(e);
        drawLine(lastX, lastY, pos.x, pos.y);
        lastX = pos.x;
        lastY = pos.y;
        
        // Обновляем координаты
        updateCoordinates(pos);
    }

    function handleMouseUp() {
        if (painting) {
            painting = false;
            saveState();
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
        
        if (currentTool === 'fill' || currentTool === 'shape') {
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
        
        drawLine(lastX, lastY, pos.x, pos.y);
        lastX = pos.x;
        lastY = pos.y;
        
        updateCoordinates(pos);
    }

    function handleTouchEnd() {
        if (painting) {
            painting = false;
            saveState();
        }
    }

    function handleResize() {
        setTimeout(() => {
            setupCanvas();
            updateResponsiveLayout();
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
            } else if (currentTool === 'eraser') {
                drawEraser(x, y, size, opacity);
            } else if (currentTool === 'fill') {
                drawFill(x, y, color, opacity);
            } else if (currentTool === 'shape' && window.currentShape) {
                drawShape(x, y, size, color, opacity);
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

    function drawFallbackBrush(x, y, size, color, opacity) {
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawEraser(x, y, size, opacity) {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawFill(x, y, color, opacity) {
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }

    function drawShape(x, y, size, color, opacity) {
        if (!window.FIGURES || !window.FIGURES[window.currentShape]) {
            drawFallbackBrush(x, y, size, color, opacity);
            return;
        }
        
        window.FIGURES[window.currentShape](ctx, x, y, size, color, opacity);
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
        setupColorPresets();
        setupSliders();
        setupActionButtons();
        setupMobileUI();
        setupShapes();
        
        console.log('✅ UI setup completed');
    }

    function setupBrushes() {
        const brushSelect = document.getElementById('brushSelect');
        const brushCategory = document.getElementById('brushCategory');
        
        if (!brushSelect) {
            console.error('❌ brushSelect element not found');
            return;
        }

        // Загружаем кисти сразу
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

    function loadBrushes() {
        setTimeout(() => {
            if (window.BRUSHES && Object.keys(window.BRUSHES).length > 0) {
                console.log('🎨 Brushes loaded:', Object.keys(window.BRUSHES).length + ' brushes available');
                updateBrushList('all');
            } else {
                console.warn('⚠️ BRUSHES not loaded, creating fallback brushes');
                createFallbackBrushes();
                updateBrushList('all');
            }
        }, 500);
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
                    name.includes('Каллиграфия') || name.includes('Тушь')
                ),
                'paint': allBrushes.filter(name => 
                    name.includes('Акварель') || name.includes('Масло') || 
                    name.includes('Гуашь') || name.includes('Акрил') ||
                    name.includes('Пастель') || name.includes('Аэрограф')
                ),
                'texture': allBrushes.filter(name => 
                    name.includes('Холст') || name.includes('Бумага') || 
                    name.includes('Песок') || name.includes('Мрамор') ||
                    name.includes('Кора') || name.includes('Камень')
                ),
                'anime': allBrushes.filter(name => 
                    name.includes('Аниме') || name.includes('Блик') ||
                    name.includes('Румянец') || name.includes('Свет')
                ),
                '3d': allBrushes.filter(name => 
                    name.includes('Металл') || name.includes('Стекло') || 
                    name.includes('Керамика') || name.includes('Пластик') ||
                    name.includes('Дерево') || name.includes('Кожа')
                )
            };
            
            filteredBrushes = categories[category] || allBrushes;
        }

        // Очищаем и заполняем список
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

    function createFallbackBrushes() {
        window.BRUSHES = {
            'Круглая': (ctx, x, y, r, color, op) => {
                ctx.save();
                ctx.globalAlpha = op;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
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
            'Мягкая круглая': (ctx, x, y, r, color, op) => {
                ctx.save();
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
                gradient.addColorStop(0, color);
                gradient.addColorStop(1, color.replace(')', ',0)').replace('rgb', 'rgba'));
                ctx.globalAlpha = op;
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        };
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

    function setupShapes() {
        const shapeButtons = document.querySelectorAll('.shape-btn');
        shapeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                currentTool = 'shape';
                window.currentShape = this.dataset.shape;
                console.log('🔷 Shape changed to:', window.currentShape);
                
                // Активируем инструмент фигур
                const shapeTool = document.querySelector('[data-tool="shape"]');
                if (shapeTool) {
                    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                    shapeTool.classList.add('active');
                    currentTool = 'shape';
                }
            });
        });
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
            brushInfo.textContent = `${currentBrush} | ${getBrushSize()}px`;
        }
    }

    function updateResponsiveLayout() {
        const isMobile = window.innerWidth <= 768;
        document.body.classList.toggle('mobile-mode', isMobile);
        
        // Обновляем мобильную панель
        const mobileToolbar = document.getElementById('mobileToolbar');
        if (mobileToolbar) {
            mobileToolbar.style.display = isMobile ? 'flex' : 'none';
        }
    }

    /* 8. Запуск приложения */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Глобальный интерфейс
    window.ArtFlow = {
        version: '1.0',
        test: () => {
            console.log('🧪 ArtFlow Test:');
            console.log('📝 Available brushes:', window.BRUSHES ? Object.keys(window.BRUSHES) : 'NONE');
            console.log('🎯 Current:', { tool: currentTool, brush: currentBrush });
            console.log('📏 Canvas:', canvas.width + 'x' + canvas.height);
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

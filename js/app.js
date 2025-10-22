// js/app.js - полностью обновленное ядро приложения
(() => {
    // Проверка загрузки всех модулей
    const requiredModules = ['BRUSHES', 'TOOLS', 'FIGURES', 'TEXTURES', 'ANIME_TOOLS', 'THREE_D_TOOLS'];
    const missingModules = requiredModules.filter(module => !window[module]);
    
    if (missingModules.length > 0) {
        console.error('Missing modules:', missingModules);
        return;
    }

    // Основные элементы
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    // Состояние приложения
    let painting = false;
    let lastX = 0, lastY = 0;
    let history = [];
    let historyStep = 0;
    let currentTool = 'brush';
    let currentBrush = 'Круглая';
    let isMobile = window.innerWidth <= 768;

    /* 1. Инициализация приложения */
    function init() {
        setupCanvas();
        setupEventListeners();
        setupUI();
        initializeLayers();
        updateCanvasInfo();
        
        console.log('ArtFlow Pro initialized successfully');
    }

    /* 2. Настройка Canvas */
    function setupCanvas() {
        resizeCanvas();
        setupGrid();
    }

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const toolbar = document.getElementById('toolbar');
        const mobileToolbar = document.getElementById('mobileToolbar');
        
        let toolbarHeight = 0;
        if (isMobile && mobileToolbar) {
            toolbarHeight = mobileToolbar.offsetHeight;
        } else if (toolbar) {
            toolbarHeight = toolbar.offsetHeight;
        }
        
        const w = window.innerWidth - (isMobile ? 0 : 380); // Ширина панели
        const h = Math.max(100, window.innerHeight - toolbarHeight);
        
        canvas.width = Math.max(1, Math.floor(w * dpr));
        canvas.height = Math.max(1, Math.floor(h * dpr));
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        
        if (window.Layers) {
            window.Layers.resizeAll();
        }
    }

    function setupGrid() {
        const grid = document.getElementById('canvasGrid');
        if (grid && document.getElementById('gridToggle')?.checked) {
            grid.classList.add('visible');
        }
    }

    /* 3. Обработчики событий */
    function setupEventListeners() {
        // События canvas
        canvas.addEventListener('pointerdown', handlePointerDown, { passive: false });
        canvas.addEventListener('pointermove', handlePointerMove, { passive: false });
        canvas.addEventListener('pointerup', handlePointerUp);
        canvas.addEventListener('pointerleave', handlePointerUp);
        canvas.addEventListener('pointercancel', handlePointerUp);

        // События окна
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleOrientationChange);

        // Горячие клавиши
        document.addEventListener('keydown', handleKeyDown);
    }

    function handlePointerDown(e) {
        e.preventDefault();
        painting = true;
        
        const pos = getCanvasPosition(e);
        lastX = pos.x;
        lastY = pos.y;
        
        const pressure = e.pressure > 0 ? e.pressure : 1;
        
        if (isShapeToolActive()) {
            handleShapeTool(pos.x, pos.y, pressure);
        } else if (isStampToolActive()) {
            handleStampTool(pos.x, pos.y, pressure);
        } else {
            drawBrush(pos.x, pos.y, pressure);
        }
        
        updateCanvasInfo('Рисование...');
    }

    function handlePointerMove(e) {
        if (!painting) {
            updateCursorPosition(e);
            return;
        }
        
        e.preventDefault();
        
        const pos = getCanvasPosition(e);
        const pressure = e.pressure > 0 ? e.pressure : 1;
        
        if (currentTool === 'brush' || currentTool === 'eraser') {
            drawLine(lastX, lastY, pos.x, pos.y, pressure);
        } else if (window.Tools && window.Tools[currentTool]) {
            window.Tools[currentTool](getActiveCtx(), lastX, lastY, pos.x, pos.y, getCurrentColor(), pressure);
        }
        
        lastX = pos.x;
        lastY = pos.y;
        
        updateCanvasInfo(`Рисование... X:${Math.round(pos.x)} Y:${Math.round(pos.y)}`);
    }

    function handlePointerUp() {
        if (painting) {
            painting = false;
            saveState();
            updateCanvasInfo('Готов к рисованию');
        }
    }

    function handleResize() {
        isMobile = window.innerWidth <= 768;
        resizeCanvas();
        updateCanvasInfo();
    }

    function handleOrientationChange() {
        setTimeout(() => {
            resizeCanvas();
            updateCanvasInfo();
        }, 100);
    }

    function handleKeyDown(e) {
        // Ctrl+Z - отмена
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        }
        // Ctrl+Y или Ctrl+Shift+Z - повтор
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
            e.preventDefault();
            redo();
        }
        // Пробел - временно переключиться на руку (панорамирование)
        if (e.key === ' ') {
            e.preventDefault();
            canvas.style.cursor = 'grab';
        }
    }

    /* 4. Функции рисования */
    function drawLine(x1, y1, x2, y2, pressure = 1) {
        const dx = x2 - x1, dy = y2 - y1;
        const distance = Math.hypot(dx, dy);
        const steps = Math.max(1, Math.ceil(distance / getSpacing()));
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = x1 + dx * t;
            const y = y1 + dy * t;
            drawBrush(x, y, pressure);
        }
    }

    function drawBrush(x, y, pressure = 1) {
        const size = getBrushSize() * pressure;
        const opacity = getBrushOpacity() * pressure;
        const color = getCurrentColor();
        const hardness = getBrushHardness();
        
        const activeCtx = getActiveCtx();
        if (!activeCtx) return;

        if (currentTool === 'brush') {
            if (window.BRUSHES[currentBrush]) {
                window.BRUSHES[currentBrush](activeCtx, x, y, size, color, opacity, hardness);
            }
        } else if (currentTool === 'eraser') {
            window.Tools.eraser(activeCtx, x, y, size, color, opacity);
        } else if (window.Tools && window.Tools[currentTool]) {
            window.Tools[currentTool](activeCtx, x, y, size, color, opacity);
        }
        
        if (window.Layers) {
            window.Layers.composeLayers();
        }
    }

    /* 5. Инструменты фигур и штампов */
    function isShapeToolActive() {
        return document.querySelector('.shape-btn.active') !== null;
    }

    function isStampToolActive() {
        const stampSelect = document.getElementById('stampSelect');
        return stampSelect && stampSelect.value !== '';
    }

    function handleShapeTool(x, y, pressure) {
        const activeShape = document.querySelector('.shape-btn.active')?.dataset.shape;
        const size = getBrushSize() * pressure;
        const color = getCurrentColor();
        const opacity = getBrushOpacity();
        
        if (activeShape && window.FIGURES[activeShape]) {
            window.FIGURES[activeShape](getActiveCtx(), x, y, size, color, opacity);
            if (window.Layers) window.Layers.composeLayers();
        }
    }

    function handleStampTool(x, y, pressure) {
        const stampSelect = document.getElementById('stampSelect');
        const stampType = stampSelect.value;
        const size = getBrushSize() * pressure;
        const color = getCurrentColor();
        const opacity = getBrushOpacity();
        
        if (stampType && window.applyStamp) {
            window.applyStamp(stampType, getActiveCtx(), x, y, size, color, opacity);
            if (window.Layers) window.Layers.composeLayers();
        }
    }

    /* 6. Вспомогательные функции */
    function getCanvasPosition(e) {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        return {
            x: (e.clientX - rect.left) * (canvas.width / rect.width / dpr),
            y: (e.clientY - rect.top) * (canvas.height / rect.height / dpr)
        };
    }

    function updateCursorPosition(e) {
        const pos = getCanvasPosition(e);
        const coordinates = document.getElementById('coordinates');
        if (coordinates) {
            coordinates.textContent = `X:${Math.round(pos.x)} Y:${Math.round(pos.y)}`;
        }
    }

    function getActiveCtx() {
        return window.Layers ? window.Layers.getActiveCtx() : ctx;
    }

    function getCurrentColor() {
        return document.getElementById('colorPicker')?.value || '#007aff';
    }

    function getBrushSize() {
        const slider = document.getElementById('sizeSlider');
        return slider ? parseInt(slider.value, 10) : 20;
    }

    function getBrushOpacity() {
        const slider = document.getElementById('opacitySlider');
        return slider ? parseInt(slider.value, 10) / 100 : 1;
    }

    function getBrushHardness() {
        const slider = document.getElementById('hardnessSlider');
        return slider ? parseInt(slider.value, 10) / 100 : 1;
    }

    function getSpacing() {
        const slider = document.getElementById('spacingSlider');
        const value = slider ? parseInt(slider.value, 10) : 25;
        return Math.max(1, 5 - (value / 25)); // Преобразуем в интервал между точками
    }

    /* 7. История действий */
    function saveState() {
        if (!canvas) return;
        
        try {
            history.length = historyStep;
            history.push(canvas.toDataURL());
            if (history.length > 50) history.shift(); // Увеличили историю до 50 шагов
            historyStep = history.length;
            
            updateUndoRedoButtons();
        } catch (e) {
            console.error('Error saving state:', e);
        }
    }

    function undo() {
        if (historyStep > 1) {
            historyStep--;
            restoreState();
        }
    }

    function redo() {
        if (historyStep < history.length) {
            historyStep++;
            restoreState();
        }
    }

    function restoreState() {
        if (historyStep > 0 && history[historyStep - 1]) {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.onerror = () => {
                console.error('Error loading history state');
            };
            img.src = history[historyStep - 1];
        }
        updateUndoRedoButtons();
    }

    function updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        if (undoBtn) undoBtn.disabled = historyStep <= 1;
        if (redoBtn) redoBtn.disabled = historyStep >= history.length;
    }

    /* 8. Обновление интерфейса */
    function updateCanvasInfo(message = '') {
        const info = document.getElementById('canvasInfo');
        if (!info) return;

        if (message) {
            info.textContent = message;
        } else {
            const brushInfo = document.getElementById('brushInfo');
            if (brushInfo) {
                brushInfo.textContent = `${currentBrush} | ${getBrushSize()}px`;
            }
        }
    }

    function setupUI() {
        setupBrushes();
        setupTools();
        setupShapes();
        setupColorPresets();
        setupMobileUI();
        setupSettings();
    }

    function setupBrushes() {
        const brushSelect = document.getElementById('brushSelect');
        const brushCategory = document.getElementById('brushCategory');
        
        if (brushSelect && window.BRUSHES) {
            updateBrushList('all');
            
            if (brushCategory) {
                brushCategory.addEventListener('change', (e) => {
                    updateBrushList(e.target.value);
                });
            }
            
            brushSelect.addEventListener('change', (e) => {
                currentBrush = e.target.value;
                updateCanvasInfo();
            });
        }
    }

    function updateBrushList(category) {
        const brushSelect = document.getElementById('brushSelect');
        if (!brushSelect) return;

        const allBrushes = Object.keys(window.BRUSHES);
        let filteredBrushes = allBrushes;

        if (category !== 'all') {
            // Группировка кистей по категориям (упрощенная версия)
            const categories = {
                'basic': allBrushes.slice(0, 15),
                'paint': allBrushes.slice(15, 30),
                'texture': allBrushes.slice(30, 40),
                'anime': allBrushes.slice(40, 50),
                '3d': allBrushes.slice(50, 60),
                'special': allBrushes.slice(60)
            };
            filteredBrushes = categories[category] || allBrushes;
        }

        brushSelect.innerHTML = '';
        filteredBrushes.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            brushSelect.appendChild(option);
        });

        // Обновляем счетчик кистей
        const brushCount = document.getElementById('brushCount');
        if (brushCount) {
            brushCount.textContent = `${filteredBrushes.length}+`;
        }
    }

    function setupTools() {
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Убираем активный класс у всех кнопок
                toolButtons.forEach(b => b.classList.remove('active'));
                // Добавляем активный класс текущей кнопке
                e.currentTarget.classList.add('active');
                
                currentTool = e.currentTarget.dataset.tool;
                updateCanvasInfo();
            });
        });

        // Настройка слайдеров
        setupSlider('sizeSlider', 'sizeOut');
        setupSlider('opacitySlider', 'opacityOut', '%');
        setupSlider('hardnessSlider', 'hardnessOut', '%');
        setupSlider('spacingSlider', 'spacingOut', '%');
    }

    function setupSlider(sliderId, outputId, suffix = '') {
        const slider = document.getElementById(sliderId);
        const output = document.getElementById(outputId);
        
        if (slider && output) {
            const updateOutput = () => {
                output.textContent = slider.value + suffix;
                updateCanvasInfo();
            };
            
            slider.addEventListener('input', updateOutput);
            updateOutput(); // Инициализация
        }
    }

    function setupShapes() {
        const shapeButtons = document.querySelectorAll('.shape-btn');
        shapeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Переключаем активное состояние
                shapeButtons.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
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
                    updateCanvasInfo();
                }
            });
        });
    }

    function setupMobileUI() {
        if (!isMobile) return;

        const mobileToggle = document.getElementById('mobileToggle');
        const mobileModal = document.getElementById('mobileModal');
        const mobileModalClose = document.getElementById('mobileModalClose');
        const panel = document.getElementById('toolbar');

        if (mobileToggle && panel) {
            mobileToggle.addEventListener('click', () => {
                panel.classList.toggle('show');
            });
        }

        if (mobileModal && mobileModalClose) {
            const mobileMenu = document.getElementById('mobileMenu');
            
            if (mobileMenu) {
                mobileMenu.addEventListener('click', () => {
                    mobileModal.classList.add('show');
                });
            }
            
            mobileModalClose.addEventListener('click', () => {
                mobileModal.classList.remove('show');
            });
            
            // Закрытие модального окна при клике вне его
            mobileModal.addEventListener('click', (e) => {
                if (e.target === mobileModal) {
                    mobileModal.classList.remove('show');
                }
            });
        }

        // Мобильные инструменты
        const mobileToolButtons = document.querySelectorAll('.mobile-tool-btn');
        mobileToolButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tool = btn.dataset.tool;
                currentTool = tool;
                
                // Закрываем модальное окно
                if (mobileModal) {
                    mobileModal.classList.remove('show');
                }
                
                updateCanvasInfo();
            });
        });
    }

    function setupSettings() {
        // Переключатель сетки
        const gridToggle = document.getElementById('gridToggle');
        const canvasGrid = document.getElementById('canvasGrid');
        
        if (gridToggle && canvasGrid) {
            gridToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    canvasGrid.classList.add('visible');
                } else {
                    canvasGrid.classList.remove('visible');
                }
            });
        }

        // Переключатель темы
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', (e) => {
                document.body.classList.toggle('light-theme', !e.target.checked);
            });
        }
    }

    function initializeLayers() {
        if (window.Layers) {
            // Слои уже инициализированы в layers.js
            return;
        }
        
        // Резервная инициализация если layers.js не загружен
        console.warn('Layers module not loaded, using basic context');
    }

    /* 9. Глобальный интерфейс */
    window.App = {
        canvas,
        ctx,
        getDpr: () => window.devicePixelRatio || 1,
        saveState,
        undo,
        redo,
        getCurrentTool: () => currentTool,
        getCurrentBrush: () => currentBrush
    };

    /* 10. Запуск приложения */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

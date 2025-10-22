// js/app.js - ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ ВЕРСИЯ
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
        
        // Временная замена для Layers если не загружены
        if (!window.Layers) {
            window.Layers = {
                getActiveCtx: () => ctx,
                composeLayers: () => {},
                resizeAll: () => {}
            };
        }
        
        setupCanvas();
        setupUI();
        setupEventListeners();
        
        console.log('✅ ArtFlow Pro initialized successfully');
    }

    /* 2. Настройка Canvas */
    function setupCanvas() {
        console.log('📐 Setting up canvas...');
        
        // Простые фиксированные размеры
        const container = document.querySelector('.canvas-container');
        let width = 800;
        let height = 600;
        
        if (container) {
            const rect = container.getBoundingClientRect();
            if (rect.width > 100 && rect.height > 100) {
                width = rect.width;
                height = rect.height;
            }
        }
        
        console.log('📦 Canvas size:', width + 'x' + height);
        
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.style.background = '#ffffff';
        canvas.style.border = '1px solid #30363d';
        canvas.style.display = 'block';
        canvas.style.cursor = 'crosshair';

        // Очищаем и заливаем белым
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Сохраняем начальное состояние
        saveState();
        
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
        
        console.log('✅ Event listeners setup completed');
    }

    function handleMouseDown(e) {
        e.preventDefault();
        painting = true;
        
        const pos = getCanvasPosition(e);
        lastX = pos.x;
        lastY = pos.y;
        
        // Для инструментов, которым нужны начальные координаты
        if (currentTool === 'gradient' || currentTool === 'lineTool') {
            // Сохраняем начальную точку, но не рисуем сразу
        } else {
            drawBrush(pos.x, pos.y);
        }
    }

    function handleMouseMove(e) {
        if (!painting) return;
        e.preventDefault();
        
        const pos = getCanvasPosition(e);
        
        if (currentTool === 'gradient' || currentTool === 'lineTool') {
            // Для этих инструментов рисуем линию от начальной точки
            drawLine(lastX, lastY, pos.x, pos.y);
        } else {
            drawLine(lastX, lastY, pos.x, pos.y);
            lastX = pos.x;
            lastY = pos.y;
        }
    }

    function handleMouseUp() {
        if (painting) {
            painting = false;
            saveState();
        }
    }

    function handleTouchStart(e) {
        e.preventDefault();
        painting = true;
        
        const touch = e.touches[0];
        const pos = getCanvasPosition(touch);
        lastX = pos.x;
        lastY = pos.y;
        
        drawBrush(pos.x, pos.y);
    }

    function handleTouchMove(e) {
        if (!painting) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const pos = getCanvasPosition(touch);
        
        drawLine(lastX, lastY, pos.x, pos.y);
        lastX = pos.x;
        lastY = pos.y;
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
        }, 100);
    }

    /* 4. Функции рисования */
    function drawLine(x1, y1, x2, y2) {
        if (currentTool === 'gradient') {
            // Для градиента рисуем один раз
            drawBrush(x1, y1, x2, y2);
            return;
        }
        
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

    function drawBrush(x, y, x2 = null, y2 = null) {
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
            } 
            else if (window.Tools && window.Tools[currentTool]) {
                // Для инструментов, которым нужны обе координаты
                if (x2 !== null && y2 !== null) {
                    window.Tools[currentTool](ctx, x, y, x2, y2, color, opacity);
                } else {
                    window.Tools[currentTool](ctx, x, y, size, color, opacity);
                }
            }
            else if (currentTool === 'eraser') {
                drawEraser(x, y, size, opacity);
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

    /* 5. Вспомогательные функции */
    function getCanvasPosition(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    function getCurrentColor() {
        const colorPicker = document.getElementById('colorPicker');
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
        try {
            history.length = historyStep;
            history.push(canvas.toDataURL());
            if (history.length > 30) history.shift();
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

    /* 7. Настройка интерфейса */
    function setupUI() {
        console.log('⚙️ Setting up UI...');
        
        setupBrushes();
        setupTools();
        setupColorPresets();
        setupActions();
        setupSliders();
        setupMobileUI();
        
        console.log('✅ UI setup completed');
    }

    function setupBrushes() {
        const brushSelect = document.getElementById('brushSelect');
        const brushCategory = document.getElementById('brushCategory');
        
        if (!brushSelect) {
            console.error('❌ brushSelect element not found');
            return;
        }

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
            updateBrushInfo();
        });
    }

    function loadBrushes() {
        setTimeout(() => {
            if (window.BRUSHES && Object.keys(window.BRUSHES).length > 0) {
                console.log('🎨 Brushes loaded:', Object.keys(window.BRUSHES).length + ' brushes');
                updateBrushList('all');
            } else {
                console.warn('⚠️ BRUSHES not loaded, creating fallback brushes');
                createFallbackBrushes();
                updateBrushList('all');
            }
        }, 100);
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
        const toolButtons = document.querySelectorAll('.tool-btn');
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
            });
        });

        // Активируем первую кнопку
        toolButtons[0].classList.add('active');
    }

    function setupColorPresets() {
        const presets = document.querySelectorAll('.color-preset');
        const colorPicker = document.getElementById('colorPicker');
        
        if (presets.length === 0) {
            console.warn('⚠️ No color presets found');
            return;
        }

        presets.forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.dataset.color;
                if (colorPicker && color) {
                    colorPicker.value = color;
                }
            });
        });
    }

    function setupActions() {
        // Кнопка Очистить
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                saveState();
                console.log('✅ Canvas cleared');
            });
        }

        // Кнопка Сохранить
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const link = document.createElement('a');
                link.download = `artflow-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                console.log('💾 Image saved');
            });
        }

        // Кнопки Отмена/Повтор
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
                    console.log('📝 Layers system not available');
                }
            });
        }
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
                updateBrushInfo();
            });
            opacityOut.textContent = opacitySlider.value + '%';
        }
    }

    function setupMobileUI() {
        const mobileToggle = document.getElementById('mobileToggle');
        const panel = document.getElementById('toolbar');

        if (mobileToggle && panel) {
            mobileToggle.addEventListener('click', () => {
                panel.classList.toggle('show');
            });
        }
    }

    function updateBrushInfo() {
        const brushInfo = document.getElementById('brushInfo');
        if (brushInfo) {
            if (currentTool === 'brush') {
                brushInfo.textContent = `${currentBrush} | ${getBrushSize()}px`;
            } else {
                brushInfo.textContent = `${currentTool} | ${getBrushSize()}px`;
            }
        }
    }

    /* 8. Запуск приложения */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Глобальный интерфейс
    window.App = {
        canvas,
        ctx,
        saveState,
        undo,
        redo,
        getCurrentTool: () => currentTool,
        getCurrentBrush: () => currentBrush
    };

    console.log('🚀 ArtFlow Pro loaded successfully');
})();

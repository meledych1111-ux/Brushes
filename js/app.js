// js/app.js - исправленное ядро приложения
(() => {
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
        console.log('Initializing ArtFlow Pro...');
        setupCanvas();
        setupEventListeners();
        setupUI();
        updateCanvasInfo();
        
        // Тестовый рисунок для проверки
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        console.log('ArtFlow Pro initialized successfully');
    }

    /* 2. Настройка Canvas */
    function setupCanvas() {
        resizeCanvas();
        
        // Заливаем белым фон
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const toolbar = document.getElementById('toolbar');
        
        let toolbarHeight = 0;
        let panelWidth = 0;
        
        if (isMobile) {
            const mobileToolbar = document.getElementById('mobileToolbar');
            toolbarHeight = mobileToolbar ? mobileToolbar.offsetHeight : 60;
        } else {
            toolbarHeight = toolbar ? toolbar.offsetHeight : 0;
            panelWidth = toolbar ? toolbar.offsetWidth : 380;
        }
        
        // Исправлено: правильный расчет размеров
        const w = window.innerWidth - panelWidth;
        const h = window.innerHeight - toolbarHeight;
        
        console.log(`Canvas size: ${w}x${h}, DPR: ${dpr}`);
        
        canvas.width = Math.max(1, Math.floor(w * dpr));
        canvas.height = Math.max(1, Math.floor(h * dpr));
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        
        // Перерисовываем белый фон
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
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
    }

    function handlePointerDown(e) {
        e.preventDefault();
        painting = true;
        
        const pos = getCanvasPosition(e);
        lastX = pos.x;
        lastY = pos.y;
        
        const pressure = e.pressure > 0 ? e.pressure : 1;
        drawBrush(pos.x, pos.y, pressure);
        
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
        
        drawLine(lastX, lastY, pos.x, pos.y, pressure);
        
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
        setTimeout(() => {
            resizeCanvas();
            updateCanvasInfo();
        }, 100);
    }

    function handleOrientationChange() {
        setTimeout(() => {
            resizeCanvas();
            updateCanvasInfo();
        }, 500);
    }

    /* 4. Функции рисования */
    function drawLine(x1, y1, x2, y2, pressure = 1) {
        const dx = x2 - x1, dy = y2 - y1;
        const distance = Math.hypot(dx, dy);
        const steps = Math.max(1, Math.ceil(distance / 2));
        
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
        
        console.log(`Drawing at ${x},${y} with brush: ${currentBrush}, size: ${size}, color: ${color}`);

        if (currentTool === 'brush') {
            if (window.BRUSHES && window.BRUSHES[currentBrush]) {
                window.BRUSHES[currentBrush](ctx, x, y, size, color, opacity);
            } else {
                // Резервная кисть если основная не найдена
                console.warn('Brush not found, using fallback');
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        } else if (currentTool === 'eraser') {
            // Ластик
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    /* 5. Вспомогательные функции */
    function getCanvasPosition(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    function updateCursorPosition(e) {
        const pos = getCanvasPosition(e);
        const coordinates = document.getElementById('coordinates');
        if (coordinates) {
            coordinates.textContent = `X:${Math.round(pos.x)} Y:${Math.round(pos.y)}`;
        }
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

    /* 6. История действий */
    function saveState() {
        if (!canvas) return;
        
        try {
            history.length = historyStep;
            history.push(canvas.toDataURL());
            if (history.length > 50) history.shift();
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

    /* 7. Обновление интерфейса */
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
        setupColorPresets();
        setupMobileUI();
        
        console.log('UI setup completed');
    }

    function setupBrushes() {
        const brushSelect = document.getElementById('brushSelect');
        const brushCategory = document.getElementById('brushCategory');
        
        if (brushSelect) {
            // Ждем загрузки кистей
            setTimeout(() => {
                if (window.BRUSHES) {
                    updateBrushList('all');
                } else {
                    console.error('BRUSHES not loaded');
                    // Создаем базовые кисти на случай ошибки
                    createFallbackBrushes();
                    updateBrushList('all');
                }
            }, 100);
            
            if (brushCategory) {
                brushCategory.addEventListener('change', (e) => {
                    updateBrushList(e.target.value);
                });
            }
            
            brushSelect.addEventListener('change', (e) => {
                currentBrush = e.target.value;
                console.log('Selected brush:', currentBrush);
                updateCanvasInfo();
            });
        }
    }

    function updateBrushList(category) {
        const brushSelect = document.getElementById('brushSelect');
        if (!brushSelect) return;

        let brushes = [];
        
        if (window.BRUSHES) {
            const allBrushes = Object.keys(window.BRUSHES);
            
            if (category === 'all') {
                brushes = allBrushes;
            } else {
                // Простая группировка для тестирования
                brushes = allBrushes.filter(name => {
                    if (category === 'basic') return name.includes('Круглая') || name.includes('Квадратная') || name.includes('Карандаш');
                    if (category === 'paint') return name.includes('Акварель') || name.includes('Масло') || name.includes('Гуашь');
                    if (category === 'texture') return name.includes('Холст') || name.includes('Бумага') || name.includes('Ткань');
                    return true;
                });
            }
        } else {
            // Fallback кисти
            brushes = ['Круглая', 'Квадратная', 'Мягкая круглая', 'Карандаш'];
        }

        brushSelect.innerHTML = '';
        brushes.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            brushSelect.appendChild(option);
        });

        // Устанавливаем первую кисть
        if (brushes.length > 0) {
            currentBrush = brushes[0];
            brushSelect.value = currentBrush;
        }

        // Обновляем счетчик
        const brushCount = document.getElementById('brushCount');
        if (brushCount) {
            brushCount.textContent = `${brushes.length}+`;
        }
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
            },
            'Карандаш': (ctx, x, y, r, color, op) => {
                ctx.save();
                ctx.globalAlpha = op;
                ctx.strokeStyle = color;
                ctx.lineWidth = Math.max(1, r / 3);
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(x - 1, y);
                ctx.lineTo(x + 1, y);
                ctx.stroke();
                ctx.restore();
            }
        };
    }

    function setupTools() {
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                toolButtons.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                currentTool = e.currentTarget.dataset.tool;
                console.log('Selected tool:', currentTool);
                updateCanvasInfo();
            });
        });

        // Настройка слайдеров
        setupSlider('sizeSlider', 'sizeOut');
        setupSlider('opacitySlider', 'opacityOut', '%');
        
        // Активируем первую кнопку
        if (toolButtons.length > 0) {
            toolButtons[0].classList.add('active');
        }
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
            updateOutput();
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
                    updateCanvasInfo();
                }
            });
        });
    }

    function setupMobileUI() {
        if (!isMobile) return;

        const mobileToggle = document.getElementById('mobileToggle');
        const panel = document.getElementById('toolbar');

        if (mobileToggle && panel) {
            mobileToggle.addEventListener('click', () => {
                panel.classList.toggle('show');
            });
        }
    }

    /* 8. Глобальный интерфейс */
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

    /* 9. Запуск приложения */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

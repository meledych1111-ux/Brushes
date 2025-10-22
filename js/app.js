// js/app.js – основное ядро приложения
(() => {
    // Проверка зависимостей
    if (!window.BRUSHES) {
        console.error('BRUSHES not loaded');
        return;
    }

    const canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const ctx = canvas.getContext('2d');
    let painting = false;
    let lastX = 0, lastY = 0;
    let history = [];
    let historyStep = 0;

    /* 1. Утилиты */
    const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

    /* 2. Hi-DPI + размеры */
    function resize() {
        const dpr = window.devicePixelRatio || 1;
        const toolbar = document.getElementById('toolbar');
        const toolbarHeight = toolbar ? toolbar.offsetHeight : 0;
        const w = window.innerWidth;
        const h = Math.max(100, window.innerHeight - toolbarHeight);
        
        canvas.width = Math.max(1, Math.floor(w * dpr));
        canvas.height = Math.max(1, Math.floor(h * dpr));
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        
        if (window.Layers) window.Layers.resizeAll();
        updateCanvasInfo();
    }

    /* 3. Плавная линия с интерполяцией */
    window.drawLine = (x1, y1, x2, y2, pressure = 1) => {
        const dx = x2 - x1, dy = y2 - y1;
        const distance = dist(x1, y1, x2, y2);
        const steps = Math.max(1, Math.ceil(distance / 2));
        
        const baseSize = parseInt(sizeSlider.value, 10);
        const baseOpacity = parseInt(opacitySlider.value, 10) / 100;
        const size = Math.max(1, baseSize * pressure);
        const opacity = Math.max(0.05, baseOpacity * pressure);
        const color = colorPicker.value;
        const tool = toolSelect.value;
        
        const activeCtx = window.Layers ? window.Layers.getActiveCtx() : ctx;

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = x1 + dx * t;
            const y = y1 + dy * t;
            
            if (tool === 'brush') {
                const brushName = brushSelect.value;
                if (window.BRUSHES[brushName]) {
                    window.BRUSHES[brushName](activeCtx, x, y, size, color, opacity);
                }
            } else if (window.Tools && window.Tools[tool]) {
                window.Tools[tool](activeCtx, x, y, size, color, opacity);
            }
        }
        
        if (window.Layers) window.Layers.composeLayers();
    };

    /* 4. Одиночное нажатие */
    window.drawBrush = (x, y, pressure = 1) => {
        const baseSize = parseInt(sizeSlider.value, 10);
        const baseOpacity = parseInt(opacitySlider.value, 10) / 100;
        const size = Math.max(1, baseSize * pressure);
        const opacity = Math.max(0.05, baseOpacity * pressure);
        const color = colorPicker.value;
        const tool = toolSelect.value;
        
        const activeCtx = window.Layers ? window.Layers.getActiveCtx() : ctx;

        if (tool === 'brush') {
            const brushName = brushSelect.value;
            if (window.BRUSHES[brushName]) {
                window.BRUSHES[brushName](activeCtx, x, y, size, color, opacity);
            }
        } else if (window.Tools && window.Tools[tool]) {
            window.Tools[tool](activeCtx, x, y, size, color, opacity);
        }
        
        if (window.Layers) window.Layers.composeLayers();
    };

    /* 5. Pointer Events */
    function getCanvasPosition(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    function handlePointerDown(e) {
        e.preventDefault();
        painting = true;
        const pos = getCanvasPosition(e);
        lastX = pos.x;
        lastY = pos.y;
        
        const pressure = e.pressure || 1;
        window.drawBrush(pos.x, pos.y, pressure);
        updateCanvasInfo('Рисование...');
    }

    function handlePointerMove(e) {
        if (!painting) return;
        e.preventDefault();
        
        const pos = getCanvasPosition(e);
        const pressure = e.pressure || 1;
        
        window.drawLine(lastX, lastY, pos.x, pos.y, pressure);
        
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

    // Назначение событий
    canvas.addEventListener('pointerdown', handlePointerDown, { passive: false });
    canvas.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);

    /* 6. Элементы управления */
    const colorPicker = document.getElementById('colorPicker');
    const sizeSlider = document.getElementById('sizeSlider');
    const sizeOut = document.getElementById('sizeOut');
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityOut = document.getElementById('opacityOut');
    const brushSelect = document.getElementById('brushSelect');
    const toolSelect = document.getElementById('toolSelect');
    const clearBtn = document.getElementById('clearBtn');
    const saveBtn = document.getElementById('saveBtn');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');

    // Заполнение списка кистей
    function populateBrushes() {
        if (!brushSelect) return;
        
        brushSelect.innerHTML = '';
        Object.keys(window.BRUSHES).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            brushSelect.appendChild(option);
        });
        brushSelect.value = 'Круглая';
    }

    // Обновление информации на холсте
    function updateCanvasInfo(message = '') {
        const info = document.getElementById('canvasInfo');
        if (info) {
            if (message) {
                info.textContent = message;
            } else {
                const brush = brushSelect.value;
                const size = sizeSlider.value;
                info.textContent = `${brush} | Размер: ${size}px`;
            }
        }
    }

    // Обновление выводов слайдеров
    function updateSliderOutputs() {
        if (sizeOut) sizeOut.textContent = sizeSlider.value;
        if (opacityOut) opacityOut.textContent = opacitySlider.value + '%';
    }

    /* 7. История действий */
    function saveState() {
        if (!canvas) return;
        
        history.length = historyStep;
        history.push(canvas.toDataURL());
        if (history.length > 30) history.shift();
        historyStep = history.length;
        
        updateUndoRedoButtons();
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
        if (undoBtn) undoBtn.disabled = historyStep <= 1;
        if (redoBtn) redoBtn.disabled = historyStep >= history.length;
    }

    /* 8. Инициализация */
    function init() {
        // Заполнение кистей
        populateBrushes();
        
        // События слайдеров
        if (sizeSlider && sizeOut) {
            sizeSlider.addEventListener('input', () => {
                updateSliderOutputs();
                updateCanvasInfo();
            });
        }
        
        if (opacitySlider && opacityOut) {
            opacitySlider.addEventListener('input', updateSliderOutputs);
        }
        
        if (colorPicker) {
            colorPicker.addEventListener('input', updateCanvasInfo);
        }
        
        if (brushSelect) {
            brushSelect.addEventListener('change', updateCanvasInfo);
        }
        
        if (toolSelect) {
            toolSelect.addEventListener('change', updateCanvasInfo);
        }

        // Кнопки действий
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                const activeCtx = window.Layers ? window.Layers.getActiveCtx() : ctx;
                const dpr = window.devicePixelRatio || 1;
                const w = canvas.width / dpr;
                const h = canvas.height / dpr;
                activeCtx.clearRect(0, 0, w, h);
                if (window.Layers) window.Layers.composeLayers();
                saveState();
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                if (window.Layers) window.Layers.composeLayers();
                
                if (navigator.share && canvas.toBlob) {
                    canvas.toBlob(blob => {
                        const file = new File([blob], "artwork.png", { type: "image/png" });
                        navigator.share({ 
                            files: [file], 
                            title: "Мой рисунок ArtFlow" 
                        }).catch(() => {
                            downloadCanvas();
                        });
                    });
                } else {
                    downloadCanvas();
                }
            });
        }

        if (undoBtn) undoBtn.addEventListener('click', undo);
        if (redoBtn) redoBtn.addEventListener('click', redo);

        function downloadCanvas() {
            const link = document.createElement('a');
            link.download = `artflow_${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }

        // Инициализация размеров
        resize();
        saveState();
        updateSliderOutputs();
        updateCanvasInfo();
    }

    // Глобальные функции
    window.App = {
        canvas,
        ctx,
        getDpr: () => window.devicePixelRatio || 1,
        saveState,
        undo,
        redo
    };

    // Запуск при загрузке
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('resize', resize);
})();

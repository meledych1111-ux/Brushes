// js/layers.js - расширенная система слоев с исправлениями
(() => {
    const layers = [];
    let activeIndex = 0;
    let layerIdCounter = 1;

    // Получение размеров холста
    function getCanvasDimensions() {
        const dpr = window.devicePixelRatio || 1;
        let toolbarHeight = 0;
        
        if (window.innerWidth <= 768) {
            const mobileToolbar = document.getElementById('mobileToolbar');
            toolbarHeight = mobileToolbar ? mobileToolbar.offsetHeight : 60;
        } else {
            const toolbar = document.getElementById('toolbar');
            toolbarHeight = toolbar ? toolbar.offsetHeight : 0;
        }
        
        const w = window.innerWidth - (window.innerWidth <= 768 ? 0 : 380);
        const h = Math.max(100, window.innerHeight - toolbarHeight);
        return { w, h, dpr };
    }

    // Создание нового слоя
    function createLayer(name = `Слой ${layerIdCounter}`, isBackground = false) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        resizeLayer(canvas);
        
        const layer = {
            id: layerIdCounter++,
            name,
            canvas,
            ctx,
            opacity: 1,
            visible: true,
            blendMode: 'normal',
            locked: false,
            isBackground: isBackground
        };
        
        layers.push(layer);
        activeIndex = layers.length - 1;
        
        // Если это фоновый слой, заливаем белым
        if (isBackground) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        composeLayers();
        updateLayerUI();
        
        return layer;
    }

    // Изменение размера слоя
    function resizeLayer(canvas) {
        const { w, h, dpr } = getCanvasDimensions();
        
        canvas.width = Math.max(1, Math.floor(w * dpr));
        canvas.height = Math.max(1, Math.floor(h * dpr));
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        
        const ctx = canvas.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
    }

    // Изменение размера всех слоев
    function resizeAll() {
        layers.forEach(layer => resizeLayer(layer.canvas));
        composeLayers();
    }

    // Установка прозрачности слоя
    function setOpacity(index, value) {
        if (layers[index] && !layers[index].locked) {
            layers[index].opacity = Math.max(0, Math.min(1, value / 100));
            composeLayers();
        }
    }

    // Установка режима смешивания
    function setBlendMode(index, mode) {
        if (layers[index] && !layers[index].locked) {
            layers[index].blendMode = mode;
            composeLayers();
        }
    }

    // Установка активного слоя
    function setActive(index) {
        if (index >= 0 && index < layers.length && !layers[index].locked) {
            activeIndex = index;
            updateLayerUI();
        }
    }

    // Переключение видимости слоя
    function toggleVisibility(index) {
        if (layers[index]) {
            layers[index].visible = !layers[index].visible;
            composeLayers();
            updateLayerUI();
        }
    }

    // Блокировка/разблокировка слоя
    function toggleLock(index) {
        if (layers[index]) {
            layers[index].locked = !layers[index].locked;
            updateLayerUI();
        }
    }

    // Получение контекста активного слоя
    function getActiveCtx() {
        if (layers[activeIndex] && !layers[activeIndex].locked) {
            return layers[activeIndex].ctx;
        }
        
        // Ищем первый незаблокированный слой
        for (let i = 0; i < layers.length; i++) {
            if (!layers[i].locked) {
                activeIndex = i;
                return layers[i].ctx;
            }
        }
        
        // Если все слои заблокированы, возвращаем основной контекст
        return window.App ? window.App.ctx : null;
    }

    // Объединение слоев
    function composeLayers() {
        const baseCtx = window.App?.ctx;
        const baseCanvas = window.App?.canvas;
        
        if (!baseCtx || !baseCanvas) {
            console.warn('Base canvas not available for composition');
            return;
        }
        
        const dpr = window.devicePixelRatio || 1;
        const w = baseCanvas.width / dpr;
        const h = baseCanvas.height / dpr;
        
        // Очищаем основной холст
        baseCtx.clearRect(0, 0, w, h);
        
        // Отрисовываем все видимые слои
        layers.forEach(layer => {
            if (layer.visible && layer.opacity > 0) {
                baseCtx.save();
                
                // Применяем режим смешивания
                baseCtx.globalCompositeOperation = layer.blendMode;
                baseCtx.globalAlpha = layer.opacity;
                
                baseCtx.drawImage(layer.canvas, 0, 0, w, h);
                baseCtx.restore();
            }
        });
    }

    // Обновление интерфейса слоев
    function updateLayerUI() {
        const layersList = document.getElementById('layersList');
        const layerSelect = document.getElementById('layerSelect');
        const layerOpacity = document.getElementById('layerOpacity');
        const layerOpacityOut = document.getElementById('layerOpacityOut');
        const blendMode = document.getElementById('blendMode');
        
        // Обновляем список слоев
        if (layersList) {
            layersList.innerHTML = '';
            
            layers.forEach((layer, index) => {
                const layerItem = createLayerElement(layer, index);
                layersList.appendChild(layerItem);
            });
        }
        
        // Обновляем выпадающий список
        if (layerSelect) {
            layerSelect.innerHTML = '';
            layers.forEach((layer, index) => {
                const option = document.createElement('option');
                option.value = String(index);
                option.textContent = `${layer.name} ${layer.locked ? '🔒' : ''} ${index === activeIndex ? '(активный)' : ''}`;
                if (index === activeIndex) option.selected = true;
                layerSelect.appendChild(option);
            });
        }
        
        // Обновляем слайдер прозрачности
        if (layerOpacity && layerOpacityOut && layers[activeIndex]) {
            const opacityValue = Math.round(layers[activeIndex].opacity * 100);
            layerOpacity.value = opacityValue;
            layerOpacityOut.textContent = opacityValue + '%';
            
            // Блокируем если слой заблокирован
            layerOpacity.disabled = layers[activeIndex].locked;
        }
        
        // Обновляем режим смешивания
        if (blendMode && layers[activeIndex]) {
            blendMode.value = layers[activeIndex].blendMode;
            blendMode.disabled = layers[activeIndex].locked;
        }
    }

    // Создание элемента слоя для UI
    function createLayerElement(layer, index) {
        const layerItem = document.createElement('div');
        layerItem.className = `layer-item ${index === activeIndex ? 'active' : ''} ${layer.locked ? 'locked' : ''}`;
        
        layerItem.innerHTML = `
            <div class="layer-preview">
                <canvas width="40" height="40"></canvas>
            </div>
            <div class="layer-info">
                <span class="layer-name">${layer.name}</span>
                <span class="layer-status">
                    ${layer.locked ? '🔒' : ''}
                    ${!layer.visible ? '👁️‍🗨️' : ''}
                </span>
            </div>
            <div class="layer-controls">
                <button class="layer-visibility" title="${layer.visible ? 'Скрыть' : 'Показать'}">
                    ${layer.visible ? '👁️' : '👁️‍🗨️'}
                </button>
                <button class="layer-lock" title="${layer.locked ? 'Разблокировать' : 'Заблокировать'}">
                    ${layer.locked ? '🔓' : '🔒'}
                </button>
            </div>
        `;
        
        // Обновляем превью
        updateLayerPreview(layer, layerItem);
        
        // Обработчики событий
        layerItem.addEventListener('click', (e) => {
            if (!e.target.closest('.layer-controls')) {
                setActive(index);
            }
        });
        
        const visibilityBtn = layerItem.querySelector('.layer-visibility');
        const lockBtn = layerItem.querySelector('.layer-lock');
        
        visibilityBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleVisibility(index);
        });
        
        lockBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLock(index);
        });
        
        return layerItem;
    }

    // Обновление превью слоя
    function updateLayerPreview(layer, layerItem) {
        const previewCanvas = layerItem.querySelector('.layer-preview canvas');
        const previewCtx = previewCanvas.getContext('2d');
        
        // Очищаем превью
        previewCtx.clearRect(0, 0, 40, 40);
        
        // Рисуем шаблон прозрачности
        previewCtx.fillStyle = '#FFFFFF';
        previewCtx.fillRect(0, 0, 40, 40);
        
        // Шахматный узор для прозрачности
        previewCtx.fillStyle = '#CCCCCC';
        for (let y = 0; y < 40; y += 10) {
            for (let x = (y / 10) % 2 ? 0 : 10; x < 40; x += 20) {
                previewCtx.fillRect(x, y, 10, 10);
            }
        }
        
        // Масштабируем и рисуем содержимое слоя
        const scale = 40 / Math.max(layer.canvas.width, layer.canvas.height);
        const scaledWidth = layer.canvas.width * scale;
        const scaledHeight = layer.canvas.height * scale;
        const offsetX = (40 - scaledWidth) / 2;
        const offsetY = (40 - scaledHeight) / 2;
        
        previewCtx.drawImage(
            layer.canvas,
            0, 0, layer.canvas.width, layer.canvas.height,
            offsetX, offsetY, scaledWidth, scaledHeight
        );
        
        // Если слой невидим, добавляем затемнение
        if (!layer.visible) {
            previewCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            previewCtx.fillRect(0, 0, 40, 40);
        }
        
        // Если слой заблокирован, добавляем значок
        if (layer.locked) {
            previewCtx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            previewCtx.fillRect(0, 0, 40, 40);
        }
    }

    // Удаление слоя
    function deleteLayer(index) {
        if (layers.length <= 1) {
            alert('Нельзя удалить последний слой');
            return false;
        }
        
        if (index < 0 || index >= layers.length) return false;
        
        // Нельзя удалить заблокированный слой
        if (layers[index].locked) {
            alert('Нельзя удалить заблокированный слой');
            return false;
        }
        
        layers.splice(index, 1);
        if (activeIndex >= layers.length) {
            activeIndex = Math.max(0, layers.length - 1);
        }
        composeLayers();
        updateLayerUI();
        return true;
    }

    // Объединение слоев
    function mergeLayers(fromIndex, toIndex = null) {
        if (layers.length < 2) {
            alert('Недостаточно слоев для объединения');
            return false;
        }
        
        const targetIndex = toIndex !== null ? toIndex : activeIndex;
        
        if (targetIndex < 0 || targetIndex >= layers.length) return false;
        if (fromIndex < 0 || fromIndex >= layers.length) return false;
        if (fromIndex === targetIndex) return false;
        
        // Нельзя объединять заблокированные слои
        if (layers[fromIndex].locked || layers[targetIndex].locked) {
            alert('Нельзя объединять заблокированные слои');
            return false;
        }
        
        const targetLayer = layers[targetIndex];
        const sourceLayer = layers[fromIndex];
        
        // Рисуем исходный слой на целевом
        targetLayer.ctx.save();
        targetLayer.ctx.globalCompositeOperation = sourceLayer.blendMode;
        targetLayer.ctx.globalAlpha = sourceLayer.opacity;
        targetLayer.ctx.drawImage(sourceLayer.canvas, 0, 0);
        targetLayer.ctx.restore();
        
        // Удаляем исходный слой
        layers.splice(fromIndex, 1);
        
        // Обновляем активный индекс
        if (activeIndex === fromIndex) {
            activeIndex = Math.max(0, targetIndex - (fromIndex < targetIndex ? 1 : 0));
        } else if (activeIndex > fromIndex) {
            activeIndex--;
        }
        
        composeLayers();
        updateLayerUI();
        return true;
    }

    // Объединение всех видимых слоев
    function mergeVisibleLayers() {
        const visibleLayers = layers.filter(layer => layer.visible && !layer.locked);
        
        if (visibleLayers.length < 2) {
            alert('Недостаточно видимых слоев для объединения');
            return false;
        }
        
        // Создаем временный canvas для объединения
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        resizeLayer(tempCanvas);
        
        // Объединяем все видимые слои на временном canvas
        visibleLayers.forEach(layer => {
            tempCtx.save();
            tempCtx.globalCompositeOperation = layer.blendMode;
            tempCtx.globalAlpha = layer.opacity;
            tempCtx.drawImage(layer.canvas, 0, 0);
            tempCtx.restore();
        });
        
        // Удаляем все объединенные слои
        layers.forEach((layer, index) => {
            if (layer.visible && !layer.locked) {
                layers.splice(index, 1);
            }
        });
        
        // Добавляем объединенный слой
        const mergedLayer = {
            id: layerIdCounter++,
            name: 'Объединенный слой',
            canvas: tempCanvas,
            ctx: tempCtx,
            opacity: 1,
            visible: true,
            blendMode: 'normal',
            locked: false,
            isBackground: false
        };
        
        layers.push(mergedLayer);
        activeIndex = layers.length - 1;
        
        composeLayers();
        updateLayerUI();
        return true;
    }

    // Перемещение слоя
    function moveLayer(fromIndex, toIndex) {
        if (fromIndex === toIndex) return false;
        if (fromIndex < 0 || fromIndex >= layers.length) return false;
        if (toIndex < 0 || toIndex >= layers.length) return false;
        
        const layer = layers.splice(fromIndex, 1)[0];
        layers.splice(toIndex, 0, layer);
        
        // Обновляем активный индекс
        if (activeIndex === fromIndex) {
            activeIndex = toIndex;
        } else if (activeIndex > fromIndex && activeIndex <= toIndex) {
            activeIndex--;
        } else if (activeIndex < fromIndex && activeIndex >= toIndex) {
            activeIndex++;
        }
        
        composeLayers();
        updateLayerUI();
        return true;
    }

    // Дублирование слоя
    function duplicateLayer(index) {
        if (index < 0 || index >= layers.length) return null;
        
        const originalLayer = layers[index];
        
        // Создаем новый canvas
        const newCanvas = document.createElement('canvas');
        const newCtx = newCanvas.getContext('2d');
        resizeLayer(newCanvas);
        
        // Копируем содержимое
        newCtx.drawImage(originalLayer.canvas, 0, 0);
        
        const newLayer = {
            id: layerIdCounter++,
            name: `${originalLayer.name} (копия)`,
            canvas: newCanvas,
            ctx: newCtx,
            opacity: originalLayer.opacity,
            visible: originalLayer.visible,
            blendMode: originalLayer.blendMode,
            locked: false,
            isBackground: false
        };
        
        layers.splice(index + 1, 0, newLayer);
        activeIndex = index + 1;
        
        composeLayers();
        updateLayerUI();
        return newLayer;
    }

    // Очистка слоя
    function clearLayer(index) {
        if (index < 0 || index >= layers.length) return false;
        if (layers[index].locked) {
            alert('Нельзя очистить заблокированный слой');
            return false;
        }
        
        const layer = layers[index];
        const { w, h } = getCanvasDimensions();
        
        layer.ctx.clearRect(0, 0, w, h);
        
        // Если это фоновый слой, заливаем белым
        if (layer.isBackground) {
            layer.ctx.fillStyle = '#FFFFFF';
            layer.ctx.fillRect(0, 0, w, h);
        }
        
        composeLayers();
        return true;
    }

    // Экспорт слоя как изображения
    function exportLayer(index) {
        if (index < 0 || index >= layers.length) return null;
        
        const layer = layers[index];
        const link = document.createElement('a');
        link.download = `layer_${layer.name}_${Date.now()}.png`;
        link.href = layer.canvas.toDataURL('image/png');
        return link;
    }

    // Инициализация системы слоев
    function initLayers() {
        // Создаем фоновый слой
        createLayer('Фон', true);
        
        // Создаем основной слой для рисования
        createLayer('Слой 1');
        
        // Обработчики событий
        setupLayerEvents();
    }

    function setupLayerEvents() {
        const newLayerBtn = document.getElementById('newLayerBtn');
        const deleteLayerBtn = document.getElementById('deleteLayerBtn');
        const mergeLayersBtn = document.getElementById('mergeLayersBtn');
        const layerSelect = document.getElementById('layerSelect');
        const layerOpacity = document.getElementById('layerOpacity');
        const blendMode = document.getElementById('blendMode');
        
        if (newLayerBtn) {
            newLayerBtn.addEventListener('click', () => {
                createLayer();
                if (window.App) window.App.saveState();
            });
        }
        
        if (deleteLayerBtn) {
            deleteLayerBtn.addEventListener('click', () => {
                if (deleteLayer(activeIndex) && window.App) {
                    window.App.saveState();
                }
            });
        }
        
        if (mergeLayersBtn) {
            mergeLayersBtn.addEventListener('click', () => {
                if (mergeVisibleLayers() && window.App) {
                    window.App.saveState();
                }
            });
        }
        
        if (layerSelect) {
            layerSelect.addEventListener('change', (e) => {
                const index = parseInt(e.target.value, 10);
                if (!isNaN(index)) {
                    setActive(index);
                }
            });
        }
        
        if (layerOpacity) {
            layerOpacity.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                    setOpacity(activeIndex, value);
                    if (window.App) window.App.saveState();
                    
                    const layerOpacityOut = document.getElementById('layerOpacityOut');
                    if (layerOpacityOut) {
                        layerOpacityOut.textContent = value + '%';
                    }
                }
            });
        }
        
        if (blendMode) {
            blendMode.addEventListener('change', (e) => {
                setBlendMode(activeIndex, e.target.value);
                if (window.App) window.App.saveState();
            });
        }
        
        // Горячие клавиши для слоев
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && !e.altKey) {
                switch (e.key) {
                    case ']': // Следующий слой
                        e.preventDefault();
                        setActive((activeIndex + 1) % layers.length);
                        break;
                    case '[': // Предыдущий слой
                        e.preventDefault();
                        setActive((activeIndex - 1 + layers.length) % layers.length);
                        break;
                    case 'j': // Дублировать слой
                        e.preventDefault();
                        if (duplicateLayer(activeIndex) && window.App) {
                            window.App.saveState();
                        }
                        break;
                }
            }
        });
    }

    // Создаем первый слой при загрузке
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLayers);
    } else {
        initLayers();
    }

    // Глобальный интерфейс
    window.Layers = {
        // Основные операции
        createLayer,
        deleteLayer,
        setActive,
        setOpacity,
        setBlendMode,
        toggleVisibility,
        toggleLock,
        getActiveCtx,
        composeLayers,
        resizeAll,
        clearLayer,
        
        // Расширенные операции
        mergeLayers,
        mergeVisibleLayers,
        moveLayer,
        duplicateLayer,
        exportLayer,
        
        // Информация
        get layers() { return layers.slice(); },
        get activeIndex() { return activeIndex; },
        set activeIndex(index) { setActive(index); },
        get activeLayer() { return layers[activeIndex]; },
        
        // Утилиты
        getLayerCount: () => layers.length,
        getVisibleLayers: () => layers.filter(layer => layer.visible),
        getLockedLayers: () => layers.filter(layer => layer.locked)
    };

    window.addEventListener('resize', resizeAll);
    
    console.log('Layers system initialized successfully');
})();

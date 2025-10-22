// js/layers.js - система слоев
(() => {
    const layers = [];
    let activeIndex = 0;

    // Создание нового слоя
    function createLayer(name = `Слой ${layers.length + 1}`) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        resizeLayer(canvas);
        
        const layer = {
            name,
            canvas,
            ctx,
            opacity: 1,
            visible: true
        };
        
        layers.push(layer);
        activeIndex = layers.length - 1;
        composeLayers();
        updateLayerUI();
        
        return layer;
    }

    // Изменение размера слоя
    function resizeLayer(canvas) {
        const dpr = window.App ? window.App.getDpr() : (window.devicePixelRatio || 1);
        const toolbar = document.getElementById('toolbar');
        const toolbarHeight = toolbar ? toolbar.offsetHeight : 0;
        const w = window.innerWidth;
        const h = Math.max(100, window.innerHeight - toolbarHeight);
        
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
        if (layers[index]) {
            layers[index].opacity = value / 100;
            composeLayers();
        }
    }

    // Установка активного слоя
    function setActive(index) {
        if (index >= 0 && index < layers.length) {
            activeIndex = index;
            composeLayers();
            updateLayerUI();
        }
    }

    // Получение контекста активного слоя
    function getActiveCtx() {
        return layers[activeIndex]?.ctx || window.App.ctx;
    }

    // Объединение слоев
    function composeLayers() {
        const baseCtx = window.App.ctx;
        const baseCanvas = window.App.canvas;
        const dpr = window.App ? window.App.getDpr() : 1;
        const w = baseCanvas.width / dpr;
        const h = baseCanvas.height / dpr;
        
        // Очищаем основной холст
        baseCtx.clearRect(0, 0, w, h);
        
        // Отрисовываем все видимые слои
        layers.forEach(layer => {
            if (layer.visible && layer.opacity > 0) {
                baseCtx.save();
                baseCtx.globalAlpha = layer.opacity;
                baseCtx.drawImage(layer.canvas, 0, 0, w, h);
                baseCtx.restore();
            }
        });
    }

    // Обновление интерфейса слоев
    function updateLayerUI() {
        const layerSelect = document.getElementById('layerSelect');
        const layerOpacity = document.getElementById('layerOpacity');
        const layerOpacityOut = document.getElementById('layerOpacityOut');
        
        if (layerSelect) {
            layerSelect.innerHTML = '';
            layers.forEach((layer, index) => {
                const option = document.createElement('option');
                option.value = String(index);
                option.textContent = `${layer.name} ${index === activeIndex ? '✓' : ''}`;
                if (index === activeIndex) option.selected = true;
                layerSelect.appendChild(option);
            });
        }
        
        if (layerOpacity && layerOpacityOut && layers[activeIndex]) {
            layerOpacity.value = Math.round(layers[activeIndex].opacity * 100);
            layerOpacityOut.textContent = layerOpacity.value + '%';
        }
    }

    // Удаление слоя
    function deleteLayer(index) {
        if (layers.length <= 1) {
            alert('Нельзя удалить последний слой');
            return;
        }
        
        layers.splice(index, 1);
        if (activeIndex >= layers.length) {
            activeIndex = layers.length - 1;
        }
        composeLayers();
        updateLayerUI();
    }

    // Инициализация системы слоев
    function initLayers() {
        createLayer('Фон');
        
        // Обработчики событий
        const newLayerBtn = document.getElementById('newLayerBtn');
        const deleteLayerBtn = document.getElementById('deleteLayerBtn');
        const layerSelect = document.getElementById('layerSelect');
        const layerOpacity = document.getElementById('layerOpacity');
        
        if (newLayerBtn) {
            newLayerBtn.addEventListener('click', () => {
                createLayer();
                if (window.App) window.App.saveState();
            });
        }
        
        if (deleteLayerBtn) {
            deleteLayerBtn.addEventListener('click', () => {
                deleteLayer(activeIndex);
                if (window.App) window.App.saveState();
            });
        }
        
        if (layerSelect) {
            layerSelect.addEventListener('change', (e) => {
                const index = parseInt(e.target.value, 10);
                setActive(index);
            });
        }
        
        if (layerOpacity) {
            layerOpacity.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                setOpacity(activeIndex, value);
                if (window.App) window.App.saveState();
                
                const layerOpacityOut = document.getElementById('layerOpacityOut');
                if (layerOpacityOut) {
                    layerOpacityOut.textContent = value + '%';
                }
            });
        }
    }

    // Создаем первый слой при загрузке
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLayers);
    } else {
        initLayers();
    }

    // Глобальный интерфейс
    window.Layers = {
        createLayer,
        setOpacity,
        setActive,
        getActiveCtx,
        composeLayers,
        resizeAll,
        deleteLayer,
        get layers() { return layers; },
        get activeIndex() { return activeIndex; },
        set activeIndex(index) { setActive(index); }
    };

    window.addEventListener('resize', resizeAll);
})();

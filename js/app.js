// js/app.js - ПОЛНАЯ ИНТЕГРАЦИЯ ВСЕХ КИСТЕЙ И ТЕКСТУР
(() => {
    console.log('🔄 Starting ArtFlow Pro with ALL brushes...');

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
    let currentShape = 'circle';
    let history = [];
    let historyStep = 0;

    // === ПРОВЕРКА ВСЕХ МОДУЛЕЙ ===
    function checkAllModules() {
        console.log('🔍 Checking all modules...');
        
        const modules = {
            'BRUSHES': window.BRUSHES,
            'Tools': window.Tools,
            'FIGURES': window.FIGURES,
            'TEXTURES': window.TEXTURES,
            'ANIME_TOOLS': window.ANIME_TOOLS,
            'THREE_D_TOOLS': window.THREE_D_TOOLS
        };

        let loadedCount = 0;
        Object.keys(modules).forEach(moduleName => {
            if (modules[moduleName]) {
                loadedCount++;
                const itemCount = modules[moduleName] ? Object.keys(modules[moduleName]).length : 'N/A';
                console.log(`✅ ${moduleName}: ${itemCount} items`);
            } else {
                console.log(`❌ ${moduleName}: NOT loaded`);
            }
        });

        console.log(`📊 Loaded ${loadedCount}/${Object.keys(modules).length} modules`);
        
        // Создаем fallback для отсутствующих модулей
        if (!window.BRUSHES) createFallbackBrushes();
        if (!window.Tools) createFallbackTools();
        if (!window.FIGURES) createFallbackFigures();
        if (!window.TEXTURES) createFallbackTextures();
        
        return loadedCount;
    }

    // === БАЗОВЫЕ КИСТИ (fallback) ===
    function createFallbackBrushes() {
        console.log('🎨 Creating fallback brushes...');
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
            }
        };
    }

    // === БАЗОВЫЕ ИНСТРУМЕНТЫ ===
    function createFallbackTools() {
        window.Tools = {
            eraser: (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalCompositeOperation = 'destination-out';
                ctx.globalAlpha = opacity || 0.8;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            },
            blur: (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity * 0.3;
                ctx.fillStyle = color;
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.arc(x + (Math.random() - 0.5) * size, y + (Math.random() - 0.5) * size, size * 0.5, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            },
            fill: (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity || 1;
                ctx.fillStyle = color;
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.restore();
            }
        };
    }

    // === БАЗОВЫЕ ФИГУРЫ ===
    function createFallbackFigures() {
        window.FIGURES = {
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
            }
        };
    }

    // === БАЗОВЫЕ ТЕКСТУРЫ ===
    function createFallbackTextures() {
        window.TEXTURES = {
            applyTexture: (ctx, textureName) => {
                console.log('🔄 Applying texture:', textureName);
                const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
                const data = imageData.data;
                
                // Простая текстура - добавляем шум
                for (let i = 0; i < data.length; i += 4) {
                    if (Math.random() > 0.8) {
                        data[i] = Math.min(255, data[i] + 20);
                        data[i + 1] = Math.min(255, data[i + 1] + 20);
                        data[i + 2] = Math.min(255, data[i + 2] + 20);
                    }
                }
                
                ctx.putImageData(imageData, 0, 0);
            },
            getTexture: (name) => {
                return {
                    name: name,
                    apply: function(ctx) {
                        this.applyTexture(ctx, name);
                    }
                };
            }
        };
    }

    // === ПРОСТАЯ СИСТЕМА СЛОЕВ ===
    function initializeLayers() {
        window.Layers = {
            getActiveCtx: () => ctx,
            createLayer: () => console.log('➕ Layer created'),
            resizeAll: () => {}
        };
    }

    // === ОСНОВНЫЕ ФУНКЦИИ ===
    function init() {
        console.log('🎨 Initializing ArtFlow Pro...');
        
        // Проверяем все модули
        const loadedModules = checkAllModules();
        
        // Показываем информацию о кистях
        if (window.BRUSHES) {
            const brushNames = Object.keys(window.BRUSHES);
            console.log(`🖌️ Available brushes (${brushNames.length}):`, brushNames.slice(0, 10).join(', ') + (brushNames.length > 10 ? '...' : ''));
        }
        
        // Показываем информацию о текстурах
        if (window.TEXTURES) {
            console.log('🎨 Textures system available');
        }
        
        setupCanvas();
        setupUI();
        setupEventListeners();
        saveState();
        
        console.log('✅ ArtFlow Pro READY with ALL features!');
    }

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

    function setupEventListeners() {
        // Mouse events
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        
        // Touch events
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchmove', handleTouchMove);
        canvas.addEventListener('touchend', stopDrawing);
        
        document.addEventListener('keydown', handleKeyDown);
    }

    function startDrawing(e) {
        e.preventDefault();
        painting = true;
        
        const pos = getCanvasPosition(e);
        lastX = pos.x;
        lastY = pos.y;
        
        // Немедленно рисуем первую точку
        drawBrush(pos.x, pos.y);
    }

    function draw(e) {
        if (!painting) return;
        e.preventDefault();
        
        const pos = getCanvasPosition(e);
        
        // Рисуем плавную линию
        drawLine(lastX, lastY, pos.x, pos.y);
        
        lastX = pos.x;
        lastY = pos.y;
        
        updateCoordinates(pos);
    }

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
                // Используем кисть из модуля BRUSHES
                if (window.BRUSHES && window.BRUSHES[currentBrush]) {
                    window.BRUSHES[currentBrush](ctx, x, y, size, color, opacity);
                } else {
                    // Fallback кисть
                    drawBasicBrush(x, y, size, color, opacity);
                }
            } else if (currentTool === 'eraser') {
                // Ластик
                if (window.Tools && window.Tools.eraser) {
                    window.Tools.eraser(ctx, x, y, size, color, opacity);
                } else {
                    drawBasicEraser(x, y, size, opacity);
                }
            } else if (window.Tools && window.Tools[currentTool]) {
                // Другие инструменты
                window.Tools[currentTool](ctx, x, y, size, color, opacity);
            } else {
                // Fallback - обычная кисть
                drawBasicBrush(x, y, size, color, opacity);
            }
        } catch (error) {
            console.error('❌ Drawing error:', error);
            // Аварийный fallback
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

    function drawBasicEraser(x, y, size, opacity) {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = opacity || 0.8;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function stopDrawing() {
        if (painting) {
            painting = false;
            saveState();
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

    function updateCoordinates(pos) {
        const coordsEl = document.getElementById('coordinates');
        if (coordsEl) {
            coordsEl.textContent = `X: ${Math.round(pos.x)}, Y: ${Math.round(pos.y)}`;
        }
    }

    // === ИСТОРИЯ ===
    function saveState() {
        history.length = historyStep;
        history.push(canvas.toDataURL());
        if (history.length > 20) history.shift();
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
        if (undoBtn) {
            undoBtn.disabled = historyStep <= 1;
        }
    }

    // === UI ===
    function setupUI() {
        setupBrushes();
        setupTools();
        setupColorPresets();
        setupSliders();
        setupActionButtons();
        setupTextureButtons();
        
        console.log('✅ UI ready');
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
            
            // Устанавливаем первую кисть
            if (brushes.length > 0) {
                currentBrush = brushes[0];
                brushSelect.value = currentBrush;
            }
            
            brushSelect.addEventListener('change', (e) => {
                currentBrush = e.target.value;
                updateBrushInfo();
            });

            // Обновляем счетчик
            if (brushCount) {
                brushCount.textContent = `${brushes.length}+`;
            }
            
            console.log(`🖌️ Loaded ${brushes.length} brushes into UI`);
        }
        
        updateBrushInfo();
    }

    function setupTools() {
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                toolButtons.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                currentTool = e.currentTarget.dataset.tool;
                updateBrushInfo();
            });
        });

        // Активируем первую кнопку
        if (toolButtons[0]) {
            toolButtons[0].classList.add('active');
        }
    }

    function setupTextureButtons() {
        // Кнопка применения текстуры
        const textureBtn = document.createElement('button');
        textureBtn.textContent = '🎨 Применить текстуру';
        textureBtn.style.marginTop = '10px';
        textureBtn.addEventListener('click', () => {
            if (window.TEXTURES && window.TEXTURES.applyTexture) {
                window.TEXTURES.applyTexture(ctx, 'холст');
                saveState();
                console.log('✅ Texture applied');
            }
        });
        
        const actionsSection = document.querySelector('.control-group[aria-labelledby="actions-section"]');
        if (actionsSection) {
            actionsSection.appendChild(textureBtn);
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
                console.log('💾 Image saved');
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
            brushInfo.textContent = `${currentBrush} | ${getBrushSize()}px`;
        }
    }

    // Инициализируем слои
    initializeLayers();

    // === ЗАПУСК ===
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('🚀 ArtFlow Pro - ALL BRUSHES & TEXTURES READY!');
})();

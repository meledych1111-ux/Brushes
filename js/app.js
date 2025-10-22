// js/app.js - полностью исправленная версия
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

    /* 1. Инициализация приложения */
    function init() {
        console.log('🎨 Initializing ArtFlow Pro...');
        
        // Сначала настраиваем canvas
        setupCanvas();
        
        // Затем UI
        setupUI();
        
        // И только потом события
        setupEventListeners();
        
        console.log('✅ ArtFlow Pro initialized successfully');
    }

    /* 2. Настройка Canvas */
    function setupCanvas() {
        console.log('📐 Setting up canvas...');
        
        // Получаем размеры контейнера
        const container = document.querySelector('.canvas-container');
        const toolbar = document.getElementById('toolbar');
        const mobileToolbar = document.getElementById('mobileToolbar');
        
        let width, height;
        
        if (container) {
            const rect = container.getBoundingClientRect();
            width = rect.width || 800;
            height = rect.height || 600;
        } else {
            // Расчет размеров вручную
            const panelWidth = window.innerWidth <= 768 ? 0 : 380;
            const toolbarHeight = mobileToolbar ? mobileToolbar.offsetHeight : (toolbar ? toolbar.offsetHeight : 0);
            
            width = window.innerWidth - panelWidth;
            height = window.innerHeight - toolbarHeight;
        }

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
        
        console.log('✅ Event listeners setup completed');
    }

    function handleMouseDown(e) {
        e.preventDefault();
        painting = true;
        
        const pos = getCanvasPosition(e);
        lastX = pos.x;
        lastY = pos.y;
        
        console.log('🖱️ Mouse down at:', pos.x, pos.y);
        drawBrush(pos.x, pos.y);
    }

    function handleMouseMove(e) {
        if (!painting) return;
        e.preventDefault();
        
        const pos = getCanvasPosition(e);
        drawLine(lastX, lastY, pos.x, pos.y);
        lastX = pos.x;
        lastY = pos.y;
    }

    function handleMouseUp() {
        if (painting) {
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
        }
    }

    function handleResize() {
        setTimeout(() => {
            setupCanvas();
        }, 100);
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
        
        // console.log(`🖍️ Drawing with ${currentBrush} at ${Math.round(x)},${Math.round(y)}`);

        try {
            if (currentTool === 'brush') {
                if (window.BRUSHES && window.BRUSHES[currentBrush]) {
                    window.BRUSHES[currentBrush](ctx, x, y, size, color, opacity);
                } else {
                    drawFallbackBrush(x, y, size, color, opacity);
                }
            } else if (currentTool === 'eraser') {
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

    /* 6. Настройка интерфейса */
    function setupUI() {
        console.log('⚙️ Setting up UI...');
        
        setupBrushes();
        setupTools();
        setupColorPresets();
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
        // Ждем немного чтобы BRUSHES загрузились из brushes.js
        setTimeout(() => {
            if (window.BRUSHES && Object.keys(window.BRUSHES).length > 0) {
                console.log('🎨 Brushes loaded:', Object.keys(window.BRUSHES).length + ' brushes available');
                console.log('📝 Brush names:', Object.keys(window.BRUSHES));
                updateBrushList('all');
            } else {
                console.warn('⚠️ BRUSHES not loaded, creating fallback brushes');
                createFallbackBrushes();
                updateBrushList('all');
            }
        }, 500); // Увеличил время ожидания
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

        console.log(`📝 Filtered brushes for ${category}:`, filteredBrushes);

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
        
        console.log(`✅ Loaded ${filteredBrushes.length} brushes for category: ${category}`);
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
            },
            'Акварель': (ctx, x, y, r, color, op) => {
                ctx.save();
                ctx.globalAlpha = op * 0.6;
                ctx.fillStyle = color;
                for (let i = 0; i < 5; i++) {
                    const texX = x + (Math.random() - 0.5) * r;
                    const texY = y + (Math.random() - 0.5) * r;
                    const texR = r * (0.3 + Math.random() * 0.4);
                    ctx.beginPath();
                    ctx.arc(texX, texY, texR, 0, Math.PI * 2);
                    ctx.fill();
                }
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
            brushInfo.textContent = `${currentBrush} | ${getBrushSize()}px`;
        }
    }

    /* 7. Запуск приложения */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Глобальный интерфейс для отладки
    window.ArtFlow = {
        version: '1.0',
        test: () => {
            console.log('🧪 ArtFlow Test:');
            console.log('📝 Available brushes:', window.BRUSHES ? Object.keys(window.BRUSHES) : 'NONE');
            console.log('🎯 Current:', { tool: currentTool, brush: currentBrush });
            console.log('📏 Canvas:', canvas.width + 'x' + canvas.height);
            console.log('🎨 Color:', getCurrentColor());
            console.log('📏 Size:', getBrushSize());
            
            // Тестовый рисунок
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(10, 10, 50, 50);
            console.log('✅ Test rectangle drawn');
        },
        clear: () => {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            console.log('✅ Canvas cleared');
        },
        listBrushes: () => {
            return window.BRUSHES ? Object.keys(window.BRUSHES) : [];
        }
    };

    console.log('🚀 ArtFlow Pro loaded successfully');
})();

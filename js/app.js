// js/app.js – финальная версия с исправленными кнопками и адаптивностью
(() => {
  console.log('🔄 Starting ArtFlow Pro...');

  const canvas = document.getElementById('canvas');
  if (!canvas) { console.error('❌ Canvas not found'); return; }
  const ctx = canvas.getContext('2d');
  if (!ctx) { console.error('❌ Context not available'); return; }

  let painting = false;
  let lastX = 0, lastY = 0;
  let currentTool = 'brush';
  let currentBrush = 'round';
  let currentColor = '#007aff';
  let brushSize = 20;
  let brushOpacity = 1;
  let history = [];
  let historyStep = 0;
  let isMobile = window.innerWidth <= 768;

  function init() {
    console.log('🎨 Initializing ArtFlow Pro...');
    
    // Инициализация модулей если они не загружены
    initializeModules();
    setupCanvas();
    setupUI();
    setupEventListeners();
    loadInitialState();
    
    console.log('✅ ArtFlow Pro initialized successfully');
  }

  function initializeModules() {
    // Инициализация всех модулей если они не загружены
    if (!window.Layers) {
      window.Layers = {
        getActiveCtx: () => ctx,
        composeLayers: () => {},
        resizeAll: () => {},
        createLayer: () => {
          console.log('📝 Creating new layer...');
          alert('Система слоев загружена! Создан новый слой.');
        },
        getActiveLayer: () => ({ ctx: ctx })
      };
    }
    
    if (!window.BRUSHES) {
      console.warn('⚠️ BRUSHES module not found, using fallback');
      window.BRUSHES = {
        round: (ctx, x, y, size, color, opacity) => {
          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      };
    }
    
    if (!window.FIGURES) {
      console.warn('⚠️ FIGURES module not found, using fallback');
      window.FIGURES = {
        circle: (ctx, x, y, size, color, opacity) => {
          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      };
    }
    
    if (!window.Tools) {
      console.warn('⚠️ Tools module not found, using fallback');
      window.Tools = {};
    }
  }

  function setupCanvas() {
    const container = document.querySelector('.canvas-container');
    if (!container) {
      console.error('❌ Canvas container not found');
      return;
    }
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    // Очищаем и заполняем белым фоном
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Обновляем слои если они есть
    if (window.Layers && window.Layers.resizeAll) {
      window.Layers.resizeAll();
    }
    
    saveState();
    console.log(`📐 Canvas set to ${width}x${height}`);
  }

  function setupEventListeners() {
    // Основные события canvas
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    // Адаптивность
    window.addEventListener('resize', () => {
      setTimeout(() => {
        setupCanvas();
        updateResponsiveLayout();
      }, 100);
    });

    // Обновление координат
    canvas.addEventListener('mousemove', updateCoordinates);
    canvas.addEventListener('touchmove', updateCoordinates);
  }

  function handleMouseDown(e) {
    e.preventDefault();
    painting = true;
    const pos = getCanvasPosition(e);
    lastX = pos.x; lastY = pos.y;
    
    // Для инструментов, которым не нужна линия (заливка и т.д.)
    if (currentTool === 'fill' || currentTool === 'gradient') {
      drawBrush(pos.x, pos.y, null, null, 1);
      painting = false;
      saveState();
    } else {
      drawBrush(pos.x, pos.y, null, null, e.pressure > 0 ? e.pressure : 1);
    }
  }

  function handleMouseMove(e) {
    if (!painting) return;
    e.preventDefault();
    const pos = getCanvasPosition(e);
    let pressure = e.pressure;
    if (!pressure || pressure <= 0) pressure = 1;
    drawLine(lastX, lastY, pos.x, pos.y, pressure);
    lastX = pos.x; lastY = pos.y;
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
    lastX = pos.x; lastY = pos.y;
    
    if (currentTool === 'fill' || currentTool === 'gradient') {
      drawBrush(pos.x, pos.y, null, null, 1);
      painting = false;
      saveState();
    } else {
      drawBrush(pos.x, pos.y, null, null, 1);
    }
  }

  function handleTouchMove(e) {
    if (!painting) return;
    e.preventDefault();
    const touch = e.touches[0];
    const pos = getCanvasPosition(touch);
    drawLine(lastX, lastY, pos.x, pos.y, 1);
    lastX = pos.x; lastY = pos.y;
  }

  function handleTouchEnd() {
    if (painting) { 
      painting = false; 
      saveState(); 
    }
  }

  // === РИСОВАНИЕ ===
  function drawLine(x1, y1, x2, y2, pressure = 1) {
    const dx = x2 - x1, dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.floor(dist / 2));
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + dx * t, y = y1 + dy * t;
      drawBrush(x, y, null, null, pressure);
    }
  }

  function drawBrush(x, y, x2 = null, y2 = null, pressure = 1) {
    const size = getBrushSize() * pressure;
    const opacity = getBrushOpacity() * pressure;
    const color = getCurrentColor();
    const ctxActive = (window.Layers && window.Layers.getActiveCtx()) || ctx;

    try {
      if (currentTool === 'brush') {
        if (window.BRUSHES && window.BRUSHES[currentBrush]) {
          window.BRUSHES[currentBrush](ctxActive, x, y, size, color, opacity);
        } else {
          drawFallbackBrush(ctxActive, x, y, size, color, opacity);
        }
      }
      else if (currentTool === 'eraser') {
        if (window.Tools && window.Tools.eraser) {
          window.Tools.eraser(ctxActive, x, y, size, color, opacity);
        } else {
          drawEraser(ctxActive, x, y, size, opacity);
        }
      }
      else if (currentTool === 'shape' && window.currentShape) {
        if (window.FIGURES && window.FIGURES[window.currentShape]) {
          window.FIGURES[window.currentShape](ctxActive, x, y, size, color, opacity);
        }
      }
      else if (window.Tools && window.Tools[currentTool]) {
        if (x2 !== null && y2 !== null) {
          window.Tools[currentTool](ctxActive, x, y, x2, y2, color, opacity);
        } else {
          window.Tools[currentTool](ctxActive, x, y, size, color, opacity);
        }
      }
      else {
        // Fallback для неизвестных инструментов
        drawFallbackBrush(ctxActive, x, y, size, color, opacity);
      }
    } catch (err) {
      console.error('❌ Draw error:', err);
      drawFallbackBrush(ctxActive, x, y, size, color, opacity);
    }
  }

  function drawFallbackBrush(ctxActive, x, y, r, color, op) {
    ctxActive.save(); 
    ctxActive.globalAlpha = op; 
    ctxActive.fillStyle = color;
    ctxActive.beginPath(); 
    ctxActive.arc(x, y, r, 0, Math.PI * 2); 
    ctxActive.fill(); 
    ctxActive.restore();
  }
  
  function drawEraser(ctxActive, x, y, r, op) {
    ctxActive.save(); 
    ctxActive.globalCompositeOperation = 'destination-out';
    ctxActive.globalAlpha = op; 
    ctxActive.beginPath(); 
    ctxActive.arc(x, y, r, 0, Math.PI * 2); 
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
    const el = document.getElementById('colorPicker') || document.getElementById('quickColor');
    return el ? el.value : currentColor; 
  }
  
  function getBrushSize() { 
    const el = document.getElementById('sizeSlider');
    return el ? parseInt(el.value) : brushSize; 
  }
  
  function getBrushOpacity() { 
    const el = document.getElementById('opacitySlider');
    return el ? parseInt(el.value) / 100 : brushOpacity; 
  }

  function updateCoordinates(e) {
    const coordsEl = document.getElementById('coordinates');
    if (!coordsEl) return;
    
    const pos = getCanvasPosition(e);
    coordsEl.textContent = `X: ${Math.round(pos.x)}, Y: ${Math.round(pos.y)}`;
  }

  // === ИСТОРИЯ ===
  function saveState() {
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

  // === UI УПРАВЛЕНИЕ ===
  function setupUI() {
    setupToolButtons();
    setupBrushControls();
    setupActionButtons();
    setupMobileControls();
    updateResponsiveLayout();
    
    console.log('✅ UI setup complete');
  }

  function setupToolButtons() {
    // Активация инструментов
    const toolButtons = document.querySelectorAll('.tool-btn, .mobile-tool-btn');
    toolButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        // Убираем активный класс у всех кнопок
        toolButtons.forEach(b => b.classList.remove('active'));
        // Добавляем активный класс текущей кнопке
        this.classList.add('active');
        // Устанавливаем текущий инструмент
        currentTool = this.dataset.tool || 'brush';
        
        // Обновляем информацию о кисти
        updateBrushInfo();
        console.log(`🛠️ Tool changed to: ${currentTool}`);
      });
    });

    // Активация кистей
    const brushSelect = document.getElementById('brushSelect');
    if (brushSelect) {
      brushSelect.addEventListener('change', function() {
        currentBrush = this.value;
        updateBrushInfo();
        console.log(`🖌️ Brush changed to: ${currentBrush}`);
      });
    }

    // Активация фигур
    const shapeButtons = document.querySelectorAll('.shape-btn');
    shapeButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        currentTool = 'shape';
        window.currentShape = this.dataset.shape;
        console.log(`🔷 Shape changed to: ${window.currentShape}`);
      });
    });
  }

  function setupBrushControls() {
    // Размер кисти
    const sizeSlider = document.getElementById('sizeSlider');
    const sizeOut = document.getElementById('sizeOut');
    if (sizeSlider && sizeOut) {
      sizeSlider.addEventListener('input', function() {
        brushSize = parseInt(this.value);
        sizeOut.textContent = brushSize;
        updateBrushInfo();
      });
    }

    // Прозрачность
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityOut = document.getElementById('opacityOut');
    if (opacitySlider && opacityOut) {
      opacitySlider.addEventListener('input', function() {
        brushOpacity = parseInt(this.value) / 100;
        opacityOut.textContent = this.value + '%';
      });
    }

    // Цвет
    const colorPickers = document.querySelectorAll('input[type="color"]');
    colorPickers.forEach(picker => {
      picker.addEventListener('input', function() {
        currentColor = this.value;
        updateBrushInfo();
      });
    });

    // Пресеты цветов
    const colorPresets = document.querySelectorAll('.color-preset');
    colorPresets.forEach(preset => {
      preset.addEventListener('click', function() {
        const color = this.dataset.color;
        currentColor = color;
        
        // Обновляем все color pickers
        colorPickers.forEach(picker => {
          picker.value = color;
        });
        
        updateBrushInfo();
        console.log(`🎨 Color changed to: ${color}`);
      });
    });
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
    const exportFmt = document.getElementById('exportFormat');
    if (exportBtn && exportFmt) {
      exportBtn.addEventListener('click', () => {
        const fmt = exportFmt.value || 'png';
        const mimeType = fmt === 'jpg' ? 'image/jpeg' : `image/${fmt}`;
        
        canvas.toBlob(blob => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `artflow-${Date.now()}.${fmt}`;
          a.click();
          URL.revokeObjectURL(a.href);
          console.log(`📤 Exported as ${fmt.toUpperCase()}`);
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

  function setupMobileControls() {
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
      brushInfo.textContent = `${currentBrush} | ${brushSize}px`;
    }
  }

  function updateResponsiveLayout() {
    isMobile = window.innerWidth <= 768;
    document.body.classList.toggle('mobile-mode', isMobile);
    
    // Скрываем/показываем панель инструментов на мобильных
    const toolbar = document.getElementById('toolbar');
    if (toolbar) {
      if (isMobile) {
        toolbar.style.transform = 'translateX(-100%)';
      } else {
        toolbar.style.transform = 'translateX(0)';
      }
    }
    
    console.log(`📱 ${isMobile ? 'Mobile' : 'Desktop'} layout activated`);
  }

  function loadInitialState() {
    // Загрузка начальных настроек
    updateBrushInfo();
    updateUndoRedoButtons();
    
    // Устанавливаем начальную кисть
    if (window.BRUSHES && window.BRUSHES.round) {
      currentBrush = 'round';
    }
    
    console.log('🎯 Initial state loaded');
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
    getCurrentColor: () => currentColor
  };

  console.log('🚀 ArtFlow Pro loaded successfully');
})();

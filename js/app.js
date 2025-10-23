// js/app.js - ПОЛНАЯ РАБОЧАЯ ВЕРСИЯ С ВСЕМИ ФУНКЦИЯМИ
(() => {
    console.log('🔄 Starting ArtFlow Pro...');

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
    let startX = 0, startY = 0;
    let currentTool = 'brush';
    let currentBrush = 'Круглая';
    let currentShape = 'circle';
    let history = [];
    let historyStep = 0;
    let isDrawingShape = false;
    let lastTime = 0;

    // Временный canvas для предпросмотра
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // Буферы для эффектов
    const effectBuffers = {
        blur: { lastX: 0, lastY: 0, buffer: null },
        smudge: { lastPixels: null, lastX: 0, lastY: 0 }
    };

    // === УЛУЧШЕННЫЕ ЭФФЕКТЫ ===
    function createAdvancedEffects() {
        console.log('🎭 Creating advanced effects...');
        
        // Улучшенное размытие
        window.advancedBlur = {
            apply: function(ctx, x, y, size, color, opacity) {
                const blurRadius = Math.max(5, size * 0.8);
                const intensity = opacity * 0.3;
                
                try {
                    // Создаем временный буфер если нужно
                    if (!effectBuffers.blur.buffer || 
                        effectBuffers.blur.buffer.width !== ctx.canvas.width || 
                        effectBuffers.blur.buffer.height !== ctx.canvas.height) {
                        effectBuffers.blur.buffer = document.createElement('canvas');
                        effectBuffers.blur.buffer.width = ctx.canvas.width;
                        effectBuffers.blur.buffer.height = ctx.canvas.height;
                    }
                    
                    const bufferCtx = effectBuffers.blur.buffer.getContext('2d');
                    
                    // Копируем область вокруг курсора
                    const areaSize = blurRadius * 2;
                    const sx = Math.max(0, x - areaSize);
                    const sy = Math.max(0, y - areaSize);
                    const sw = Math.min(areaSize * 2, ctx.canvas.width - sx);
                    const sh = Math.min(areaSize * 2, ctx.canvas.height - sy);
                    
                    if (sw > 0 && sh > 0) {
                        const imageData = ctx.getImageData(sx, sy, sw, sh);
                        const data = imageData.data;
                        
                        // Применяем размытие по Гауссу
                        for (let i = 4; i < data.length - 4; i += 4) {
                            // Усредняем с соседями
                            data[i] = (data[i] + data[i - 4] + data[i + 4]) / 3;
                            data[i + 1] = (data[i + 1] + data[i - 3] + data[i + 5]) / 3;
                            data[i + 2] = (data[i + 2] + data[i - 2] + data[i + 6]) / 3;
                        }
                        
                        // Плавное наложение
                        ctx.globalAlpha = intensity;
                        ctx.putImageData(imageData, sx, sy);
                        ctx.globalAlpha = 1;
                    }
                    
                } catch (e) {
                    console.log('Blur out of bounds');
                }
            }
        };

        // Улучшенное затирание (смазка)
        window.advancedSmudge = {
            apply: function(ctx, x, y, size, color, opacity) {
                const smudgeSize = Math.max(8, size);
                const intensity = opacity * 0.8;
                
                try {
                    // Получаем текущие пиксели
                    const currentPixels = ctx.getImageData(x - smudgeSize, y - smudgeSize, smudgeSize * 2, smudgeSize * 2);
                    
                    if (effectBuffers.smudge.lastPixels && effectBuffers.smudge.lastX !== 0 && effectBuffers.smudge.lastY !== 0) {
                        // Вычисляем направление движения
                        const dx = x - effectBuffers.smudge.lastX;
                        const dy = y - effectBuffers.smudge.lastY;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance > 0 && distance < smudgeSize) {
                            // Смешиваем пиксели по направлению движения
                            const blendStrength = Math.min(1, distance / smudgeSize) * intensity;
                            
                            for (let i = 0; i < currentPixels.data.length; i += 4) {
                                const pixelX = (i / 4) % (smudgeSize * 2);
                                const pixelY = Math.floor((i / 4) / (smudgeSize * 2));
                                
                                // Смещение для эффекта смазки
                                const offsetX = Math.round(pixelX + dx * blendStrength);
                                const offsetY = Math.round(pixelY + dy * blendStrength);
                                
                                if (offsetX >= 0 && offsetX < smudgeSize * 2 && offsetY >= 0 && offsetY < smudgeSize * 2) {
                                    const offsetIndex = (offsetY * smudgeSize * 2 + offsetX) * 4;
                                    
                                    if (offsetIndex < effectBuffers.smudge.lastPixels.data.length) {
                                        // Смешивание цветов
                                        currentPixels.data[i] = effectBuffers.smudge.lastPixels.data[offsetIndex] * blendStrength + currentPixels.data[i] * (1 - blendStrength);
                                        currentPixels.data[i + 1] = effectBuffers.smudge.lastPixels.data[offsetIndex + 1] * blendStrength + currentPixels.data[i + 1] * (1 - blendStrength);
                                        currentPixels.data[i + 2] = effectBuffers.smudge.lastPixels.data[offsetIndex + 2] * blendStrength + currentPixels.data[i + 2] * (1 - blendStrength);
                                    }
                                }
                            }
                        }
                    }
                    
                    // Сохраняем для следующего кадра
                    effectBuffers.smudge.lastPixels = currentPixels;
                    effectBuffers.smudge.lastX = x;
                    effectBuffers.smudge.lastY = y;
                    
                    // Применяем измененные пиксели
                    ctx.putImageData(currentPixels, x - smudgeSize, y - smudgeSize);
                    
                } catch (e) {
                    console.log('Smudge out of bounds');
                }
            }
        };

        // Улучшенный градиент
        window.advancedGradient = {
            draw: function(ctx, startX, startY, endX, endY, color, opacity) {
                const secondaryColor = document.getElementById('secondaryColorPicker')?.value || '#ffffff';
                
                // Создаем плавный градиент

                const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
                gradient.addColorStop(0, color);
                gradient.addColorStop(0.3, this.mixColors(color, secondaryColor, 0.7));
                gradient.addColorStop(0.5, this.mixColors(color, secondaryColor, 0.5));
                gradient.addColorStop(0.7, this.mixColors(color, secondaryColor, 0.3));
                gradient.addColorStop(1, secondaryColor);
                
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.fillStyle = gradient;
                
                // Рисуем плавную область градиента

                const width = Math.abs(endX - startX);
                const height = Math.abs(endY - startY);
                const x = Math.min(startX, endX);
                const y = Math.min(startY, endY);
                
                ctx.fillRect(x, y, width, height);
                
                ctx.restore();
            },
            
            mixColors: function(color1, color2, ratio) {
                const hex = (color) => color.replace('#', '');
                const r = (hex) => parseInt(hex.substring(0, 2), 16);
                const g = (hex) => parseInt(hex.substring(2, 4), 16);
                const b = (hex) => parseInt(hex.substring(4, 6), 16);
                
                const c1 = hex(color1);
                const c2 = hex(color2);
                
                const r1 = r(c1), g1 = g(c1), b1 = b(c1);
                const r2 = r(c2), g2 = g(c2), b2 = b(c2);
                
                const rr = Math.round(r1 * ratio + r2 * (1 - ratio));
                const rg = Math.round(g1 * ratio + g2 * (1 - ratio));
                const rb = Math.round(b1 * ratio + b2 * (1 - ratio));
                
                return `#${rr.toString(16).padStart(2, '0')}${rg.toString(16).padStart(2, '0')}${rb.toString(16).padStart(2, '0')}`;
            }
        };
    }

    // === ИНИЦИАЛИЗАЦИЯ ВСЕХ МОДУЛЕЙ ===

    function initializeAllModules() {
        console.log('📦 Checking all modules...');
        
        // Создаем улучшенные эффекты
        createAdvancedEffects();
        
        // Кисти
        if (!window.BRUSHES) {
            console.warn('⚠️ BRUSHES module not found, creating fallback');
            createFallbackBrushes();
        } else {
            console.log('✅ BRUSHES loaded:', Object.keys(window.BRUSHES).length + ' brushes');
        }

        // Инструменты
        if (!window.Tools) {
            console.warn('⚠️ Tools module not found, creating fallback');
            createFallbackTools();
        } else {
            console.log('✅ Tools loaded:', Object.keys(window.Tools).length + ' tools');
        }

        // Фигуры
        if (!window.FIGURES) {
            console.warn('⚠️ FIGURES module not found, creating fallback');
            createFallbackFigures();
        } else {
            console.log('✅ FIGURES loaded:', Object.keys(window.FIGURES).length + ' figures');
        }

        // Текстуры
        if (!window.TEXTURES) {
            console.warn('⚠️ TEXTURES module not found, creating fallback');
            createFallbackTextures();
        } else {
            console.log('✅ TEXTURES loaded');
        }

        // Слои
        if (!window.Layers) {
            console.warn('⚠️ Layers module not found, creating fallback');
            createFallbackLayers();
        } else {
            console.log('✅ Layers system available');
        }

        // Создаем инструменты для черчения

        createDrawingTools();
        
        console.log('🎯 All modules initialized');
    }

    // === БАЗОВЫЕ КИСТИ ===

    function createFallbackBrushes() {
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
            
            'Мягкая круглая': (ctx, x, y, size, color, opacity) => {
                ctx.save();
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
                gradient.addColorStop(0, color);
                gradient.addColorStop(0.3, color.replace(')', ',0.8)').replace('rgb', 'rgba'));
                gradient.addColorStop(0.7, color.replace(')', ',0.3)').replace('rgb', 'rgba'));
                gradient.addColorStop(1, 'transparent');
                ctx.globalAlpha = opacity;
                ctx.fillStyle = gradient;
                ctx.fillRect(x - size, y - size, size * 2, size * 2);
                ctx.restore();
            },
            
            'Квадратная': (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.fillStyle = color;
                ctx.fillRect(x - size, y - size, size * 2, size * 2);
                ctx.restore();
            },
            
            'Карандаш': (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.strokeStyle = color;
                ctx.lineWidth = Math.max(1, size / 3);
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(x - 1, y);
                ctx.lineTo(x + 1, y);
                ctx.stroke();
                ctx.restore();
            },
            
            'Акварель': (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity * 0.7;
                ctx.fillStyle = color;
                for (let i = 0; i < 8; i++) {
                    const offsetX = (Math.random() - 0.5) * size * 0.8;
                    const offsetY = (Math.random() - 0.5) * size * 0.8;
                    const radius = size * (0.3 + Math.random() * 0.4);
                    ctx.beginPath();
                    ctx.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            },
            
            'Щетина': (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.strokeStyle = color;
                ctx.lineWidth = Math.max(1, size / 4);
                ctx.lineCap = 'round';
                for (let i = 0; i < 5; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const length = size * (0.5 + Math.random() * 0.5);
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
                    ctx.stroke();
                }
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
                window.advancedBlur.apply(ctx, x, y, size, color, opacity);
            },
            
            smudge: (ctx, x, y, size, color, opacity) => {
                window.advancedSmudge.apply(ctx, x, y, size, color, opacity);
            },
            
            fill: (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity || 1;
                ctx.fillStyle = color;
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.restore();
            },
            
            gradient: (ctx, x1, y1, x2, y2, color, opacity) => {
                window.advancedGradient.draw(ctx, x1, y1, x2, y2, color, opacity);
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
            },
            triangle: (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(x, y - size);
                ctx.lineTo(x - size, y + size);
                ctx.lineTo(x + size, y + size);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            },
            star: (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.fillStyle = color;
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
                    const x1 = x + Math.cos(angle) * size;
                    const y1 = y + Math.sin(angle) * size;
                    
                    if (i === 0) ctx.moveTo(x1, y1);
                    else ctx.lineTo(x1, y1);
                    
                    const innerAngle = angle + Math.PI / 5;
                    const x2 = x + Math.cos(innerAngle) * size * 0.5;
                    const y2 = y + Math.sin(innerAngle) * size * 0.5;
                    ctx.lineTo(x2, y2);
                }
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            },
            heart: (ctx, x, y, size, color, opacity) => {
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.fillStyle = color;
                ctx.beginPath();
                const topCurveHeight = size * 0.3;
                ctx.moveTo(x, y + size);
                ctx.bezierCurveTo(x, y - topCurveHeight, x - size, y, x, y + size);
                ctx.bezierCurveTo(x + size, y, x, y - topCurveHeight, x, y + size);
                ctx.fill();
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
                
                for (let i = 0; i < data.length; i += 4) {
                    if (Math.random() > 0.7) {
                        data[i] = Math.min(255, data[i] + 10);
                        data[i + 1] = Math.min(255, data[i + 1] + 10);
                        data[i + 2] = Math.min(255, data[i + 2] + 10);
                    }
                }
                
                ctx.putImageData(imageData, 0, 0);
            }
        };
    }

    // === БАЗОВАЯ СИСТЕМА СЛОЕВ ===

    function createFallbackLayers() {
        window.Layers = {
            layers: [],
            activeLayerIndex: 0,
            
            init: function(canvasElement) {
                this.canvas = canvasElement;
                this.createLayer('Основной слой');
                console.log('✅ Fallback layers initialized');
            },
            
            createLayer: function(name = 'Слой') {
                const layerCanvas = document.createElement('canvas');
                layerCanvas.width = this.canvas.width;
                layerCanvas.height = this.canvas.height;
                
                const layerCtx = layerCanvas.getContext('2d');
                layerCtx.fillStyle = 'transparent';
                layerCtx.fillRect(0, 0, layerCanvas.width, layerCanvas.height);

                const layer = {
                    name: name,
                    canvas: layerCanvas,
                    ctx: layerCtx,
                    visible: true,
                    opacity: 1
                };

                this.layers.push(layer);
                this.activeLayerIndex = this.layers.length - 1;
                this.updateUI();
                
                return layer;
            },
            
            getActiveCtx: function() {
                return this.layers[this.activeLayerIndex]?.ctx || ctx;
            },
            
            composeLayers: function() {
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.layers.forEach(layer => {
                    if (layer.visible && layer.opacity > 0) {
                        ctx.save();
                        ctx.globalAlpha = layer.opacity;
                        ctx.drawImage(layer.canvas, 0, 0);
                        ctx.restore();
                    }
                });
            },
            
            updateUI: function() {
                const layersList = document.getElementById('layersList');
                if (!layersList) return;
                
                layersList.innerHTML = '';
                this.layers.forEach((layer, index) => {
                    const layerElement = document.createElement('div');
                    layerElement.className = `layer-item ${index === this.activeLayerIndex ? 'active' : ''}`;
                    layerElement.innerHTML = `
                        <div class="layer-info">
                            <span class="layer-name">${layer.name}</span>
                            <span class="layer-opacity">${Math.round(layer.opacity * 100)}%</span>
                        </div>
                        <div class="layer-controls">
                            <button class="layer-visibility">${layer.visible ? '👁️' : '👁️‍🗨️'}</button>
                        </div>
                    `;
                    
                    layerElement.addEventListener('click', () => {
                        this.activeLayerIndex = index;
                        this.updateUI();
                    });
                    
                    const visibilityBtn = layerElement.querySelector('.layer-visibility');
                    visibilityBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        layer.visible = !layer.visible;
                        this.composeLayers();
                        this.updateUI();
                    });
                    
                    layersList.appendChild(layerElement);
                });
            },
            
            resizeAll: function() {
                this.layers.forEach(layer => {
                    layer.canvas.width = this.canvas.width;
                    layer.canvas.height = this.canvas.height;
                });
                this.composeLayers();
            }
        };
    }

    // === ИНСТРУМЕНТЫ ДЛЯ ЧЕРЧЕНИЯ ===

    function createDrawingTools() {
        window.DrawingTools = {
            line: {
                preview: (ctx, startX, startY, endX, endY, color, opacity) => {
                    ctx.save();
                    ctx.globalAlpha = opacity * 0.7;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                    ctx.restore();
                },
                final: (ctx, startX, startY, endX, endY, color, opacity) => {
                    ctx.save();
                    ctx.globalAlpha = opacity;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                    ctx.restore();
                }
            },
            
            rectangle: {
                preview: (ctx, startX, startY, endX, endY, color, opacity) => {
                    ctx.save();
                    ctx.globalAlpha = opacity * 0.7;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 5]);
                    ctx.strokeRect(startX, startY, endX - startX, endY - startY);
                    ctx.restore();
                },
                final: (ctx, startX, startY, endX, endY, color, opacity) => {
                    ctx.save();
                    ctx.globalAlpha = opacity;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.strokeRect(startX, startY, endX - startX, endY - startY);
                    ctx.restore();
                }
            },
            
            rectangle_fill: {
                preview: (ctx, startX, startY, endX, endY, color, opacity) => {
                    ctx.save();
                    ctx.globalAlpha = opacity * 0.5;
                    ctx.fillStyle = color;
                    ctx.fillRect(startX, startY, endX - startX, endY - startY);
                    ctx.restore();
                },
                final: (ctx, startX, startY, endX, endY, color, opacity) => {
                    ctx.save();
                    ctx.globalAlpha = opacity;
                    ctx.fillStyle = color;
                    ctx.fillRect(startX, startY, endX - startX, endY - startY);
                    ctx.restore();
                }
            },
            
            circle: {
                preview: (ctx, startX, startY, endX, endY, color, opacity) => {
                    const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                    ctx.save();
                    ctx.globalAlpha = opacity * 0.7;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                },
                final: (ctx, startX, startY, endX, endY, color, opacity) => {
                    const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                    ctx.save();
                    ctx.globalAlpha = opacity;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }
            },
            
            circle_fill: {
                preview: (ctx, startX, startY, endX, endY, color, opacity) => {
                    const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                    ctx.save();
                    ctx.globalAlpha = opacity * 0.5;
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                },
                final: (ctx, startX, startY, endX, endY, color, opacity) => {
                    const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                    ctx.save();
                    ctx.globalAlpha = opacity;
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            },
            
            gradient: {
                preview: (ctx, startX, startY, endX, endY, color, opacity) => {
                    window.advancedGradient.draw(ctx, startX, startY, endX, endY, color, opacity * 0.7);
                },
                final: (ctx, startX, startY, endX, endY, color, opacity) => {
                    window.advancedGradient.draw(ctx, startX, startY, endX, endY, color, opacity);
                }
            }
        };
    }

    // === ОСНОВНЫЕ ФУНКЦИИ ===

    function init() {
        console.log('🎨 Initializing ArtFlow Pro...');
        
        // Инициализируем все модули
        initializeAllModules();
        
        // Настраиваем canvas
        setupCanvas();
        
        // Настраиваем UI
        setupUI();
        
        // Настраиваем события
        setupEventListeners();
        
        // Сохраняем начальное состояние
        saveState();
        
        console.log('✅ ArtFlow Pro initialized successfully');
    }

    function setupCanvas() {
        const container = document.querySelector('.canvas-container');
        if (!container) return;

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 600;
        
        canvas.width = width;
        canvas.height = height;
        tempCanvas.width = width;
        tempCanvas.height = height;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        // Очищаем canvas
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        tempCtx.fillStyle = '#FFFFFF';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Инициализируем слои
        if (window.Layers && window.Layers.init) {
            window.Layers.init(canvas);
        }
    }

    function setupEventListeners() {
        // Mouse events
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseUp);
        
        // Touch events
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd);
        
        // Resize
        window.addEventListener('resize', handleResize);
        
        // Keyboard
        document.addEventListener('keydown', handleKeyDown);
    }

    function handleMouseDown(e) {
        e.preventDefault();
        painting = true;
        
        const pos = getCanvasPosition(e);
        lastX = pos.x;
        lastY = pos.y;
        startX = pos.x;
        startY = pos.y;
        
        console.log('🖱️ Mouse down at:', pos.x, pos.y, 'Tool:', currentTool);
        
        if (isDrawingTool(currentTool)) {
            isDrawingShape = true;
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(canvas, 0, 0);
        } else if (currentTool === 'shape') {
            drawShape(pos.x, pos.y);
            painting = false;
            saveState();
        } else if (currentTool === 'fill') {
            drawBrush(pos.x, pos.y);
            painting = false;
            saveState();
        } else {
            saveState();
            drawBrush(pos.x, pos.y);
        }
    }

    function handleMouseMove(e) {
        if (!painting) return;
        e.preventDefault();
        
        const pos = getCanvasPosition(e);
        const currentTime = Date.now();
        
        // Ограничиваем FPS для плавности
        if (currentTime - lastTime < 16) return;
        lastTime = currentTime;
        
        if (isDrawingTool(currentTool) && isDrawingShape) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(tempCanvas, 0, 0);
            drawPreviewShape(startX, startY, pos.x, pos.y);
        } else if (!isDrawingTool(currentTool) && currentTool !== 'shape' && currentTool !== 'fill') {
            drawSmoothLine(lastX, lastY, pos.x, pos.y);
            lastX = pos.x;
            lastY = pos.y;
        }
        
        updateCoordinates(pos);
    }

    function drawSmoothLine(x1, y1, x2, y2) {
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

    function handleMouseUp() {
        if (painting) {
            if (isDrawingTool(currentTool) && isDrawingShape) {
                drawFinalShape(startX, startY, lastX, lastY);
                isDrawingShape = false;
                saveState();
            } else if (currentTool === 'brush' || currentTool === 'eraser') {
                saveState();
            }
            
            painting = false;
            
            // Сбрасываем состояние эффектов
            effectBuffers.smudge.lastPixels = null;
            effectBuffers.smudge.lastX = 0;
            effectBuffers.smudge.lastY = 0;
        }
    }

    function handleTouchStart(e) {
        e.preventDefault();
        painting = true;
        
        const touch = e.touches[0];
        const pos = getCanvasPosition(touch);
        lastX = pos.x;
        lastY = pos.y;
        startX = pos.x;
        startY = pos.y;
        
        if (isDrawingTool(currentTool)) {
            isDrawingShape = true;
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(canvas, 0, 0);
        } else if (currentTool === 'shape') {
            drawShape(pos.x, pos.y);
            painting = false;
            saveState();
        } else if (currentTool === 'fill') {
            drawBrush(pos.x, pos.y);
            painting = false;
            saveState();
        } else {
            saveState();
            drawBrush(pos.x, pos.y);
        }
    }

    function handleTouchMove(e) {
        if (!painting) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const pos = getCanvasPosition(touch);
        
        if (isDrawingTool(currentTool) && isDrawingShape) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(tempCanvas, 0, 0);
            drawPreviewShape(startX, startY, pos.x, pos.y);
        } else if (!isDrawingTool(currentTool) && currentTool !== 'shape' && currentTool !== 'fill') {
            drawSmoothLine(lastX, lastY, pos.x, pos.y);
            lastX = pos.x;
            lastY = pos.y;
        }
        
        updateCoordinates(pos);
    }

    function handleTouchEnd() {
        handleMouseUp();
    }

    function handleResize() {
        setTimeout(() => {
            setupCanvas();
            if (window.Layers && window.Layers.resizeAll) {
                window.Layers.resizeAll();
            }
        }, 100);
    }

    function handleKeyDown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            undo();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
            e.preventDefault();
            redo();
        }
    }

    function drawBrush(x, y) {
        const size = getBrushSize();
        const opacity = getBrushOpacity();
        const color = getCurrentColor();
        
        // Получаем активный контекст из системы слоев
        const ctxActive = (window.Layers && window.Layers.getActiveCtx()) || ctx;
        
        try {
            if (currentTool === 'brush') {
                if (window.BRUSHES && window.BRUSHES[currentBrush]) {
                    window.BRUSHES[currentBrush](ctxActive, x, y, size, color, opacity);
                } else {
                    drawFallbackBrush(ctxActive, x, y, size, color, opacity);
                }
            } else if (window.Tools && window.Tools[currentTool]) {
                window.Tools[currentTool](ctxActive, x, y, size, color, opacity);
            } else {
                drawFallbackBrush(ctxActive, x, y, size, color, opacity);
            }
        } catch (error) {
            console.error('❌ Error drawing:', error);
            drawFallbackBrush(ctxActive, x, y, size, color, opacity);
        }
    }

    function drawFallbackBrush(ctxActive, x, y, size, color, opacity) {
        ctxActive.save();
        ctxActive.globalAlpha = opacity;
        ctxActive.fillStyle = color;
        ctxActive.beginPath();
        ctxActive.arc(x, y, size, 0, Math.PI * 2);
        ctxActive.fill();
        ctxActive.restore();
    }

    function drawShape(x, y) {
        const size = getBrushSize();
        const opacity = getBrushOpacity();
        const color = getCurrentColor();
        const ctxActive = (window.Layers && window.Layers.getActiveCtx()) || ctx;
        
        if (window.FIGURES && window.FIGURES[currentShape]) {
            window.FIGURES[currentShape](ctxActive, x, y, size, color, opacity);
        } else {
            drawFallbackBrush(ctxActive, x, y, size, color, opacity);
        }
    }

    function drawPreviewShape(startX, startY, endX, endY) {
        const color = getCurrentColor();
        const opacity = getBrushOpacity();
        const ctxActive = (window.Layers && window.Layers.getActiveCtx()) || ctx;
        
        if (window.DrawingTools && window.DrawingTools[currentTool]) {
            window.DrawingTools[currentTool].preview(ctxActive, startX, startY, endX, endY, color, opacity * 0.7);
        }
    }

    function drawFinalShape(startX, startY, endX, endY) {
        const color = getCurrentColor();
        const opacity = getBrushOpacity();
        const ctxActive = (window.Layers && window.Layers.getActiveCtx()) || ctx;
        
        if (window.DrawingTools && window.DrawingTools[currentTool]) {
            window.DrawingTools[currentTool].final(ctxActive, startX, startY, endX, endY, color, opacity);
        }
    }

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

    function isDrawingTool(tool) {
        const drawingTools = ['line', 'rectangle', 'rectangle_fill', 'circle', 'circle_fill', 'triangle', 'triangle_fill', 'gradient'];
        return drawingTools.includes(tool);
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

    // === UI SETUP ===

    function setupUI() {
        setupBrushes();
        setupTools();
        setupDrawingTools();
        setupShapes();
        setupColorPresets();
        setupSliders();
        setupActionButtons();
        setupMobileUI();
        
        console.log('✅ UI setup completed');
    }

    function setupBrushes() {
        const brushSelect = document.getElementById('brushSelect');
        const brushCategory = document.getElementById('brushCategory');
        
        if (brushSelect) {
            updateBrushList('all');
            
            if (brushCategory) {
                brushCategory.addEventListener('change', (e) => {
                    updateBrushList(e.target.value);
                });
            }

            brushSelect.addEventListener('change', (e) => {
                currentBrush = e.target.value;
                updateBrushInfo();
            });
        }
    }

    function updateBrushList(category = 'all') {
        const brushSelect = document.getElementById('brushSelect');
        const brushCount = document.getElementById('brushCount');
        
        if (!brushSelect || !window.BRUSHES) return;

        const allBrushes = Object.keys(window.BRUSHES);
        let filteredBrushes = allBrushes;

        if (category !== 'all') {
            const categories = {
                'basic': allBrushes.filter(name => 
                    name.includes('Круглая') || name.includes('Квадратная') || 
                    name.includes('Мягкая') || name.includes('Карандаш') || 
                    name.includes('Щетина')
                ),
                'paint': allBrushes.filter(name => name.includes('Акварель')),
                'texture': allBrushes,
                'anime': allBrushes,
                '3d': allBrushes,
                'special': allBrushes
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

        if (filteredBrushes.length > 0) {
            currentBrush = filteredBrushes[0];
            brushSelect.value = currentBrush;
        }

        if (brushCount) {
            brushCount.textContent = `${filteredBrushes.length}+`;
        }

        updateBrushInfo();
    }

    function setupDrawingTools() {
        const advancedToolSelect = document.getElementById('advancedToolSelect');
        if (advancedToolSelect) {
            const drawingTools = [
                {value: 'line', text: '📏 Линия'},
                {value: 'rectangle', text: '⬜ Прямоугольник'},
                {value: 'rectangle_fill', text: '🟦 Залитый прямоугольник'},
                {value: 'circle', text: '⭕ Круг'},
                {value: 'circle_fill', text: '🔵 Залитый круг'},
                {value: 'gradient', text: '🌈 Градиент'}
            ];

            drawingTools.forEach(tool => {
                const option = document.createElement('option');
                option.value = tool.value;
                option.textContent = tool.text;
                advancedToolSelect.appendChild(option);
            });

            advancedToolSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    currentTool = e.target.value;
                    updateBrushInfo();
                }
            });
        }
    }

    function setupTools() {
        const toolButtons = document.querySelectorAll('.tool-btn, .mobile-tool-btn');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                toolButtons.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                currentTool = e.currentTarget.dataset.tool;
                updateBrushInfo();
                
                const mobileModal = document.getElementById('mobileModal');
                if (mobileModal) mobileModal.style.display = 'none';
            });
        });

        if (toolButtons[0]) toolButtons[0].classList.add('active');
    }

    function setupShapes() {
        const shapeButtons = document.querySelectorAll('.shape-btn');
        shapeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                currentTool = 'shape';
                currentShape = this.dataset.shape;
                updateBrushInfo();
                
                const shapeTool = document.querySelector('[data-tool="shape"]');
                if (shapeTool) {
                    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                    shapeTool.classList.add('active');
                }
            });
        });

        const stampSelect = document.getElementById('stampSelect');
        if (stampSelect) {
            stampSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    currentTool = 'shape';
                    currentShape = e.target.value;
                    updateBrushInfo();
                    
                    const shapeTool = document.querySelector('[data-tool="shape"]');
                    if (shapeTool) {
                        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                        shapeTool.classList.add('active');
                    }
                }
            });
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
                if (confirm('Очистить весь холст?')) {
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
                const quality = format === 'jpg' ? 0.92 : 0.95;
                
                canvas.toBlob(blob => {
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `artflow-${Date.now()}.${format}`;
                    a.click();
                    URL.revokeObjectURL(a.href);
                    console.log(`📤 Exported as ${format.toUpperCase()}`);
                }, mimeType, quality);
            });
        }

        // Undo/Redo
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        if (undoBtn) undoBtn.addEventListener('click', undo);
        if (redoBtn) redoBtn.addEventListener('click', redo);

        // Слои
        const newLayerBtn = document.getElementById('newLayerBtn');
        const deleteLayerBtn = document.getElementById('deleteLayerBtn');
        const mergeLayersBtn = document.getElementById('mergeLayersBtn');
        
        if (newLayerBtn && window.Layers && window.Layers.createLayer) {
            newLayerBtn.addEventListener('click', () => {
                window.Layers.createLayer();
                saveState();
            });
        }
        
        if (deleteLayerBtn && window.Layers && window.Layers.deleteLayer) {
            deleteLayerBtn.addEventListener('click', () => {
                if (window.Layers.deleteLayer(window.Layers.activeIndex)) {
                    saveState();
                }
            });
        }
        
        if (mergeLayersBtn && window.Layers && window.Layers.mergeVisibleLayers) {
            mergeLayersBtn.addEventListener('click', () => {
                if (window.Layers.mergeVisibleLayers()) {
                    saveState();
                }
            });
        }

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
            if (isDrawingTool(currentTool)) {
                brushInfo.textContent = `📐 ${currentTool} | ${getBrushSize()}px`;
            } else if (currentTool === 'shape') {
                brushInfo.textContent = `🔷 ${currentShape} | ${getBrushSize()}px`;
            } else {
                brushInfo.textContent = `${currentBrush} | ${getBrushSize()}px`;
            }
        }
    }

    // === ЗАПУСК ===

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
        getCurrentBrush: () => currentBrush,
        getCurrentColor,
        getBrushSize,
        getBrushOpacity
    };

    console.log('🚀 ArtFlow Pro FULLY WORKING version loaded');
})();

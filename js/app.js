/* Добавьте в css/style.css */

/* Мобильная адаптивность */
@media (max-width: 768px) {
  .app-container {
    padding: 5px;
    gap: 5px;
  }
  
  .toolbar {
    flex-direction: column;
    padding: 8px;
    gap: 6px;
  }
  
  .tool-group {
    width: 100%;
    justify-content: space-between;
  }
  
  .tool-btn, .brush-btn, .action-btn {
    min-width: 40px;
    min-height: 40px;
    font-size: 12px;
    padding: 6px 8px;
  }
  
  .canvas-container {
    border-radius: 8px;
  }
}

/* Мобильная панель инструментов */
.mobile-toolbar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(52, 73, 94, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 10px 15px;
  display: none;
  gap: 15px;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

.mobile-mode .mobile-toolbar {
  display: flex;
}

.mobile-toggle {
  background: #3498db;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* Модальное окно для мобильных */
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  z-index: 2000;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: #34495e;
  border-radius: 15px;
  padding: 20px;
  max-width: 90%;
  max-height: 80%;
  overflow-y: auto;
}

.mobile-tools-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.mobile-tool-btn {
  padding: 15px;
  background: #3498db;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Адаптивные контрольные группы */
@media (max-width: 768px) {
  .control-group {
    padding: 8px;
  }
  
  .tools-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 5px;
  }
  
  .tool-name {
    font-size: 10px;
  }
}

/* Улучшенная поддержка touch */
@media (hover: none) and (pointer: coarse) {
  .tool-btn:hover, .brush-btn:hover, .action-btn:hover {
    transform: none;
    background: #3498db;
  }
  
  .tool-btn:active, .brush-btn:active, .action-btn:active {
    background: #2980b9;
    transform: scale(0.95);
  }
}

// Главный скрипт - координация всех модулей
(function() {
    let currentTool = 'marker';
    
    function init() {
        // Выпадающее меню
        const dropdownBtn = document.getElementById('toolsDropdownBtn');
        const toolsMenu = document.getElementById('toolsMenu');
        
        if (dropdownBtn && toolsMenu) {
            dropdownBtn.addEventListener('click', () => {
                toolsMenu.classList.toggle('show');
            });
            
            // Закрываем меню при клике вне
            window.addEventListener('click', (e) => {
                if (!e.target.matches('.dropdown-btn')) {
                    if (toolsMenu.classList.contains('show')) {
                        toolsMenu.classList.remove('show');
                    }
                }
            });
            
            // Обработчики для инструментов в меню
            document.querySelectorAll('#toolsMenu button').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const tool = btn.getAttribute('data-tool');
                    const icon = btn.getAttribute('data-icon');
                    const toolName = btn.innerText;
                    
                    if (window.toolsAPI) {
                        window.toolsAPI.setTool(tool);
                        currentTool = tool;
                        updateActiveToolButton(tool);
                        dropdownBtn.innerHTML = `${icon} ${toolName} ▼`;
                        toolsMenu.classList.remove('show');
                    }
                });
            });
        }
        
        // Настройка слотов
        document.querySelectorAll('.slot-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const slotIndex = parseInt(btn.getAttribute('data-slot'));
                if (btn.innerHTML === '➕') {
                    // Сохраняем текущий инструмент в слот
                    const toolBtn = document.querySelector(`#toolsMenu button[data-tool="${currentTool}"]`);
                    if (toolBtn && window.toolsAPI) {
                        const icon = toolBtn.getAttribute('data-icon');
                        const toolName = toolBtn.innerText;
                        window.toolsAPI.saveToSlot(slotIndex, currentTool, icon);
                    }
                } else {
                    // Загружаем инструмент из слота
                    const slot = window.toolsAPI.getSlot(slotIndex);
                    if (slot && slot.tool) {
                        if (window.toolsAPI) {
                            window.toolsAPI.setTool(slot.tool);
                            currentTool = slot.tool;
                            updateActiveToolButton(slot.tool);
                            const toolBtn = document.querySelector(`#toolsMenu button[data-tool="${slot.tool}"]`);
                            if (toolBtn && dropdownBtn) {
                                const icon = toolBtn.getAttribute('data-icon');
                                const toolName = toolBtn.innerText;
                                dropdownBtn.innerHTML = `${icon} ${toolName} ▼`;
                            }
                        }
                    }
                }
            });
        });
        
        // Настройка цветов
        document.querySelectorAll('.color-swatch').forEach(sw => {
            sw.addEventListener('click', () => {
                const color = sw.getAttribute('data-color');
                if (window.drawingAPI) window.drawingAPI.setColor(color);
            });
        });
        
        document.getElementById('customColorPicker')?.addEventListener('input', (e) => {
            if (window.drawingAPI) window.drawingAPI.setColor(e.target.value);
        });
        
        // Настройка размера кисти
        document.getElementById('brushSize')?.addEventListener('input', (e) => {
            if (window.drawingAPI) window.drawingAPI.setBrushSize(parseInt(e.target.value));
        });
        
        // Очистка канваса
        document.getElementById('clearCanvasBtn')?.addEventListener('click', () => {
            if (window.drawingAPI) window.drawingAPI.clearCanvas();
        });
        
        function updateActiveToolButton(activeTool) {
            // Обновляем активный класс в меню
            document.querySelectorAll('#toolsMenu button').forEach(btn => {
                btn.classList.remove('active-tool');
                if (btn.getAttribute('data-tool') === activeTool) {
                    btn.classList.add('active-tool');
                }
            });
        }
        
        // Добавляем обработчики touch для canvas
        const canvas = document.getElementById('drawCanvas');
        
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const event = new MouseEvent('mousedown', {
                clientX: e.touches[0].clientX,
                clientY: e.touches[0].clientY
            });
            canvas.dispatchEvent(event);
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const event = new MouseEvent('mousemove', {
                clientX: e.touches[0].clientX,
                clientY: e.touches[0].clientY
            });
            canvas.dispatchEvent(event);
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const event = new MouseEvent('mouseup');
            canvas.dispatchEvent(event);
        });
        
        console.log('Script.js готов');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
// Главный скрипт - координация всех модулей
(function() {
    let currentTool = 'marker';
    let slots = [];
    let slotCount = 3;
    
    function init() {
        loadSlotsFromStorage();
        initSlotsUI();
        initSelectionPanel();
        
        // Выпадающее меню
        const dropdownBtn = document.getElementById('toolsDropdownBtn');
        const toolsMenu = document.getElementById('toolsMenu');
        
        if (dropdownBtn && toolsMenu) {
            dropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toolsMenu.classList.toggle('show');
            });
            
            window.addEventListener('click', (e) => {
                if (!e.target.matches('.dropdown-btn') && !e.target.closest('.dropdown-content')) {
                    toolsMenu.classList.remove('show');
                }
            });
            
            document.querySelectorAll('#toolsMenu button').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const tool = btn.getAttribute('data-tool');
                    const iconHtml = btn.querySelector('i') ? btn.querySelector('i').cloneNode(true) : null;
                    const toolName = btn.innerText.trim();
                    
                    if (window.toolsAPI) {
                        window.toolsAPI.setTool(tool);
                        currentTool = tool;
                        updateActiveToolButton(tool);
                        if (iconHtml) {
                            dropdownBtn.innerHTML = '';
                            dropdownBtn.appendChild(iconHtml);
                            dropdownBtn.appendChild(document.createTextNode(' ' + toolName + ' '));
                            const chevron = document.createElement('i');
                            chevron.className = 'fas fa-chevron-down';
                            dropdownBtn.appendChild(chevron);
                        }
                        toolsMenu.classList.remove('show');
                    }
                });
            });
        }
        
        // Настройки
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsOverlay = document.getElementById('settingsOverlay');
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');
        const applySettingsBtn = document.getElementById('applySettingsBtn');
        const slotCountInput = document.getElementById('slotCountInput');
        const boardCountInput = document.getElementById('boardCountInput');
        const selectionKeepModeCheckbox = document.getElementById('selectionKeepMode');
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                if (slotCountInput) slotCountInput.value = slotCount;
                if (boardCountInput && window.drawingAPI) boardCountInput.value = window.drawingAPI.getBoardCount();
                if (selectionKeepModeCheckbox && window.drawingAPI) selectionKeepModeCheckbox.checked = window.drawingAPI.getSelectionKeepMode();
                settingsOverlay.classList.add('show');
            });
        }
        
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => {
                settingsOverlay.classList.remove('show');
            });
        }
        
        if (applySettingsBtn) {
            applySettingsBtn.addEventListener('click', () => {
                if (slotCountInput) {
                    const newSlotCount = parseInt(slotCountInput.value);
                    if (newSlotCount >= 1 && newSlotCount <= 10) {
                        slotCount = newSlotCount;
                        saveSlotsToStorage();
                        initSlotsUI();
                    }
                }
                if (boardCountInput && window.drawingAPI) {
                    const newBoardCount = parseInt(boardCountInput.value);
                    if (newBoardCount >= 1 && newBoardCount <= 20) {
                        window.drawingAPI.setBoardCount(newBoardCount);
                    }
                }
                if (selectionKeepModeCheckbox && window.drawingAPI) {
                    window.drawingAPI.setSelectionKeepMode(selectionKeepModeCheckbox.checked);
                }
                settingsOverlay.classList.remove('show');
            });
        }
        
        settingsOverlay.addEventListener('click', (e) => {
            if (e.target === settingsOverlay) {
                settingsOverlay.classList.remove('show');
            }
        });
        
        // Навигация по бордам - ИСПРАВЛЕНО
        const prevBoardBtn = document.getElementById('prevBoardBtn');
        const nextBoardBtn = document.getElementById('nextBoardBtn');
        
        if (prevBoardBtn) {
            prevBoardBtn.addEventListener('click', () => {
                if (window.drawingAPI) {
                    const currentIndex = window.drawingAPI.getCurrentBoardIndex();
                    window.drawingAPI.switchToBoard(currentIndex - 1);
                }
            });
        }
        
        if (nextBoardBtn) {
            nextBoardBtn.addEventListener('click', () => {
                if (window.drawingAPI) {
                    const currentIndex = window.drawingAPI.getCurrentBoardIndex();
                    window.drawingAPI.switchToBoard(currentIndex + 1);
                }
            });
        }
        
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
        
        document.getElementById('brushSize')?.addEventListener('input', (e) => {
            if (window.drawingAPI) window.drawingAPI.setBrushSize(parseInt(e.target.value));
        });
        
        document.getElementById('clearCanvasBtn')?.addEventListener('click', () => {
            if (window.drawingAPI) window.drawingAPI.clearCanvas();
        });
        
        function updateActiveToolButton(activeTool) {
            document.querySelectorAll('#toolsMenu button').forEach(btn => {
                btn.classList.remove('active-tool');
                if (btn.getAttribute('data-tool') === activeTool) {
                    btn.classList.add('active-tool');
                }
            });
        }
        
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
    }
    
    function initSelectionPanel() {
        // Кнопка копировать
        document.getElementById('copySelectionBtn')?.addEventListener('click', () => {
            if (window.selectionAPI) {
                window.selectionAPI.copySelection();
            }
        });
        
        // Кнопка вырезать
        document.getElementById('cutSelectionBtn')?.addEventListener('click', () => {
            if (window.selectionAPI) {
                window.selectionAPI.cutSelection();
            }
        });
        
        // Кнопка вставить
        document.getElementById('pasteSelectionBtn')?.addEventListener('click', () => {
            if (window.selectionAPI) {
                window.selectionAPI.pasteSelection();
            }
        });
        
        // Выбор цветов градиента
        const gradientColor1 = document.getElementById('gradientColor1');
        const gradientColor2 = document.getElementById('gradientColor2');
        
        if (gradientColor1) {
            gradientColor1.addEventListener('input', (e) => {
                if (window.selectionAPI) {
                    const colors = window.selectionAPI.getGradientColors();
                    window.selectionAPI.setGradientColors(e.target.value, colors.color2);
                }
            });
        }
        
        if (gradientColor2) {
            gradientColor2.addEventListener('input', (e) => {
                if (window.selectionAPI) {
                    const colors = window.selectionAPI.getGradientColors();
                    window.selectionAPI.setGradientColors(colors.color1, e.target.value);
                }
            });
        }
        
        // Кнопка градиент
        document.getElementById('gradientSelectionBtn')?.addEventListener('click', () => {
            if (window.selectionAPI) {
                window.selectionAPI.applyGradient();
            }
        });
        
        // Кнопка заливка
        document.getElementById('fillSelectionBtn')?.addEventListener('click', () => {
            if (window.selectionAPI) {
                window.selectionAPI.applyFill();
            }
        });
        
        // Кнопка отменить захват
        document.getElementById('cancelSelectionBtn')?.addEventListener('click', () => {
            if (window.selectionAPI) {
                window.selectionAPI.clearSelection();
            }
        });
    }
    
    function initSlotsUI() {
        const slotContainer = document.getElementById('slotContainer');
        if (!slotContainer) return;
        
        slotContainer.innerHTML = '';
        for (let i = 0; i < slotCount; i++) {
            const slot = slots[i] || null;
            const slotBtn = document.createElement('button');
            slotBtn.className = 'slot-btn';
            slotBtn.setAttribute('data-slot', i);
            
            if (slot && slot.tool) {
                slotBtn.innerHTML = `<i class="${slot.icon}"></i>`;
                slotBtn.title = slot.toolName;
            } else {
                slotBtn.innerHTML = '<i class="fas fa-plus"></i>';
                slotBtn.title = 'Добавить инструмент';
            }
            
            slotBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleSlotClick(i);
            });
            
            slotBtn.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (slots[i]) {
                    slots[i] = null;
                    saveSlotsToStorage();
                    initSlotsUI();
                }
            });
            
            slotContainer.appendChild(slotBtn);
        }
    }
    
    function handleSlotClick(slotIndex) {
        const existingSlot = slots[slotIndex];
        const currentToolObj = getCurrentToolInfo();
        
        if (!existingSlot) {
            if (currentToolObj) {
                slots[slotIndex] = {
                    tool: currentTool,
                    icon: currentToolObj.icon,
                    toolName: currentToolObj.name
                };
                saveSlotsToStorage();
                initSlotsUI();
            }
        } else {
            if (window.toolsAPI) {
                window.toolsAPI.setTool(existingSlot.tool);
                currentTool = existingSlot.tool;
                updateDropdownButton(existingSlot.icon, existingSlot.toolName);
                updateActiveToolButton(existingSlot.tool);
            }
        }
    }
    
    function getCurrentToolInfo() {
        const activeBtn = document.querySelector(`#toolsMenu button[data-tool="${currentTool}"]`);
        if (activeBtn) {
            const iconElement = activeBtn.querySelector('i');
            return {
                icon: iconElement ? iconElement.className : 'fas fa-paintbrush',
                name: activeBtn.innerText.trim()
            };
        }
        return null;
    }
    
    function updateDropdownButton(iconClass, toolName) {
        const dropdownBtn = document.getElementById('toolsDropdownBtn');
        if (dropdownBtn) {
            dropdownBtn.innerHTML = '';
            const icon = document.createElement('i');
            icon.className = iconClass;
            dropdownBtn.appendChild(icon);
            dropdownBtn.appendChild(document.createTextNode(' ' + toolName + ' '));
            const chevron = document.createElement('i');
            chevron.className = 'fas fa-chevron-down';
            dropdownBtn.appendChild(chevron);
        }
    }
    
    function updateActiveToolButton(activeTool) {
        document.querySelectorAll('#toolsMenu button').forEach(btn => {
            btn.classList.remove('active-tool');
            if (btn.getAttribute('data-tool') === activeTool) {
                btn.classList.add('active-tool');
            }
        });
    }
    
    function saveSlotsToStorage() {
        localStorage.setItem('quickSlots', JSON.stringify(slots));
        localStorage.setItem('slotCount', slotCount);
    }
    
    function loadSlotsFromStorage() {
        const savedSlots = localStorage.getItem('quickSlots');
        const savedSlotCount = localStorage.getItem('slotCount');
        
        if (savedSlotCount) slotCount = parseInt(savedSlotCount);
        if (savedSlots) slots = JSON.parse(savedSlots);
        else slots = [];
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
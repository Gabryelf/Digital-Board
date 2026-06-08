// Инструмент выделения (прямоугольный)
(function() {
    let isSelecting = false;
    let selectionStart = null;
    let selectionEnd = null;
    let selectionImageData = null;
    let originalCanvasState = null;
    let isDragging = false;
    let dragOffsetX = 0, dragOffsetY = 0;
    let clipboardImage = null;
    let selectionBounds = null;
    
    const canvas = document.getElementById('drawCanvas');
    const ctx = canvas.getContext('2d');
    
    let gradientColor1 = '#000000';
    let gradientColor2 = '#ffffff';
    
    // Получить нормализованные границы выделения
    function getNormalizedBounds() {
        if (!selectionStart || !selectionEnd) return null;
        return {
            x: Math.min(selectionStart.x, selectionEnd.x),
            y: Math.min(selectionStart.y, selectionEnd.y),
            width: Math.abs(selectionEnd.x - selectionStart.x),
            height: Math.abs(selectionEnd.y - selectionStart.y)
        };
    }
    
    function startSelection(e) {
        const coords = getCanvasCoordinates(e);
        if (!coords) return;
        
        // Очищаем предыдущее выделение
        clearSelection();
        
        isSelecting = true;
        selectionStart = { x: coords.x, y: coords.y };
        selectionEnd = { x: coords.x, y: coords.y };
        
        // Сохраняем состояние канваса
        originalCanvasState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        canvas.style.cursor = 'crosshair';
    }
    
    function updateSelection(e) {
        if (!isSelecting) return;
        
        const coords = getCanvasCoordinates(e);
        if (!coords) return;
        
        selectionEnd = { x: coords.x, y: coords.y };
        
        // Перерисовываем
        if (originalCanvasState) {
            ctx.putImageData(originalCanvasState, 0, 0);
            drawSelectionBorder();
        }
    }
    
    function drawSelectionBorder() {
        const bounds = getNormalizedBounds();
        if (!bounds || bounds.width < 2 || bounds.height < 2) return;
        
        ctx.save();
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        ctx.setLineDash([]);
        ctx.restore();
    }
    
    function endSelection(e) {
        if (!isSelecting) return;
        
        isSelecting = false;
        const bounds = getNormalizedBounds();
        
        if (bounds && bounds.width > 5 && bounds.height > 5) {
            selectionBounds = bounds;
            selectionImageData = ctx.getImageData(bounds.x, bounds.y, bounds.width, bounds.height);
            showPanel();
        } else {
            clearSelection();
        }
        
        canvas.style.cursor = 'crosshair';
    }
    
    function copySelection() {
        if (!selectionImageData) return;
        
        clipboardImage = ctx.createImageData(selectionImageData.width, selectionImageData.height);
        clipboardImage.data.set(selectionImageData.data);
        hidePanel();
    }
    
    function cutSelection() {
        if (!selectionBounds || !selectionImageData) return;
        
        clipboardImage = ctx.createImageData(selectionImageData.width, selectionImageData.height);
        clipboardImage.data.set(selectionImageData.data);
        
        ctx.fillStyle = window.drawingAPI.getCurrentBgColor();
        ctx.fillRect(selectionBounds.x, selectionBounds.y, selectionBounds.width, selectionBounds.height);
        
        window.drawingAPI.saveBoard();
        clearSelection();
        hidePanel();
    }
    
    function pasteSelection() {
        if (!clipboardImage) return;
        
        clearSelection();
        
        const x = (canvas.width - clipboardImage.width) / 2;
        const y = (canvas.height - clipboardImage.height) / 2;
        
        ctx.putImageData(clipboardImage, x, y);
        
        selectionBounds = { x: x, y: y, width: clipboardImage.width, height: clipboardImage.height };
        selectionImageData = ctx.getImageData(x, y, clipboardImage.width, clipboardImage.height);
        originalCanvasState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        drawSelectionBorder();
        
        window.drawingAPI.saveBoard();
        showPanel();
    }
    
    function startDrag(e) {
        if (!selectionBounds) return false;
        
        const coords = getCanvasCoordinates(e);
        if (!coords) return false;
        
        if (coords.x >= selectionBounds.x && coords.x <= selectionBounds.x + selectionBounds.width &&
            coords.y >= selectionBounds.y && coords.y <= selectionBounds.y + selectionBounds.height) {
            
            isDragging = true;
            dragOffsetX = selectionBounds.x - coords.x;
            dragOffsetY = selectionBounds.y - coords.y;
            
            originalCanvasState = ctx.getImageData(0, 0, canvas.width, canvas.height);
            canvas.style.cursor = 'move';
            e.preventDefault();
            return true;
        }
        return false;
    }
    
    function updateDrag(e) {
        if (!isDragging || !selectionImageData) return;
        
        const coords = getCanvasCoordinates(e);
        if (!coords) return;
        
        ctx.putImageData(originalCanvasState, 0, 0);
        
        const newX = coords.x + dragOffsetX;
        const newY = coords.y + dragOffsetY;
        
        ctx.putImageData(selectionImageData, newX, newY);
        
        selectionBounds.x = newX;
        selectionBounds.y = newY;
        
        drawSelectionBorder();
        originalCanvasState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        e.preventDefault();
    }
    
    function endDrag(e) {
        if (isDragging) {
            isDragging = false;
            canvas.style.cursor = 'crosshair';
            
            selectionImageData = ctx.getImageData(selectionBounds.x, selectionBounds.y, 
                selectionBounds.width, selectionBounds.height);
            
            window.drawingAPI.saveBoard();
        }
    }
    
    function applyGradient() {
        if (!selectionBounds) return;
        
        const gradient = ctx.createLinearGradient(selectionBounds.x, selectionBounds.y, 
            selectionBounds.x + selectionBounds.width, selectionBounds.y + selectionBounds.height);
        gradient.addColorStop(0, gradientColor1);
        gradient.addColorStop(1, gradientColor2);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(selectionBounds.x, selectionBounds.y, selectionBounds.width, selectionBounds.height);
        
        window.drawingAPI.saveBoard();
        clearSelection();
        hidePanel();
    }
    
    function applyFill() {
        if (!selectionBounds) return;
        
        ctx.fillStyle = window.drawingAPI.getCurrentColor();
        ctx.fillRect(selectionBounds.x, selectionBounds.y, selectionBounds.width, selectionBounds.height);
        
        window.drawingAPI.saveBoard();
        clearSelection();
        hidePanel();
    }
    
    function clearSelection() {
        if (originalCanvasState && !isDragging) {
            ctx.putImageData(originalCanvasState, 0, 0);
        }
        selectionStart = null;
        selectionEnd = null;
        selectionBounds = null;
        selectionImageData = null;
        originalCanvasState = null;
        isSelecting = false;
        isDragging = false;
        hidePanel();
    }
    
    function showPanel() {
        const panel = document.getElementById('selectionPanel');
        if (panel) panel.classList.add('show');
    }
    
    function hidePanel() {
        const panel = document.getElementById('selectionPanel');
        if (panel) panel.classList.remove('show');
    }
    
    function hasSelection() {
        return selectionBounds !== null;
    }
    
    function getIsDragging() {
        return isDragging;
    }
    
    function setGradientColors(color1, color2) {
        gradientColor1 = color1;
        gradientColor2 = color2;
    }
    
    function getGradientColors() {
        return { color1: gradientColor1, color2: gradientColor2 };
    }
    
    function getCanvasCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        return {
            x: Math.min(Math.max(0, (clientX - rect.left) * scaleX), canvas.width),
            y: Math.min(Math.max(0, (clientY - rect.top) * scaleY), canvas.height)
        };
    }
    
    window.selectionAPI = {
        startSelection: startSelection,
        updateSelection: updateSelection,
        endSelection: endSelection,
        clearSelection: clearSelection,
        copySelection: copySelection,
        cutSelection: cutSelection,
        pasteSelection: pasteSelection,
        applyGradient: applyGradient,
        applyFill: applyFill,
        startDrag: startDrag,
        updateDrag: updateDrag,
        endDrag: endDrag,
        setGradientColors: setGradientColors,
        getGradientColors: getGradientColors,
        hasSelection: hasSelection,
        getIsDragging: getIsDragging
    };
    
    console.log('Selection API loaded');
})();
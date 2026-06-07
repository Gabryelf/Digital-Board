// Базовые функции рисования
(function() {
    const canvas = document.getElementById('drawCanvas');
    const ctx = canvas.getContext('2d');
    
    let currentColor = '#000000';
    let currentBrushSize = 6;
    let isDarkMode = false;
    let currentBgColor = '#ffffff';
    
    // Установка размеров канваса
    canvas.width = 1000;
    canvas.height = 800;
    
    // Устанавливаем белый фон
    ctx.fillStyle = currentBgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    function applyBrushSettings() {
        ctx.strokeStyle = currentColor;
        ctx.fillStyle = currentColor;
        ctx.lineWidth = currentBrushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }
    applyBrushSettings();
    
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
        
        let canvasX = (clientX - rect.left) * scaleX;
        let canvasY = (clientY - rect.top) * scaleY;
        canvasX = Math.min(Math.max(0, canvasX), canvas.width);
        canvasY = Math.min(Math.max(0, canvasY), canvas.height);
        return { x: canvasX, y: canvasY };
    }
    
    function clearCanvas() {
        ctx.fillStyle = currentBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        applyBrushSettings();
    }
    
    function setColor(color) {
        currentColor = color;
        applyBrushSettings();
        const customPicker = document.getElementById('customColorPicker');
        if (customPicker) customPicker.value = color;
    }
    
    function setBrushSize(size) {
        currentBrushSize = size;
        const sizeValue = document.getElementById('sizeValue');
        const brushSize = document.getElementById('brushSize');
        if (sizeValue) sizeValue.innerText = size + 'px';
        if (brushSize) brushSize.value = size;
        applyBrushSettings();
    }
    
    function setCanvasBackground(isDark) {
        isDarkMode = isDark;
        currentBgColor = isDark ? '#1e1e1e' : '#ffffff';
        
        // Сохраняем текущий рисунок
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Меняем фон
        ctx.fillStyle = currentBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Восстанавливаем рисунок, но заменяем белый цвет на фоновый для ластика
        const imageDataArray = imageData.data;
        for (let i = 0; i < imageDataArray.length; i += 4) {
            // Если пиксель был белым (или очень близким к белому) в светлой теме
            if (!isDark && imageDataArray[i] === 255 && imageDataArray[i+1] === 255 && imageDataArray[i+2] === 255) {
                // Оставляем как есть (белый)
                continue;
            } else if (isDark && imageDataArray[i] === 30 && imageDataArray[i+1] === 30 && imageDataArray[i+2] === 30) {
                // Оставляем как есть (темный)
                continue;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        applyBrushSettings();
    }
    
    function getEraserColor() {
        return currentBgColor;
    }
    
    function getCanvas() { return canvas; }
    function getContext() { return ctx; }
    function getCurrentColor() { return currentColor; }
    function getCurrentBrushSize() { return currentBrushSize; }
    function getIsDarkMode() { return isDarkMode; }
    function getCurrentBgColor() { return currentBgColor; }
    
    // Экспорт API
    window.drawingAPI = {
        clearCanvas: clearCanvas,
        setColor: setColor,
        setBrushSize: setBrushSize,
        setCanvasBackground: setCanvasBackground,
        getCanvas: getCanvas,
        getContext: getContext,
        getCurrentColor: getCurrentColor,
        getCurrentBrushSize: getCurrentBrushSize,
        getIsDarkMode: getIsDarkMode,
        getCurrentBgColor: getCurrentBgColor,
        getEraserColor: getEraserColor,
        applyBrushSettings: applyBrushSettings
    };
    
    console.log('Drawing.js готов');
})();
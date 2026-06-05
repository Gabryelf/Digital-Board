// Рисование на канвасе
(function() {
    const canvas = document.getElementById('drawCanvas');
    const ctx = canvas.getContext('2d');
    
    let drawing = false;
    let currentColor = '#000000';
    let currentBrushSize = 6;
    let lastX = 0;
    let lastY = 0;
    
    // Установка размеров канваса
    canvas.width = 1000;
    canvas.height = 800;
    
    // Устанавливаем белый фон
    ctx.fillStyle = '#ffffff';
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
    
    function startDrawing(e) {
        e.preventDefault();
        const coords = getCanvasCoordinates(e);
        if (!coords) return;
        drawing = true;
        lastX = coords.x;
        lastY = coords.y;
        
        ctx.beginPath();
        ctx.arc(lastX, lastY, currentBrushSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
    }
    
    function draw(e) {
        if (!drawing) return;
        e.preventDefault();
        const coords = getCanvasCoordinates(e);
        if (!coords) return;
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        
        lastX = coords.x;
        lastY = coords.y;
    }
    
    function stopDrawing() {
        drawing = false;
    }
    
    function clearCanvas() {
        // Очищаем текущим фоном (белый или чёрный)
        const currentBg = document.body.classList.contains('dark-mode') ? '#1e1e1e' : '#ffffff';
        ctx.fillStyle = currentBg;
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
    
    // Функция смены фона канваса
    function setCanvasBackground(isDark) {
        const newBgColor = isDark ? '#1e1e1e' : '#ffffff';
        
        // Сохраняем рисунок
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Меняем фон
        ctx.fillStyle = newBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Восстанавливаем рисунок
        ctx.putImageData(imageData, 0, 0);
        
        applyBrushSettings();
        console.log('Фон изменён на:', newBgColor);
    }
    
    // Добавляем обработчики
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Настройка UI
    document.querySelectorAll('.color-swatch').forEach(sw => {
        sw.addEventListener('click', () => setColor(sw.getAttribute('data-color')));
    });
    document.getElementById('customColorPicker')?.addEventListener('input', (e) => setColor(e.target.value));
    document.getElementById('brushSize')?.addEventListener('input', (e) => setBrushSize(parseInt(e.target.value)));
    document.getElementById('clearCanvasBtn')?.addEventListener('click', () => clearCanvas());
    
    // Экспорт API
    window.drawingAPI = {
        clearCanvas: clearCanvas,
        setColor: setColor,
        setBrushSize: setBrushSize,
        setCanvasBackground: setCanvasBackground
    };
    
    console.log('Drawing.js готов');
})();
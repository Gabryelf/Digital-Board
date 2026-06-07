// Базовые функции рисования
(function() {
    const canvas = document.getElementById('drawCanvas');
    const ctx = canvas.getContext('2d');
    
    let currentColor = '#000000';
    let currentBrushSize = 6;
    let isDarkMode = false;
    let currentBgColor = '#ffffff';
    let boards = [];
    let currentBoardIndex = 0;
    let boardCount = 5;
    
    // Установка размеров канваса
    canvas.width = 1000;
    canvas.height = 800;
    
    function initBoards(count) {
        boards = [];
        for (let i = 0; i < count; i++) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.fillStyle = currentBgColor;
            tempCtx.fillRect(0, 0, canvas.width, canvas.height);
            boards.push(tempCanvas);
        }
        currentBoardIndex = 0;
        loadBoard(currentBoardIndex);
    }
    
    function loadBoard(index) {
        if (index >= 0 && index < boards.length) {
            const board = boards[index];
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(board, 0, 0);
            applyBrushSettings();
            updateBoardCounter();
        }
    }
    
    function saveCurrentBoard() {
        if (boards[currentBoardIndex]) {
            const tempCtx = boards[currentBoardIndex].getContext('2d');
            tempCtx.clearRect(0, 0, canvas.width, canvas.height);
            tempCtx.drawImage(canvas, 0, 0);
        }
    }
    
    function switchToBoard(index) {
        saveCurrentBoard();
        currentBoardIndex = Math.max(0, Math.min(index, boards.length - 1));
        loadBoard(currentBoardIndex);
    }
    
    function updateBoardCounter() {
        const counter = document.getElementById('boardCounter');
        if (counter) {
            counter.textContent = `${currentBoardIndex + 1} / ${boards.length}`;
        }
    }
    
    function setBoardCount(count) {
        const oldIndex = currentBoardIndex;
        const oldBoards = [...boards];
        boardCount = Math.max(1, Math.min(20, count));
        
        const newBoards = [];
        for (let i = 0; i < boardCount; i++) {
            if (i < oldBoards.length) {
                newBoards.push(oldBoards[i]);
            } else {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.fillStyle = currentBgColor;
                tempCtx.fillRect(0, 0, canvas.width, canvas.height);
                newBoards.push(tempCanvas);
            }
        }
        
        boards = newBoards;
        currentBoardIndex = Math.min(oldIndex, boardCount - 1);
        loadBoard(currentBoardIndex);
    }
    
    // Функция заливки
    function floodFill(startX, startY, fillColor) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        const startPos = (startY * canvas.width + startX) * 4;
        const startR = data[startPos];
        const startG = data[startPos + 1];
        const startB = data[startPos + 2];
        const startA = data[startPos + 3];
        
        const fillR = parseInt(fillColor.slice(1, 3), 16);
        const fillG = parseInt(fillColor.slice(3, 5), 16);
        const fillB = parseInt(fillColor.slice(5, 7), 16);
        
        if (startR === fillR && startG === fillG && startB === fillB) return;
        
        const stack = [{x: startX, y: startY}];
        const visited = new Set();
        
        while (stack.length > 0) {
            const {x, y} = stack.pop();
            const pos = (y * canvas.width + x) * 4;
            
            if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
            
            const key = `${x},${y}`;
            if (visited.has(key)) continue;
            
            if (data[pos] === startR && data[pos+1] === startG && data[pos+2] === startB && data[pos+3] === startA) {
                data[pos] = fillR;
                data[pos+1] = fillG;
                data[pos+2] = fillB;
                visited.add(key);
                
                stack.push({x: x+1, y});
                stack.push({x: x-1, y});
                stack.push({x, y: y+1});
                stack.push({x, y: y-1});
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
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
        saveCurrentBoard();
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
        if (sizeValue) sizeValue.innerText = size;
        if (brushSize) brushSize.value = size;
        applyBrushSettings();
    }
    
    function setCanvasBackground(isDark) {
        isDarkMode = isDark;
        currentBgColor = isDark ? '#1e1e1e' : '#ffffff';
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = currentBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const imageDataArray = imageData.data;
        for (let i = 0; i < imageDataArray.length; i += 4) {
            if (!isDark && imageDataArray[i] === 255 && imageDataArray[i+1] === 255 && imageDataArray[i+2] === 255) {
                continue;
            } else if (isDark && imageDataArray[i] === 30 && imageDataArray[i+1] === 30 && imageDataArray[i+2] === 30) {
                continue;
            } else {
                imageDataArray[i] = isDark ? Math.min(255, imageDataArray[i] + 30) : Math.max(0, imageDataArray[i] - 30);
                imageDataArray[i+1] = isDark ? Math.min(255, imageDataArray[i+1] + 30) : Math.max(0, imageDataArray[i+1] - 30);
                imageDataArray[i+2] = isDark ? Math.min(255, imageDataArray[i+2] + 30) : Math.max(0, imageDataArray[i+2] - 30);
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        applyBrushSettings();
        saveCurrentBoard();
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
    function floodFillArea(x, y) { floodFill(x, y, currentColor); }
    function saveBoard() { saveCurrentBoard(); }
    
    initBoards(boardCount);
    
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
        applyBrushSettings: applyBrushSettings,
        floodFill: floodFillArea,
        saveBoard: saveBoard,
        switchToBoard: switchToBoard,
        setBoardCount: setBoardCount,
        getBoardCount: () => boards.length,
        getCurrentBoardIndex: () => currentBoardIndex
    };
    
})();
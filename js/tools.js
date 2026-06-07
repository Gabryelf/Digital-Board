// Инструменты рисования
(function() {
    let currentTool = 'marker';
    let drawing = false;
    let startX = 0, startY = 0;
    let lastX = 0, lastY = 0;
    let savedImageData = null;
    
    function getDrawingAPI() {
        return window.drawingAPI;
    }
    
    function drawMarker(e) {
        if (!drawing) return;
        const api = getDrawingAPI();
        const ctx = api.getContext();
        const coords = getCanvasCoordinates(e, api);
        if (!coords) return;
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        
        lastX = coords.x;
        lastY = coords.y;
        api.saveBoard();
    }
    
    function drawEraser(e) {
        if (!drawing) return;
        const api = getDrawingAPI();
        const ctx = api.getContext();
        const coords = getCanvasCoordinates(e, api);
        if (!coords) return;
        
        const originalColor = ctx.strokeStyle;
        const originalSize = ctx.lineWidth;
        
        ctx.strokeStyle = api.getEraserColor();
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = api.getEraserColor();
        ctx.fill();
        
        ctx.strokeStyle = originalColor;
        ctx.lineWidth = originalSize;
        
        lastX = coords.x;
        lastY = coords.y;
        api.saveBoard();
    }
    
    function performFill(e) {
        const api = getDrawingAPI();
        const coords = getCanvasCoordinates(e, api);
        if (coords) {
            api.floodFill(Math.floor(coords.x), Math.floor(coords.y));
            api.saveBoard();
        }
    }
    
    function startShape(e, type) {
        const api = getDrawingAPI();
        const ctx = api.getContext();
        const coords = getCanvasCoordinates(e, api);
        if (!coords) return;
        
        drawing = true;
        startX = coords.x;
        startY = coords.y;
        
        savedImageData = ctx.getImageData(0, 0, api.getCanvas().width, api.getCanvas().height);
    }
    
    function drawLine(e) {
        if (!drawing) return;
        const api = getDrawingAPI();
        const ctx = api.getContext();
        const coords = getCanvasCoordinates(e, api);
        if (!coords) return;
        
        ctx.putImageData(savedImageData, 0, 0);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
    }
    
    function drawRectangle(e) {
        if (!drawing) return;
        const api = getDrawingAPI();
        const ctx = api.getContext();
        const coords = getCanvasCoordinates(e, api);
        if (!coords) return;
        
        ctx.putImageData(savedImageData, 0, 0);
        const width = coords.x - startX;
        const height = coords.y - startY;
        ctx.strokeRect(startX, startY, width, height);
    }
    
    function drawCircle(e) {
        if (!drawing) return;
        const api = getDrawingAPI();
        const ctx = api.getContext();
        const coords = getCanvasCoordinates(e, api);
        if (!coords) return;
        
        ctx.putImageData(savedImageData, 0, 0);
        const radius = Math.sqrt(Math.pow(coords.x - startX, 2) + Math.pow(coords.y - startY, 2));
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    function drawTriangle(e) {
        if (!drawing) return;
        const api = getDrawingAPI();
        const ctx = api.getContext();
        const coords = getCanvasCoordinates(e, api);
        if (!coords) return;
        
        ctx.putImageData(savedImageData, 0, 0);
        const width = coords.x - startX;
        const height = coords.y - startY;
        
        ctx.beginPath();
        ctx.moveTo(startX + width / 2, startY);
        ctx.lineTo(startX, startY + height);
        ctx.lineTo(startX + width, startY + height);
        ctx.closePath();
        ctx.stroke();
    }
    
    function finishDrawing(e) {
        if (drawing && savedImageData) {
            const api = getDrawingAPI();
            api.saveBoard();
        }
        drawing = false;
        savedImageData = null;
    }
    
    function drawFree(e) {
        if (currentTool === 'marker') drawMarker(e);
        else if (currentTool === 'eraser') drawEraser(e);
    }
    
    function startFreeDrawing(e) {
        drawing = true;
        const api = getDrawingAPI();
        const coords = getCanvasCoordinates(e, api);
        if (!coords) return;
        
        lastX = coords.x;
        lastY = coords.y;
        
        const ctx = api.getContext();
        
        if (currentTool === 'marker') {
            ctx.beginPath();
            ctx.arc(lastX, lastY, api.getCurrentBrushSize() / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
        } else if (currentTool === 'eraser') {
            ctx.beginPath();
            ctx.arc(lastX, lastY, api.getCurrentBrushSize() / 2, 0, Math.PI * 2);
            ctx.fillStyle = api.getEraserColor();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.strokeStyle = api.getEraserColor();
        }
    }
    
    function startShapeWrapper(e) {
        if (currentTool === 'line') startShape(e, 'line');
        else if (currentTool === 'rect') startShape(e, 'rect');
        else if (currentTool === 'circle') startShape(e, 'circle');
        else if (currentTool === 'triangle') startShape(e, 'triangle');
    }
    
    function drawShapeWrapper(e) {
        if (currentTool === 'line') drawLine(e);
        else if (currentTool === 'rect') drawRectangle(e);
        else if (currentTool === 'circle') drawCircle(e);
        else if (currentTool === 'triangle') drawTriangle(e);
    }
    
    function getCanvasCoordinates(e, api) {
        const canvas = api.getCanvas();
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
    
    function setTool(tool) {
        currentTool = tool;
        const canvas = getDrawingAPI().getCanvas();
        
        canvas.removeEventListener('mousedown', startFreeDrawing);
        canvas.removeEventListener('mousemove', drawFree);
        canvas.removeEventListener('mousedown', startShapeWrapper);
        canvas.removeEventListener('mousemove', drawShapeWrapper);
        canvas.removeEventListener('click', performFill);
        
        if (currentTool === 'fill') {
            canvas.addEventListener('click', performFill);
        } else if (currentTool === 'marker' || currentTool === 'eraser') {
            canvas.addEventListener('mousedown', startFreeDrawing);
            canvas.addEventListener('mousemove', drawFree);
        } else {
            canvas.addEventListener('mousedown', startShapeWrapper);
            canvas.addEventListener('mousemove', drawShapeWrapper);
        }
        
        canvas.addEventListener('mouseup', finishDrawing);
        canvas.addEventListener('mouseleave', finishDrawing);
    }
    
    window.toolsAPI = {
        setTool: setTool,
        getCurrentTool: () => currentTool
    };
    
})();
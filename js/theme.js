// Управление темой
(function() {
    function init() {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        const body = document.body;
        
        function setTheme(isDark) {
            if (isDark) {
                body.classList.add('dark-mode');
                if (themeIcon) themeIcon.src = 'assets/images/sun.png';
                localStorage.setItem('darkMode', 'enabled');
            } else {
                body.classList.remove('dark-mode');
                if (themeIcon) themeIcon.src = 'assets/images/moon.png';
                localStorage.setItem('darkMode', 'disabled');
            }
            
            if (window.drawingAPI && window.drawingAPI.setCanvasBackground) {
                window.drawingAPI.setCanvasBackground(isDark);
            }
            
            if (window.toolsAPI && window.toolsAPI.updateEraserColor) {
                window.toolsAPI.updateEraserColor();
            }
        }
        
        if (localStorage.getItem('darkMode') === 'enabled') {
            setTheme(true);
        }
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                setTheme(!body.classList.contains('dark-mode'));
            });
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
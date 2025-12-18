(()=> {
    const toggleBtn = document.getElementById('modeToggle');

    if (!toggleBtn) return;

    function applyTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            toggleBtn.textContent = 'Switch to Light Mode';
            localStorage.setItem('darkMode', 'true');
        } else {
            document.body.classList.remove('dark-mode');
            toggleBtn.textContent = 'Switch to Dark Mode';
            localStorage.setItem('darkMode', 'false');
        }
    }

    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    applyTheme(isDarkMode);

    toggleBtn.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-mode');
        applyTheme(!isDark);
    });
})();
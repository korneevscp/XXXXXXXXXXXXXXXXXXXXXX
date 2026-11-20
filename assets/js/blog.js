(function () {
    var saved = null;
    try { saved = localStorage.getItem('portfolio-theme'); } catch (e) {}
    if (saved === 'light') document.body.classList.add('theme-light');
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
        var isLight = document.body.classList.toggle('theme-light');
        try { localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark'); } catch (e) {}
    });
})();

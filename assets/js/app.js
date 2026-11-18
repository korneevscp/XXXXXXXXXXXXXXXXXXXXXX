/* ── THEME TOGGLE ────────────────────────────────────────────────── */
(function () {
    const saved = localStorage.getItem('portfolio-theme');
    if (saved === 'light') document.body.classList.add('theme-light');
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
        toggle.addEventListener('click', function () {
            const isLight = document.body.classList.toggle('theme-light');
            localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
        });
    }
})();

/* ── PRELOADER — Matrix canvas + logo connexion ─────────────────── */
(function () {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    const isLight = document.body.classList.contains('theme-light');

    // 1. Fond adapté au thème
    preloader.style.background = isLight ? '#f0f4ff' : '#030712';

    // 2. Filtre logo adapté au thème (JS = fiable, pas de cascade CSS)
    const logo = preloader.querySelector('.pl-logo');
    if (logo) {
        logo.style.filter = isLight ? 'invert(1)' : '';
    }

    // 3. Canvas Matrix — couleurs adaptées au thème
    const canvas = document.getElementById('preloader-canvas');
    let timerId = null;

    if (canvas && window.innerWidth >= 768) {
        const ctx = canvas.getContext('2d');
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;

        const COL  = 16;
        const cols = Math.ceil(canvas.width / COL);
        const drops = new Float32Array(cols).map(
            () => (Math.random() * -(canvas.height / COL)) | 0
        );

        const CHARS = '0123456789ABCDEFabcdef><!=|\\/#';

        // Couleurs selon thème
        const TRAIL = isLight ? 'rgba(240,244,255,0.22)' : 'rgba(3,7,18,0.16)';
        const CHAR  = isLight ? '#1650d4' : '#2660ff';
        const LEAD  = isLight ? '#0a2080' : '#c8d8ff';

        function drawMatrix() {
            ctx.fillStyle = TRAIL;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = '13px "Space Mono", monospace';

            for (let i = 0; i < cols; i++) {
                const ch  = CHARS[(Math.random() * CHARS.length) | 0];
                const y   = drops[i] * COL;
                ctx.fillStyle = Math.random() > 0.92 ? LEAD : CHAR;
                ctx.fillText(ch, i * COL, y);

                if (y > canvas.height && Math.random() > 0.972) drops[i] = 0;
                drops[i] += 0.7;
            }
        }

        drawMatrix();
        timerId = setInterval(drawMatrix, 38);
    }

    // 4. Dismiss : fade puis masquer
    const HOLD = window.innerWidth >= 992 ? 560 : 260;
    setTimeout(function () {
        preloader.classList.add('pl-fade');
        setTimeout(function () {
            preloader.style.display = 'none';
            if (timerId) clearInterval(timerId);
        }, 380);
    }, HOLD);
})();

/* ── HOME — Particle network canvas ─────────────────────────────── */
(function () {
    const section = document.getElementById('home');
    if (!section) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'home-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    section.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let W, H, pts, rafId;

    const N      = 55;
    const THRESH = 135;
    const SPEED  = 0.3;

    const C1 = '38,96,255';
    const C2 = '14,165,233';

    function isLight() {
        return document.body.classList.contains('theme-light');
    }

    function resize() {
        const w = section.offsetWidth, h = section.offsetHeight;
        W = canvas.width  = w;
        H = canvas.height = h;
        if (!pts) init();
    }

    function init() {
        pts = [];
        for (let i = 0; i < N; i++) {
            pts.push({
                x:  Math.random() * W,
                y:  Math.random() * H,
                vx: (Math.random() - 0.5) * SPEED * 2,
                vy: (Math.random() - 0.5) * SPEED * 2,
                r:  Math.random() * 1.4 + 0.9,
                c:  Math.random() > 0.55 ? C1 : C2,
            });
        }
    }

    function tick() {
        ctx.clearRect(0, 0, W, H);

        const light       = isLight();
        const dotAlpha    = light ? 0.85 : 0.60;
        const lineAlphaK  = light ? 0.55 : 0.22;

        for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
                const a = pts[i], b = pts[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const d2 = dx * dx + dy * dy;
                if (d2 < THRESH * THRESH) {
                    const alpha = (1 - Math.sqrt(d2) / THRESH) * lineAlphaK;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(${a.c},${alpha.toFixed(3)})`;
                    ctx.lineWidth = light ? 1.1 : 0.7;
                    ctx.stroke();
                }
            }
        }

        for (const p of pts) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, light ? p.r * 1.3 : p.r, 0, 6.283);
            ctx.fillStyle = `rgba(${p.c},${dotAlpha})`;
            ctx.fill();

            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx = -p.vx;
            if (p.y < 0 || p.y > H) p.vy = -p.vy;
        }

        rafId = requestAnimationFrame(tick);
    }

    // Pause when tab is hidden (save CPU)
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            cancelAnimationFrame(rafId);
        } else {
            rafId = requestAnimationFrame(tick);
        }
    });

    window.addEventListener('resize', resize, { passive: true });
    // Delay canvas start so it doesn't block the initial paint
    setTimeout(function () { resize(); tick(); }, 120);
})();

/* ── NAVBAR SCROLL + SCROLL SPY ─────────────────────────────────── */
(function () {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', function () {
        navbar.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });

    const navLinks = Array.from(navbar.querySelectorAll('a.nav-link[href^="#"]'));
    if (!navLinks.length) return;

    const sectionIds = navLinks.map(a => a.getAttribute('href').slice(1));
    const sections   = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    function setActive(id) {
        navLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) setActive(entry.target.id);
        });
    }, {
        rootMargin: '-80px 0px -55% 0px',
        threshold: 0
    });

    sections.forEach(s => observer.observe(s));
})();

/* ── AOS ─────────────────────────────────────────────────────────── */
(function () {
    function initAOS() { AOS.init({ duration: 800, once: true }); }
    if ('requestIdleCallback' in window) {
        requestIdleCallback(initAOS, { timeout: 1000 });
    } else {
        setTimeout(initAOS, 150);
    }
})();

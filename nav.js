(() => {
    const nav = document.querySelector('.site-nav');
    const toggle = document.querySelector('.site-nav-toggle');
    if (!nav || !toggle) return;

    function closeMenu() {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('.site-nav-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeMenu();
    });

    const sections = Array.from(nav.querySelectorAll('.site-nav-link'))
        .map(link => {
            const target = document.querySelector(link.getAttribute('href'));
            return target ? { link, target } : null;
        })
        .filter(Boolean);

    if (sections.length && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const match = sections.find(s => s.target === entry.target);
                if (match) match.link.classList.toggle('is-active', entry.isIntersecting);
            });
        }, { rootMargin: '-40% 0px -40% 0px' });

        sections.forEach(s => observer.observe(s.target));
    }
})();

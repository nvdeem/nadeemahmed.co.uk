(() => {
    const grid = document.querySelector('.projects-grid');
    const overlay = document.querySelector('.overlay');
    const overlayPanel = document.querySelector('.overlay-panel');
    const overlayContent = document.querySelector('#overlay-content');
    const overlayBackdrop = document.querySelector('.overlay-backdrop');
    const closeBtn = document.querySelector('.overlay-close');
    let lastFocused = null;

    function lockIcon() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.innerHTML = '<rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>';
        return svg;
    }

    function createChip(text, isLock) {
        const chip = document.createElement('span');
        chip.className = 'project-card-chip';
        if (isLock) {
            chip.appendChild(lockIcon());
        }
        const label = document.createElement('span');
        label.textContent = text;
        chip.appendChild(label);
        return chip;
    }

    function renderCard(project) {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'project-card';
        card.setAttribute('data-cursor-invert', '');

        const body = document.createElement('div');
        body.className = 'project-card-body';

        const hero = document.createElement('div');
        hero.className = 'project-card-hero';
        body.appendChild(hero);

        const title = document.createElement('h3');
        title.className = 'project-card-title';
        title.textContent = project.title;
        body.appendChild(title);

        const blurb = document.createElement('p');
        blurb.className = 'project-card-blurb';
        blurb.textContent = project.blurb;
        body.appendChild(blurb);

        const chips = document.createElement('div');
        chips.className = 'project-card-chips';
        chips.appendChild(createChip(project.year));
        chips.appendChild(createChip(project.tag));
        if (project.locked) {
            chips.appendChild(createChip('Locked', true));
        }
        body.appendChild(chips);

        card.appendChild(body);

        card.addEventListener('click', () => openOverlay(project, card));
        return card;
    }

    function renderOverlayContent(project) {
        overlayContent.innerHTML = '';

        const tagsRow = document.createElement('div');
        tagsRow.className = 'overlay-tags';
        [project.year, project.tag].forEach(t => {
            const pill = document.createElement('span');
            pill.className = 'overlay-tag';
            pill.textContent = t;
            tagsRow.appendChild(pill);
        });
        if (project.locked) {
            const pill = document.createElement('span');
            pill.className = 'overlay-tag';
            pill.textContent = 'Locked';
            tagsRow.appendChild(pill);
        }
        overlayContent.appendChild(tagsRow);

        const title = document.createElement('h2');
        title.className = 'overlay-title';
        title.id = 'overlay-title';
        title.textContent = project.title;
        overlayContent.appendChild(title);

        const hero = document.createElement('div');
        hero.className = 'overlay-hero';
        overlayContent.appendChild(hero);

        const body = document.createElement('div');
        body.className = 'overlay-body';
        project.body.forEach(block => {
            if (block.type === 'paragraph') {
                const p = document.createElement('p');
                p.textContent = block.text;
                body.appendChild(p);
            }
        });
        overlayContent.appendChild(body);
    }

    function onKeydown(e) {
        if (e.key === 'Escape') closeOverlay();
    }

    function openOverlay(project, triggerEl) {
        lastFocused = triggerEl;
        renderOverlayContent(project);
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('overlay-open');
        overlayPanel.scrollTop = 0;
        closeBtn.focus();
        document.addEventListener('keydown', onKeydown);
    }

    function closeOverlay() {
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('overlay-open');
        document.removeEventListener('keydown', onKeydown);
        if (lastFocused) lastFocused.focus();
    }

    closeBtn.addEventListener('click', closeOverlay);
    overlayBackdrop.addEventListener('click', closeOverlay);

    function revealOnScroll(elements) {
        if (!('IntersectionObserver' in window)) {
            elements.forEach(el => el.classList.add('in-view'));
            return;
        }

        function startObserving() {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });
            elements.forEach(el => observer.observe(el));
        }

        // Stay hidden even if the section is already in the viewport on load
        // (e.g. a short hero on a tall screen) — only reveal once the user
        // actually scrolls, unless they've already scrolled (e.g. #work link).
        if (window.scrollY > 0) {
            startObserving();
        } else {
            window.addEventListener('scroll', startObserving, { once: true, passive: true });
        }
    }

    const cards = [];
    if (typeof PROJECTS !== 'undefined') {
        PROJECTS.forEach((project, index) => {
            const card = renderCard(project);
            card.style.animationDelay = (index * 0.12) + 's';
            grid.appendChild(card);
            cards.push(card);
        });
    }

    const workHeader = document.querySelector('.work-header');
    revealOnScroll([workHeader, ...cards].filter(Boolean));
})();

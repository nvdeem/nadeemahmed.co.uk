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

    function renderCard(project) {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'project-card';
        card.setAttribute('data-cursor-invert', '');

        const hero = document.createElement('div');
        hero.className = 'project-card-hero';
        card.appendChild(hero);

        const body = document.createElement('div');
        body.className = 'project-card-body';

        const top = document.createElement('div');
        top.className = 'project-card-top';

        const tag = document.createElement('span');
        tag.className = 'project-card-tag';
        tag.textContent = project.tag;
        top.appendChild(tag);

        if (project.locked) {
            const lock = document.createElement('span');
            lock.className = 'project-card-lock';
            lock.appendChild(lockIcon());
            const lockLabel = document.createElement('span');
            lockLabel.textContent = 'Locked';
            lock.appendChild(lockLabel);
            top.appendChild(lock);
        }

        body.appendChild(top);

        const title = document.createElement('h3');
        title.className = 'project-card-title';
        title.textContent = project.title;
        body.appendChild(title);

        const blurb = document.createElement('p');
        blurb.className = 'project-card-blurb';
        blurb.textContent = project.blurb;
        body.appendChild(blurb);

        const meta = document.createElement('div');
        meta.className = 'project-card-meta';
        meta.textContent = project.year;
        body.appendChild(meta);

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

    if (typeof PROJECTS !== 'undefined') {
        PROJECTS.forEach(project => grid.appendChild(renderCard(project)));
    }
})();

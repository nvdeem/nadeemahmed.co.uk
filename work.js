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
        if (project.image) {
            const img = document.createElement('img');
            img.src = project.image;
            img.alt = '';
            img.loading = 'lazy';
            hero.appendChild(img);
        }
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
        (project.tags || []).forEach(tag => chips.appendChild(createChip(tag)));
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
        overlayPanel.classList.toggle('is-compact', !!project.locked);

        if (project.locked) {
            renderLockedState(project);
            return;
        }

        renderProjectDetail(project);
    }

    function renderProjectDetail(details) {
        const tagsRow = document.createElement('div');
        tagsRow.className = 'overlay-tags';
        [details.year, ...(details.tags || [])].forEach(t => {
            const pill = document.createElement('span');
            pill.className = 'overlay-tag';
            pill.textContent = t;
            tagsRow.appendChild(pill);
        });
        overlayContent.appendChild(tagsRow);

        const title = document.createElement('h2');
        title.className = 'overlay-title';
        title.id = 'overlay-title';
        title.textContent = details.title;
        overlayContent.appendChild(title);

        const hero = document.createElement('div');
        hero.className = 'overlay-hero';
        if (details.image) {
            const img = document.createElement('img');
            img.src = details.image;
            img.alt = '';
            hero.appendChild(img);
        }
        overlayContent.appendChild(hero);

        const body = document.createElement('div');
        body.className = 'overlay-body';
        details.body.forEach(block => {
            if (block.type === 'paragraph') {
                const p = document.createElement('p');
                p.textContent = block.text;
                body.appendChild(p);
            }
        });
        overlayContent.appendChild(body);
    }

    function renderLockedState(project) {
        const wrap = document.createElement('div');
        wrap.className = 'overlay-locked';

        const icon = document.createElement('div');
        icon.className = 'overlay-locked-icon';
        icon.appendChild(lockIcon());
        wrap.appendChild(icon);

        const title = document.createElement('h2');
        title.className = 'overlay-locked-title';
        title.id = 'overlay-title';
        title.textContent = 'Password protected';
        wrap.appendChild(title);

        const text = document.createElement('p');
        text.className = 'overlay-locked-text';
        text.textContent = 'Enter the password to view this case study.';
        wrap.appendChild(text);

        const form = document.createElement('form');
        form.className = 'overlay-locked-form';
        form.setAttribute('novalidate', '');

        const label = document.createElement('label');
        label.className = 'overlay-locked-label';
        label.htmlFor = 'overlay-locked-password';
        label.textContent = 'Password';
        form.appendChild(label);

        const input = document.createElement('input');
        input.type = 'password';
        input.id = 'overlay-locked-password';
        input.className = 'overlay-locked-input';
        form.appendChild(input);

        const submit = document.createElement('button');
        submit.type = 'submit';
        submit.className = 'overlay-locked-submit';
        submit.setAttribute('data-cursor-invert', '');
        submit.textContent = 'Unlock';
        form.appendChild(submit);

        const error = document.createElement('p');
        error.className = 'overlay-locked-error';
        error.hidden = true;
        form.appendChild(error);

        function showError(message) {
            error.textContent = message;
            error.hidden = false;
            input.focus();
            input.select();
            input.classList.remove('shake');
            void input.offsetWidth;
            input.classList.add('shake');
        }

        form.addEventListener('submit', async e => {
            e.preventDefault();
            const password = input.value;

            if (!password) {
                showError('Enter a password.');
                return;
            }

            error.hidden = true;
            submit.disabled = true;
            submit.textContent = 'Unlocking…';

            try {
                const res = await fetch('/api/unlock', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: project.id, password })
                });

                if (res.ok) {
                    const details = await res.json();
                    overlayContent.innerHTML = '';
                    overlayPanel.classList.remove('is-compact');
                    renderProjectDetail(details);
                    return;
                }

                const data = await res.json().catch(() => ({}));
                showError(data.error === 'Incorrect password'
                    ? 'Incorrect password. Try again.'
                    : 'Unable to unlock. Check your connection and try again.');
            } catch {
                showError('Unable to unlock. Check your connection and try again.');
            } finally {
                submit.disabled = false;
                submit.textContent = 'Unlock';
            }
        });
        wrap.appendChild(form);

        const contact = document.createElement('a');
        contact.className = 'overlay-locked-contact';
        contact.setAttribute('data-cursor-invert', '');
        const subject = encodeURIComponent('Case study access');
        const body = encodeURIComponent("Hey Nadeem, I'd love to view your case studies. Would I be able to get access?");
        contact.href = `mailto:hello@nadeemahmed.co.uk?subject=${subject}&body=${body}`;
        contact.innerHTML = 'No password? Get in touch <span class="arrow">↗</span>';
        wrap.appendChild(contact);

        overlayContent.appendChild(wrap);
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

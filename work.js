(() => {
    const grid = document.querySelector('.projects-grid');
    const overlay = document.querySelector('.overlay');
    const overlayPanel = document.querySelector('.overlay-panel');
    const overlayScroll = document.querySelector('.overlay-scroll');
    const overlayContent = document.querySelector('#overlay-content');
    const overlayBackdrop = document.querySelector('.overlay-backdrop');
    const closeBtn = document.querySelector('.overlay-close');
    let lastFocused = null;

    // Shared element builders — most of the block renderers below are just
    // "create an element, give it a class, give it text, append it".
    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined && text !== null) node.textContent = text;
        return node;
    }

    function img(src, className, lazy = true) {
        const image = document.createElement('img');
        image.src = src;
        image.alt = '';
        if (lazy) image.loading = 'lazy';
        if (className) image.className = className;
        return image;
    }

    // Lucide icon paths (24x24, stroke-based) — kept inline rather than
    // pulled from a package, consistent with the rest of the site staying
    // dependency-free with no build step.
    const ICON_PATHS = {
        lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
        x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
        check: '<path d="M20 6 9 17l-5-5"/>'
    };

    function icon(name, className) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        if (className) svg.setAttribute('class', className);
        svg.innerHTML = ICON_PATHS[name];
        return svg;
    }

    function createChip(text, isLock) {
        const chip = el('span', 'project-card-chip');
        if (isLock) chip.appendChild(icon('lock'));
        chip.appendChild(el('span', null, text));
        return chip;
    }

    function renderCard(project) {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'project-card';
        card.setAttribute('data-cursor-invert', '');

        const body = el('div', 'project-card-body');

        const hero = el('div', 'project-card-hero');
        if (project.image) hero.appendChild(img(project.image, null));
        body.appendChild(hero);

        body.appendChild(el('h3', 'project-card-title', project.title));

        const chips = el('div', 'project-card-chips');
        chips.appendChild(createChip(project.year));
        (project.tags || []).forEach(tag => chips.appendChild(createChip(tag)));
        if (project.locked) chips.appendChild(createChip('Locked', true));
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
        const tagsRow = el('div', 'overlay-tags');
        [details.year, ...(details.tags || [])].forEach(t => {
            tagsRow.appendChild(el('span', 'overlay-tag', t));
        });
        overlayContent.appendChild(tagsRow);

        const title = el('h2', 'overlay-title', details.title);
        title.id = 'overlay-title';
        overlayContent.appendChild(title);

        const hero = el('div', 'overlay-hero');
        if (details.image) hero.appendChild(img(details.image, null, false));
        overlayContent.appendChild(hero);

        const body = el('div', 'overlay-body');
        (details.body || []).forEach(block => {
            const node = renderBlock(block);
            if (node) body.appendChild(node);
        });
        overlayContent.appendChild(body);
    }

    const blockRenderers = {
        paragraph(block) {
            return el('p', null, block.text);
        },

        meta(block) {
            const grid = el('div', 'overlay-meta');
            (block.items || []).forEach(item => {
                const cell = el('div', 'overlay-meta-item');
                cell.appendChild(el('span', 'overlay-meta-label', item.label));
                const values = Array.isArray(item.value) ? item.value : [item.value];
                values.forEach(v => cell.appendChild(el('span', 'overlay-meta-value', v)));
                grid.appendChild(cell);
            });
            return grid;
        },

        // `heading`/`number`/`quote` are all optional. With no `number`, the
        // eyebrow can stand alone as the whole section header (no heading
        // needed underneath it).
        section(block) {
            const wrap = el('div', 'overlay-section');

            const meta = el('div', 'overlay-section-meta');
            if (block.number) meta.appendChild(el('span', 'overlay-section-number', block.number));
            if (block.eyebrow) meta.appendChild(el('span', 'overlay-section-eyebrow', block.eyebrow));
            if (meta.childElementCount) wrap.appendChild(meta);

            if (block.heading) wrap.appendChild(el('h3', 'overlay-section-heading', block.heading));
            if (block.quote) wrap.appendChild(el('blockquote', 'overlay-section-quote', block.quote));

            return wrap;
        },

        list(block) {
            const list = el('ul', 'overlay-list');
            (block.items || []).forEach(text => list.appendChild(el('li', null, text)));
            return list;
        },

        callout(block) {
            const wrap = el('div', 'overlay-callout');
            wrap.appendChild(el('span', 'overlay-callout-label', block.label));
            wrap.appendChild(el('p', 'overlay-callout-text', block.text));
            return wrap;
        },

        gallery(block) {
            const figure = el('figure', 'overlay-gallery');

            const grid = el('div', 'overlay-gallery-grid');
            (block.images || []).forEach(src => {
                grid.appendChild(src ? img(src, null) : el('div', 'overlay-gallery-placeholder'));
            });
            figure.appendChild(grid);

            if (block.caption) {
                const caption = el('figcaption', 'overlay-gallery-caption');
                caption.appendChild(el('span', 'overlay-gallery-caption-label', 'IMAGE'));
                caption.appendChild(document.createTextNode(block.caption));
                figure.appendChild(caption);
            }

            return figure;
        },

        // Big number + small label, several side by side.
        'stat-row'(block) {
            const row = el('div', 'overlay-stats');
            (block.items || []).forEach(stat => {
                const cell = el('div', 'overlay-stat');
                cell.appendChild(el('span', 'overlay-stat-value', stat.value));
                cell.appendChild(el('span', 'overlay-stat-label', stat.label));
                row.appendChild(cell);
            });
            return row;
        },

        // Circular numbered badges instead of bullets. Each item can carry
        // an optional `sub` line (e.g. a "Fix: ..." follow-up).
        'numbered-list'(block) {
            const list = el('ol', 'overlay-numbered-list');
            (block.items || []).forEach((item, i) => {
                const li = document.createElement('li');
                li.appendChild(el('span', 'overlay-numbered-badge', i + 1));

                const content = el('div', 'overlay-numbered-content');
                content.appendChild(el('p', null, item.text));
                if (item.sub) content.appendChild(el('p', 'overlay-numbered-sub', item.sub));

                li.appendChild(content);
                list.appendChild(li);
            });
            return list;
        },

        // N-up grid of cards, each with its own heading + bullet list.
        'card-grid'(block) {
            const grid = el('div', 'overlay-card-grid');
            (block.cards || []).forEach(card => {
                const cell = el('div', 'overlay-card');
                cell.appendChild(el('h4', 'overlay-card-heading', card.heading));

                const list = el('ul', 'overlay-card-list');
                (card.items || []).forEach(text => list.appendChild(el('li', null, text)));
                cell.appendChild(list);

                grid.appendChild(cell);
            });
            return grid;
        },

        // Side-by-side cards with a title, description, and a check/✕ list —
        // used for competitor/tool comparisons. `icon` is optional and is
        // skipped if not supplied (avoids a broken image before real assets
        // are dropped in).
        comparison(block) {
            const grid = el('div', 'overlay-comparison');
            (block.items || []).forEach(item => {
                const card = el('div', 'overlay-comparison-card');

                if (item.icon) card.appendChild(img(item.icon, 'overlay-comparison-icon'));
                card.appendChild(el('h4', 'overlay-comparison-title', item.title));
                if (item.description) card.appendChild(el('p', 'overlay-comparison-description', item.description));

                const list = el('ul', 'overlay-comparison-list');
                (item.points || []).forEach(point => {
                    const li = el('li', point.good ? 'is-good' : 'is-bad');
                    li.appendChild(icon(point.good ? 'check' : 'x', 'overlay-comparison-mark'));
                    li.appendChild(document.createTextNode(point.text));
                    list.appendChild(li);
                });
                card.appendChild(list);

                grid.appendChild(card);
            });
            return grid;
        },

        // Bespoke persona layout: optional avatar, name/meta, a grid of
        // trait cards (Goals/Behaviours/Pain Points/Needs), and a quote.
        persona(block) {
            const wrap = el('div', 'overlay-persona');

            const profile = el('div', 'overlay-persona-profile');
            if (block.avatar) profile.appendChild(img(block.avatar, 'overlay-persona-avatar'));
            profile.appendChild(el('h4', 'overlay-persona-name', block.name));
            (block.meta || []).forEach(line => profile.appendChild(el('p', 'overlay-persona-meta', line)));
            wrap.appendChild(profile);

            const grid = el('div', 'overlay-persona-grid');
            (block.cards || []).forEach(card => {
                const cell = el('div', 'overlay-persona-card');
                cell.appendChild(el('h5', null, card.label));

                const list = document.createElement('ul');
                (card.items || []).forEach(text => list.appendChild(el('li', null, text)));
                cell.appendChild(list);

                grid.appendChild(cell);
            });
            wrap.appendChild(grid);

            if (block.quote) wrap.appendChild(el('blockquote', 'overlay-persona-quote', block.quote));

            return wrap;
        }
    };

    function renderBlock(block) {
        const renderer = blockRenderers[block.type];
        return renderer ? renderer(block) : null;
    }

    function renderLockedState(project) {
        const wrap = el('div', 'overlay-locked');

        const iconWrap = el('div', 'overlay-locked-icon');
        iconWrap.appendChild(icon('lock'));
        wrap.appendChild(iconWrap);

        const title = el('h2', 'overlay-locked-title', 'Password protected');
        title.id = 'overlay-title';
        wrap.appendChild(title);

        wrap.appendChild(el('p', 'overlay-locked-text', 'Enter the password to view this case study.'));

        const form = document.createElement('form');
        form.className = 'overlay-locked-form';
        form.setAttribute('novalidate', '');

        const label = el('label', 'overlay-locked-label', 'Password');
        label.htmlFor = 'overlay-locked-password';
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

        const error = el('p', 'overlay-locked-error');
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
                    updateScrollFade();
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
        contact.innerHTML = 'No password? Get in touch <span class="arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg></span>';
        wrap.appendChild(contact);

        overlayContent.appendChild(wrap);
    }

    function onKeydown(e) {
        if (e.key === 'Escape') closeOverlay();
    }

    function updateScrollFade() {
        const hasMore = overlayScroll.scrollHeight - overlayScroll.scrollTop - overlayScroll.clientHeight > 4;
        overlayPanel.classList.toggle('has-overflow-below', hasMore);
    }

    overlayScroll.addEventListener('scroll', updateScrollFade, { passive: true });

    function openOverlay(project, triggerEl) {
        lastFocused = triggerEl;
        renderOverlayContent(project);
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('overlay-open');
        overlayScroll.scrollTop = 0;
        updateScrollFade();
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
    const footer = document.querySelector('.site-footer');
    revealOnScroll([workHeader, ...cards, footer].filter(Boolean));
})();

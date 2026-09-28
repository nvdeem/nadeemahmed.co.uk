(() => {
    const grid = document.querySelector('.projects-grid');
    const overlay = document.querySelector('.overlay');
    const overlayPanel = document.querySelector('.overlay-panel');
    const overlayScroll = document.querySelector('.overlay-scroll');
    const overlayContent = document.querySelector('#overlay-content');
    const overlayBackdrop = document.querySelector('.overlay-backdrop');
    const closeBtn = document.querySelector('.overlay-close');
    let lastFocused = null;

    const lightbox = document.querySelector('.lightbox');
    const lightboxBackdrop = document.querySelector('.lightbox-backdrop');
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxClose = document.querySelector('.lightbox-close');
    let lightboxLastFocused = null;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    // Click-to-expand: any real case-study image (hero, gallery) can open
    // in the lightbox at a larger size.
    function makeExpandable(image) {
        image.classList.add('overlay-expandable');
        image.setAttribute('data-cursor-invert', '');
        image.addEventListener('click', () => openLightbox(image.src));
        return image;
    }

    // Cursor-tilt + spotlight on project cards. Tracks mouse position
    // relative to the card and expresses it two ways: a small 3D tilt
    // (rotateX/rotateY) and a --spot-x/--spot-y custom property the CSS
    // spotlight gradient reads. Skipped entirely under reduced-motion.
    function addCardTilt(card) {
        if (prefersReducedMotion) return;
        const MAX_TILT = 9;

        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width;
            const py = (e.clientY - rect.top) / rect.height;
            const rotateY = (px - 0.5) * MAX_TILT * 2;
            const rotateX = (0.5 - py) * MAX_TILT * 2;
            card.style.transform = `translateY(-2px) perspective(700px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
            card.style.setProperty('--spot-x', (px * 100).toFixed(1) + '%');
            card.style.setProperty('--spot-y', (py * 100).toFixed(1) + '%');
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    }

    // Magnetic pull: the element nudges toward the cursor while hovered,
    // clamped to a small max offset. Preserves the target's own base
    // `transform` (e.g. the close button's centering translateX) by only
    // ever touching the inline style, which cleanly reverts to the CSS
    // rule's value when cleared on mouseleave.
    function addMagnetic(target, { strength = 0.35, max = 12, base = '' } = {}) {
        if (prefersReducedMotion || !target) return;

        target.addEventListener('mousemove', e => {
            const rect = target.getBoundingClientRect();
            const relX = e.clientX - (rect.left + rect.width / 2);
            const relY = e.clientY - (rect.top + rect.height / 2);
            const dx = Math.max(-max, Math.min(max, relX * strength));
            const dy = Math.max(-max, Math.min(max, relY * strength));
            target.style.transform = `${base} translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
        });

        target.addEventListener('mouseleave', () => {
            target.style.transform = '';
        });
    }

    // Lucide icon paths (24x24, stroke-based) — kept inline rather than
    // pulled from a package, consistent with the rest of the site staying
    // dependency-free with no build step.
    const ICON_PATHS = {
        lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
        x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
        check: '<path d="M20 6 9 17l-5-5"/>',
        lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
        'trending-up': '<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>'
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
        addCardTilt(card);
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

    // Populated by the stat-row/statement renderers below, reset per
    // project render, then wired up (count-up on scroll into view /
    // scroll-linked word fill) once the fresh content is actually in the DOM.
    let pendingCountUps = [];
    let statementBlocks = [];

    function renderProjectDetail(details) {
        pendingCountUps = [];
        statementBlocks = [];

        const tagsRow = el('div', 'overlay-tags');
        [details.year, ...(details.tags || [])].forEach(t => {
            tagsRow.appendChild(el('span', 'overlay-tag', t));
        });
        overlayContent.appendChild(tagsRow);

        const title = el('h2', 'overlay-title', details.title);
        title.id = 'overlay-title';
        overlayContent.appendChild(title);

        const hero = el('div', 'overlay-hero');
        if (details.image) hero.appendChild(makeExpandable(img(details.image, null, false)));
        overlayContent.appendChild(hero);

        const body = el('div', 'overlay-body');
        (details.body || []).forEach(block => {
            const node = renderBlock(block);
            if (node) body.appendChild(node);
        });
        overlayContent.appendChild(body);

        updateStatementFill();
        pendingCountUps.forEach(node => countUpObserver.observe(node));
    }

    const blockRenderers = {
        paragraph(block) {
            return el('p', null, block.text);
        },

        // A single pronounced statement — for the one or two moments per
        // case study (a problem statement, a key finding) that need to
        // read as a stronger, standalone claim rather than body copy.
        // Larger and brighter than `overlay-section-quote` on purpose:
        // that one is a subtle secondary accent under a heading, this is
        // the main point.
        statement(block) {
            const p = el('p', 'overlay-statement');
            const words = block.text.split(' ');
            const wordEls = words.map((word, i) => {
                const span = document.createElement('span');
                span.className = 'overlay-statement-word';
                span.textContent = word + (i < words.length - 1 ? ' ' : '');
                p.appendChild(span);
                return span;
            });

            if (prefersReducedMotion) {
                wordEls.forEach(w => w.classList.add('is-filled'));
            } else {
                statementBlocks.push({ el: p, words: wordEls });
            }

            return p;
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

            const label = el('span', 'overlay-callout-label');
            label.appendChild(icon('lightbulb', 'overlay-callout-icon'));
            label.appendChild(document.createTextNode(block.label));
            wrap.appendChild(label);

            wrap.appendChild(el('p', 'overlay-callout-text', block.text));
            return wrap;
        },

        // `aspect` (e.g. '16 / 9') overrides the default portrait 9:16
        // frame — most gallery images are phone screenshots, but process
        // diagrams/flows/sketches are usually landscape.
        gallery(block) {
            const figure = el('figure', 'overlay-gallery');

            const grid = el('div', 'overlay-gallery-grid');
            (block.images || []).forEach(src => {
                if (!src) {
                    const placeholder = el('div', 'overlay-gallery-placeholder');
                    if (block.aspect) placeholder.style.aspectRatio = block.aspect;
                    grid.appendChild(placeholder);
                    return;
                }
                const frame = el('div', 'overlay-gallery-frame');
                if (block.aspect) frame.style.aspectRatio = block.aspect;
                frame.appendChild(makeExpandable(img(src, null)));
                grid.appendChild(frame);
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

        // Big number + small label, several side by side. Purely numeric
        // values (with an optional +/% suffix) count up from 0 once
        // scrolled into view; anything else (ranges, words) just renders
        // as-is — counting "26-34" or "UK" up from zero wouldn't mean
        // anything.
        'stat-row'(block) {
            const row = el('div', 'overlay-stats');
            (block.items || []).forEach(stat => {
                const cell = el('div', 'overlay-stat card-beam');
                const value = el('span', 'overlay-stat-value');
                const match = /^(\d+)(\+|%)?$/.exec(String(stat.value).trim());

                if (prefersReducedMotion) {
                    value.textContent = stat.value;
                    value.classList.add('is-visible');
                } else {
                    // Every value gets the same fade/scale-in reveal on
                    // scroll into view; numeric ones additionally count up
                    // in step with it, so the whole thing reads as one
                    // coordinated ease-in rather than a bare digit tick.
                    if (match) {
                        value.textContent = '0' + (match[2] || '');
                        value.dataset.countTo = match[1];
                        value.dataset.countSuffix = match[2] || '';
                    } else {
                        value.textContent = stat.value;
                    }
                    pendingCountUps.push(value);
                }

                cell.appendChild(value);
                cell.appendChild(el('span', 'overlay-stat-label', stat.label));
                row.appendChild(cell);
            });
            return row;
        },

        // Outcome cards: a big number (or a trending-up icon when there's
        // no clean metric) plus a short heading and a sentence of context —
        // for closing a case study on its impact, not just its process.
        // Numeric values count up the same way `stat-row` does.
        'outcome-grid'(block) {
            const grid = el('div', 'overlay-outcome-grid');
            (block.items || []).forEach(item => {
                const card = el('div', 'overlay-outcome-card');
                const value = el('span', 'overlay-outcome-value');
                const match = item.value ? /^(\d+)(\+|%)?$/.exec(String(item.value).trim()) : null;

                if (!item.value) {
                    value.appendChild(icon('trending-up', 'overlay-outcome-icon'));
                    if (prefersReducedMotion) value.classList.add('is-visible');
                    else pendingCountUps.push(value);
                } else if (prefersReducedMotion) {
                    value.textContent = item.value;
                    value.classList.add('is-visible');
                } else if (match) {
                    value.textContent = '0' + (match[2] || '');
                    value.dataset.countTo = match[1];
                    value.dataset.countSuffix = match[2] || '';
                    pendingCountUps.push(value);
                } else {
                    value.textContent = item.value;
                    pendingCountUps.push(value);
                }

                card.appendChild(value);
                card.appendChild(el('h4', 'overlay-outcome-heading', item.heading));
                if (item.text) card.appendChild(el('p', 'overlay-outcome-text', item.text));
                grid.appendChild(card);
            });
            return grid;
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
        // The lightbox can be open on top of the case-study overlay —
        // let its own keydown handler take the first Escape press.
        if (e.key === 'Escape' && !lightbox.classList.contains('is-open')) closeOverlay();
    }

    function openLightbox(src) {
        lightboxLastFocused = document.activeElement;
        lightboxImage.src = src;
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        lightboxClose.focus();
        document.addEventListener('keydown', onLightboxKeydown);
    }

    function closeLightbox() {
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.removeEventListener('keydown', onLightboxKeydown);
        if (lightboxLastFocused) lightboxLastFocused.focus();
    }

    function onLightboxKeydown(e) {
        if (e.key === 'Escape') closeLightbox();
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxBackdrop.addEventListener('click', closeLightbox);

    function updateScrollFade() {
        const hasMore = overlayScroll.scrollHeight - overlayScroll.scrollTop - overlayScroll.clientHeight > 4;
        overlayPanel.classList.toggle('has-overflow-below', hasMore);
    }

    // Scroll-linked word fill for `statement` blocks: each word is dim by
    // default and turns white as the statement moves through a reveal
    // window anchored to the scroll viewport (progress 0 when its top is
    // 65% down the viewport — deliberately not right at the bottom edge
    // (was 85%), since starting the fill while the text is still mostly
    // off-screen meant it was already underway by the time it was actually
    // noticeable; progress 1 once it's reached 35% down, comfortably in
    // view) — not a one-shot trigger, so scrolling back down un-fills it too.
    function updateStatementFill() {
        if (!statementBlocks.length) return;
        const viewportRect = overlayScroll.getBoundingClientRect();
        const startLine = viewportRect.top + viewportRect.height * 0.65;
        const endLine = viewportRect.top + viewportRect.height * 0.35;

        statementBlocks.forEach(({ el: statementEl, words }) => {
            const rect = statementEl.getBoundingClientRect();
            const progress = Math.max(0, Math.min(1, (startLine - rect.top) / (startLine - endLine)));
            const filledCount = Math.round(progress * words.length);
            words.forEach((word, i) => word.classList.toggle('is-filled', i < filledCount));
        });
    }

    let scrollEffectsRaf = null;
    function requestScrollEffectsUpdate() {
        if (scrollEffectsRaf) return;
        scrollEffectsRaf = requestAnimationFrame(() => {
            updateStatementFill();
            scrollEffectsRaf = null;
        });
    }

    overlayScroll.addEventListener('scroll', updateScrollFade, { passive: true });
    if (!prefersReducedMotion) {
        overlayScroll.addEventListener('scroll', requestScrollEffectsUpdate, { passive: true });
    }

    // Count-up for stat-row values that are purely numeric, running in step
    // with the CSS fade/scale-in (`.is-visible`, see .overlay-stat-value)
    // so the two read as one coordinated ease-in rather than a bare digit
    // tick against an already-fully-visible page. Long duration + a long-
    // tail easing curve (matching the site's own `--ease`) rather than a
    // short linear-ish count, since small targets (4, 5) only have a
    // handful of integer steps to begin with — the slow tail is what
    // actually reads as "smooth" for those.
    function animateCount(target) {
        const to = parseInt(target.dataset.countTo, 10);
        const suffix = target.dataset.countSuffix || '';
        const duration = 1300;
        const start = performance.now();

        function step(now) {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 5);
            target.textContent = Math.round(to * eased) + suffix;
            if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    const countUpObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                if (entry.target.dataset.countTo) animateCount(entry.target);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.6 });

    function openOverlay(project, triggerEl) {
        lastFocused = triggerEl;
        renderOverlayContent(project);
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        document.documentElement.classList.add('overlay-open');
        overlayScroll.scrollTop = 0;
        updateScrollFade();
        closeBtn.focus();
        document.addEventListener('keydown', onKeydown);
    }

    function closeOverlay() {
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        document.documentElement.classList.remove('overlay-open');
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

    document.querySelectorAll('.cta-primary, .cta-secondary').forEach(cta => addMagnetic(cta));
})();

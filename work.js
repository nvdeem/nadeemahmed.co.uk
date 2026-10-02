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

    // Brand marks (tool logos in the meta grid) — unlike ICON_PATHS above,
    // these keep their own real fill colors rather than inheriting
    // currentColor, since a brand mark's recognizability depends on its
    // actual colors (Figma's 4-color logo, Claude's brand orange). No
    // official FigJam mark exists as a standalone icon anywhere (checked
    // Simple Icons, Iconify's full aggregated search, devicon) — Figma and
    // FigJam are combined into a single "Figma & FigJam" entry instead of
    // guessing one. Maze has no usable vector mark either (Simple Icons'
    // "Maze" entry turned out to be the wrong logo entirely) — its real
    // current mark, fetched directly from maze.co, is a raster PNG
    // (`images/logos/maze.png`), rendered via `logoImg()` below instead of
    // this SVG path registry.
    const LOGO_MARKUP = {
        figma: '<path fill="#0acf83" d="M45.5 129c11.9 0 21.5-9.6 21.5-21.5V86H45.5C33.6 86 24 95.6 24 107.5S33.6 129 45.5 129zm0 0"/><path fill="#a259ff" d="M24 64.5C24 52.6 33.6 43 45.5 43H67v43H45.5C33.6 86 24 76.4 24 64.5zm0 0"/><path fill="#f24e1e" d="M24 21.5C24 9.6 33.6 0 45.5 0H67v43H45.5C33.6 43 24 33.4 24 21.5zm0 0"/><path fill="#ff7262" d="M67 0h21.5C100.4 0 110 9.6 110 21.5S100.4 43 88.5 43H67zm0 0"/><path fill="#1abcfe" d="M110 64.5c0 11.9-9.6 21.5-21.5 21.5S67 76.4 67 64.5 76.6 43 88.5 43 110 52.6 110 64.5zm0 0"/>',
        claude: '<path fill="#D97757" d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3649-.4614-.1578-1.0079.6557-.7225.8802.0607.2246.0607.8923.6861 1.9064 1.4754 2.4893 1.8336.3642.3032.1457-.1032.0182-.0729-.1639-.2733-1.356-2.4467-1.4472-2.4954-.6435-1.0335-.1699-.619a2.98 2.98 0 0 1-.1032-.729l.7467-1.0132.4128-.1335.9956.1335.4188.3642.6191 1.4147 1.0031 2.2283 1.5546 3.0294.4553.899.2429.8316.0912.2552h.1579v-.1457l.1275-1.7055.2368-2.0947.2307-2.6962.0789-.7589.3763-.9107.7468-.4917.5828.2793.4795.6861-.0668.4432-.2853 1.853-.5586 2.9018-.3642 1.9429h.2125l.2428-.2429.9835-1.3053 1.6517-2.0642.7285-.8194.8498-.9047.5464-.4310h1.0334l.7589 1.129-.3399 1.1656-1.0638 1.3498-.8802 1.1412-1.2626 1.7005-.7893 1.3599.0729.1093.1882-.0182 2.8529-.6071 1.541-.2792 1.8396-.3156.8316.3885.0911.3946-.3277.8073-1.9671.4857-2.306.4614-3.4353.8134-.0425.0303.0486.0607 1.5471.1457.6618.0364h1.6192l3.0151.2246.789.5221.4735.6375-.0789.4857-1.2079.6132-1.6333-.389-3.8114-.9077-1.3073-.3252h-.1821v.1093l1.0881 1.0638 1.9945 1.8032 2.4953 2.3194.1275.5768-.3216.4553-.3399-.0486-2.2041-1.6577-.8499-.7467-1.9247-1.6192h-.1275v.1699l.4432.6497 2.3437 3.5219.1214 1.0789-.17.3521-.6071.2125-.6679-.1214-1.3741-1.9247-1.4147-2.1664-1.1412-1.9429-.1396.0789-.6739 7.2606-.3156.3703-.7285.2793-.6071-.4614-.3216-.7467.3216-1.4753.3885-1.9247.3156-1.5289.2853-1.8998.17-.6314-.0121-.0425-.1396.0182-1.4329 1.9671-2.1785 2.9443-1.7236 1.8457-.4128.1639-.7163-.3703.0668-.6618.4007-.5889 2.3863-3.0333 1.4389-1.882.9289-1.0881-.0061-.1578h-.0547l-6.3457 4.1163-1.1291.1457-.4857-.4552.0607-.7468.2307-.2429 1.9064-1.3113z"/>'
    };
    const LOGO_VIEWBOX = { figma: '0 0 128 128', claude: '0 0 24 24' };

    function logo(name, className) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', LOGO_VIEWBOX[name] || '0 0 24 24');
        if (className) svg.setAttribute('class', className);
        svg.innerHTML = LOGO_MARKUP[name];
        return svg;
    }

    function logoImg(src, className) {
        const image = document.createElement('img');
        image.src = src;
        image.alt = '';
        if (className) image.className = className;
        return image;
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

        // Each value line is either a plain string, or `{ text, logo }` to
        // show a small brand mark next to it (e.g. the Tools list).
        meta(block) {
            const grid = el('div', 'overlay-meta');
            (block.items || []).forEach(item => {
                const cell = el('div', 'overlay-meta-item');
                cell.appendChild(el('span', 'overlay-meta-label', item.label));
                const values = Array.isArray(item.value) ? item.value : [item.value];
                values.forEach(v => {
                    if (v && typeof v === 'object') {
                        const line = el('span', 'overlay-meta-value overlay-meta-value--logo');
                        const chip = el('span', 'overlay-meta-logo-chip');
                        chip.appendChild(v.logoImg ? logoImg(v.logoImg, 'overlay-meta-logo-img') : logo(v.logo, 'overlay-meta-logo'));
                        line.appendChild(chip);
                        line.appendChild(document.createTextNode(v.text));
                        cell.appendChild(line);
                    } else {
                        cell.appendChild(el('span', 'overlay-meta-value', v));
                    }
                });
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
                const wrapper = el('figcaption', 'overlay-gallery-caption-wrapper');

                const caption = el('span', 'overlay-gallery-caption');
                if (block.figure) caption.appendChild(el('span', 'overlay-gallery-figure', block.figure));
                caption.appendChild(document.createTextNode(block.caption));
                wrapper.appendChild(caption);

                const chip = el('span', 'overlay-gallery-chip');
                chip.appendChild(el('span', null, block.mediaType || 'IMAGE'));
                wrapper.appendChild(chip);

                figure.appendChild(wrapper);
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
        const startLine = viewportRect.top + viewportRect.height * 0.5;
        const endLine = viewportRect.top + viewportRect.height * 0.2;

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

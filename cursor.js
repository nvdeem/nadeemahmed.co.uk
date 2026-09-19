(() => {
    const cursor = document.querySelector('.cursor');
    const glow = document.querySelector('.cursor-glow');
    const hoverInvertSelector = '[data-cursor-invert]';
    let mx = 0, my = 0, cx = 0, cy = 0, gx = 0, gy = 0, visible = false;

    document.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
        if (!visible) {
            cursor.style.opacity = glow.style.opacity = '1';
            visible = true;
        }
    });

    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = glow.style.opacity = '0';
        cursor.classList.remove('cursor--invert');
        visible = false;
    });

    document.addEventListener('mouseover', e => {
        if (e.target.closest(hoverInvertSelector)) {
            cursor.classList.add('cursor--invert');
        }
    });

    document.addEventListener('mouseout', e => {
        if (e.target.closest(hoverInvertSelector)) {
            cursor.classList.remove('cursor--invert');
        }
    });

    (function animate() {
        cx += (mx - cx) * 0.15;
        cy += (my - cy) * 0.15;
        gx += (mx - gx) * 0.08;
        gy += (my - gy) * 0.08;
        cursor.style.left = cx + 'px';
        cursor.style.top = cy + 'px';
        glow.style.left = gx + 'px';
        glow.style.top = gy + 'px';
        requestAnimationFrame(animate);
    })();
})();

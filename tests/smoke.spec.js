// Lightweight smoke tests — not a full suite. Just enough to catch a
// broken deploy: the page loads clean, the core interactions work, and
// nothing regresses on two bugs we've hit before (horizontal scroll,
// locked content leaking to the client).
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    page.on('pageerror', err => { throw err; });
});

test('home page loads with no console errors and shows the hero', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto('/');
    await expect(page.locator('h1.headline')).toBeVisible();
    await expect(page.locator('.site-nav')).toBeVisible();
    expect(errors).toEqual([]);
});

test('work section renders project cards', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('.project-card');
    await expect(cards).toHaveCount(3);
});

test('opening an unlocked project shows its real case study content', async ({ page }) => {
    await page.goto('/');
    await page.locator('.project-card').first().click();
    await expect(page.locator('.overlay')).toHaveClass(/is-open/);
    await expect(page.locator('.overlay-title')).toHaveText('Designing Calm for Parents on the Go');
    await expect(page.locator('.overlay-body > *').first()).toBeVisible();
});

test('closing the overlay (Escape) returns to the page', async ({ page }) => {
    await page.goto('/');
    await page.locator('.project-card').first().click();
    await expect(page.locator('.overlay')).toHaveClass(/is-open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('.overlay')).not.toHaveClass(/is-open/);
});

test('locked project shows a password prompt, not real content', async ({ page }) => {
    await page.goto('/');
    await page.locator('.project-card', { hasText: 'Locked' }).click();
    await expect(page.locator('.overlay-locked-title')).toHaveText('Password protected');
    await expect(page.locator('.overlay-locked-form')).toBeVisible();
    // Real body content must never render before a correct password.
    await expect(page.locator('.overlay-body')).toHaveCount(0);
});

test('wrong password shows an inline error, not a crash', async ({ page }) => {
    await page.goto('/');
    await page.locator('.project-card', { hasText: 'Locked' }).click();
    await page.locator('#overlay-locked-password').fill('definitely-wrong');
    await page.locator('.overlay-locked-submit').click();
    await expect(page.locator('.overlay-locked-error')).toBeVisible();
});

test('no horizontal overflow on the page', async ({ page }) => {
    await page.goto('/');
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});

test('mobile nav menu opens and closes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const nav = page.locator('.site-nav');
    const toggle = page.locator('.site-nav-toggle');

    await toggle.click();
    await expect(nav).toHaveClass(/is-open/);
    await expect(page.locator('.site-nav-links')).toBeVisible();

    await toggle.click();
    await expect(nav).not.toHaveClass(/is-open/);
});

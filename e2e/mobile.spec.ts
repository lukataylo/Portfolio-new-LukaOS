import { test, expect } from '@playwright/test';
import { loadDesktop, windowByTitle } from './helpers';

// red-600 (light mode) or red-500 (dark mode) — the selected-tab accent.
const RED = /rgb\((220, 38, 38|239, 68, 68)\)/;

test.describe('mobile shell', () => {
  test('shows the tab bar instead of the dock', async ({ page }) => {
    await loadDesktop(page);

    const tabBar = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(tabBar).toBeVisible();
    await expect(page.getByRole('toolbar', { name: 'Application dock' })).toBeHidden();

    await expect(tabBar.getByRole('button', { name: /LinkedIn/ })).toBeVisible();
    await expect(tabBar.getByRole('button', { name: /Email/ })).toBeVisible();
  });

  test('the selected tab is red and every other tab is grey', async ({ page }) => {
    // No hash → About auto-opens and is the foreground window.
    await loadDesktop(page);
    const tabBar = page.getByRole('navigation', { name: 'Main navigation' });

    const aboutTab = tabBar.getByRole('button', { name: /^Open About/ });
    await expect(aboutTab).toHaveAttribute('aria-current', 'page');
    const aboutColor = await aboutTab.locator('span').evaluate(
      (el) => getComputedStyle(el).color,
    );
    expect(aboutColor).toMatch(RED);

    // A non-selected tab must not be red.
    const terminalTab = tabBar.getByRole('button', { name: /^Open Terminal/ });
    await expect(terminalTab).not.toHaveAttribute('aria-current', 'page');
    const terminalColor = await terminalTab.locator('span').evaluate(
      (el) => getComputedStyle(el).color,
    );
    expect(terminalColor).not.toMatch(RED);
  });

  test('LinkedIn + GitHub links are above the fold and point to the right profiles', async ({ page }) => {
    await loadDesktop(page);

    const github = page.getByTestId('social-github');
    await expect(github).toBeVisible();
    await expect(github).toHaveAttribute('href', /github\.com\/lukataylo/);
    await expect(github).toHaveAttribute('target', '_blank');

    const linkedin = page.getByTestId('social-linkedin');
    await expect(linkedin).toBeVisible();
    await expect(linkedin).toHaveAttribute('href', /linkedin\.com\/in\//);
    await expect(linkedin).toHaveAttribute('target', '_blank');
  });

  test('Apps drawer opens, then closes via the close button', async ({ page }) => {
    await loadDesktop(page);
    await page.getByRole('button', { name: 'All apps' }).click();

    const drawer = page.getByRole('dialog', { name: 'App drawer' });
    await expect(drawer).toBeVisible();

    // Two controls share the "Close app drawer" name (grabber + X); the X is last.
    await drawer.getByRole('button', { name: 'Close app drawer' }).last().click();
    await expect(drawer).toBeHidden();
  });

  test('Apps drawer closes by tapping the backdrop', async ({ page }) => {
    await loadDesktop(page);
    await page.getByRole('button', { name: 'All apps' }).click();
    const drawer = page.getByRole('dialog', { name: 'App drawer' });
    await expect(drawer).toBeVisible();

    // Tap near the top of the backdrop, above the bottom sheet.
    await page.getByTestId('drawer-backdrop').click({ position: { x: 8, y: 8 } });
    await expect(drawer).toBeHidden();
  });

  test('Apps drawer closes with Escape', async ({ page }) => {
    await loadDesktop(page);
    await page.getByRole('button', { name: 'All apps' }).click();
    const drawer = page.getByRole('dialog', { name: 'App drawer' });
    await expect(drawer).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
  });

  test('blog article is readable on mobile (regression: not crushed by the sidebar)', async ({ page }) => {
    await loadDesktop(page);

    // Open Notes from the drawer (the desktop + dock both expose "Notes").
    await page.getByRole('button', { name: 'All apps' }).click();
    const drawer = page.getByRole('dialog', { name: 'App drawer' });
    await drawer.getByRole('button', { name: 'Open Notes' }).first().click();

    const notes = windowByTitle(page, 'Notes');
    await expect(notes).toBeVisible();

    // List view → tap an essay → reader view.
    await notes.getByText('Anxiety is unspent agency').first().click();

    const body = notes.getByText('The more responsibility').first();
    await expect(body).toBeVisible();

    // The reader must be full-width, not a ~90px sliver next to the sidebar.
    const width = (await body.boundingBox())?.width ?? 0;
    expect(width).toBeGreaterThan(250);

    // And a back affordance returns to the list.
    await expect(notes.getByRole('button', { name: 'Back to notes list' })).toBeVisible();
  });

  test('Email tab opens the mail composer', async ({ page }) => {
    await loadDesktop(page);

    const tabBar = page.getByRole('navigation', { name: 'Main navigation' });
    await tabBar.getByRole('button', { name: /Email/ }).click();
    await expect(windowByTitle(page, 'New Message')).toBeVisible();
  });

  test('no cookie popup, boot splash, or welcome-back modal', async ({ page }) => {
    await loadDesktop(page);

    await expect(page.getByText('Cookie Policy')).toHaveCount(0);
    await expect(page.getByText(/tracking cookies/i)).toHaveCount(0);
    await expect(page.getByText(/welcome back/i)).toHaveCount(0);
    // The Library app is gone.
    await expect(page.getByText('Library', { exact: true })).toHaveCount(0);
  });
});

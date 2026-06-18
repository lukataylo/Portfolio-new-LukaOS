import { test, expect } from '@playwright/test';
import { desktopIcon, loadDesktop, windowByTitle } from './helpers';

test.describe('desktop shell', () => {
  test('boots to the desktop with menu bar, dock, and About window', async ({ page }) => {
    await loadDesktop(page);

    await expect(page.getByText('LukaOS', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('toolbar', { name: 'Application dock' })).toBeVisible();
    await expect(windowByTitle(page, 'About_Me.pdf')).toBeVisible();

    // The deep-link hash and document title follow the active window.
    await expect(page).toHaveURL(/#\/about$/);
    await expect(page).toHaveTitle(/About_Me\.pdf \| Luka Dadiani/);
  });

  test('window traffic lights: minimize and close', async ({ page }) => {
    await loadDesktop(page);
    const about = windowByTitle(page, 'About_Me.pdf');

    await about.getByRole('button', { name: 'Minimize window' }).click();
    await expect(about).toBeHidden();

    // Reopen from the desktop icon and close it for good.
    await desktopIcon(page, 'About_Me.pdf').dblclick();
    await expect(about).toBeVisible();
    await about.getByRole('button', { name: 'Close window' }).click();
    await expect(about).toBeHidden();
  });

  test('maximize expands the window and restore brings it back', async ({ page }) => {
    await loadDesktop(page);
    const about = windowByTitle(page, 'About_Me.pdf');
    const before = await about.boundingBox();

    await about.getByRole('button', { name: 'Maximize window' }).click();
    await expect.poll(async () => (await about.boundingBox())?.width).toBeGreaterThan(1200);

    await about.getByRole('button', { name: 'Restore window' }).click();
    await expect.poll(async () => (await about.boundingBox())?.width).toBe(before?.width);
  });

  test('opens apps from the dock', async ({ page }) => {
    await loadDesktop(page);
    await page.getByRole('button', { name: /^Open Finder/ }).click();
    await expect(windowByTitle(page, 'Finder')).toBeVisible();
  });

  test('menu bar: File ▸ Open About_Me.pdf focuses the CV', async ({ page }) => {
    await loadDesktop(page);
    await windowByTitle(page, 'About_Me.pdf').getByRole('button', { name: 'Close window' }).click();

    await page.getByText('File', { exact: true }).click();
    // Scope to the header: the desktop icon shares the same accessible name.
    await page.locator('header').getByRole('button', { name: 'Open About_Me.pdf' }).click();
    await expect(windowByTitle(page, 'About_Me.pdf')).toBeVisible();
  });

  test('theme toggle switches to dark mode and persists across reload', async ({ page }) => {
    await loadDesktop(page);
    const html = page.locator('#root > div');

    await page.getByRole('button', { name: 'Switch to Dark Mode' }).click();
    await expect(html).toHaveClass(/dark/);

    await page.reload();
    await expect(page.getByRole('main', { name: 'Desktop workspace' })).toBeVisible();
    await expect(page.locator('#root > div')).toHaveClass(/dark/);
  });

  test('hash deep links open the matching app', async ({ page }) => {
    await loadDesktop(page, '#/notes');
    await expect(windowByTitle(page, 'Notes')).toBeVisible();
  });

  test('LinkedIn + GitHub links sit above the fold in the menu bar', async ({ page }) => {
    await loadDesktop(page);

    const github = page.getByTestId('social-github');
    await expect(github).toBeVisible();
    await expect(github).toHaveAttribute('href', /github\.com\/lukataylo/);
    await expect(github).toHaveAttribute('target', '_blank');
    await expect(github).toHaveAttribute('rel', /noopener/);

    const linkedin = page.getByTestId('social-linkedin');
    await expect(linkedin).toBeVisible();
    await expect(linkedin).toHaveAttribute('href', /linkedin\.com\/in\//);
  });

  test('no cookie popup and no Library app remain', async ({ page }) => {
    await loadDesktop(page);

    await expect(page.getByText('Cookie Policy')).toHaveCount(0);
    await expect(page.getByText(/tracking cookies/i)).toHaveCount(0);
    // Library was removed entirely — no desktop icon, dock item, or window.
    await expect(page.getByRole('button', { name: 'Open Library' })).toHaveCount(0);
  });
});

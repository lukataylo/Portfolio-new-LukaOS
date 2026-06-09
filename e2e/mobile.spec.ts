import { test, expect } from '@playwright/test';
import { loadDesktop, windowByTitle } from './helpers';

test.describe('mobile shell', () => {
  test('shows the tab bar instead of the dock', async ({ page }) => {
    await loadDesktop(page);

    const tabBar = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(tabBar).toBeVisible();
    await expect(page.getByRole('toolbar', { name: 'Application dock' })).toBeHidden();

    // The two contact actions are first-class tabs.
    await expect(tabBar.getByRole('button', { name: /LinkedIn/ })).toBeVisible();
    await expect(tabBar.getByRole('button', { name: /Email/ })).toBeVisible();
  });

  test('Apps tab opens the drawer; launching an app closes it', async ({ page }) => {
    await loadDesktop(page);

    await page.getByRole('button', { name: 'All apps' }).click();
    const drawer = page.getByRole('dialog', { name: 'App drawer' });
    await expect(drawer).toBeVisible();

    await drawer.getByRole('button', { name: 'Open Library' }).click();
    await expect(drawer).toBeHidden();
    await expect(windowByTitle(page, 'Library')).toBeVisible();
  });

  test('Email tab opens the mail composer', async ({ page }) => {
    await loadDesktop(page);

    const tabBar = page.getByRole('navigation', { name: 'Main navigation' });
    await tabBar.getByRole('button', { name: /Email/ }).click();
    await expect(windowByTitle(page, 'New Message')).toBeVisible();
  });
});

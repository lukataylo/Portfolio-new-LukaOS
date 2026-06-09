import { test, expect, Locator } from '@playwright/test';
import { loadDesktop, windowByTitle } from './helpers';

/**
 * Type a terminal command and submit it. The terminal input can briefly drop
 * keystrokes while the window finishes its open animation and the lazy chunk
 * settles, so retry filling until the value sticks before pressing Enter.
 */
async function runCommand(input: Locator, cmd: string) {
  await expect(async () => {
    await input.fill(cmd);
    await expect(input).toHaveValue(cmd, { timeout: 1000 });
  }).toPass({ timeout: 8000 });
  await input.press('Enter');
}

test.describe('spotlight', () => {
  test('opens with Ctrl+Space, filters, and launches the selection', async ({ page }) => {
    await loadDesktop(page);

    await page.keyboard.press('Control+Space');
    const input = page.getByPlaceholder('Search files, notes, and more...');
    await expect(input).toBeVisible();

    await input.fill('terminal');
    await input.press('Enter');

    await expect(input).toBeHidden();
    await expect(windowByTitle(page, 'Terminal')).toBeVisible();
  });

  test('Escape closes spotlight without opening anything', async ({ page }) => {
    await loadDesktop(page);

    await page.keyboard.press('Control+Space');
    const input = page.getByPlaceholder('Search files, notes, and more...');
    await expect(input).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(input).toBeHidden();
  });
});

test.describe('terminal', () => {
  test('runs built-in commands with clean output', async ({ page }) => {
    await loadDesktop(page);
    await page.getByRole('button', { name: /^Open Terminal/ }).click();

    const terminal = windowByTitle(page, 'Terminal');
    const input = terminal.getByLabel('Terminal input');
    await expect(input).toBeVisible();

    await runCommand(input, 'whoami');
    await expect(terminal.getByText('Product Manager & Senior Designer')).toBeVisible();

    await runCommand(input, 'ls');
    // Directories are marked with a trailing slash — and no raw ANSI codes.
    await expect(terminal.getByText(/about-me\//)).toBeVisible();
    await expect(terminal.locator('text=/\\u001b\\[/')).toHaveCount(0);
  });
});

test.describe('notes', () => {
  test('lists the essays and opens one in the reader', async ({ page }) => {
    await loadDesktop(page, '#/notes');
    const notes = windowByTitle(page, 'Notes');
    await expect(notes).toBeVisible();

    await notes.getByText('Anxiety is unspent agency').first().click();
    await expect(notes.getByText('The more responsibility')).toBeVisible();
  });
});

test.describe('protected content', () => {
  test('locked case study asks for an access code', async ({ page }) => {
    await loadDesktop(page, '#/case-study/xtrade');
    const win = windowByTitle(page, 'xTrade (Confidential)');
    await expect(win).toBeVisible();
    await expect(win.getByText(/covered by an NDA/)).toBeVisible();
  });
});

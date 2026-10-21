import { test, expect } from '@playwright/test';
import { createTask, openBlankWorkspace } from './workspace';

test('production service worker reopens and edits saved work offline', async ({ page, context }) => {
  await openBlankWorkspace(page);
  await createTask(page, 'Offline inspection');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Offline inspection', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Rename Offline inspection', exact: true }).click();
  await page.getByLabel('Rename task', { exact: true }).fill('Inspection saved offline');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Inspection saved offline', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Inspection saved offline', exact: true })).toBeVisible();
  await context.setOffline(false);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Inspection saved offline', exact: true })).toBeVisible();
});

test('theme and sidebar preferences survive reload and task focus expands the workspace', async ({ page }) => {
  await openBlankWorkspace(page);
  await page.goto('/settings');
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('checkbox', { name: 'Keep the sidebar collapsed' }).click();
  await expect(page.getByRole('checkbox', { name: 'Keep the sidebar collapsed' })).toBeChecked();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('checkbox', { name: 'Keep the sidebar collapsed' })).toBeChecked();
  await page.getByRole('button', { name: 'Light', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.goto('/tasks');
  await page.getByRole('button', { name: 'Focus view', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Exit focus', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Exit focus', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Focus view', exact: true })).toBeVisible();
});

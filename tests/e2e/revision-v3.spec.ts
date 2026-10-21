import { test, expect } from '@playwright/test';
import { createTask, openBlankWorkspace } from './workspace';

const statuses = ['Open', 'In Progress', 'On Hold', 'Closed', 'Cancelled'] as const;

test('one status control supports all five saved states in compact list and table', async ({ page }) => {
  // Given a real task with optional Business Unit.
  await openBlankWorkspace(page);
  await createTask(page, 'Inspect a long business unit task title');
  await page.getByRole('button', { name: 'Inspect a long business unit task title', exact: true }).click();
  const editor = page.getByRole('dialog', { name: 'Edit task', exact: true });
  await editor.getByLabel('Business Unit', { exact: true }).fill('Marine operations');
  await editor.getByRole('button', { name: 'Save task', exact: true }).click();
  await expect(editor).toBeHidden();
  // When each supported status is saved through the sole visible control.
  for (const status of statuses) {
    const control = page.getByLabel('Move Inspect a long business unit task title to status', { exact: true });
    await expect(control).toHaveCount(1);
    await expect(control.locator('option')).toHaveText([...statuses]);
    await control.selectOption(status);
    await page.reload();
    // Then reopening preserves status, with no duplicate badge beside its editor.
    await expect(control).toHaveValue(status);
    await expect(page.locator('.task-row .status-badge')).toHaveCount(0);
  }
  await page.getByRole('button', { name: 'Table', exact: true }).click();
  await expect(page.locator('.task-table .status-control')).toHaveCount(1);
  await page.getByRole('button', { name: 'Inspect a long business unit task title', exact: true }).click();
  await expect(editor.getByLabel('Business Unit', { exact: true })).toHaveValue('Marine operations');
});

test('custom five-status palette persists and can be restored to defaults', async ({ page }, testInfo) => {
  // Given the saved appearance settings.
  await openBlankWorkspace(page);
  await page.goto('/settings');
  const defaults = await Promise.all(statuses.map(status => page.getByLabel(`${status} hex color`, { exact: true }).inputValue()));
  const colors = ['#123456', '#987612', '#654398', '#246842', '#765454'];
  // When every seed changes and is explicitly saved.
  for (const [index, status] of statuses.entries()) {
    const color = colors[index];
    if (color) await page.getByLabel(`${status} hex color`, { exact: true }).fill(color);
  }
  await page.getByRole('button', { name: 'Save status colors', exact: true }).click();
  await page.reload();
  // Then all colors survive reload, and reset restores the original default seeds.
  for (const [index, status] of statuses.entries()) await expect(page.getByLabel(`${status} hex color`, { exact: true })).toHaveValue(colors[index] ?? '');
  await page.locator('#status-colors').scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('custom-status-palette.png'), fullPage: true });
  await page.getByRole('button', { name: 'Reset to defaults', exact: true }).click();
  await page.reload();
  for (const [index, status] of statuses.entries()) await expect(page.getByLabel(`${status} hex color`, { exact: true })).toHaveValue(defaults[index] ?? '');
});

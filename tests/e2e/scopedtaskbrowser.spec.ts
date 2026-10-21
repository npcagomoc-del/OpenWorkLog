import { expect, test } from '@playwright/test';
import { createTask, openBlankWorkspace } from './workspace';

test.use({ viewport: { width: 375, height: 812 } });

test('focused board returns to the first lane when visible groups shrink', async ({ page }) => {
  await openBlankWorkspace(page);
  await createTask(page, 'Lane review');
  await page.getByRole('button', { name: 'Kanban', exact: true }).click();
  await page.getByRole('button', { name: 'Focus board', exact: true }).click();

  for (let step = 0; step < 4; step += 1) {
    await page.getByRole('button', { name: 'Next lane' }).click();
  }
  await expect(page.locator('.task-board-lane-label')).toContainText('Cancelled 5 / 5');

  await page.getByRole('button', { name: 'Cards', exact: true }).click();
  const details = page.getByRole('dialog', { name: 'Card details' });
  await details.getByLabel('Cancelled', { exact: true }).uncheck();
  await details.getByLabel('Closed', { exact: true }).uncheck();
  await details.getByRole('button', { name: 'Done', exact: true }).click();

  await expect(page.locator('.task-board-column')).toHaveCount(3);
  await expect(page.locator('.task-board-lane-label')).toContainText('Open 1 / 3');
  await expect.poll(() => page.locator('.task-board-viewport').evaluate((node) => node.scrollLeft)).toBe(0);
  await page.getByRole('button', { name: 'Next lane' }).click();
  await expect(page.locator('.task-board-lane-label')).toContainText('In Progress 2 / 3');
});

test('keyboard drop keeps focus when the last task leaves a temporary business unit', async ({ page }) => {
  await openBlankWorkspace(page);
  await createTask(page, 'Legacy work');
  await page.getByRole('button', { name: 'Legacy work', exact: true }).click();
  const editor = page.getByRole('dialog', { name: 'Edit task', exact: true });
  await editor.getByLabel('Business Unit', { exact: true }).fill('Legacy');
  await editor.getByRole('button', { name: 'Save task' }).click();
  await page.getByRole('button', { name: 'Kanban', exact: true }).click();
  await page.getByLabel('Group by', { exact: true }).selectOption('businessUnit');
  await page.getByRole('button', { name: 'Focus board', exact: true }).click();

  const handle = page.getByRole('button', { name: 'Drag Legacy work', exact: true });
  await handle.focus();
  await handle.press('Space', { delay: 50 });
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Space');

  await expect(page.getByRole('region', { name: 'Legacy tasks' })).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'No business unit tasks' }).getByRole('button', { name: 'Legacy work', exact: true })).toBeVisible();
  await expect(handle).toBeFocused();
  await expect(page.locator('.task-board-lane-label')).toContainText('No business unit 1 / 1');
  await expect.poll(() => page.locator('.task-board-viewport').evaluate((node) => node.scrollLeft)).toBe(0);
});

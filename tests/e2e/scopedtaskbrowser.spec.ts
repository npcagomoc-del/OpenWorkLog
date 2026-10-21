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

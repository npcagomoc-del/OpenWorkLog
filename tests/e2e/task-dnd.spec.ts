import { expect, test } from '@playwright/test';
import { createTask, openBlankWorkspace } from './workspace';
test('pointer task movement persists across all five status destinations', async ({ page }) => {
  await openBlankWorkspace(page); await createTask(page, 'Drag inventory review');
  await page.getByRole('button', { name: 'Kanban', exact: true }).click();
  const handle = page.getByRole('button', { name: 'Drag Drag inventory review', exact: true });
  const target = page.getByRole('region', { name: 'On Hold tasks', exact: true });
  await target.scrollIntoViewIfNeeded(); const start = await handle.boundingBox(); const end = await target.boundingBox();
  if (!start || !end) throw new Error('Visible drag targets required');
  await page.mouse.move(start.x + 22, start.y + 22); await page.mouse.down();
  await page.mouse.move(start.x + 32, start.y + 22, { steps: 3 });
  await page.mouse.move(end.x + end.width / 2, end.y + 80, { steps: 16 });
  await expect(target).toHaveClass(/--over/); await page.mouse.up();
  await expect(target.getByRole('button', { name: 'Drag inventory review', exact: true })).toBeVisible();
  await page.reload(); await expect(target.getByRole('button', { name: 'Drag inventory review', exact: true })).toBeVisible();
});
test('keyboard moves and cancels between groups while restoring focus', async ({ page }) => {
  await openBlankWorkspace(page); await createTask(page, 'Keyboard review');
  await page.getByRole('button', { name: 'Kanban', exact: true }).click();
  const handle = page.getByRole('button', { name: 'Drag Keyboard review', exact: true });
  await handle.focus(); await handle.press('Space', { delay: 50 }); await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('region', { name: 'In Progress tasks', exact: true })).toHaveClass(/--over/);
  await page.keyboard.press('Escape'); await expect(handle).toBeFocused();
  await expect(page.getByRole('region', { name: 'Open tasks', exact: true }).getByRole('button', { name: 'Keyboard review', exact: true })).toBeVisible();
  await handle.press('Space', { delay: 50 }); await expect(handle).toHaveAttribute('aria-pressed', 'true'); await page.keyboard.press('ArrowRight'); await expect(page.getByRole('region', { name: 'In Progress tasks', exact: true })).toHaveClass(/--over/); await page.keyboard.press('Space');
  await expect(page.getByRole('region', { name: 'In Progress tasks', exact: true }).getByRole('button', { name: 'Keyboard review', exact: true })).toBeVisible();
  await expect(handle).toBeFocused();
});

test('keyboard category drop changes category while retaining status', async ({ page }) => {
  await openBlankWorkspace(page); await createTask(page, 'Category keyboard');
  await page.getByRole('button', { name: 'Kanban', exact: true }).click();
  await page.getByLabel('Group by', { exact: true }).selectOption('category');
  const handle = page.getByRole('button', { name: 'Drag Category keyboard', exact: true });
  await handle.focus(); await handle.press('Space', { delay: 50 });
  await expect(handle).toHaveAttribute('aria-pressed', 'true'); await page.keyboard.press('ArrowRight');
  await expect(page.locator('.task-board-column--over')).toHaveCount(1);
  await page.keyboard.press('Space');
  await expect(page.getByRole('region', { name: 'Uncategorized tasks', exact: true }).getByRole('button', { name: 'Category keyboard', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Category keyboard', exact: true }).click();
  const editor = page.getByRole('dialog', { name: 'Edit task', exact: true });
  await expect(editor.getByLabel('Status', { exact: true })).toHaveValue('Open');
  await expect(editor.getByLabel('Category', { exact: true })).not.toHaveValue('');
});
test.describe('touch horizontal board', () => {
 test.use({ hasTouch: true, viewport: { width: 430, height: 932 } });
 test('deliberate touch moves to the next visible column and keeps page within viewport', async ({ page, context }, info) => {
  await openBlankWorkspace(page); await createTask(page, 'Touch review');
  await page.getByRole('button', { name: 'Kanban', exact: true }).click();
  const handle = page.getByRole('button', { name: 'Drag Touch review', exact: true });
  await handle.scrollIntoViewIfNeeded();
  const start = await handle.boundingBox(); const end = await page.getByRole('region', { name: 'In Progress tasks', exact: true }).boundingBox();
  if (!start || !end) throw new Error('Touch controls need bounds');
  const session = await context.newCDPSession(page);
  const x = start.x + start.width / 2; const y = start.y + start.height / 2;
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await expect(page.locator('.task-drag-preview')).toBeVisible();
  const targetX = Math.min(410, end.x + 35); const targetY = end.y + 65;
  for (let step = 1; step <= 12; step += 1) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (targetX - x) * step / 12, y: y + (targetY - y) * step / 12 }] });
  await expect(page.getByRole('region', { name: 'In Progress tasks', exact: true })).toHaveClass(/--over/);
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.getByRole('region', { name: 'In Progress tasks', exact: true }).getByRole('button', { name: 'Touch review', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  while (await page.getByRole('button', { name: 'Dismiss notification', exact: true }).count()) await page.getByRole('button', { name: 'Dismiss notification', exact: true }).first().click(); await page.locator('main').evaluate((element) => { element.scrollTop = element.scrollHeight; }); await page.locator('.task-board-viewport').evaluate((element) => { element.scrollLeft = 300; }); await page.screenshot({ path: info.outputPath('touch-board.png') }); await page.locator('.task-board-viewport').screenshot({ path: info.outputPath('touch-board-detail.png') }); await session.detach();
 });
});

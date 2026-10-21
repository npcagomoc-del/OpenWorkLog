import { test, expect } from '@playwright/test';
import { createTask, openBlankWorkspace } from './workspace';

test('dragging a task between status columns persists after reload', async ({ page }, testInfo) => {
  await openBlankWorkspace(page);
  await createTask(page, 'Drag inventory review');
  await page.getByRole('button', { name: 'Kanban', exact: true }).click();
  const handle = page.getByRole('button', { name: 'Drag Drag inventory review', exact: true });
  const target = page.getByRole('region', { name: 'In Progress tasks', exact: true });
  const start = await handle.boundingBox();
  const end = await target.boundingBox();
  expect(start).toBeTruthy();
  expect(end).toBeTruthy();
  if (!start || !end) throw new Error('Drag controls must have visible bounds');
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(start.x + start.width / 2 + 10, start.y + start.height / 2, { steps: 3 });
  await expect(page.locator('.task-drag-preview')).toBeVisible();
  await page.mouse.move(end.x + end.width / 2, end.y + 80, { steps: 12 });
  await expect(target).toHaveClass(/task-board-column--over/);
  await page.screenshot({ path: testInfo.outputPath('task-drag-active.png') });
  await page.mouse.up();
  await expect(target.getByRole('button', { name: 'Drag inventory review', exact: true })).toBeVisible();
  await expect(page.getByLabel('Move Drag inventory review to status')).toHaveValue('In Progress');
  await page.reload();
  await expect(page.getByLabel('Move Drag inventory review to status')).toHaveValue('In Progress');
});

test('keyboard move supports cancel, status movement and focus restoration', async ({ page }, testInfo) => {
  await openBlankWorkspace(page);
  await createTask(page, 'Keyboard backup review');
  await page.getByRole('button', { name: 'Kanban', exact: true }).click();
  const handle = page.getByRole('button', { name: 'Drag Keyboard backup review', exact: true });
  await handle.focus();
  // Core attaches its keyboard listener after activation; use a held keypress and observable lift state.
  await handle.press('Space', { delay: 50 });
  await expect(handle).toHaveAttribute('aria-pressed', 'true');
  await expect(handle).toBeFocused();
  await expect(page.locator('.task-board-card--dragging')).toHaveCSS('opacity', '1');
  const visualOverlay = page.locator('.task-drag-visual');
  await expect(visualOverlay).toHaveAttribute('aria-hidden', 'true');
  await expect(visualOverlay).toHaveCSS('pointer-events', 'none');
  await expect(visualOverlay.locator('button, a, input, select, textarea, [tabindex]')).toHaveCount(0);
  await expect(handle.locator('xpath=ancestor::*[@aria-hidden="true"]')).toHaveCount(0);
  await expect(page.getByRole('status').filter({ hasText: /Picked up Keyboard backup review|Over Open/ })).toBeVisible();
  await expect(page.locator('.task-drag-preview')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('region', { name: 'In Progress tasks', exact: true })).toHaveClass(/task-board-column--over/);
  await page.keyboard.press('Escape');
  await expect(page.locator('.task-drag-preview')).toBeHidden();
  await expect(page.getByLabel('Move Keyboard backup review to status')).toHaveValue('Open');
  await handle.focus();
  await handle.press('Space', { delay: 50 });
  await expect(handle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('status').filter({ hasText: /Picked up Keyboard backup review|Over Open/ })).toBeVisible();
  await expect(page.locator('.task-drag-preview')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('region', { name: 'In Progress tasks', exact: true })).toHaveClass(/task-board-column--over/);
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('region', { name: 'Closed tasks', exact: true })).toHaveClass(/task-board-column--over/);
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('region', { name: 'In Progress tasks', exact: true })).toHaveClass(/task-board-column--over/);
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('region', { name: 'Closed tasks', exact: true })).toHaveClass(/task-board-column--over/);
  await page.keyboard.press('Space');
  await expect(page.getByLabel('Move Keyboard backup review to status')).toHaveValue('Closed');
  await expect(handle).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath('task-keyboard-moved.png') });
  await page.reload();
  await expect(page.getByLabel('Move Keyboard backup review to status')).toHaveValue('Closed');
});

test.describe('touch task movement', () => {
  test.use({ hasTouch: true, viewport: { width: 430, height: 932 } });
  test('a held drag handle moves a task and persists after reload', async ({ page, context }, testInfo) => {
    await openBlankWorkspace(page);
    await createTask(page, 'Touch support request');
    await page.getByRole('button', { name: 'Kanban', exact: true }).click();
    await page.getByRole('region', { name: 'Open tasks', exact: true }).evaluate((element) => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
    const handle = page.getByRole('button', { name: 'Drag Touch support request', exact: true });
    await handle.scrollIntoViewIfNeeded();
    const target = page.getByRole('region', { name: 'In Progress tasks', exact: true });
    const start = await handle.boundingBox();
    const end = await target.boundingBox();
    if (!start || !end) throw new Error('Touch drag targets must be visible');
    expect(end.y + 60).toBeLessThan(850);
    const session = await context.newCDPSession(page);
    const x = start.x + start.width / 2;
    const y = start.y + start.height / 2;
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await page.waitForTimeout(260);
    await expect(page.locator('.task-drag-preview')).toBeVisible();
    for (let step = 1; step <= 12; step += 1) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (end.x + end.width / 2 - x) * step / 12, y: y + (end.y + 60 - y) * step / 12 }] });
    }
    await expect(target).toHaveClass(/task-board-column--over/);
    const preview = await page.locator('.task-drag-preview').boundingBox();
    if (!preview) throw new Error('Touch drag preview must be visible');
    expect(preview.x).toBeGreaterThanOrEqual(0);
    expect(preview.x + preview.width).toBeLessThanOrEqual(430);
    await page.screenshot({ path: testInfo.outputPath('task-touch-active.png') });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(page.getByLabel('Move Touch support request to status')).toHaveValue('In Progress');
    await page.reload();
    await expect(page.getByLabel('Move Touch support request to status')).toHaveValue('In Progress');
    await session.detach();
  });
});

import { expect, test, type Page } from '@playwright/test';
import { createTask, openBlankWorkspace } from './workspace';

async function fitDocument(page: Page): Promise<void> {
  const widths = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(widths.content).toBeLessThanOrEqual(widths.viewport + 1);
}

test('phone calendar focus keeps a day readable and updates a linked category color live', async ({ page, context }, info) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await openBlankWorkspace(page);
  await page.goto('/settings');
  await page.getByLabel('New category', { exact: true }).fill('Field work');
  await page.getByLabel('Color', { exact: true }).fill('#7042a4');
  await page.getByRole('button', { name: 'Add category', exact: true }).click();
  await expect(page.getByLabel('Color for Field work', { exact: true })).toHaveValue('#7042a4');
  await createTask(page, 'Inspect vessel camera');
  await page.getByRole('button', { name: 'Inspect vessel camera', exact: true }).click();
  const task = page.getByRole('dialog', { name: 'Edit task', exact: true });
  await task.getByLabel('Category', { exact: true }).selectOption({ label: 'Field work' });
  await task.getByRole('button', { name: 'Save task', exact: true }).click();
  await page.goto('/calendar');
  await page.getByRole('button', { name: 'New plan', exact: true }).click();
  const plan = page.getByRole('dialog', { name: 'Plan your time' });
  await plan.getByLabel('Linked task', { exact: true }).selectOption({ label: 'Inspect vessel camera' });
  await plan.getByLabel('From', { exact: true }).fill('09:00');
  await plan.getByLabel('To', { exact: true }).selectOption({ label: '10:00' });
  await plan.getByRole('button', { name: 'Save plan', exact: true }).click();
  await page.getByRole('button', { name: 'Day', exact: true }).click();
  await page.getByRole('button', { name: 'Focus calendar', exact: true }).click();
  await expect(page.getByRole('toolbar', { name: 'Calendar focus controls' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Choose calendar date' }).getByRole('button')).toHaveCount(7);
  const event = page.locator('.calendar-block[data-calendar-plan]').filter({ hasText: 'Inspect vessel camera' });
  await expect(event).toBeVisible();
  await expect(event).toHaveCSS('--calendar-category-color', '#7042a4');
  await fitDocument(page);
  await page.screenshot({ path: info.outputPath('phone-375-calendar-focus.png'), animations: 'disabled' });

  const editor = await context.newPage();
  await editor.goto('/settings');
  await editor.getByLabel('Color for Field work', { exact: true }).fill('#16805e');
  const saveColor = editor.locator('.category-row').filter({ has: editor.getByLabel('Color for Field work', { exact: true }) }).getByRole('button', { name: 'Save', exact: true });
  await expect(saveColor).toBeEnabled();
  await saveColor.click();
  await expect(event).toHaveCSS('--calendar-category-color', '#16805e');
  await page.setViewportSize({ width: 430, height: 932 });
  await fitDocument(page);
  await page.screenshot({ path: info.outputPath('phone-430-calendar-updated-color.png'), animations: 'disabled' });
  await page.getByRole('button', { name: 'Exit calendar focus', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Focus calendar', exact: true })).toBeVisible();
});

test('phone Kanban focus navigates roomy lanes and keeps a keyboard drop', async ({ page }, info) => {
  await page.setViewportSize({ width: 430, height: 932 });
  await openBlankWorkspace(page);
  await createTask(page, 'Review safety checklist');
  await page.getByRole('button', { name: 'Kanban', exact: true }).click();
  await page.getByRole('button', { name: 'Focus board', exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Board lanes' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Exit focus', exact: true })).toBeVisible();
  const handle = page.getByRole('button', { name: 'Drag Review safety checklist', exact: true });
  await handle.focus();
  await handle.press('Space');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('region', { name: 'In Progress tasks', exact: true })).toHaveClass(/--over/);
  await page.keyboard.press('Space');
  await expect(page.getByRole('region', { name: 'In Progress tasks', exact: true }).getByRole('button', { name: 'Review safety checklist', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next lane', exact: true }).click();
  await fitDocument(page);
  await page.screenshot({ path: info.outputPath('phone-430-kanban-focus.png'), animations: 'disabled' });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Kanban', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Focus board', exact: true }).click();
  await expect(page.getByRole('region', { name: 'In Progress tasks', exact: true }).getByRole('button', { name: 'Review safety checklist', exact: true })).toBeVisible();
});

test('appearance presets persist independently of light and super dark', async ({ page }, info) => {
  await openBlankWorkspace(page);
  await page.goto('/settings');
  await page.getByRole('button', { name: /Warm.*terracotta/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-preset', 'claude');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.setViewportSize({ width: 800, height: 1280 });
  await page.screenshot({ path: info.outputPath('tablet-800-warm-light.png'), animations: 'disabled' });
  await page.getByRole('button', { name: 'Super dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'black');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-preset', 'claude');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'black');
  await page.getByRole('button', { name: /Apple.*blue/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-preset', 'apple');
  await page.setViewportSize({ width: 1280, height: 800 });
  await fitDocument(page);
  await page.screenshot({ path: info.outputPath('tablet-1280-apple-super-dark.png'), animations: 'disabled' });
  await page.getByRole('button', { name: 'Light', exact: true }).click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-preset', 'apple');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.screenshot({ path: info.outputPath('desktop-1440-apple-light.png'), animations: 'disabled' });
});

test('explicit Daily edit changes its canonical task and keeps a sibling entry', async ({ page }, info) => {
  await openBlankWorkspace(page);
  await createTask(page, 'Inspect switch cabinet');
  await page.goto('/daily');
  await page.getByRole('button', { name: 'Add entry', exact: true }).click();
  const add = page.getByRole('dialog', { name: 'Add daily entry' });
  await add.getByLabel('Linked task / operational task', { exact: true }).selectOption({ label: 'Inspect switch cabinet' });
  await add.getByRole('button', { name: 'Save entry', exact: true }).click();
  await page.getByRole('button', { name: 'Add entry', exact: true }).click();
  await add.getByLabel('Linked task / operational task', { exact: true }).selectOption({ label: 'Inspect switch cabinet' });
  await add.getByLabel('Task / activity', { exact: true }).fill('Second inspection record');
  await add.getByRole('button', { name: 'Save entry', exact: true }).click();
  await page.getByRole('button', { name: 'Inspect switch cabinet', exact: true }).click();
  const edit = page.getByRole('dialog', { name: 'Edit daily entry' });
  await edit.getByLabel('Task / activity', { exact: true }).fill('Inspect cabinet and uplink');
  await edit.getByLabel('Entry status', { exact: true }).selectOption('Closed');
  await edit.getByLabel('Work done', { exact: true }).fill('Cabinet inspection complete; uplink stable.');
  await edit.getByRole('button', { name: 'Save entry', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Second inspection record', exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath('daily-linked-history.png'), animations: 'disabled' });
  await page.goto('/tasks');
  await expect(page.getByRole('button', { name: 'Inspect cabinet and uplink', exact: true })).toHaveCount(1);
  await expect(page.getByLabel('Move Inspect cabinet and uplink to status', { exact: true })).toHaveValue('Closed');
  await page.getByRole('button', { name: 'Inspect cabinet and uplink', exact: true }).click();
  const task = page.getByRole('dialog', { name: 'Edit task', exact: true });
  await expect(task.getByLabel('Latest update', { exact: true })).toHaveValue('Cabinet inspection complete; uplink stable.');
  await page.reload();
  await expect(page.getByLabel('Move Inspect cabinet and uplink to status', { exact: true })).toHaveValue('Closed');
});

test('real pen input saves handwriting across offline production reload', async ({ page, context }, info) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await openBlankWorkspace(page);
  await page.goto('/notes');
  await page.getByRole('button', { name: 'New note', exact: true }).click();
  await page.getByLabel('Note title', { exact: true }).fill('Offline field sketch');
  await page.getByRole('button', { name: 'Save note', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.getByRole('button', { name: 'Add handwriting', exact: true }).click();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button', { name: 'Add handwriting', exact: true }).click();
  const canvas = page.getByLabel('Handwriting canvas', { exact: true });
  await canvas.scrollIntoViewIfNeeded();
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error('Handwriting canvas has no visible bounds');
  const cdp = await context.newCDPSession(page);
  const x = bounds.x + bounds.width * 0.2;
  const y = bounds.y + bounds.height * 0.3;
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1, pointerType: 'pen', force: 0.25 });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x + 35, y: y + 18, button: 'left', buttons: 1, pointerType: 'pen', force: 0.8 });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x + 70, y: y + 34, button: 'left', buttons: 0, clickCount: 1, pointerType: 'pen', force: 0.5 });
  await expect(page.getByTestId('ink-stroke-count')).toHaveText('1 stroke');
  await expect(page.getByTestId('ink-save-state')).toHaveText('Saved on this device');
  await page.getByRole('button', { name: 'Undo handwriting', exact: true }).click();
  await expect(page.getByTestId('ink-stroke-count')).toHaveText('0 strokes');
  await page.getByRole('button', { name: 'Redo handwriting', exact: true }).click();
  await expect(page.getByTestId('ink-stroke-count')).toHaveText('1 stroke');
  await page.reload();
  await expect(page.getByTestId('ink-stroke-count')).toHaveText('1 stroke');
  await canvas.scrollIntoViewIfNeeded();
  await expect(canvas).toBeInViewport();
  await fitDocument(page);
  await page.screenshot({ path: info.outputPath('phone-375-offline-pen.png'), animations: 'disabled' });
  await cdp.detach();
  await context.setOffline(false);
});

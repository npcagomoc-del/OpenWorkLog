import { expect, test, type Page } from '@playwright/test';
import { openBlankWorkspace } from './workspace';

async function createInkNote(page: Page) {
  await openBlankWorkspace(page);
  await page.goto('/notes');
  await page.getByRole('button', { name: 'New note', exact: true }).click();
  await page.getByLabel('Note title', { exact: true }).fill('Handwriting practice');
  await page.getByRole('button', { name: 'Save note', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.getByRole('button', { name: 'Add handwriting' }).click();
}
async function penStroke(page: Page, pointerType = 'pen') {
  await page.getByLabel('Handwriting canvas', { exact: true }).evaluate((canvas, kind) => {
    const bounds = canvas.getBoundingClientRect();
    const emit = (name: string, x: number, pressure: number) => canvas.dispatchEvent(new PointerEvent(name, {
      bubbles: true, pointerId: 41, pointerType: kind, isPrimary: true,
      clientX: bounds.left + bounds.width * x, clientY: bounds.top + bounds.height * 0.3,
      pressure, buttons: name === 'pointerup' ? 0 : 1,
    }));
    emit('pointerdown', 0.2, 0.2);
    emit('pointermove', 0.3, 0.8);
    emit('pointerup', 0.4, 0.5);
  }, pointerType);
}

test('pen ink saves, ignores touch, undoes and survives reload', async ({ page }) => {
  // Given a saved study note with pen-only input.
  await createInkNote(page);
  // When pen events draw a stroke and an incidental touch crosses the page.
  await penStroke(page);
  await penStroke(page, 'touch');
  // Then one persisted stroke remains, undo and redo are reversible, and reload retains it.
  await expect(page.getByTestId('ink-stroke-count')).toHaveText('1 stroke');
  await expect(page.getByTestId('ink-save-state')).toHaveText('Saved on this device');
  await page.getByRole('button', { name: 'Undo handwriting' }).click();
  await expect(page.getByTestId('ink-stroke-count')).toHaveText('0 strokes');
  await page.getByRole('button', { name: 'Redo handwriting' }).click();
  await expect(page.getByTestId('ink-save-state')).toHaveText('Saved on this device');
  await page.reload();
  await expect(page.getByTestId('ink-stroke-count')).toHaveText('1 stroke');
});

test('mouse drawing and whole-stroke eraser work offline on the loaded page', async ({ page, context }) => {
  // Given a loaded note and a real mouse gesture while network is unavailable.
  await createInkNote(page);
  await context.setOffline(true);
  const canvas = page.getByLabel('Handwriting canvas', { exact: true });
  await canvas.scrollIntoViewIfNeeded();
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error('Canvas must have bounds');
  await page.mouse.move(bounds.x + bounds.width * 0.2, bounds.y + bounds.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width * 0.4, bounds.y + bounds.height * 0.3, { steps: 8 });
  await page.mouse.up();
  await expect(page.getByTestId('ink-stroke-count')).toHaveText('1 stroke');
  await expect(page.getByTestId('ink-save-state')).toHaveText('Saved on this device');
  // When erasing across that stroke.
  await page.getByRole('button', { name: 'Eraser', exact: true }).click();
  await penStroke(page);
  // Then the entire stroke is removed and undo restores it.
  await expect(page.getByTestId('ink-stroke-count')).toHaveText('0 strokes');
  await page.getByRole('button', { name: 'Undo handwriting' }).click();
  await expect(page.getByTestId('ink-stroke-count')).toHaveText('1 stroke');
  await context.setOffline(false);
});

test('cancelled pointers do not commit and explicit finger drawing does', async ({ page }) => {
  // Given a note and an interrupted pen gesture.
  await createInkNote(page);
  const canvas = page.getByLabel('Handwriting canvas', { exact: true });
  await canvas.dispatchEvent('pointerdown', { pointerId: 2, pointerType: 'pen', clientX: 100, clientY: 100, buttons: 1 });
  await canvas.evaluate((element) => element.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerId: 2, pointerType: 'pen' })));
  await expect(page.getByTestId('ink-stroke-count')).toHaveText('0 strokes');
  // When finger mode is enabled, touch events create handwriting.
  await page.getByRole('button', { name: 'Handwriting options' }).click();
  await page.getByLabel('Draw with finger (disables scrolling on paper)').check();
  await penStroke(page, 'touch');
  // Then the committed stroke is saved.
  await expect(page.getByTestId('ink-stroke-count')).toHaveText('1 stroke');
  await expect(page.getByTestId('ink-save-state')).toHaveText('Saved on this device');
});

test('handwriting roundtrips through downloaded backup and confirmed restore', async ({ page }, testInfo) => {
  // Given saved handwriting and its real backup file.
  await createInkNote(page);
  await penStroke(page);
  await expect(page.getByTestId('ink-save-state')).toHaveText('Saved on this device');
  await page.goto('/settings');
  const ready = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download backup', exact: true }).click();
  const backup = await ready;
  const path = testInfo.outputPath('ink-backup.json');
  await backup.saveAs(path);
  await page.goto('/notes');
  await page.getByRole('button', { name: 'Eraser', exact: true }).click();
  await penStroke(page);
  await expect(page.getByTestId('ink-stroke-count')).toHaveText('0 strokes');
  await expect(page.getByTestId('ink-save-state')).toHaveText('Saved on this device');
  // When the original backup is explicitly restored.
  await page.goto('/settings');
  await page.getByLabel('Choose OpenWorkLog backup', { exact: true }).setInputFiles(path);
  await page.getByRole('button', { name: 'Replace workspace with this backup', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, replace workspace', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.goto('/notes');
  // Then the original stroke is rendered after restore and reload.
  await page.reload();
  await expect(page.getByTestId('ink-stroke-count')).toHaveText('1 stroke');
  const painted = await page.getByLabel('Handwriting canvas', { exact: true }).evaluate((element) => {
    if (!(element instanceof HTMLCanvasElement)) return false;
    const pixels = element.getContext('2d')?.getImageData(0, 0, element.width, element.height).data;
    return pixels?.some((value, index) => index % 4 === 3 && value > 0) ?? false;
  });
  expect(painted).toBe(true);
});

for (const width of [375, 768, 1280]) {
  test(`writing area fits viewport ${width} and keeps ink after resizing`, async ({ page }, testInfo) => {
    // Given a note on the requested mobile/tablet/desktop viewport.
    await page.setViewportSize({ width, height: 900 });
    await createInkNote(page);
    await penStroke(page);
    await page.getByRole('button', { name: 'Expand writing area' }).click();
    // When the expanded writer is shown, controls and paper fit without body overflow.
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCSS('opacity', '1');
    const paper = await page.getByLabel('Handwriting canvas', { exact: true }).boundingBox();
    expect(paper?.y).toBeLessThanOrEqual(116);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`ink-${width}.png`), fullPage: true, animations: 'disabled' });
    await page.getByRole('button', { name: 'Close dialog' }).click();
    await page.setViewportSize({ width: 900, height: 768 });
    // Then the same logical drawing survives layout and focus changes.
    await expect(page.getByTestId('ink-stroke-count')).toHaveText('1 stroke');
  });
}


test('explicit restore supersedes a failed-save recovery draft', async ({ page }, testInfo) => {
  // Given a blank-note backup followed by an ink save failing at IndexedDB's real write boundary.
  await createInkNote(page);
  await page.goto('/settings');
  const ready = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download backup', exact: true }).click();
  const path = testInfo.outputPath('before-ink.json');
  await (await ready).saveAs(path);
  await page.goto('/notes');
  await page.getByRole('button', { name: 'Add handwriting' }).click();
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function(value, key) {
      if (this.name === 'notes') throw new DOMException('Simulated device storage failure', 'QuotaExceededError');
      return key === undefined ? put.call(this, value) : put.call(this, value, key);
    };
  });
  await penStroke(page);
  await expect(page.getByTestId('ink-save-state')).toHaveText('Handwriting not saved');
  // When the user explicitly restores the earlier backup in the same SPA session.
  await page.getByRole('link', { name: 'Settings', exact: true }).first().click();
  await page.getByLabel('Choose OpenWorkLog backup', { exact: true }).setInputFiles(path);
  await page.getByRole('button', { name: 'Replace workspace with this backup', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, replace workspace', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.getByRole('link', { name: 'Study Notes', exact: true }).first().click();
  // Then the restored blank note wins over its discarded recovery journal.
  await expect(page.getByRole('button', { name: 'Add handwriting' })).toBeVisible();
});

test('mounted handwriting follows another tabs saved ink', async ({ page, context }) => {
  // Given the same note open in two independent views.
  await createInkNote(page);
  const observer = await context.newPage();
  await observer.goto('/notes');
  await observer.getByRole('button', { name: 'Add handwriting' }).click();
  // When one tab saves a pen stroke.
  await penStroke(page);
  await expect(page.getByTestId('ink-save-state')).toHaveText('Saved on this device');
  // Then the already-mounted second writer receives it without reload.
  await expect(observer.getByTestId('ink-stroke-count')).toHaveText('1 stroke');
});

test('incidental touch does not change the active pen touch-action or add strokes', async ({ page }) => {
  // Given a pen already writing on paper.
  await createInkNote(page);
  const canvas = page.getByLabel('Handwriting canvas', { exact: true });
  await canvas.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const send = (type: string, pointerType: string, pointerId: number) => element.dispatchEvent(new PointerEvent(type, {
      bubbles: true, pointerType, pointerId, clientX: bounds.left + 40, clientY: bounds.top + 40, pressure: 0.7, buttons: 1,
    }));
    send('pointerover', 'pen', 7);
    send('pointerdown', 'pen', 7);
    // When a second contact reaches the canvas while the pen is down.
    send('pointerover', 'touch', 8);
    send('pointerdown', 'touch', 8);
  });
  // Then palm contact cannot reset the active pen's scroll suppression.
  await expect(canvas).toHaveCSS('touch-action', 'none');
  await canvas.evaluate((element) => element.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 7, pointerType: 'pen', pressure: 0.5 })));
  await expect(page.getByTestId('ink-stroke-count')).toHaveText('1 stroke');
});


test('failed handwriting save retains a retryable drawing', async ({ page }) => {
  // Given a device write that fails once at the IndexedDB boundary.
  await createInkNote(page);
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    let fail = true;
    IDBObjectStore.prototype.put = function(value, key) {
      if (this.name === 'notes' && fail) {
        fail = false;
        throw new DOMException('Simulated device storage failure', 'QuotaExceededError');
      }
      return key === undefined ? put.call(this, value) : put.call(this, value, key);
    };
  });
  await penStroke(page);
  await expect(page.getByTestId('ink-save-state')).toHaveText('Handwriting not saved');
  await expect(page.getByTestId('ink-stroke-count')).toHaveText('1 stroke');
  // When saving is retried after storage is available.
  await page.getByRole('button', { name: 'Save handwriting', exact: true }).click();
  // Then the same drawing is committed and survives reload.
  await expect(page.getByTestId('ink-save-state')).toHaveText('Saved on this device');
  await page.reload();
  await expect(page.getByTestId('ink-stroke-count')).toHaveText('1 stroke');
});

import { expect, test, type Page } from '@playwright/test';
import { openBlankWorkspace } from './workspace';

async function draw(page: Page) {
  await page.getByLabel('Handwriting canvas', { exact: true }).evaluate((canvas) => {
    const bounds = canvas.getBoundingClientRect();
    for (const [type, offset] of [['pointerdown', 30], ['pointermove', 60], ['pointerup', 90]] as const)
      canvas.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerType: 'pen', pointerId: 6,
        clientX: bounds.left + offset, clientY: bounds.top + 30, pressure: 0.5, buttons: type === 'pointerup' ? 0 : 1 }));
  });
  await expect(page.getByTestId('ink-save-state')).toHaveText('Saved on this device');
}
for (const restore of [false, true]) {
  test(`typed editor preserves ${restore ? 'restored' : 'another tabs new'} ink`, async ({ page, context }, testInfo) => {
    // Given a typed editor opened before another view changes this note's handwriting.
    await openBlankWorkspace(page);
    await page.goto('/notes');
    await page.getByRole('button', { name: 'New note', exact: true }).click();
    await page.getByLabel('Note title', { exact: true }).fill('Concurrent ink');
    await page.getByRole('button', { name: 'Save note', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    const writer = await context.newPage();
    await writer.goto('/settings');
    const ready = writer.waitForEvent('download');
    await writer.getByRole('button', { name: 'Download backup', exact: true }).click();
    const backup = testInfo.outputPath('blank-ink.json');
    await (await ready).saveAs(backup);
    await page.getByRole('button', { name: 'Add handwriting' }).click();
    await draw(page);
    await page.getByRole('button', { name: 'Edit note', exact: true }).click();
    const editor = page.getByRole('dialog', { name: 'Edit study note' });
    await editor.getByLabel('Study notes', { exact: true }).fill('Typed text added independently');
    if (restore) {
      await writer.getByLabel('Choose OpenWorkLog backup', { exact: true }).setInputFiles(backup);
      await writer.getByRole('button', { name: 'Replace workspace with this backup', exact: true }).click();
      await writer.getByRole('button', { name: 'Yes, replace workspace', exact: true }).click();
      await expect(writer.getByRole('dialog')).toBeHidden();
    } else {
      await writer.goto('/notes');
      await draw(writer);
      await expect(writer.getByTestId('ink-stroke-count')).toHaveText('2 strokes');
    }
    // When the old typed editor saves its text.
    await editor.getByRole('button', { name: 'Save note', exact: true }).click();
    await expect(editor).toBeHidden();
    await page.reload();
    // Then the separately saved or restored drawing survives, alongside the text.
    await expect(page.getByText('Typed text added independently', { exact: true }).last()).toBeVisible();
    if (restore) await expect(page.getByRole('button', { name: 'Add handwriting' })).toBeVisible();
    else await expect(page.getByTestId('ink-stroke-count')).toHaveText('2 strokes');
  });
}

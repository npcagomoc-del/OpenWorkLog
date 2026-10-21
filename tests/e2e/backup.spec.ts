import { test, expect } from '@playwright/test';
import { createTask, openBlankWorkspace } from './workspace';

test('backup preview requires confirmation and restore replaces changed data', async ({ page, context }, testInfo) => {
  // Given a downloaded backup and a task changed after that backup.
  await openBlankWorkspace(page);
  await createTask(page, 'Original inspection');
  await page.goto('/settings');
  const downloadReady = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download backup', exact: true }).click();
  const download = await downloadReady;
  const backupPath = testInfo.outputPath('workspace-backup.json');
  await download.saveAs(backupPath);
  await page.goto('/tasks');
  await page.getByRole('button', { name: 'Rename Original inspection', exact: true }).click();
  await page.getByLabel('Rename task', { exact: true }).fill('Changed after backup');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Changed after backup', exact: true })).toBeVisible();
  await page.goto('/settings');
  // When a backup is selected, only its preview is displayed.
  await page.getByLabel('Choose OpenWorkLog backup', { exact: true }).setInputFiles(backupPath);
  await expect(page.getByRole('heading', { name: 'Review this backup' })).toBeVisible();
  const observer = await context.newPage();
  await observer.goto('/tasks');
  await expect(observer.getByRole('button', { name: 'Changed after backup', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Replace workspace with this backup', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Replace this workspace?' })).toBeVisible();
  await expect(observer.getByRole('button', { name: 'Changed after backup', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Yes, replace workspace', exact: true }).click();
  // Then replacement occurs only after the explicit confirmation.
  await expect(page.getByRole('dialog', { name: 'Replace this workspace?' })).toBeHidden();
  await observer.reload();
  await expect(observer.getByRole('button', { name: 'Original inspection', exact: true })).toBeVisible();
  await expect(observer.getByRole('button', { name: 'Changed after backup', exact: true })).toHaveCount(0);
});

test('invalid backup selection preserves existing records', async ({ page }) => {
  // Given saved work in the device database.
  await openBlankWorkspace(page);
  await createTask(page, 'Keep this record');
  await page.goto('/settings');
  // When a schema-invalid JSON file is chosen for restore.
  await page.getByLabel('Choose OpenWorkLog backup', { exact: true }).setInputFiles({
    name: 'invalid-backup.json', mimeType: 'application/json', buffer: Buffer.from('{"version":999,"tasks":[]}'),
  });
  // Then no replacement control is offered and the saved task survives reload.
  await expect(page.getByText('Your existing data has not been replaced.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Replace workspace with this backup', exact: true })).toHaveCount(0);
  await page.goto('/tasks');
  await expect(page.getByRole('button', { name: 'Keep this record', exact: true })).toBeVisible();
});

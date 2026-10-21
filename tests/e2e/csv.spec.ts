import { readFile } from 'node:fs/promises';
import { parse } from 'csv-parse/sync';
import { test, expect } from '@playwright/test';
import { z } from 'zod';
import { createTask, openBlankWorkspace } from './workspace';

test('downloaded tracker CSV preserves punctuation and neutralizes formulas', async ({ page }, testInfo) => {
  await openBlankWorkspace(page);
  await createTask(page, '=SUM(1,2)');
  await page.getByRole('button', { name: '=SUM(1,2)', exact: true }).click();
  const editor = page.getByRole('dialog', { name: 'Edit task' });
  await editor.getByLabel('Latest update', { exact: true }).fill('Checked "Port", then Starboard\nRecording verified.');
  await editor.getByRole('button', { name: 'Save task', exact: true }).click();
  await expect(editor).toBeHidden();
  const downloadReady = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV', exact: true }).click();
  const download = await downloadReady;
  const filePath = testInfo.outputPath('task-tracker.csv');
  await download.saveAs(filePath);
  const raw: unknown = parse(await readFile(filePath, 'utf8'), { bom: true, columns: true });
  const rows = z.array(z.record(z.string(), z.string())).parse(raw);
  expect(rows).toHaveLength(1);
  expect(rows[0]?.['Task']).toBe("'=SUM(1,2)");
  expect(rows[0]?.['Latest Update']).toBe('Checked "Port", then Starboard\nRecording verified.');
  expect(rows[0]?.['Status']).toBe('Open');
});

test('CSV import requires a valid preview and rejects unsupported statuses', async ({ page }) => {
  await openBlankWorkspace(page);
  await page.goto('/reports');
  await page.getByRole('button', { name: 'Import tracker CSV', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Import tracker CSV' });
  await dialog.getByLabel('Tracker CSV file', { exact: true }).setInputFiles({
    name: 'invalid-status.csv', mimeType: 'text/csv', buffer: Buffer.from('Task,Status\r\nInvalid status,Completed'),
  });
  await expect(dialog.getByText('Fix these rows before importing.', { exact: true })).toBeVisible();
  await expect(dialog.getByRole('button', { name: /Import \d+ tasks/ })).toBeDisabled();
  await dialog.getByLabel('Tracker CSV file', { exact: true }).setInputFiles({
    name: 'valid-tracker.csv', mimeType: 'text/csv', buffer: Buffer.from('Task,Status\r\n"Imported, checked task",Open'),
  });
  await expect(dialog.getByRole('button', { name: 'Import 1 tasks', exact: true })).toBeEnabled();
  await dialog.getByRole('button', { name: 'Import 1 tasks', exact: true }).click();
  await expect(dialog).toBeHidden();
  await page.goto('/tasks');
  await expect(page.getByRole('button', { name: 'Imported, checked task', exact: true })).toBeVisible();
  await expect(page.getByLabel('Move Imported, checked task to status', { exact: true })).toHaveValue('Open');
  await expect(page.getByRole('button', { name: 'Invalid status', exact: true })).toHaveCount(0);
});

test('downloaded daily CSV keeps planned times separate from actual work', async ({ page }, testInfo) => {
  await openBlankWorkspace(page);
  await page.goto('/daily');
  await page.getByRole('button', { name: 'Add entry', exact: true }).click();
  const editor = page.getByRole('dialog', { name: 'Add daily entry' });
  await editor.getByLabel('Task / activity', { exact: true }).fill('Routine support');
  await editor.getByLabel('Planned from', { exact: true }).fill('08:00');
  await editor.getByLabel('Planned to', { exact: true }).fill('09:00');
  await editor.getByLabel('Actual from', { exact: true }).fill('08:10');
  await editor.getByLabel('Actual to', { exact: true }).fill('08:42');
  await editor.getByLabel('Work done', { exact: true }).fill('Checked "Port", then Starboard\nRecording verified.');
  await editor.getByRole('button', { name: 'Save entry', exact: true }).click();
  await expect(editor).toBeHidden();
  await expect(page.locator('.daily-summary .card').filter({ hasText: 'Daily tasks' }).locator('strong')).toHaveText('1');
  const downloadReady = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV', exact: true }).click();
  const download = await downloadReady;
  const filePath = testInfo.outputPath('daily-log.csv');
  await download.saveAs(filePath);
  const raw: unknown = parse(await readFile(filePath, 'utf8'), { bom: true, columns: true });
  const rows = z.array(z.record(z.string(), z.string())).parse(raw);
  expect(rows).toHaveLength(1);
  expect(rows[0]?.['Task']).toBe('Routine support');
  expect(rows[0]?.['Planned From']).toBe('08:00');
  expect(rows[0]?.['Actual From']).toBe('08:10');
  expect(rows[0]?.['Actual To']).toBe('08:42');
  expect(rows[0]?.['Work done']).toBe('Checked "Port", then Starboard\nRecording verified.');
});

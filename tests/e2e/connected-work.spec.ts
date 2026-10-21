import { readFile } from 'node:fs/promises';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';
import { test, expect, type Page } from '@playwright/test';
import { createTask, openBlankWorkspace } from './workspace';

async function addDailyActivity(page: Page, title: string, lunch = false): Promise<void> {
  await page.goto('/daily');
  await page.getByRole('button', { name: 'Add entry', exact: true }).click();
  const editor = page.getByRole('dialog', { name: 'Add daily entry' });
  await editor.getByLabel('Task / activity', { exact: true }).fill(title);
  await editor.getByLabel('Actual from', { exact: true }).fill(lunch ? '12:00' : '09:10');
  await editor.getByLabel('Actual to', { exact: true }).fill(lunch ? '13:00' : '09:40');
  if (lunch) await editor.getByRole('checkbox', { name: /Lunch \/ break/ }).check();
  await editor.getByRole('button', { name: 'Save entry', exact: true }).click();
  await expect(editor).toBeHidden();
}

test('a daily activity appears once in My Tasks while lunch stays only in the log', async ({ page }) => {
  await openBlankWorkspace(page);
  await addDailyActivity(page, 'Review firewall requests');
  await addDailyActivity(page, 'Lunch break', true);
  await page.goto('/tasks');
  await expect(page.getByRole('button', { name: 'Review firewall requests', exact: true })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Review firewall requests', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Lunch break', exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Review firewall requests', exact: true })).toHaveCount(1);
});

async function addCalendarPlan(page: Page, title: string): Promise<void> {
  await page.goto('/calendar');
  await page.getByRole('button', { name: 'New plan', exact: true }).click();
  const editor = page.getByRole('dialog', { name: 'Plan your time' });
  await editor.getByLabel('Plan title', { exact: true }).fill(title);
  await editor.getByLabel('From', { exact: true }).fill('09:00');
  await editor.getByLabel('To', { exact: true }).selectOption({ label: '10:00' });
  await editor.getByRole('button', { name: 'Save plan', exact: true }).click();
  await expect(editor).toBeHidden();
}

test('a Calendar plan creates one task and its planned timer saves one linked daily entry', async ({ page }, testInfo) => {
  await page.clock.install({ time: new Date('2026-10-21T05:10:00Z') });
  await page.clock.setFixedTime(new Date('2026-10-21T05:10:00Z'));
  await openBlankWorkspace(page);
  const title = 'Schedule uplink inspection';
  await addCalendarPlan(page, title);
  await page.goto('/tasks');
  await expect(page.getByRole('button', { name: title, exact: true })).toHaveCount(1);
  await expect(page.getByLabel(`Move ${title} to status`, { exact: true })).toHaveValue('Open');
  await page.goto('/daily');
  await page.getByLabel('Planned work', { exact: true }).selectOption({ label: `2026-10-21 · 09:00–10:00 · ${title}` });
  await expect(page.locator('.timer-plan-context')).toContainText('09:00–10:00');
  await expect(page.locator('.timer-plan-context')).toContainText(`Task: ${title}`);
  await page.getByRole('button', { name: 'Start timer', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await expect(page.locator('.timer-plan-context')).toContainText('Planned: 2026-10-21 · 09:00–10:00');
  await page.reload();
  await expect(page.locator('.timer-plan-context')).toContainText('09:00–10:00');
  await page.screenshot({ path: testInfo.outputPath('timer-planned-calendar.png'), fullPage: true, animations: 'disabled' });
  await page.clock.setFixedTime(new Date('2026-10-21T05:20:00Z'));
  await page.getByRole('button', { name: 'Stop and review', exact: true }).click();
  const review = page.getByRole('dialog', { name: 'Review your session' });
  await expect(review.getByLabel('Planned from', { exact: true })).toHaveValue('09:00');
  await expect(review.getByLabel('Planned to', { exact: true })).toHaveValue('10:00');
  await review.getByLabel('Work done', { exact: true }).fill('Checked uplink stability.');
  await review.getByRole('button', { name: 'Save work log', exact: true }).click();
  await expect(review).toBeHidden();
  await expect(page.locator('.daily-summary .card').filter({ hasText: 'Daily tasks' }).locator('strong')).toHaveText('1');
  await expect(page.locator('.daily-summary .card').filter({ hasText: 'Productive time' }).locator('strong')).toHaveText('10m');
  await page.goto('/tasks');
  await expect(page.getByRole('button', { name: title, exact: true })).toHaveCount(1);
  await expect(page.getByLabel(`Move ${title} to status`, { exact: true })).toHaveValue('Open');
});

test('a planned daily activity is visible in Calendar and its row timer updates the same entry', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-21T05:10:00Z') });
  await page.clock.setFixedTime(new Date('2026-10-21T05:10:00Z'));
  await openBlankWorkspace(page);
  const title = 'Prepare weekly infrastructure report';
  await page.goto('/daily');
  await page.getByRole('button', { name: 'Add entry', exact: true }).click();
  const editor = page.getByRole('dialog', { name: 'Add daily entry' });
  await editor.getByLabel('Task / activity', { exact: true }).fill(title);
  await editor.getByLabel('Planned from', { exact: true }).fill('13:00');
  await editor.getByLabel('Planned to', { exact: true }).fill('14:00');
  await editor.getByRole('button', { name: 'Save entry', exact: true }).click();
  await expect(editor).toBeHidden();
  await page.goto('/calendar');
  await expect(page.locator('.calendar-agenda-item').filter({ hasText: title })).toHaveCount(1);
  await page.goto('/daily');
  const picker = page.getByLabel('Planned work', { exact: true });
  await expect(picker.locator('option').filter({ hasText: title })).toHaveCount(1);
  await page.getByRole('button', { name: `Start timer for ${title} at 13:00`, exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await expect(page.locator('.timer-plan-context')).toContainText('13:00–14:00');
  await page.clock.setFixedTime(new Date('2026-10-21T05:30:00Z'));
  await page.getByRole('button', { name: 'Stop and review', exact: true }).click();
  const review = page.getByRole('dialog', { name: 'Review your session' });
  await review.getByLabel('Work done', { exact: true }).fill('Prepared the weekly draft.');
  await review.getByRole('button', { name: 'Save work log', exact: true }).click();
  await expect(review).toBeHidden();
  await expect(page.locator('.daily-summary .card').filter({ hasText: 'Daily tasks' }).locator('strong')).toHaveText('1');
  await expect(page.locator('.daily-summary .card').filter({ hasText: 'Productive time' }).locator('strong')).toHaveText('20m');
  await page.goto('/tasks');
  await expect(page.getByRole('button', { name: title, exact: true })).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole('button', { name: title, exact: true })).toHaveCount(1);
});

test('Super dark is neutral black and persists after reopening the app', async ({ page }) => {
  await openBlankWorkspace(page);
  await page.goto('/settings');
  await page.getByRole('button', { name: 'Super dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'black');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'black');
  await expect(page.getByRole('button', { name: 'Super dark', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/daily');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(0, 0, 0)');
});

test('an actual-only daily source stays one entry when more timer work is saved', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-21T02:00:00Z') });
  await page.clock.setFixedTime(new Date('2026-10-21T02:00:00Z'));
  await openBlankWorkspace(page);
  const title = 'Resolve printer request';
  await addDailyActivity(page, title);
  await page.getByRole('button', { name: `Start timer for ${title} at 09:00`, exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open linked daily entry', exact: true })).toBeVisible();
  await page.clock.setFixedTime(new Date('2026-10-21T02:10:00Z'));
  await page.getByRole('button', { name: 'Stop and review', exact: true }).click();
  const review = page.getByRole('dialog', { name: 'Review your session' });
  await review.getByLabel('Work done', { exact: true }).fill('Completed a follow-up check.');
  await review.getByRole('button', { name: 'Save work log', exact: true }).click();
  await expect(review).toBeHidden();
  await expect(page.locator('.daily-summary .card').filter({ hasText: 'Daily tasks' }).locator('strong')).toHaveText('1');
  await expect(page.locator('.daily-summary .card').filter({ hasText: 'Productive time' }).locator('strong')).toHaveText('40m');
  await page.goto('/tasks');
  await expect(page.getByRole('button', { name: title, exact: true })).toHaveCount(1);
  await expect(page.getByLabel(`Move ${title} to status`, { exact: true })).toHaveValue('Open');
});

test('Executive metrics and CSV use saved work while dates filter activity only', async ({ page }, testInfo) => {
  await page.clock.install({ time: new Date('2026-10-21T02:00:00Z') });
  await page.clock.setFixedTime(new Date('2026-10-21T02:00:00Z'));
  await openBlankWorkspace(page);
  await addDailyActivity(page, 'Verify backup result');
  await createTask(page, 'Prepare change request');
  await page.goto('/executive');
  await expect(page.getByRole('heading', { name: 'Executive overview', exact: true })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Unfinished tasks', exact: true }).locator('strong')).toHaveText('2');
  await expect(page.getByRole('group', { name: 'Productive time', exact: true }).locator('strong')).toHaveText('30m');
  await expect(page.getByRole('region', { name: 'Current portfolio status table', exact: true })).toBeVisible();
  const downloadReady = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export summary CSV', exact: true }).click();
  const download = await downloadReady;
  expect(download.suggestedFilename()).toMatch(/^executive-summary-.*\.csv$/);
  const filePath = testInfo.outputPath('executive-summary.csv');
  await download.saveAs(filePath);
  const raw: unknown = parse(await readFile(filePath, 'utf8'), { bom: true, columns: true });
  const rows = z.array(z.record(z.string(), z.string())).parse(raw);
  expect(rows.find(row => row['Scope'] === 'Selected period' && row['Item'] === 'Productive time')?.['Value']).toBe('30');
  await page.screenshot({ path: testInfo.outputPath('executive-live-data.png'), fullPage: true, animations: 'disabled' });
  await page.getByLabel('Activity from', { exact: true }).fill('2026-10-22');
  await page.getByLabel('Activity to', { exact: true }).fill('2026-10-22');
  await expect(page.getByRole('group', { name: 'Productive time', exact: true }).locator('strong')).toHaveText('0m');
  await expect(page.getByRole('group', { name: 'Unfinished tasks', exact: true }).locator('strong')).toHaveText('2');
});

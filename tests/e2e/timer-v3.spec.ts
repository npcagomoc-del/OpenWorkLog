import { expect, test } from '@playwright/test';
import { openBlankWorkspace } from './workspace';

test('one multi-slot activity has one timer action and all full-day grid slots', async ({ page }, testInfo) => {
  await openBlankWorkspace(page);
  await page.getByRole('link', { name: 'Daily Log', exact: true }).click();
  await page.getByRole('button', { name: 'Add entry', exact: true }).click();
  const editor = page.getByRole('dialog', { name: 'Add daily entry' });
  await editor.getByLabel('Task / activity', { exact: true }).fill('One spanning session');
  await editor.getByLabel('Planned from', { exact: true }).fill('08:00');
  await editor.getByLabel('Planned to', { exact: true }).fill('10:00');
  await editor.getByRole('button', { name: 'Save entry', exact: true }).click();
  const block = page.locator('.daily-activity-block').filter({ hasText: 'One spanning session' });
  await expect(block).toHaveCount(1);
  await expect(block).toContainText('Planned: 08:00–10:00');
  await expect(block.getByRole('button', { name: 'Start timer for One spanning session', exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: 'Full day · 24h', exact: true }).click();
  await expect(page.locator('[data-slot]')).toHaveCount(48);
  for (const width of [375, 768, 1280]) {
    await page.setViewportSize({ width, height: 960 });
    await block.scrollIntoViewIfNeeded();
    expect((await block.boundingBox())?.height).toBeLessThanOrEqual(320);
    await page.screenshot({ path: testInfo.outputPath(`span-${width}.png`) });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test('session seconds survive pause reload and stop, while a repeated start begins at zero', async ({ page }, testInfo) => {
  await page.clock.setFixedTime(new Date('2026-10-21T00:00:00Z'));
  await openBlankWorkspace(page);
  await page.getByRole('link', { name: 'Daily Log', exact: true }).click();
  await page.getByLabel('Session name', { exact: true }).fill('Seconds session');
  await page.getByRole('button', { name: 'Start timer', exact: true }).click();
  await expect(page.locator('.timer-clock')).toContainText('00:00:00');
  await page.clock.setFixedTime(new Date('2026-10-21T00:00:18Z'));
  await expect(page.locator('.timer-clock')).toContainText('00:00:18');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(page.locator('.timer-clock')).toContainText('00:00:18');
  await page.reload();
  await expect(page.locator('.timer-clock')).toContainText('00:00:18');
  await page.clock.setFixedTime(new Date('2026-10-21T00:04:48Z'));
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await page.clock.setFixedTime(new Date('2026-10-21T00:05:00Z'));
  await expect(page.locator('.timer-clock')).toContainText('00:00:30');
  await page.getByRole('button', { name: 'Stop and review', exact: true }).click();
  await page.getByRole('dialog', { name: 'Review your session' }).getByRole('button', { name: 'Save work log', exact: true }).click();
  await expect(page.locator('.daily-activity-block')).toContainText('30s active · saved');
  await page.setViewportSize({ width: 375, height: 960 });
  await page.locator('.daily-activity-block').scrollIntoViewIfNeeded();
  expect(await page.locator('.daily-activity-block').evaluate(element => element.scrollHeight <= element.clientHeight)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('paused-actual-375.png') });
  await page.setViewportSize({ width: 1280, height: 960 });
  await page.getByLabel('Linked task', { exact: true }).selectOption({ label: 'Seconds session' });
  await page.getByRole('button', { name: 'Start timer', exact: true }).click();
  await expect(page.locator('.timer-clock')).toContainText('00:00:00');
  await expect(page.locator('.daily-activity-block')).toHaveCount(1);
  await page.clock.setFixedTime(new Date('2026-10-21T00:05:10Z'));
  await page.getByRole('button', { name: 'Stop and review', exact: true }).click();
  await page.getByRole('dialog', { name: 'Review your session' }).getByRole('button', { name: 'Save work log', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Review your session' })).toBeHidden();
  await expect(page.locator('.daily-summary .card').filter({ hasText: 'Productive time' }).locator('strong')).toHaveText('40s');
  await expect(page.locator('.daily-activity-block')).toHaveCount(1);
});





test('recorded work is placed at actual time while a distant plan remains context', async ({ page }, testInfo) => {
  await openBlankWorkspace(page);
  await page.getByRole('link', { name: 'Daily Log', exact: true }).click();
  await page.getByRole('button', { name: 'Add entry', exact: true }).click();
  const editor = page.getByRole('dialog', { name: 'Add daily entry' });
  await editor.getByLabel('Task / activity', { exact: true }).fill('Rescheduled actual work');
  await editor.getByLabel('Planned from', { exact: true }).fill('08:00');
  await editor.getByLabel('Planned to', { exact: true }).fill('09:00');
  await editor.getByLabel('Actual from', { exact: true }).fill('16:00');
  await editor.getByLabel('Actual to', { exact: true }).fill('17:00');
  await editor.getByRole('button', { name: 'Save entry', exact: true }).click();
  await page.getByRole('button', { name: 'Full day · 24h', exact: true }).click();
  const block = page.locator('.daily-activity-block').filter({ hasText: 'Rescheduled actual work' });
  await expect(block).toHaveCount(1);
  await block.scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('actual-placement.png') });
  await expect(block).toContainText('Planned: 08:00–09:00');
  await expect(block).toContainText('Actual: 16:00–17:00 · 1h active');
  await expect(block).toHaveCSS('grid-row-start', '33');
  await expect(block).toHaveCSS('grid-row-end', '35');
  await page.getByRole('button', { name: 'Add entry', exact: true }).click();
  await editor.getByLabel('Task / activity', { exact: true }).fill('Separate morning plan');
  await editor.getByLabel('Planned from', { exact: true }).fill('09:00');
  await editor.getByLabel('Planned to', { exact: true }).fill('10:00');
  await editor.getByRole('button', { name: 'Save entry', exact: true }).click();
  await expect(page.locator('.daily-activity-block')).toHaveCount(2);
  await expect(block).toHaveCSS('grid-column-start', '2');
  await expect(page.locator('.daily-activity-block').filter({ hasText: 'Separate morning plan' })).toHaveCSS('grid-column-start', '2');
  await expect(page.locator('[data-slot]')).toHaveCount(48);
  await expect(page.locator('.daily-summary .card').filter({ hasText: 'Productive time' }).locator('strong')).toHaveText('1h');
});

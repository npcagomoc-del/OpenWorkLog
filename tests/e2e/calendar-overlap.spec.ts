import { expect, test, type Page } from '@playwright/test';
import { openBlankWorkspace } from './workspace';

async function overlapSample(page: Page) {
  await openBlankWorkspace(page);
  await page.goto('/calendar');
  await page.getByLabel('Go to date', { exact: true }).fill('2026-10-21');
  for (const plan of [{ title: 'Overlap network review', end: '08:30' }, { title: 'Overlap server review', end: '09:00' }]) {
    await page.getByRole('button', { name: 'New plan', exact: true }).click();
    const editor = page.getByRole('dialog', { name: 'Plan your time' });
    await editor.getByLabel('Plan title', { exact: true }).fill(plan.title);
    await editor.getByLabel('Business Unit / Requested for', { exact: true }).fill('Operations');
    await editor.getByLabel('From', { exact: true }).fill('08:00');
    await editor.getByLabel('To', { exact: true }).selectOption({ label: plan.end });
    await editor.getByRole('button', { name: 'Save plan', exact: true }).click();
    await expect(editor).toBeHidden();
  }
}

for (const width of [1440, 375]) {
  test.describe(`overlapping Week targets at ${width}px`, () => {
    test.use({ viewport: { width, height: 1000 }, hasTouch: width === 375, isMobile: width === 375 });
    test('body opens details independently of move and resize controls', async ({ page }, testInfo) => {
      await overlapSample(page);
      const body = page.locator('.calendar-block-open').filter({ hasText: 'Overlap network review' });
      const block = page.locator('.calendar-block').filter({ has: body });
      const planId = await block.getAttribute('data-calendar-plan');
      await body.evaluate((node) => node.scrollIntoView({ block: 'center', inline: 'center' }));
      const rect = await body.boundingBox();
      if (!rect) throw new Error('Missing overlap body');
      if (width === 375) await page.touchscreen.tap(rect.x + rect.width / 2, rect.y + rect.height / 2);
      else await page.mouse.click(rect.x + rect.width / 2, rect.y + rect.height / 2);
      await expect(page.getByRole('dialog', { name: 'Overlap network review', exact: true })).toBeVisible();
      await expect(page.getByRole('dialog').locator('p').filter({ hasText: 'Operations' })).toBeVisible();
      await page.keyboard.press('Escape');
      const targets = await block.evaluate((node) => {
        const body = node.querySelector('.calendar-block-open');
        const grip = node.querySelector('.calendar-drag-handle')?.getBoundingClientRect();
        const edge = node.querySelector('.calendar-resize-handle--start')?.getBoundingClientRect();
        if (!body || !grip || !edge) return null;
        const rect = body.getBoundingClientRect();
        return { bodyWidth: rect.width, bodyHeight: rect.height, exclusiveWidth: edge.left - rect.left, edgeGripGap: grip.left - edge.right,
          bodyHits: [[2,5],[45,5],[2,48],[45,48],[24,26]].every(([x,y]) => x !== undefined && y !== undefined && document.elementFromPoint(rect.left+x,rect.top+y)?.closest('button') === body) };
      });
      await testInfo.attach('overlap-target-geometry', { body: JSON.stringify(targets, null, 2), contentType: 'application/json' });
      expect(targets?.bodyHeight).toBeGreaterThanOrEqual(44);
      expect(targets?.exclusiveWidth).toBeGreaterThanOrEqual(44);
      expect(targets?.edgeGripGap).toBeGreaterThanOrEqual(0);
      expect(targets?.bodyHits).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`overlap-week-${width}.png`), fullPage: true });
      const grip = page.getByRole('button', { name: 'Move plan Overlap network review', exact: true });
      await grip.focus();
      await grip.press('Space');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await expect(body).toHaveAttribute('title', 'Overlap network review · 08:30–09:00');
      await expect(block).toHaveAttribute('data-calendar-plan', planId ?? '');
      if (width === 375) await grip.tap();
      const end = page.getByRole('button', { name: 'Resize end of Overlap network review', exact: true });
      await expect(end).toHaveCSS('pointer-events', 'auto');
      if (width === 375) {
        const bounds = await end.boundingBox();
        if (!bounds) throw new Error('Missing overlap resize edge');
        const cdp = await page.context().newCDPSession(page);
        const point = { x: bounds.x + 22, y: bounds.y + 22 };
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...point, y: point.y + 56 }] });
        await expect(body).toContainText('08:30–09:30');
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await cdp.detach();
      } else {
        await end.focus();
        await end.press('ArrowDown');
        await end.press('Enter');
      }
      await expect(body).toHaveAttribute('title', 'Overlap network review · 08:30–09:30');
      await page.reload();
      await page.getByLabel('Go to date', { exact: true }).fill('2026-10-21');
      await expect(body).toHaveAttribute('title', 'Overlap network review · 08:30–09:30');
      await expect(block).toHaveAttribute('data-calendar-plan', planId ?? '');
      await body.evaluate((node) => node.scrollIntoView({ block: 'center', inline: 'center' }));
      const persisted = await body.boundingBox();
      if (!persisted) throw new Error('Missing persisted overlap body');
      if (width === 375) await page.touchscreen.tap(persisted.x + 22, persisted.y + 27);
      else await page.mouse.click(persisted.x + 22, persisted.y + 27);
      await expect(page.getByRole('dialog').locator('p').filter({ hasText: 'Operations' })).toBeVisible();
    });
  });
}

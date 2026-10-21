import { test, expect } from '@playwright/test';
import { openDemoWorkspace } from './workspace';

const sizes = [
  { name: 'phone-375', width: 375, height: 812 },
  { name: 'phone-430', width: 430, height: 932 },
  { name: 'tablet-portrait', width: 800, height: 1280 },
  { name: 'tablet-landscape', width: 1280, height: 800 },
  { name: 'desktop', width: 1440, height: 1000 },
] as const;
const routes = ['/', '/tasks', '/projects', '/calendar', '/daily', '/notes', '/reports', '/settings', '/design'] as const;

for (const size of sizes) {
  test(`all routes fit ${size.name} with reduced motion`, async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: size.width, height: size.height });
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
    await openDemoWorkspace(page);
    const capture = async (name: string): Promise<void> => {
      const width = await page.evaluate(() => ({
        content: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
      }));
      expect(width.content, `Document overflow in ${name}`).toBeLessThanOrEqual(width.viewport + 1);
      if (size.width <= 1050) await expect(page.locator('.search-shortcut')).toBeHidden();
      await page.screenshot({ path: testInfo.outputPath(`${size.name}-${name}.png`), fullPage: true, animations: 'disabled' });
    };
    for (const route of routes) {
      await page.goto(route);
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.locator('h1')).toHaveCount(1);
      await capture(`${route.replaceAll('/', '') || 'dashboard'}-light`);
      switch (route) {
        case '/tasks':
          for (const view of ['Table', 'Kanban']) {
            await page.getByRole('button', { name: view, exact: true }).click();
            if (view === 'Table') {
              const fit = await page.locator('.task-table .task-status-select--progress').first().evaluate((element) => {
                const style = getComputedStyle(element);
                const context = document.createElement('canvas').getContext('2d');
                if (!context) throw new Error('Canvas text measurement is unavailable');
                context.font = style.font;
                return {
                  width: element.getBoundingClientRect().width,
                  required: context.measureText('In Progress').width + Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight) + 24,
                };
              });
              expect(fit.width, 'Table status select must fit the full In Progress label plus native arrow').toBeGreaterThanOrEqual(fit.required);
            }
            await capture(`tasks-${view.toLowerCase()}-light`);
            await page.locator(view === 'Table' ? '.task-table' : '.task-board').scrollIntoViewIfNeeded();
            await capture(`tasks-${view.toLowerCase()}-body-light`);
          }
          break;
        case '/calendar':
          for (const view of ['Day', 'Month']) {
            await page.getByRole('button', { name: view, exact: true }).click();
            await capture(`calendar-${view.toLowerCase()}-light`);
          }
          for (const view of ['Day', 'Week']) {
            await page.getByRole('button', { name: view, exact: true }).click();
            await page.getByRole('checkbox', { name: /Work hours/ }).uncheck();
            await page.locator('.calendar-slot').last().scrollIntoViewIfNeeded();
            await capture(`calendar-${view.toLowerCase()}-late-light`);
          }
          break;
        case '/settings':
          await page.getByRole('link', { name: 'Data & backup', exact: true }).click();
          await capture('settings-backup-light');
          break;
        case '/daily':
          await page.getByRole('button', { name: 'Full day · 24h', exact: true }).click();
          await page.locator('[data-slot="47"]').scrollIntoViewIfNeeded();
          await capture('daily-end-of-day-light');
          break;
        case '/notes': {
          await page.locator('.note-reader').scrollIntoViewIfNeeded();
          await capture('notes-reader-light');
          const padding = await page.getByRole('textbox', { name: 'Search study notes' }).evaluate((element) => Number.parseFloat(getComputedStyle(element).paddingLeft));
          expect(padding).toBeGreaterThanOrEqual(40);
          break;
        }
        case '/':
          await page.locator('.dashboard-portfolio').scrollIntoViewIfNeeded();
          await capture('dashboard-portfolio-light');
          break;
        case '/reports':
          await page.locator('.report-preview').scrollIntoViewIfNeeded();
          await capture('reports-preview-light');
          break;
        case '/projects': case '/design':
          break;
        default: {
          const unreachable: never = route;
          throw new Error(String(unreachable));
        }
      }
    }
    await page.goto('/settings');
    await page.getByRole('button', { name: 'Dark', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await capture('settings-dark');
    await page.getByRole('button', { name: 'Large', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-text-size', 'large');
    await capture('settings-large-dark');
    await page.getByRole('button', { name: 'Comfortable', exact: true }).click();
    await page.goto('/tasks');
    await page.getByRole('button', { name: 'New task', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'New task', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.activeElement?.closest('dialog') !== null)).toBe(true);
    await capture('task-editor-dark');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    if (size.name === 'desktop') {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.screenshot({ path: testInfo.outputPath('desktop-motion-rest.png'), animations: 'allow' });
      await page.getByRole('button', { name: 'New task', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: 'New task', exact: true });
      await expect(dialog).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath('desktop-motion-enter.png'), animations: 'allow' });
      await page.waitForTimeout(100);
      await page.screenshot({ path: testInfo.outputPath('desktop-motion-mid.png'), animations: 'allow' });
      await expect.poll(() => dialog.evaluate((element) => element.getAnimations().filter((animation) => animation.playState === 'running').length)).toBe(0);
      await page.screenshot({ path: testInfo.outputPath('desktop-motion-settled.png'), animations: 'allow' });
      await page.keyboard.press('Escape');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.getByRole('button', { name: 'New task', exact: true }).click();
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveCSS('animation-name', 'none');
      await page.screenshot({ path: testInfo.outputPath('desktop-motion-reduced.png'), animations: 'allow' });
      await page.keyboard.press('Escape');
    }
    if (size.width <= 700) {
      await page.getByRole('button', { name: 'More', exact: true }).click();
      await expect(page.getByRole('dialog', { name: 'Your workspace' })).toBeVisible();
      await capture('mobile-drawer-dark');
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toBeHidden();
    }
  });
}


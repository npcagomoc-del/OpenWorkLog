import { test, expect, type Page } from '@playwright/test';
import { createTask, openDemoWorkspace } from './workspace';

const sizes = [
  { name: 'phone-375', width: 375, height: 812 },
  { name: 'phone-430', width: 430, height: 932 },
  { name: 'tablet-portrait', width: 800, height: 1280 },
  { name: 'tablet-landscape', width: 1280, height: 800 },
  { name: 'desktop', width: 1440, height: 1000 },
] as const;
const routes = ['/', '/executive', '/tasks', '/projects', '/calendar', '/daily', '/notes', '/reports', '/settings', '/design'] as const;


async function prepareLinkedWork(page: Page): Promise<void> {
  for (const [title, status, unit] of [
    ['QA · Awaiting vendor approval with a long title', 'On Hold', 'Marine operations'],
    ['QA · Cancelled device change', 'Cancelled', 'Office operations'],
  ] as const) {
    await createTask(page, title);
    await page.getByRole('button', { name: title, exact: true }).click();
    const task = page.getByRole('dialog', { name: 'Edit task', exact: true });
    await task.getByLabel('Business Unit', { exact: true }).fill(unit);
    await task.getByRole('button', { name: 'Save task', exact: true }).click();
    await expect(task).toBeHidden();
    await page.getByLabel(`Move ${title} to status`, { exact: true }).selectOption(status);
  }
  await page.goto('/calendar');
  await page.getByRole('button', { name: 'New plan', exact: true }).click();
  const plan = page.getByRole('dialog', { name: 'Plan your time' });
  await plan.getByLabel('Linked task', { exact: true }).selectOption({ label: 'Demo · Review the project checklist' });
  await plan.getByLabel('Plan title', { exact: true }).fill('QA · Planned review');
  await plan.getByLabel('From', { exact: true }).fill('09:00');
  await plan.getByLabel('To', { exact: true }).selectOption({ label: '10:00' });
  await plan.getByRole('button', { name: 'Save plan', exact: true }).click();
  await expect(plan).toBeHidden();
  await page.goto('/daily');
  await page.getByRole('button', { name: 'Add entry', exact: true }).click();
  const entry = page.getByRole('dialog', { name: 'Add daily entry' });
  await entry.getByLabel('Linked task / operational task', { exact: true }).selectOption({ label: 'Demo · Write a daily update' });
  await entry.getByLabel('Task / activity', { exact: true }).fill('QA · Daily follow-up');
  await entry.getByLabel('Planned from', { exact: true }).fill('13:00');
  await entry.getByLabel('Planned to', { exact: true }).fill('14:00');
  await entry.getByLabel('Actual from', { exact: true }).fill('13:10');
  await entry.getByLabel('Actual to', { exact: true }).fill('13:42');
  await entry.getByLabel('Work done', { exact: true }).fill('Verified the linked work record.');
  await entry.getByRole('button', { name: 'Save entry', exact: true }).click();
  await expect(entry).toBeHidden();
}

for (const size of sizes) {
  test(`all routes fit ${size.name} with reduced motion`, async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: size.width, height: size.height });
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
    await openDemoWorkspace(page);
    await prepareLinkedWork(page);
    const capture = async (name: string): Promise<void> => {
      const width = await page.evaluate(() => ({
        content: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
      }));
      expect(width.content, `Document overflow in ${name}`).toBeLessThanOrEqual(width.viewport + 1);
      if (size.width <= 1050) await expect(page.locator('.search-shortcut')).toBeHidden();
      await page.screenshot({ path: testInfo.outputPath(`${size.name}-${name}.png`), fullPage: true, animations: 'disabled' });
    };
    const captureExecutive = async (theme: string): Promise<void> => {
      for (const [selector, section] of [
        ['.executive-kpis', 'metrics'], ['.executive-portfolio', 'portfolio'],
        ['.executive-status', 'status'], ['.executive-activity', 'activity'],
      ] as const) {
        await page.locator(selector).scrollIntoViewIfNeeded();
        if (section === 'activity' && size.width < 500) {
          await page.getByRole('region', { name: 'Planned and logged time chart', exact: true }).evaluate(element => {
            element.scrollLeft = element.scrollWidth;
            element.scrollIntoView({ block: 'center' });
          });
        }
        await capture(`executive-${section}-${theme}`);
      }
      await page.getByText('View time figures', { exact: true }).click();
      const figures = page.getByRole('region', { name: 'Planned and logged time figures', exact: true });
      await figures.scrollIntoViewIfNeeded();
      if (size.width < 500) await figures.evaluate(element => { element.scrollLeft = element.scrollWidth; });
      await expect(figures).toContainText('2h');
      await expect(figures).toContainText('32m');
      await capture(`executive-time-figures-${theme}`);
      for (const [heading, section] of [['Time by category', 'workload'], ['Tasks needing attention', 'due']] as const) {
        const card = page.locator('.card').filter({ has: page.getByRole('heading', { name: heading, exact: true }) });
        await card.evaluate(element => element.scrollIntoView({ block: 'start' }));
        if (section === 'due') {
          const rows = page.locator('.executive-two-columns').last().locator('.executive-record-list li');
          for (const row of await rows.all()) await expect(row).toBeInViewport();
        }
        await capture(`executive-${section}-${theme}`);
      }
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
              const fit = await page.locator('.task-table .status-control--progress').first().evaluate((element) => {
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
            await page.locator(view === 'Table' ? '.task-table' : '.task-board-viewport').scrollIntoViewIfNeeded();
            await capture(`tasks-${view.toLowerCase()}-body-light`);
            if (view === 'Kanban') {
              const board = page.locator('.task-board-viewport');
              await board.evaluate(element => { element.scrollLeft = element.scrollWidth; });
              await capture('tasks-status-right-light');
              for (const group of ['Category', 'Project', 'Business Unit']) {
                await page.getByLabel('Group by', { exact: true }).selectOption({ label: group });
                await capture(`tasks-group-${group.toLowerCase().replaceAll(' ', '-')}-light`);
              }
              await page.getByLabel('Group by', { exact: true }).selectOption({ label: 'Status' });
            }
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
        case '/daily': {
          const choice = await page.getByLabel('Planned work', { exact: true }).locator('option').filter({ hasText: 'QA · Planned review' }).getAttribute('value');
          if (choice === null) throw new Error('Planned work option has no value');
          await page.getByLabel('Planned work', { exact: true }).selectOption(choice);
          await expect(page.locator('.timer-plan-context')).toContainText('09:00–10:00');
          await capture('daily-planned-choice-light');
          await page.getByRole('button', { name: 'Start timer', exact: true }).click();
          await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
          await page.locator('.timer-card').evaluate(element => element.scrollIntoView({ block: 'start' }));
          await expect(page.locator('.timer-plan-context')).toBeInViewport();
          await capture('daily-planned-running-light');
          await page.getByRole('button', { name: 'Discard', exact: true }).click();
          await page.getByRole('dialog', { name: 'Discard this timer?' }).getByRole('button', { name: 'Discard session', exact: true }).click();
          await expect(page.getByRole('button', { name: 'Start timer', exact: true })).toBeVisible();
          await page.getByRole('button', { name: 'Full day · 24h', exact: true }).click();
          await page.locator('[data-slot="47"]').scrollIntoViewIfNeeded();
          await capture('daily-end-of-day-light');
          break;
        }
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
        case '/executive':
          await captureExecutive('light');
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
    await page.goto('/settings');
    await page.getByRole('button', { name: 'Super dark', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'black');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(0, 0, 0)');
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('h1')).toHaveCount(1);
      await capture(`${route.replaceAll('/', '') || 'dashboard'}-super-dark`);
      if (route === '/executive') {
        await captureExecutive('super-dark');
      }
      if (route === '/tasks') {
        await page.getByRole('button', { name: 'Kanban', exact: true }).click();
        await page.locator('.task-board-viewport').evaluate(element => { element.scrollLeft = element.scrollWidth; });
        await page.locator('.task-board-viewport').scrollIntoViewIfNeeded();
        await capture('tasks-status-right-super-dark');
      }
    }
    await page.goto('/tasks');
    if (size.width <= 700) {
      await page.getByRole('button', { name: 'More', exact: true }).click();
      await expect(page.getByRole('dialog', { name: 'Your workspace' })).toBeVisible();
      await capture('mobile-drawer-super-dark');
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toBeHidden();
    }
  });
}


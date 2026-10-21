import { expect, type Page } from '@playwright/test';

export async function openBlankWorkspace(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start with a blank workspace' }).click();
  await expect(page.getByRole('button', { name: 'Start with a blank workspace' })).toBeHidden();
}

export async function openDemoWorkspace(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore demo workspace' }).click();
  await expect(page.getByRole('button', { name: 'Explore demo workspace' })).toBeHidden();
}

export async function createTask(page: Page, title: string): Promise<void> {
  await page.goto('/tasks');
  await page.getByRole('button', { name: 'New task', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'New task', exact: true });
  await dialog.getByLabel('Task', { exact: true }).fill(title);
  await dialog.getByRole('button', { name: 'Save task' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: title, exact: true })).toBeVisible();
}

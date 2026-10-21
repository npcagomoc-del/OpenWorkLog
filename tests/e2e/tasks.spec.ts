import { test, expect } from '@playwright/test';
import { createTask, openBlankWorkspace } from './workspace';

test('renamed tasks and changed status survive database reopen', async ({ page, context }) => {
  // Given a task created through the real editor.
  await openBlankWorkspace(page);
  await createTask(page, 'Prepare vessel checklist');
  // When its title and status change, then the same browser reopens the origin.
  await page.getByRole('button', { name: 'Prepare vessel checklist', exact: true }).click();
  const taskEditor = page.getByRole('dialog', { name: 'Edit task', exact: true });
  await taskEditor.getByLabel('Task', { exact: true }).fill('Review vessel checklist');
  await taskEditor.getByRole('button', { name: 'Save task', exact: true }).click();
  await expect(taskEditor).toBeHidden();
  await page.getByLabel('Move Review vessel checklist to status').selectOption('In Progress');
  await expect(page.getByLabel('Move Review vessel checklist to status')).toHaveValue('In Progress');
  await page.close();
  const reopened = await context.newPage();
  await reopened.goto('/tasks');
  // Then the edited record remains available in every supported task view.
  await expect(reopened.getByRole('button', { name: 'Review vessel checklist', exact: true })).toBeVisible();
  await expect(reopened.getByLabel('Move Review vessel checklist to status')).toHaveValue('In Progress');
  for (const view of ['Table', 'Kanban', 'List']) {
    await reopened.getByRole('button', { name: view, exact: true }).click();
    await expect(reopened.getByRole('button', { name: 'Review vessel checklist', exact: true })).toBeVisible();
  }
});

test('category rename updates an existing task link', async ({ page }) => {
  // Given a custom category and a linked task.
  await openBlankWorkspace(page);
  await page.goto('/settings');
  await page.getByLabel('New category', { exact: true }).fill('Vessel checks');
  await page.getByRole('button', { name: 'Add category', exact: true }).click();
  await expect(page.getByLabel('Category name: Vessel checks', { exact: true })).toBeVisible();
  await createTask(page, 'Camera inspection');
  await page.getByRole('button', { name: 'Camera inspection', exact: true }).click();
  const editor = page.getByRole('dialog', { name: 'Edit task', exact: true });
  await editor.getByLabel('Category', { exact: true }).selectOption({ label: 'Vessel checks' });
  await editor.getByRole('button', { name: 'Save task' }).click();
  await expect(editor).toBeHidden();
  // When the referenced category is renamed in settings.
  await page.goto('/settings');
  const category = page.getByLabel('Category name: Vessel checks', { exact: true });
  await category.fill('Marine operations');
  await page.locator('form').filter({ has: category }).getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByLabel('Category name: Marine operations', { exact: true })).toBeVisible();
  // Then reopening the task resolves the new name through its stable link.
  await page.goto('/tasks');
  await page.getByRole('button', { name: 'Camera inspection', exact: true }).click();
  await expect(page.getByRole('dialog').getByLabel('Category', { exact: true })).toContainText('Marine operations');
  await expect(page.getByRole('dialog').getByLabel('Category', { exact: true }).locator('option:checked')).toHaveText('Marine operations');
});

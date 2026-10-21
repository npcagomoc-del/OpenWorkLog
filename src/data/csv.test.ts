import { beforeEach, expect, it } from 'vitest';
import { db } from './db';
import { initializeWorkspace, readWorkspace } from './workspace';
import { previewTasksCsv, exportTasksCsv, importTasksCsv } from './csv';
import { actions } from './actions';
beforeEach(async () => {
  await db.delete();
  await db.open();
  await initializeWorkspace();
});
it('rejects unsupported status when previewing a tracker CSV', async () => {
  // Given
  const workspace = await readWorkspace();
  // When
  const preview = previewTasksCsv('Task,Status\r\nReview,Completed', workspace);
  // Then
  expect(preview.rows).toHaveLength(0);
  expect(preview.errors).toHaveLength(1);
  expect(await db.tasks.count()).toBe(0);
});
it('preserves quoted newlines and commas when importing CSV', async () => {
  // Given
  const preview = previewTasksCsv(
    'Task,Status,Latest Update\r\n"Review, notes",Open,"First line\nSecond ""quote"""',
    await readWorkspace(),
  );
  // When
  await importTasksCsv(preview.rows);
  // Then
  const task = await db.tasks.toCollection().first();
  expect(task?.title).toBe('Review, notes');
  expect(task?.latestUpdate).toBe('First line\nSecond "quote"');
});
it('neutralizes spreadsheet formula cells when exporting task CSV', async () => {
  // Given
  await actions.createTask({
    title: '=SUM(1,2)',
    description: '',
    status: 'Open',
    priority: 'Normal',
    type: 'task',
    categoryId: null,
    projectId: null,
    dueDate: null,
    assignee: '',
    ticket: '',
    latestUpdate: '',
    subtasks: [],
    archived: false,
  });
  // When
  const text = exportTasksCsv(await readWorkspace());
  // Then
  expect(text).toContain('"\'=SUM(1,2)"');
});

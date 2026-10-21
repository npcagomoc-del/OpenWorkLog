import { beforeEach, expect, it } from 'vitest';
import { db } from './db';
import { initializeWorkspace, loadDemoData, clearDemoData, readWorkspace } from './workspace';
import { createBackup, restoreBackup, parseBackup } from './backup';
import { actions } from './actions';
import { WorkspaceError } from '../domain/models';
beforeEach(async () => {
  await db.delete();
  await db.open();
  await initializeWorkspace();
});
it('rolls back cleared tables when a restore write fails', async () => {
  // Given
  await loadDemoData();
  const backup = await createBackup();
  await actions.updateSettings({ ownerName: 'Keep this name' });
  const reject = () => {
    throw new WorkspaceError('invalid', 'Injected restore failure');
  };
  db.tasks.hook('creating', reject);
  // When
  try {
    await expect(restoreBackup(backup)).rejects.toThrow('Injected restore failure');
  } finally {
    db.tasks.hook('creating').unsubscribe(reject);
  }
  // Then
  expect((await db.settings.get('workspace'))?.ownerName).toBe('Keep this name');
  expect(await db.tasks.count()).toBe(3);
});
it('preserves user notes and valid links when demo data is removed', async () => {
  // Given
  await loadDemoData();
  const task = await db.tasks.toCollection().first();
  await actions.createNote({
    title: 'My real note',
    notebook: 'General',
    content: 'Keep',
    summary: '',
    questions: '',
    references: '',
    taskId: task?.id ?? null,
    pinned: false,
    archived: false,
    reviewedAt: null,
  });
  // When
  await clearDemoData();
  // Then
  const note = await db.notes.toCollection().first();
  expect(note?.title).toBe('My real note');
  expect(note?.taskId).toBeNull();
  expect(() =>
    parseBackup(
      JSON.stringify({
        format: 'OpenWorkLog',
        version: 1,
        exportedAt: new Date().toISOString(),
        data: {},
      }),
    ),
  ).toThrow();
  expect(parseBackup(await createBackup()).data.notes).toHaveLength(1);
});
it('rejects nonexistent calendar dates when importing a backup', async () => {
  // Given
  await loadDemoData();
  const backup = parseBackup(await createBackup());
  const task = backup.data.tasks[0];
  if (task) task.dueDate = '2026-02-31';
  // When
  await expect(restoreBackup(JSON.stringify(backup))).rejects.toThrow();
  // Then
  expect((await readWorkspace()).tasks).toHaveLength(3);
});

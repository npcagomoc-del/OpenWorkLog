import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import { initializeWorkspace, readWorkspace } from './workspace';
import { actions } from './actions';
import { createBackup, restoreBackup } from './backup';
import { allocateMinutes } from '../domain/time';
const input = {
  title: 'Incident review',
  description: '',
  status: 'Open' as const,
  priority: 'Normal' as const,
  type: 'task' as const,
  categoryId: null,
  projectId: null,
  dueDate: null,
  assignee: '',
  ticket: '',
  latestUpdate: '',
  subtasks: [],
  archived: false,
};
beforeEach(async () => {
  await db.delete();
  await db.open();
  await initializeWorkspace();
});
describe('workspace persistence', () => {
  it('persists created tasks when database is reopened', async () => {
    // Given
    const saved = await actions.createTask(input);
    // When
    db.close();
    await db.open();
    // Then
    expect(await db.tasks.get(saved.id)).toMatchObject({
      title: 'Incident review',
      status: 'Open',
    });
  });
  it('preserves all data when invalid backup is rejected', async () => {
    // Given
    await actions.createTask(input);
    // When
    await expect(restoreBackup('{"version":99}')).rejects.toThrow();
    // Then
    expect(await db.tasks.count()).toBe(1);
  });
  it('restores a complete snapshot when valid backup replaces current workspace', async () => {
    // Given
    await actions.createTask(input);
    const backup = await createBackup();
    await actions.createTask({ ...input, title: 'Later' });
    // When
    await restoreBackup(backup);
    // Then
    expect((await readWorkspace()).tasks.map((t) => t.title)).toEqual(['Incident review']);
  });
  it('splits elapsed minutes when session crosses a half hour', () => {
    // Given / When
    const allocations = allocateMinutes(790, 822);
    // Then
    expect(allocations).toEqual([
      { slot: 26, minutes: 20 },
      { slot: 27, minutes: 12 },
    ]);
  });
});

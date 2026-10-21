import { beforeEach, expect, it } from 'vitest';
import { db } from './db';
import { initializeWorkspace } from './workspace';
import { actions } from './actions';
import { recordMeta, timerSchema } from '../domain/models';
beforeEach(async () => {
  await db.delete();
  await db.open();
  await initializeWorkspace();
});
it('rejects a negative segment when loading timer data', () => {
  // Given
  const raw = {
    ...recordMeta(),
    title: 'Bad',
    taskId: null,
    projectId: null,
    categoryId: null,
    state: 'review',
    entryId: null,
    segments: [{ start: '2026-10-21T05:30:00.000Z', end: '2026-10-21T05:10:00.000Z' }],
  };
  // When / Then
  expect(() => timerSchema.parse(raw)).toThrow();
});
it('rejects a dangling project link when creating a task', async () => {
  // Given
  const input = {
    title: 'Work',
    description: '',
    status: 'Open' as const,
    priority: 'Normal' as const,
    type: 'task' as const,
    categoryId: null,
    projectId: 'missing-project',
    dueDate: null,
    assignee: '',
    ticket: '',
    latestUpdate: '',
    subtasks: [],
    archived: false,
  };
  // When / Then
  await expect(actions.createTask(input)).rejects.toThrow();
  expect(await db.tasks.count()).toBe(0);
});

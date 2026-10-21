import { beforeEach, expect, it } from 'vitest';
import type { DailyEntryCreateInput } from '../domain/models';
import { actions } from './actions';
import { db } from './db';
import { initializeWorkspace } from './workspace';

const input: DailyEntryCreateInput = {
  date: '2026-10-21',
  title: 'Original work',
  taskId: null,
  projectId: null,
  categoryId: null,
  plannedStart: null,
  plannedEnd: null,
  actualStart: 480,
  actualEnd: 510,
  ticket: '',
  projectName: '',
  projectLink: '',
  subtasks: '',
  workDone: '',
  remarks: '',
  status: 'Open',
  isLunch: false,
  timerId: null,
};
beforeEach(async () => {
  await db.delete();
  await db.open();
  await initializeWorkspace();
});
it('propagates explicit daily edits to its canonical task without rewriting sibling history', async () => {
  const entry = await actions.createDailyEntry(input);
  const sibling = await actions.createDailyEntry({
    ...input,
    taskId: entry.taskId,
    date: '2026-10-20',
  });
  const category = await actions.createCategory({
    name: 'Operations',
    color: '#123456',
    archived: false,
  });
  const project = await actions.createProject({
    name: 'Project',
    description: '',
    status: 'Open',
    categoryId: null,
    dueDate: null,
    owner: '',
    link: '',
    archived: false,
  });
  await actions.updateDailyEntry(entry.id, {
    title: 'Corrected work',
    status: 'Closed',
    categoryId: category.id,
    projectId: project.id,
    businessUnit: 'Unit A',
    ticket: 'T-4',
    workDone: 'Resolved',
  });
  expect((await db.dailyEntries.get(entry.id))?.title).toBe('Corrected work');
  expect((await db.dailyEntries.get(entry.id))?.taskId).toBe(entry.taskId);
  expect(await db.tasks.get(entry.taskId ?? '')).toMatchObject({
    title: 'Corrected work',
    status: 'Closed',
    categoryId: category.id,
    projectId: project.id,
    businessUnit: 'Unit A',
    ticket: 'T-4',
    latestUpdate: 'Resolved',
  });
  expect(await db.dailyEntries.get(sibling.id)).toEqual(sibling);
  expect((await db.dailyEntries.get(entry.id))?.actualStart).toBe(480);
});
it('does not overwrite newer canonical fields on a full unchanged daily form save', async () => {
  const entry = await actions.createDailyEntry(input);
  await actions.updateTask(entry.taskId ?? '', { title: 'Tracker rename', status: 'In Progress' });
  await actions.updateDailyEntry(entry.id, {
    ...input,
    taskId: entry.taskId,
    remarks: 'Added remark',
  });
  expect(await db.tasks.get(entry.taskId ?? '')).toMatchObject({
    title: 'Tracker rename',
    status: 'In Progress',
  });
});
it('does not recreate intentionally deleted tasks while editing shared daily fields', async () => {
  const entry = await actions.createDailyEntry(input);
  await actions.deleteTask(entry.taskId ?? '');
  await actions.updateDailyEntry(entry.id, { title: 'History correction', status: 'Closed' });
  expect(await db.tasks.count()).toBe(0);
  expect((await db.dailyEntries.get(entry.id))?.taskDetached).toBe(true);
});
it('relinks without copying an unchanged historical snapshot and synchronizes only explicit changes', async () => {
  const first = await actions.createDailyEntry(input);
  const second = await actions.createDailyEntry({ ...input, title: 'Different task' });
  await actions.updateDailyEntry(first.id, { taskId: second.taskId });
  expect((await db.tasks.get(second.taskId ?? ''))?.title).toBe('Different task');
  await actions.updateDailyEntry(first.id, { title: 'Edited linked task', ticket: 'T-2' });
  expect((await db.tasks.get(second.taskId ?? ''))?.title).toBe('Edited linked task');
  expect((await db.tasks.get(first.taskId ?? ''))?.title).toBe('Original work');
  await actions.updateDailyEntry(first.id, { ticket: '', businessUnit: '' });
  expect((await db.tasks.get(second.taskId ?? ''))?.ticket).toBe('');
});
it('rejects invalid linked edits atomically and keeps lunch out of canonical synchronization', async () => {
  const entry = await actions.createDailyEntry(input);
  await expect(
    actions.updateDailyEntry(entry.id, { title: 'Rejected', projectId: 'missing' }),
  ).rejects.toThrow();
  expect((await db.dailyEntries.get(entry.id))?.title).toBe('Original work');
  expect((await db.tasks.get(entry.taskId ?? ''))?.title).toBe('Original work');
  await actions.updateDailyEntry(entry.id, { isLunch: true, title: 'Lunch', status: 'Closed' });
  expect((await db.tasks.get(entry.taskId ?? ''))?.status).toBe('Open');
});

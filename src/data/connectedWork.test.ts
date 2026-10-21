import { beforeEach, expect, it } from 'vitest';
import { type DailyEntryCreateInput, recordMeta } from '../domain/models';
import { actions } from './actions';
import { createBackup, parseBackup, restoreBackup } from './backup';
import { db } from './db';
import { initializeWorkspace } from './workspace';

const entryInput: DailyEntryCreateInput = {
  date: '2026-10-21',
  title: 'Check printer',
  taskId: null,
  projectId: null,
  categoryId: null,
  plannedStart: 480,
  plannedEnd: 510,
  actualStart: null,
  actualEnd: null,
  ticket: 'INC-32',
  projectName: '',
  projectLink: '',
  subtasks: 'Print a test page',
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
it('creates one canonical task and calendar plan from planned daily work', async () => {
  const entry = await actions.createDailyEntry(entryInput);
  expect(entry.taskId).toBeTruthy();
  expect(entry.planId).toBeTruthy();
  expect((await db.tasks.get(entry.taskId ?? ''))?.title).toBe(entry.title);
  expect((await db.tasks.get(entry.taskId ?? ''))?.dueDate).toBeNull();
  expect((await db.plans.get(entry.planId ?? ''))?.taskId).toBe(entry.taskId);
  await actions.updateDailyEntry(entry.id, { title: 'Printer review' });
  await initializeWorkspace();
  expect(await db.tasks.count()).toBe(1);
  expect(await db.plans.count()).toBe(1);
});
it('creates a task from calendar and reuses it when logging the plan', async () => {
  const plan = await actions.createPlan({
    title: 'Calendar review',
    date: '2026-10-21',
    startMinute: 540,
    endMinute: 570,
    taskId: null,
    projectId: null,
    categoryId: null,
    notes: '',
  });
  const entry = await actions.createDailyEntry({ ...entryInput, planId: plan.id, taskId: null });
  expect(plan.taskId).toBeTruthy();
  expect(entry.taskId).toBe(plan.taskId);
  expect(await db.tasks.count()).toBe(1);
});
it('leaves lunch out of My Tasks and calendar task plans', async () => {
  const entry = await actions.createDailyEntry({ ...entryInput, title: 'Lunch', isLunch: true });
  expect(entry.taskId).toBeNull();
  expect(await db.tasks.count()).toBe(0);
  expect(await db.plans.count()).toBe(0);
});
it('repairs legacy standalone records idempotently without title-merging separate work', async () => {
  const settings = await db.settings.get('workspace');
  if (settings) {
    const { connectedWorkVersion: _version, ...legacy } = settings;
    await db.settings.put(legacy);
  }
  const plan = {
    ...recordMeta(),
    title: entryInput.title,
    date: entryInput.date,
    startMinute: 480,
    endMinute: 510,
    taskId: null,
    projectId: null,
    categoryId: null,
    notes: '',
  };
  await db.plans.add(plan);
  await db.dailyEntries.add({ ...entryInput, ...recordMeta(), planId: plan.id });
  await db.dailyEntries.add({
    ...entryInput,
    ...recordMeta(),
    plannedStart: null,
    plannedEnd: null,
  });
  await initializeWorkspace();
  await initializeWorkspace();
  const entries = await db.dailyEntries.toArray();
  expect(await db.tasks.count()).toBe(2);
  expect(entries.find((e) => e.planId === plan.id)?.taskId).toBe(
    (await db.plans.get(plan.id))?.taskId,
  );
});
it('preserves intentional task deletion across initialization and a new backup restore', async () => {
  const entry = await actions.createDailyEntry(entryInput);
  await actions.deleteTask(entry.taskId ?? '');
  await initializeWorkspace();
  expect(await db.tasks.count()).toBe(0);
  await restoreBackup(await createBackup());
  expect(await db.tasks.count()).toBe(0);
  expect((await db.dailyEntries.get(entry.id))?.taskId).toBeNull();
});
it('reschedules planned-only daily work while preserving already logged actual history', async () => {
  const planned = await actions.createDailyEntry(entryInput);
  await actions.updatePlan(planned.planId ?? '', {
    date: '2026-10-22',
    startMinute: 600,
    endMinute: 630,
  });
  expect((await db.dailyEntries.get(planned.id))?.date).toBe('2026-10-22');
  await actions.updateDailyEntry(planned.id, { actualStart: 605, actualEnd: 625 });
  await actions.updatePlan(planned.planId ?? '', {
    date: '2026-10-23',
    startMinute: 660,
    endMinute: 690,
  });
  const saved = await db.dailyEntries.get(planned.id);
  expect(saved?.date).toBe('2026-10-22');
  expect(saved?.actualStart).toBe(605);
  expect(saved?.plannedStart).toBe(600);
});
it('upgrades an old backup only once and rolls back a failed connected write', async () => {
  const backup = parseBackup(await createBackup());
  const { connectedWorkVersion: _version, ...legacySettings } = backup.data.settings;
  await restoreBackup(
    JSON.stringify({
      ...backup,
      data: {
        ...backup.data,
        settings: legacySettings,
        dailyEntries: [{ ...entryInput, ...recordMeta() }],
      },
    }),
  );
  expect(await db.tasks.count()).toBe(1);
  const repaired = (await db.dailyEntries.toArray())[0];
  await actions.deleteTask(repaired?.taskId ?? '');
  await restoreBackup(await createBackup());
  expect(await db.tasks.count()).toBe(0);
  await expect(actions.createDailyEntry({ ...entryInput, projectId: 'missing' })).rejects.toThrow();
  expect(await db.tasks.count()).toBe(0);
});
it('backfills legacy links without moving a historical planned-only entry date', async () => {
  const settings = await db.settings.get('workspace');
  if (settings) {
    const { connectedWorkVersion: _version, ...legacy } = settings;
    await db.settings.put(legacy);
  }
  const plan = {
    ...recordMeta(),
    title: 'Legacy work',
    date: '2026-10-21',
    startMinute: 480,
    endMinute: 510,
    taskId: null,
    projectId: null,
    categoryId: null,
    notes: '',
  };
  const entry = {
    ...entryInput,
    ...recordMeta(),
    date: '2026-10-22',
    planId: plan.id,
    plannedStart: 540,
    plannedEnd: 570,
  };
  await db.plans.add(plan);
  await db.dailyEntries.add(entry);
  await initializeWorkspace();
  const saved = await db.dailyEntries.get(entry.id);
  expect(saved?.date).toBe('2026-10-22');
  expect(saved?.plannedStart).toBe(540);
  expect(saved?.createdAt).toBe(entry.createdAt);
});

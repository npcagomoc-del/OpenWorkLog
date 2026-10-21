import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { DailyEntryCreateInput } from '../domain/models';
import { actions } from './actions';
import { createBackup, parseBackup, restoreBackup } from './backup';
import { db } from './db';
import { saveTimerEntry, startTimer, stopTimer, timerEntryDraft } from './timers';
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
afterEach(() => vi.useRealTimers());
it('starts and saves a daily-source timer into the same entry with planned context', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-21T00:05:00Z'));
  const entry = await actions.createDailyEntry(entryInput);
  const timer = await startTimer({ title: entry.title, sourceEntryId: entry.id });
  expect(timer.taskId).toBe(entry.taskId);
  expect(timer.plannedStart).toBe(480);
  expect(timerEntryDraft(timer).ticket).toBe('INC-32');
  vi.setSystemTime(new Date('2026-10-21T00:15:00Z'));
  await saveTimerEntry(timer.id, {
    ...timerEntryDraft(await stopTimer(timer.id)),
    workDone: 'Tested',
  });
  expect(await db.dailyEntries.count()).toBe(1);
  expect((await db.dailyEntries.get(entry.id))?.workDone).toBe('Tested');
  expect((await db.tasks.get(entry.taskId ?? ''))?.status).toBe('Open');
  const backup = await createBackup();
  parseBackup(backup);
  await restoreBackup(backup);
  expect(await db.tasks.count()).toBe(1);
});

it('keeps a deleted calendar plan detached when its daily entry is edited or timed', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-21T00:05:00Z'));
  const entry = await actions.createDailyEntry(entryInput);
  await actions.deletePlan(entry.planId ?? '');
  await actions.updateDailyEntry(entry.id, { remarks: 'Keep history' });
  expect(await db.plans.count()).toBe(0);
  const timer = await startTimer({ title: entry.title, sourceEntryId: entry.id });
  vi.setSystemTime(new Date('2026-10-21T00:15:00Z'));
  await saveTimerEntry(timer.id, timerEntryDraft(await stopTimer(timer.id)));
  expect(await db.plans.count()).toBe(0);
  expect(await db.dailyEntries.count()).toBe(1);
  parseBackup(await createBackup());
});

it('creates one canonical task for a saved standalone timer across midnight', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-21T15:50:00Z'));
  const timer = await startTimer({ title: 'Overnight work' });
  vi.setSystemTime(new Date('2026-10-21T16:10:00Z'));
  const draft = timerEntryDraft(await stopTimer(timer.id));
  await saveTimerEntry(timer.id, draft);
  await saveTimerEntry(timer.id, draft);
  const entries = await db.dailyEntries.toArray();
  expect(entries).toHaveLength(2);
  expect(await db.tasks.count()).toBe(1);
  expect(entries[0]?.taskId).toBe(entries[1]?.taskId);
  expect((await db.timers.get(timer.id))?.taskId).toBe(entries[0]?.taskId);
  parseBackup(await createBackup());
});

it('does not resurrect a deleted task through historical edits, rescheduling or source timers', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-21T00:05:00Z'));
  const entry = await actions.createDailyEntry(entryInput);
  await actions.deleteTask(entry.taskId ?? '');
  await actions.updateDailyEntry(entry.id, { remarks: 'Historical correction' });
  expect(await db.tasks.count()).toBe(0);
  await actions.updatePlan(entry.planId ?? '', { startMinute: 490, endMinute: 520 });
  expect(await db.tasks.count()).toBe(0);
  const source = await startTimer({ title: entry.title, sourceEntryId: entry.id });
  vi.setSystemTime(new Date('2026-10-21T00:15:00Z'));
  await saveTimerEntry(source.id, timerEntryDraft(await stopTimer(source.id)));
  expect(await db.tasks.count()).toBe(0);
  const backup = await createBackup();
  parseBackup(backup);
  await restoreBackup(backup);
  expect(await db.tasks.count()).toBe(0);
});
it('applies manually added planned review times only to their selected date', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-21T15:50:00Z'));
  const timer = await startTimer({ title: 'Overnight review' });
  vi.setSystemTime(new Date('2026-10-21T16:10:00Z'));
  await saveTimerEntry(timer.id, {
    ...timerEntryDraft(await stopTimer(timer.id)),
    plannedStart: 480,
    plannedEnd: 510,
  });
  const entries = await db.dailyEntries.orderBy('date').toArray();
  expect(entries[0]?.plannedStart).toBe(480);
  expect(entries[1]?.plannedStart).toBeNull();
  expect(await db.plans.count()).toBe(1);
  expect(await db.tasks.count()).toBe(1);
});
it('allows adding planned review times to an unplanned source entry without duplicating it', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-21T00:05:00Z'));
  const entry = await actions.createDailyEntry({
    ...entryInput,
    plannedStart: null,
    plannedEnd: null,
  });
  const timer = await startTimer({ title: entry.title, sourceEntryId: entry.id });
  vi.setSystemTime(new Date('2026-10-21T00:15:00Z'));
  await saveTimerEntry(timer.id, {
    ...timerEntryDraft(await stopTimer(timer.id)),
    plannedStart: 480,
    plannedEnd: 510,
  });
  expect(await db.dailyEntries.count()).toBe(1);
  expect((await db.dailyEntries.get(entry.id))?.plannedStart).toBe(480);
  expect(await db.plans.count()).toBe(1);
});

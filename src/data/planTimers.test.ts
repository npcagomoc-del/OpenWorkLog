import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { db } from './db';
import { initializeWorkspace } from './workspace';
import { actions } from './actions';
import { startTimer, stopTimer, saveTimerEntry, timerEntryDraft } from './timers';
import { createBackup, parseBackup } from './backup';
import { entryMinutes } from '../domain/time';
beforeEach(async () => {
  await db.delete();
  await db.open();
  await initializeWorkspace();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-21T05:10:00Z'));
});
afterEach(() => vi.useRealTimers());
async function planned() {
  const plan = await actions.createPlan({
    title: 'Planned review',
    date: '2026-10-21',
    startMinute: 780,
    endMinute: 840,
    taskId: null,
    projectId: null,
    categoryId: null,
    notes: '',
  });
  const entry = await actions.createDailyEntry({
    title: plan.title,
    date: plan.date,
    plannedStart: 780,
    plannedEnd: 840,
    actualStart: null,
    actualEnd: null,
    taskId: null,
    projectId: null,
    categoryId: null,
    ticket: '',
    projectName: '',
    projectLink: '',
    subtasks: '',
    workDone: '',
    remarks: '',
    status: 'Open',
    isLunch: false,
    timerId: null,
    planId: plan.id,
  });
  return { plan, entry };
}
it('updates the planned daily entry when its calendar timer is saved', async () => {
  // Given
  const { plan, entry } = await planned();
  const timer = await startTimer({ title: plan.title, planId: plan.id });
  vi.setSystemTime(new Date('2026-10-21T05:42:00Z'));
  const stopped = await stopTimer(timer.id);
  // When
  await saveTimerEntry(timer.id, timerEntryDraft(stopped));
  // Then
  const saved = await db.dailyEntries.toArray();
  expect(saved).toHaveLength(1);
  expect(saved[0]?.id).toBe(entry.id);
  expect(saved[0]?.plannedStart).toBe(780);
  expect(saved[0] && entryMinutes(saved[0])).toBe(32);
  expect(parseBackup(await createBackup()).data.timers).toHaveLength(1);
});
it('consolidates repeated plan timer sessions without losing time or reciprocal ownership', async () => {
  // Given
  const { plan, entry } = await planned();
  const first = await startTimer({ title: plan.title, planId: plan.id });
  vi.setSystemTime(new Date('2026-10-21T05:30:00Z'));
  await saveTimerEntry(first.id, timerEntryDraft(await stopTimer(first.id)));
  vi.setSystemTime(new Date('2026-10-21T05:40:00Z'));
  const second = await startTimer({ title: plan.title, planId: plan.id });
  vi.setSystemTime(new Date('2026-10-21T05:50:00Z'));
  // When
  await saveTimerEntry(second.id, timerEntryDraft(await stopTimer(second.id)));
  // Then
  const backup = parseBackup(await createBackup());
  expect(backup.data.dailyEntries).toHaveLength(1);
  expect(backup.data.dailyEntries[0]?.id).toBe(entry.id);
  expect(backup.data.dailyEntries[0] && entryMinutes(backup.data.dailyEntries[0])).toBe(30);
  expect(backup.data.timers).toHaveLength(1);
});
it('does not copy another dates planned times into todays timer draft', async () => {
  // Given
  const { plan } = await planned();
  vi.setSystemTime(new Date('2026-10-22T05:10:00Z'));
  // When
  const draft = timerEntryDraft(await startTimer({ title: plan.title, planId: plan.id }));
  // Then
  expect(draft.date).toBe('2026-10-22');
  expect(draft.plannedStart).toBeNull();
  expect(draft.planId).toBe(plan.id);
});
it('preserves manual corrections and earlier accomplishments when another plan session is saved', async () => {
  // Given
  const { plan, entry } = await planned();
  const first = await startTimer({ title: plan.title, planId: plan.id });
  vi.setSystemTime(new Date('2026-10-21T05:30:00Z'));
  await saveTimerEntry(first.id, {
    ...timerEntryDraft(await stopTimer(first.id)),
    workDone: 'First accomplishment',
  });
  await actions.updateDailyEntry(entry.id, {
    actualStart: 790,
    actualEnd: 800,
    actualSegments: undefined,
  });
  vi.setSystemTime(new Date('2026-10-21T05:40:00Z'));
  const second = await startTimer({ title: plan.title, planId: plan.id });
  vi.setSystemTime(new Date('2026-10-21T05:50:00Z'));
  // When
  await saveTimerEntry(second.id, {
    ...timerEntryDraft(await stopTimer(second.id)),
    workDone: 'Second accomplishment',
  });
  // Then
  const saved = await db.dailyEntries.get(entry.id);
  expect(saved && entryMinutes(saved)).toBe(20);
  expect(saved?.workDone).toBe('First accomplishment\nSecond accomplishment');
  parseBackup(await createBackup());
});
it('does not recreate a deleted overnight date when a later plan timer is saved', async () => {
  // Given
  const { plan } = await planned();
  vi.setSystemTime(new Date('2026-10-21T15:50:00Z'));
  const first = await startTimer({ title: plan.title, planId: plan.id });
  vi.setSystemTime(new Date('2026-10-21T16:10:00Z'));
  await saveTimerEntry(first.id, timerEntryDraft(await stopTimer(first.id)));
  const removed = await db.dailyEntries.where('date').equals('2026-10-21').first();
  if (removed) await actions.deleteDailyEntry(removed.id);
  vi.setSystemTime(new Date('2026-10-21T16:20:00Z'));
  const second = await startTimer({ title: plan.title, planId: plan.id });
  vi.setSystemTime(new Date('2026-10-21T16:30:00Z'));
  // When
  await saveTimerEntry(second.id, timerEntryDraft(await stopTimer(second.id)));
  // Then
  const backup = parseBackup(await createBackup());
  expect(backup.data.dailyEntries).toHaveLength(1);
  expect(backup.data.dailyEntries[0]?.date).toBe('2026-10-22');
  expect(backup.data.dailyEntries[0] && entryMinutes(backup.data.dailyEntries[0])).toBe(20);
});

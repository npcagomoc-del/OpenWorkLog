import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { actions } from './actions';
import { db } from './db';
import { saveTimerEntry, startTimer, stopTimer, timerEntryDraft } from './timers';
import { initializeWorkspace } from './workspace';

beforeEach(async () => {
  await db.delete();
  await db.open();
  await initializeWorkspace();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-21T00:00:00Z'));
});
afterEach(() => vi.useRealTimers());

it.each(['', 'Marine'])('keeps selected plan unit %j through task changes, timer save and restart', async businessUnit => {
  const plan = await actions.createPlan({
    title: 'Plan snapshot', date: '2026-10-21', startMinute: 480, endMinute: 510,
    taskId: null, projectId: null, categoryId: null, businessUnit, notes: '',
  });
  await actions.updateTask(plan.taskId ?? '', { businessUnit: 'Assigned task' });
  const input = {
    title: plan.title, planId: plan.id, sourceEntryId: null, taskId: plan.taskId,
    projectId: plan.projectId, categoryId: plan.categoryId,
  };
  const first = await startTimer(input);
  vi.setSystemTime(new Date('2026-10-21T00:10:00Z'));
  const firstDraft = timerEntryDraft(await stopTimer(first.id));
  await saveTimerEntry(first.id, firstDraft);
  const firstEntry = (await db.dailyEntries.toArray())[0];
  const firstPlan = await db.plans.get(plan.id);
  await actions.updateTask(plan.taskId ?? '', { businessUnit: 'Changed later' });
  vi.setSystemTime(new Date('2026-10-21T00:20:00Z'));
  const next = await startTimer(input);
  vi.setSystemTime(new Date('2026-10-21T00:25:00Z'));
  await saveTimerEntry(next.id, timerEntryDraft(await stopTimer(next.id)));
  const entries = await db.dailyEntries.toArray();
  expect({
    firstTimer: first.businessUnit, firstDraft: firstDraft.businessUnit,
    firstEntry: firstEntry?.businessUnit, firstPlan: firstPlan?.businessUnit,
    nextTimer: next.businessUnit, savedEntry: entries[0]?.businessUnit,
    savedPlan: (await db.plans.get(plan.id))?.businessUnit,
  }).toEqual({
    firstTimer: businessUnit, firstDraft: businessUnit,
    firstEntry: businessUnit, firstPlan: businessUnit,
    nextTimer: businessUnit, savedEntry: businessUnit, savedPlan: businessUnit,
  });
  expect(entries).toHaveLength(1);
  expect(entries[0]?.id).toBe(firstEntry?.id);
  expect(await db.tasks.count()).toBe(1);
  expect(await db.plans.count()).toBe(1);
});

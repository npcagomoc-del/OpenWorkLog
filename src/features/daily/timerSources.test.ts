import { expect, it } from 'vitest';
import { DEFAULT_SETTINGS, dailyEntrySchema, planSchema, recordMeta, type Workspace } from '../../domain/models';
import { blankEntry } from './entryForm';
import { entryTimerSource, plannedWindow, scheduledTimerSources } from './timerSources';

const date = '2026-10-21';
function workspace(overrides: Partial<Workspace>): Workspace {
  return { tasks: [], projects: [], categories: [], notes: [], plans: [], dailyEntries: [], timers: [], settings: DEFAULT_SETTINGS, ...overrides };
}
it('shows one activity when a calendar plan already has a daily entry', () => {
  const plan = planSchema.parse({ ...recordMeta(), title: 'Review inventory', date, startMinute: 480, endMinute: 540, taskId: 'task-1', projectId: null, categoryId: null, notes: '' });
  const entry = dailyEntrySchema.parse({ ...recordMeta(), ...blankEntry(date, 480), title: plan.title, taskId: plan.taskId, plannedEnd: 540, planId: plan.id });
  const choices = scheduledTimerSources(workspace({ plans: [plan], dailyEntries: [entry] }), date);
  expect(choices).toHaveLength(1);
  expect(choices[0]).toMatchObject({ sourceEntryId: entry.id, planId: plan.id, taskId: 'task-1', plannedStart: 480, plannedEnd: 540 });
  expect(plannedWindow(entryTimerSource(entry))).toBe('2026-10-21 · 08:00–09:00');
});
it('keeps standalone plans and daily activities, excludes breaks and other dates, and orders by schedule', () => {
  const plan = planSchema.parse({ ...recordMeta(), title: 'Early plan', date, startMinute: 480, endMinute: 510, taskId: null, projectId: null, categoryId: null, notes: '' });
  const activity = dailyEntrySchema.parse({ ...recordMeta(), ...blankEntry(date, 540), title: 'Daily activity' });
  const lunch = dailyEntrySchema.parse({ ...recordMeta(), ...blankEntry(date, 720), title: 'Lunch', isLunch: true });
  const tomorrow = dailyEntrySchema.parse({ ...recordMeta(), ...blankEntry('2026-10-22', 480), title: 'Tomorrow' });
  const choices = scheduledTimerSources(workspace({ plans: [plan], dailyEntries: [activity, lunch, tomorrow] }), date);
  expect(choices.map(choice => choice.title)).toEqual(['Early plan', 'Daily activity']);
  expect(choices[0]).toMatchObject({ sourceEntryId: null, planId: plan.id });
  expect(choices[1]).toMatchObject({ sourceEntryId: activity.id });
});
it('keeps actual-only activities selectable without inventing a planned window', () => {
  const activity = dailyEntrySchema.parse({ ...recordMeta(), ...blankEntry(date), title: 'Unscheduled support', actualStart: 600, actualEnd: 630 });
  const choices = scheduledTimerSources(workspace({ dailyEntries: [activity] }), date);
  expect(choices).toHaveLength(1);
  expect(plannedWindow(entryTimerSource(activity))).toBe('2026-10-21 · No planned time');
});

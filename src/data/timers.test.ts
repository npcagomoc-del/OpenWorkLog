import { afterEach, beforeEach, expect, it, vi } from 'vitest';
afterEach(() => vi.useRealTimers());
import { db } from './db';
import { initializeWorkspace } from './workspace';
import { pauseTimer, resumeTimer, stopTimer, saveTimerEntry } from './timers';
import { recordMeta, DEFAULT_SETTINGS, type Timer } from '../domain/models';
import { timerEntryDraft } from './timers';
import { entryMinutes, entryAllocations } from '../domain/time';
beforeEach(async () => {
  await db.delete();
  await db.open();
  await initializeWorkspace();
});
function fixture(): Timer {
  return {
    ...recordMeta(),
    title: 'Focused work',
    taskId: null,
    projectId: null,
    categoryId: null,
    state: 'review',
    entryId: null,
    segments: [
      { start: '2026-10-21T05:10:00.000Z', end: '2026-10-21T05:30:00.000Z' },
      { start: '2026-10-21T05:35:00.000Z', end: '2026-10-21T05:42:00.000Z' },
    ],
  };
}
it('excludes paused gaps when saving a reviewed timer twice', async () => {
  // Given
  const timer = fixture();
  await db.timers.add(timer);
  const draft = timerEntryDraft(timer, DEFAULT_SETTINGS);
  // When
  await saveTimerEntry(timer.id, draft);
  await saveTimerEntry(timer.id, draft);
  // Then
  const entries = await db.dailyEntries.toArray();
  expect(entries).toHaveLength(1);
  const entry = entries[0];
  expect(entry && entryMinutes(entry)).toBe(27);
  expect(entry && entryAllocations(entry)).toEqual([
    { slot: 26, minutes: 20 },
    { slot: 27, minutes: 7 },
  ]);
});
it('splits overnight sessions when saving without duplicating time', async () => {
  // Given
  const timer = {
    ...fixture(),
    segments: [{ start: '2026-10-21T15:50:00.000Z', end: '2026-10-21T16:10:00.000Z' }],
  };
  await db.timers.add(timer);
  // When
  await saveTimerEntry(timer.id, timerEntryDraft(timer));
  // Then
  const entries = await db.dailyEntries.toArray();
  expect(entries).toHaveLength(2);
  expect(entries.reduce((sum, e) => sum + entryMinutes(e), 0)).toBe(20);
});
it('persists pause resume and review state across database reopen', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-21T05:11:00Z'));
  // Given
  const timer = {
    ...fixture(),
    state: 'running' as const,
    segments: [{ start: '2026-10-21T05:10:00.000Z', end: null }],
  };
  await db.timers.add(timer);
  // When
  await pauseTimer(timer.id);
  await resumeTimer(timer.id);
  await stopTimer(timer.id);
  db.close();
  await db.open();
  // Then
  const stored = await db.timers.get(timer.id);
  expect(stored?.state).toBe('review');
  expect(stored?.segments).toHaveLength(2);
  expect(stored?.segments.every((s) => s.end !== null)).toBe(true);
});
it('uses local slots across a daylight-saving jump without inventing elapsed time', () => {
  // Given
  const timer = {
    ...fixture(),
    segments: [{ start: '2026-03-08T06:50:00.000Z', end: '2026-03-08T07:10:00.000Z' }],
  };
  // When
  const draft = timerEntryDraft(timer, { ...DEFAULT_SETTINGS, timezone: 'America/New_York' });
  // Then
  expect(draft.actualStart).toBe(110);
  expect(draft.actualEnd).toBe(190);
  expect(draft.actualSegments).toEqual([
    { startMinute: 110, endMinute: 120 },
    { startMinute: 180, endMinute: 190 },
  ]);
});

it('preserves repeated-hour elapsed time during a daylight-saving fall back', async () => {
  // Given
  const timer = {
    ...fixture(),
    segments: [{ start: '2026-11-01T05:50:00.000Z', end: '2026-11-01T06:10:00.000Z' }],
  };
  await db.timers.add(timer);
  await db.settings.put({ ...DEFAULT_SETTINGS, timezone: 'America/New_York' });
  // When
  await saveTimerEntry(
    timer.id,
    timerEntryDraft(timer, { ...DEFAULT_SETTINGS, timezone: 'America/New_York' }),
  );
  // Then
  const entry = await db.dailyEntries.toCollection().first();
  expect(entry && entryMinutes(entry)).toBe(20);
  expect(entry?.actualSegments).toEqual([
    { startMinute: 110, endMinute: 120 },
    { startMinute: 60, endMinute: 70 },
  ]);
  expect(entry?.actualStart).toBe(60);
  expect(entry?.actualEnd).toBe(120);
});

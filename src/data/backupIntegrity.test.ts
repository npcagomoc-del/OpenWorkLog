import { beforeEach, expect, it } from 'vitest';
import { db } from './db';
import { initializeWorkspace } from './workspace';
import { createBackup, parseBackup, restoreBackup } from './backup';
import { recordMeta, type Timer } from '../domain/models';
import { timerEntryDraft, saveTimerEntry } from './timers';
import { actions } from './actions';
beforeEach(async () => {
  await db.delete();
  await db.open();
  await initializeWorkspace();
});
function timerFixture(): Timer {
  return {
    ...recordMeta(),
    title: 'Review',
    taskId: null,
    projectId: null,
    categoryId: null,
    state: 'review',
    entryId: null,
    segments: [{ start: '2026-10-21T05:10:00.000Z', end: '2026-10-21T05:30:00.000Z' }],
  };
}
async function savedBackup(overnight = false) {
  const timer = timerFixture();
  await db.timers.add(
    overnight
      ? {
          ...timer,
          segments: [{ start: '2026-10-21T15:50:00.000Z', end: '2026-10-21T16:10:00.000Z' }],
        }
      : timer,
  );
  const stored = await db.timers.get(timer.id);
  if (stored) await saveTimerEntry(stored.id, timerEntryDraft(stored));
  return parseBackup(await createBackup());
}
it.each([
  {
    name: 'overlapping',
    segments: [
      { start: '2026-10-21T05:10:00.000Z', end: '2026-10-21T05:30:00.000Z' },
      { start: '2026-10-21T05:20:00.000Z', end: '2026-10-21T05:40:00.000Z' },
    ],
  },
  {
    name: 'unordered',
    segments: [
      { start: '2026-10-21T05:30:00.000Z', end: '2026-10-21T05:40:00.000Z' },
      { start: '2026-10-21T05:10:00.000Z', end: '2026-10-21T05:20:00.000Z' },
    ],
  },
])('rejects $name timer segments without replacing current data', async ({ segments }) => {
  // Given
  const backup = await savedBackup();
  const timer = backup.data.timers[0];
  if (timer) timer.segments = segments;
  await actions.updateSettings({ ownerName: 'Preserve' });
  // When / Then
  await expect(restoreBackup(JSON.stringify(backup))).rejects.toThrow();
  expect((await db.settings.get('workspace'))?.ownerName).toBe('Preserve');
});
it('rejects an open segment before a closed segment', async () => {
  // Given
  const backup = parseBackup(await createBackup());
  backup.data.timers.push({
    ...timerFixture(),
    state: 'running',
    segments: [
      { start: '2026-10-21T05:10:00.000Z', end: null },
      { start: '2026-10-21T05:30:00.000Z', end: '2026-10-21T05:40:00.000Z' },
    ],
  });
  // When / Then
  expect(() => parseBackup(JSON.stringify(backup))).toThrow();
});
it('rejects two saved timers claiming one daily entry', async () => {
  // Given
  const backup = await savedBackup();
  const timer = backup.data.timers[0];
  if (timer) backup.data.timers.push({ ...timer, id: crypto.randomUUID() });
  // When / Then
  expect(() => parseBackup(JSON.stringify(backup))).toThrow();
});
it('rejects an entry that does not reciprocate its saved timer pointer', async () => {
  // Given
  const backup = await savedBackup();
  const entry = backup.data.dailyEntries[0];
  if (entry) entry.timerId = null;
  // When / Then
  expect(() => parseBackup(JSON.stringify(backup))).toThrow();
});
it('rejects a paused timer that already owns a saved entry', async () => {
  // Given
  const backup = await savedBackup();
  const timer = backup.data.timers[0];
  if (timer) timer.state = 'paused';
  // When / Then
  expect(() => parseBackup(JSON.stringify(backup))).toThrow();
});
it('rejects entries attached to an unsaved review timer', async () => {
  // Given
  const backup = await savedBackup();
  const timer = backup.data.timers[0];
  if (timer) timer.entryId = null;
  // When / Then
  expect(() => parseBackup(JSON.stringify(backup))).toThrow();
});
it('keeps an overnight timer valid when its first daily entry is deleted', async () => {
  // Given
  const backup = await savedBackup(true);
  await restoreBackup(JSON.stringify(backup));
  const timer = backup.data.timers[0];
  // When
  if (timer?.entryId) await actions.deleteDailyEntry(timer.entryId);
  // Then
  const after = parseBackup(await createBackup());
  expect(after.data.dailyEntries).toHaveLength(1);
  expect(after.data.timers).toHaveLength(1);
  expect(after.data.timers[0]?.entryId).toBe(after.data.dailyEntries[0]?.id);
});

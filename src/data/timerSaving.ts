import { db } from './db';
import { checkLinks } from './relations';
import { timerSegmentsByDate } from '../domain/timerSegments';
import {
  DEFAULT_SETTINGS,
  recordMeta,
  WorkspaceError,
  timerSchema,
  dailyEntrySchema,
  type DailyEntryCreateInput,
  type DailyEntry,
} from '../domain/models';
function recordedSegments(entry: DailyEntry | undefined) {
  return (
    entry?.actualSegments ??
    (entry?.actualStart !== null && entry?.actualStart !== undefined && entry.actualEnd !== null
      ? [{ startMinute: entry.actualStart, endMinute: entry.actualEnd }]
      : [])
  );
}
function joined(previous: string | undefined, current: string): string {
  return [...new Set([previous ?? '', current].filter((value) => value.trim()))].join('\n');
}
export async function saveTimerEntry(id: string, input: DailyEntryCreateInput): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    const timer = await db.timers.get(id);
    if (!timer) throw new WorkspaceError('missing', 'Timer no longer exists.');
    if (timer.entryId) return;
    if (timer.state !== 'review')
      throw new WorkspaceError('timer', 'Stop the timer before saving.');
    const settings = (await db.settings.get('workspace')) ?? DEFAULT_SETTINGS;
    const originalDates = timerSegmentsByDate(timer, settings.timezone);
    const plannedEntries = timer.planId
      ? await db.dailyEntries
          .filter((entry) => entry.planId === timer.planId && originalDates.has(entry.date))
          .toArray()
      : [];
    const priorOwnerIds = new Set(
      plannedEntries.flatMap((entry) => (entry.timerId ? [entry.timerId] : [])),
    );
    const priorOwners = await db.timers.filter((owner) => priorOwnerIds.has(owner.id)).toArray();
    const priorEntries = await db.dailyEntries
      .filter((entry) => entry.timerId !== null && priorOwnerIds.has(entry.timerId))
      .toArray();
    const combined = timerSchema.parse({
      ...timer,
      segments: [...priorOwners.flatMap((owner) => owner.segments), ...timer.segments].sort(
        (a, b) => Date.parse(a.start) - Date.parse(b.start),
      ),
    });
    const dates = new Set([...originalDates.keys(), ...priorEntries.map((entry) => entry.date)]);
    let firstId: string | null = null;
    for (const date of dates) {
      const existing = [...plannedEntries, ...priorEntries].find((entry) => entry.date === date);
      if (!originalDates.has(date) && existing) {
        await db.dailyEntries.put({ ...existing, timerId: id });
        firstId ??= existing.id;
        continue;
      }
      const segments = [...recordedSegments(existing), ...(originalDates.get(date) ?? [])];
      const first = segments[0];
      if (!first) continue;
      const base = { ...existing, ...input };
      const entry = dailyEntrySchema.parse({
        ...base,
        workDone: joined(existing?.workDone, input.workDone),
        remarks: joined(existing?.remarks, input.remarks),
        ticket: input.ticket || existing?.ticket || '',
        projectName: input.projectName || existing?.projectName || '',
        projectLink: input.projectLink || existing?.projectLink || '',
        subtasks: input.subtasks || existing?.subtasks || '',
        ...(existing
          ? {
              id: existing.id,
              createdAt: existing.createdAt,
              updatedAt: new Date().toISOString(),
              demo: existing.demo,
            }
          : recordMeta()),
        date,
        planId: timer.planId ?? null,
        timerId: id,
        plannedStart:
          existing?.plannedStart ??
          (timer.plannedDate === date
            ? (timer.plannedStart ?? null)
            : timer.planId
              ? null
              : input.plannedStart),
        plannedEnd:
          existing?.plannedEnd ??
          (timer.plannedDate === date
            ? (timer.plannedEnd ?? null)
            : timer.planId
              ? null
              : input.plannedEnd),
        actualStart: Math.floor(Math.min(...segments.map((segment) => segment.startMinute))),
        actualEnd: Math.min(
          1440,
          Math.max(
            Math.floor(first.startMinute) + 1,
            Math.ceil(Math.max(...segments.map((segment) => segment.endMinute))),
          ),
        ),
        actualSegments: segments,
      });
      await checkLinks(entry);
      await db.dailyEntries.put(entry);
      firstId ??= entry.id;
    }
    if (!firstId) throw new WorkspaceError('timer', 'This timer has no recorded time.');
    await db.timers.bulkDelete([...priorOwnerIds]);
    await db.timers.put({ ...combined, entryId: firstId, updatedAt: new Date().toISOString() });
  });
}

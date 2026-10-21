import {
  type DailyEntryCreateInput,
  DEFAULT_SETTINGS,
  recordMeta,
  type Settings,
  type Timer,
  timerSchema,
  WorkspaceError,
} from '../domain/models';
import { todayKey } from '../domain/time';
import { timerSegmentsByDate } from '../domain/timerSegments';
import { connectEntry } from './connectedWork';
import { db } from './db';
import { checkLinks } from './relations';
import { inheritedBusinessUnit } from './workUnits';

type StartInput = {
  readonly title: string;
  readonly taskId?: string | null;
  readonly projectId?: string | null;
  readonly categoryId?: string | null;
  readonly planId?: string | null;
  readonly sourceEntryId?: string | null;
};
export async function startTimer(input: StartInput): Promise<Timer> {
  return db.transaction('rw', db.tables, async () => {
    if (await db.timers.filter((t) => t.entryId === null).count())
      throw new WorkspaceError('timer', 'Review or discard the current timer first.');
    const settings = (await db.settings.get('workspace')) ?? DEFAULT_SETTINGS;
    const date = todayKey(new Date(), settings.timezone);
    const candidates = !input.sourceEntryId && !input.planId && input.taskId
      ? await db.dailyEntries.filter(entry => entry.taskId === input.taskId && entry.date === date && !entry.isLunch && !entry.planId).toArray()
      : [];
    const source = input.sourceEntryId
      ? await db.dailyEntries.get(input.sourceEntryId)
      : candidates.length === 1 ? candidates[0] : undefined;
    if (input.sourceEntryId && !source)
      throw new WorkspaceError('missing', 'This daily entry no longer exists.');
    if (source?.isLunch) throw new WorkspaceError('timer', 'Choose a work activity for the timer.');
    if (source && input.planId && source.planId !== input.planId)
      throw new WorkspaceError('linked', 'Choose the plan linked to this daily entry.');
    const entry = source ? await connectEntry(source) : undefined;
    const planId = entry?.planId ?? input.planId ?? null;
    const plan = planId ? await db.plans.get(planId) : undefined;
    const timer = timerSchema.parse({
      ...recordMeta(),
      title: entry?.title ?? input.title,
      taskId: entry?.taskId ?? input.taskId ?? (entry?.taskDetached ? null : plan?.taskId) ?? null,
      taskDetached: entry?.taskDetached ?? plan?.taskDetached ?? false,
      projectId: entry?.projectId ?? input.projectId ?? plan?.projectId ?? null,
      categoryId: entry?.categoryId ?? input.categoryId ?? plan?.categoryId ?? null,
      businessUnit: entry ? entry.businessUnit ?? '' : await inheritedBusinessUnit(input),
      planId,
      sourceEntryId: entry?.id ?? null,
      calendarDetached: entry?.calendarDetached ?? false,
      ...(entry
        ? {
            sourceDetails: {
              businessUnit: entry.businessUnit ?? '',
              ticket: entry.ticket,
              projectName: entry.projectName,
              projectLink: entry.projectLink,
              subtasks: entry.subtasks,
            },
          }
        : {}),
      plannedDate: entry?.date ?? plan?.date ?? null,
      plannedStart: entry?.plannedStart ?? plan?.startMinute ?? null,
      plannedEnd: entry?.plannedEnd ?? plan?.endMinute ?? null,
      state: 'running',
      segments: [{ start: new Date().toISOString(), end: null }],
      entryId: null,
    });
    await checkLinks(timer);
    await db.timers.add(timer);
    return timer;
  });
}
async function changeTimer(id: string, state: Timer['state']): Promise<Timer> {
  return db.transaction('rw', db.tables, async () => {
    const timer = await db.timers.get(id);
    if (!timer) throw new WorkspaceError('missing', 'Timer no longer exists.');
    if (timer.entryId !== null || timer.state === 'review')
      throw new WorkspaceError('timer', 'This timer is ready for review.');
    if (timer.state === state) return timer;
    const now = new Date().toISOString();
    const segments = timer.segments.map((segment) =>
      segment.end === null ? { ...segment, end: now } : segment,
    );
    if (state === 'running') segments.push({ start: now, end: null });
    const updated = timerSchema.parse({ ...timer, state, segments, updatedAt: now });
    await db.timers.put(updated);
    return updated;
  });
}
export const pauseTimer = (id: string) => changeTimer(id, 'paused');
export const resumeTimer = (id: string) => changeTimer(id, 'running');
export const stopTimer = (id: string) => changeTimer(id, 'review');
export async function discardTimer(id: string): Promise<void> {
  await db.transaction('rw', db.timers, db.dailyEntries, async () => {
    await db.timers.delete(id);
    await db.dailyEntries.where('timerId').equals(id).modify({ timerId: null });
  });
}
export function timerEntryDraft(
  timer: Timer,
  settings: Settings = DEFAULT_SETTINGS,
): DailyEntryCreateInput {
  const dates = timerSegmentsByDate(timer, settings.timezone);
  const date = dates.keys().next().value ?? todayKey(new Date(), settings.timezone);
  const segments = dates.get(date) ?? [];
  const first = segments[0];
  const last = segments.at(-1);
  return {
    date,
    planId: timer.planId ?? null,
    calendarDetached: timer.calendarDetached ?? false,
    plannedStart: timer.plannedDate === date ? (timer.plannedStart ?? null) : null,
    plannedEnd: timer.plannedDate === date ? (timer.plannedEnd ?? null) : null,
    actualStart: first
      ? Math.floor(Math.min(...segments.map((segment) => segment.startMinute)))
      : null,
    actualEnd: last
      ? Math.min(
          1440,
          Math.max(
            Math.floor(first?.startMinute ?? 0) + 1,
            Math.ceil(Math.max(...segments.map((segment) => segment.endMinute))),
          ),
        )
      : null,
    actualSegments: segments,
    taskId: timer.taskId,
    taskDetached: timer.taskDetached ?? false,
    projectId: timer.projectId,
    categoryId: timer.categoryId,
    businessUnit: timer.businessUnit ?? timer.sourceDetails?.businessUnit ?? '',
    title: timer.title,
    ticket: timer.sourceDetails?.ticket ?? '',
    projectName: timer.sourceDetails?.projectName ?? '',
    projectLink: timer.sourceDetails?.projectLink ?? '',
    subtasks: timer.sourceDetails?.subtasks ?? '',
    workDone: '',
    remarks: '',
    status: 'In Progress',
    isLunch: false,
    timerId: timer.id,
  };
}
export { saveTimerEntry } from './timerSaving';

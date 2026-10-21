import { z } from 'zod';
import type { DailyEntryCreateInput, Task } from '../../domain/models';

export const clockInputSchema = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$|^24:00$/, 'Use HH:mm, for example 13:10.');
export function parseClock(value: string): number | null {
  if (!value.trim()) return null;
  const [hours = '0', minutes = '0'] = clockInputSchema.parse(value).split(':');
  return Number(hours) * 60 + Number(minutes);
}
export function clockValue(value: number | null): string {
  if (value === null) return '';
  return `${Math.floor(value / 60).toString().padStart(2, '0')}:${(value % 60).toString().padStart(2, '0')}`;
}
export function blankEntry(date: string, start: number | null = null): DailyEntryCreateInput {
  return { date, title: '', plannedStart: start, plannedEnd: start === null ? null : Math.min(start + 30, 1440), actualStart: null, actualEnd: null,
    taskId: null, projectId: null, categoryId: null, ticket: '', projectName: '', projectLink: '', subtasks: '', workDone: '', remarks: '', status: 'Open', isLunch: false, timerId: null };
}
export function linkedTaskEntry(entry: DailyEntryCreateInput, task: Task | undefined): DailyEntryCreateInput {
  if (!task) return { ...entry, taskId: null };
  return { ...entry, taskId: task.id, title: task.title, projectId: task.projectId, categoryId: task.categoryId, ticket: task.ticket,
    subtasks: task.subtasks.map(item => `${item.done ? '[x]' : '[ ]'} ${item.title}`).join('\n'), status: task.status };
}
export function errorMessage(error: unknown): string {
  if (error instanceof z.ZodError) return error.issues.map(issue => issue.message).join(' ');
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
export type EntryTimes = { readonly plannedStart: string; readonly plannedEnd: string; readonly actualStart: string; readonly actualEnd: string };
export function withEntryTimes(entry: DailyEntryCreateInput, times: EntryTimes, initial: DailyEntryCreateInput): DailyEntryCreateInput {
  const timeFields = { plannedStart: parseClock(times.plannedStart), plannedEnd: parseClock(times.plannedEnd), actualStart: parseClock(times.actualStart), actualEnd: parseClock(times.actualEnd) };
  const changedActual = timeFields.actualStart !== initial.actualStart || timeFields.actualEnd !== initial.actualEnd;
  return { ...entry, ...timeFields, ...(changedActual ? { actualSegments: undefined } : {}) };
}

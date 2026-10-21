import type { Settings } from './settings';

export type { Settings } from './settings';
export { DEFAULT_SETTINGS, settingsSchema } from './settings';

import { z } from 'zod';
import { statusSchema } from './status';
import { inkDocumentSchema } from './ink';
import { validTimerTimeline } from './timerValidity';

export type { Status } from './status';
export { isTerminalStatus, STATUS_VALUES, STATUSES, statusSchema } from './status';
export type Priority = 'Low' | 'Normal' | 'High';
export type WorkType = 'task' | 'operational' | 'project';
const id = z.string().min(1);
const link = id.nullable();
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(value + 'T00:00:00Z');
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, 'Enter a real calendar date');
const minute = z.number().int().min(0).max(1440);
const metadata = {
  id,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  demo: z.boolean(),
};
export const taskSchema = z.object({
  ...metadata,
  businessUnit: z.string().trim().default('').optional(),
  title: z.string().trim().min(1),
  description: z.string(),
  status: statusSchema,
  priority: z.enum(['Low', 'Normal', 'High']),
  type: z.enum(['task', 'operational', 'project']),
  categoryId: link,
  projectId: link,
  dueDate: date.nullable(),
  assignee: z.string(),
  ticket: z.string(),
  latestUpdate: z.string(),
  subtasks: z.array(z.object({ id, title: z.string(), done: z.boolean() })),
  archived: z.boolean(),
});
export const projectSchema = z.object({
  ...metadata,
  businessUnit: z.string().trim().default('').optional(),
  name: z.string().trim().min(1),
  description: z.string(),
  status: statusSchema,
  categoryId: link,
  dueDate: date.nullable(),
  owner: z.string(),
  link: z.string(),
  archived: z.boolean(),
});
export const categorySchema = z.object({
  ...metadata,
  name: z.string().trim().min(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  archived: z.boolean(),
});
export const noteSchema = z.object({
  ...metadata,
  title: z.string().trim().min(1),
  notebook: z.string(),
  tags: z.array(z.string()).optional(),
  content: z.string(),
  ink: inkDocumentSchema.optional(),
  summary: z.string(),
  questions: z.string(),
  references: z.string(),
  taskId: link,
  pinned: z.boolean(),
  archived: z.boolean(),
  reviewedAt: z.iso.datetime().nullable(),
});
export const planSchema = z
  .object({
    ...metadata,
    businessUnit: z.string().trim().default('').optional(),
    title: z.string().trim().min(1),
    date,
    startMinute: minute,
    endMinute: minute,
    taskId: link,
    taskDetached: z.boolean().optional(),
    projectId: link,
    categoryId: link,
    notes: z.string(),
  })
  .refine((v) => v.endMinute > v.startMinute, 'End must be after start');
export const dailyEntrySchema = z
  .object({
    ...metadata,
    date,
    plannedStart: minute.nullable(),
    plannedEnd: minute.nullable(),
    actualStart: minute.nullable(),
    actualEnd: minute.nullable(),
    taskId: link,
    taskDetached: z.boolean().optional(),
    projectId: link,
    categoryId: link,
    businessUnit: z.string().trim().default('').optional(),
    title: z.string().trim().min(1),
    ticket: z.string(),
    projectName: z.string(),
    projectLink: z.string(),
    subtasks: z.string(),
    workDone: z.string(),
    remarks: z.string(),
    status: statusSchema,
    isLunch: z.boolean(),
    timerId: link,
    planId: link.optional(),
    calendarDetached: z.boolean().optional(),
    actualSegments: z
      .array(
        z
          .object({
            startMinute: z.number().min(0).max(1440),
            endMinute: z.number().min(0).max(1440),
          })
          .refine((v) => v.endMinute > v.startMinute),
      )
      .optional(),
  })
  .refine(
    (v) =>
      (v.actualStart === null && v.actualEnd === null) ||
      (v.actualStart !== null && v.actualEnd !== null && v.actualEnd > v.actualStart),
    'Actual end must be after start',
  )
  .refine(
    (v) =>
      (v.plannedStart === null && v.plannedEnd === null) ||
      (v.plannedStart !== null && v.plannedEnd !== null && v.plannedEnd > v.plannedStart),
    'Planned end must be after start',
  );
export const timerSchema = z
  .object({
    ...metadata,
    businessUnit: z.string().trim().default('').optional(),
    title: z.string().trim().min(1),
    taskId: link,
    taskDetached: z.boolean().optional(),
    projectId: link,
    categoryId: link,
    planId: link.optional(),
    calendarDetached: z.boolean().optional(),
    sourceEntryId: link.optional(),
    sourceDetails: z
      .object({
        businessUnit: z.string().trim().default('').optional(),
        ticket: z.string(),
        projectName: z.string(),
        projectLink: z.string(),
        subtasks: z.string(),
      })
      .optional(),
    plannedDate: date.nullable().optional(),
    plannedStart: minute.nullable().optional(),
    plannedEnd: minute.nullable().optional(),
    state: z.enum(['running', 'paused', 'review']),
    segments: z
      .array(
        z
          .object({ start: z.iso.datetime(), end: z.iso.datetime().nullable() })
          .refine(
            (segment) =>
              segment.end === null || Date.parse(segment.end) >= Date.parse(segment.start),
            'Timer end must follow start',
          ),
      )
      .min(1),
    entryId: link,
  })
  .refine(
    validTimerTimeline,
    'Timer segments must be ordered, non-overlapping, and match the timer state',
  );
export type Task = Readonly<z.infer<typeof taskSchema>>;
export type Project = Readonly<z.infer<typeof projectSchema>>;
export type Category = Readonly<z.infer<typeof categorySchema>>;
export type Note = Readonly<z.infer<typeof noteSchema>>;
export type Plan = Readonly<z.infer<typeof planSchema>>;
export type DailyEntry = Readonly<z.infer<typeof dailyEntrySchema>>;
export type Timer = Readonly<z.infer<typeof timerSchema>>;
export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'demo'>;
export type TaskCreateInput = CreateInput<Task>;
export type ProjectCreateInput = CreateInput<Project>;
export type CategoryCreateInput = CreateInput<Category>;
export type NoteCreateInput = CreateInput<Note>;
export type PlanCreateInput = CreateInput<Plan>;
export type DailyEntryCreateInput = CreateInput<DailyEntry>;
export type Workspace = {
  readonly tasks: readonly Task[];
  readonly projects: readonly Project[];
  readonly categories: readonly Category[];
  readonly notes: readonly Note[];
  readonly plans: readonly Plan[];
  readonly dailyEntries: readonly DailyEntry[];
  readonly timers: readonly Timer[];
  readonly settings: Settings;
};
export class WorkspaceError extends Error {
  constructor(
    readonly code: 'missing' | 'linked' | 'invalid' | 'timer' | 'stale',
    message: string,
  ) {
    super(message);
    this.name = 'WorkspaceError';
  }
}
export function recordMeta(demo = false) {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), createdAt: now, updatedAt: now, demo };
}

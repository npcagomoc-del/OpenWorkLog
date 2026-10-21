import { z } from 'zod';
import { validTimerTimeline } from './timerValidity';
export const STATUSES = ['Open', 'In Progress', 'Closed'] as const;
export const statusSchema = z.enum(STATUSES);
export type Status = z.infer<typeof statusSchema>;
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
    title: z.string().trim().min(1),
    date,
    startMinute: minute,
    endMinute: minute,
    taskId: link,
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
    projectId: link,
    categoryId: link,
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
    title: z.string().trim().min(1),
    taskId: link,
    projectId: link,
    categoryId: link,
    planId: link.optional(),
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
export const settingsSchema = z
  .object({
    id: z.literal('workspace'),
    ownerName: z.string().optional(),
    notebooks: z.array(z.string().trim().min(1)).optional(),
    theme: z.enum(['light', 'dark', 'system']),
    sidebarCollapsed: z.boolean(),
    textSize: z.enum(['normal', 'large']),
    workStart: minute,
    workEnd: minute,
    lunchStart: minute,
    lunchEnd: minute,
    timezone: z
      .string()
      .min(1)
      .refine((value) => {
        try {
          new Intl.DateTimeFormat('en', { timeZone: value });
          return true;
        } catch (error) {
          if (error instanceof RangeError) return false;
          throw error;
        }
      }, 'Choose a valid IANA timezone'),
    timeFormat: z.enum(['12h', '24h']),
    typeLabels: z.object({
      task: z.string().trim().min(1),
      operational: z.string().trim().min(1),
      project: z.string().trim().min(1),
    }),
    onboardingComplete: z.boolean(),
    weekStartsOn: z.union([z.literal(0), z.literal(1)]),
  })
  .refine((v) => v.workEnd > v.workStart, 'Work end must follow start')
  .refine((v) => v.lunchEnd > v.lunchStart, 'Lunch end must follow start');
export type Task = Readonly<z.infer<typeof taskSchema>>;
export type Project = Readonly<z.infer<typeof projectSchema>>;
export type Category = Readonly<z.infer<typeof categorySchema>>;
export type Note = Readonly<z.infer<typeof noteSchema>>;
export type Plan = Readonly<z.infer<typeof planSchema>>;
export type DailyEntry = Readonly<z.infer<typeof dailyEntrySchema>>;
export type Timer = Readonly<z.infer<typeof timerSchema>>;
export type Settings = Readonly<z.infer<typeof settingsSchema>>;
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
export const DEFAULT_SETTINGS: Settings = {
  id: 'workspace',
  theme: 'system',
  sidebarCollapsed: false,
  textSize: 'normal',
  workStart: 480,
  workEnd: 1020,
  lunchStart: 720,
  lunchEnd: 780,
  timezone: 'Asia/Manila',
  timeFormat: '24h',
  typeLabels: { task: 'Task', operational: 'Operational', project: 'Project' },
  onboardingComplete: false,
  weekStartsOn: 1,
};
export class WorkspaceError extends Error {
  constructor(
    readonly code: 'missing' | 'linked' | 'invalid' | 'timer',
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

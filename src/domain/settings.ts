import { z } from 'zod';
import { statusSchema } from './status';

const minute = z.number().int().min(0).max(1440);
export const settingsSchema = z
  .object({
    id: z.literal('workspace'),
    businessUnits: z.array(z.string().trim().min(1)).default([]),
    statusColors: z.partialRecord(statusSchema, z.string().regex(/^#[0-9a-fA-F]{6}$/)).default({}),
    taskView: z
      .object({
        view: z.enum(['list', 'table', 'board']),
        groupBy: z.enum(['status', 'category', 'project', 'businessUnit']),
        hiddenGroups: z.array(z.string()),
        fields: z.object({
          priority: z.boolean().default(true),
          category: z.boolean(),
          project: z.boolean(),
          businessUnit: z.boolean(),
          dueDate: z.boolean(),
          assignee: z.boolean(),
          latestUpdate: z.boolean(),
        }),
      })
      .optional(),
    ownerName: z.string().optional(),
    restoreGeneration: z.string().uuid().optional(),
    connectedWorkVersion: z.literal(1).optional(),
    notebooks: z.array(z.string().trim().min(1)).optional(),
    actionAccent: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .optional(),
    appearancePreset: z.enum(['classic', 'claude', 'apple']).default('classic'),
    theme: z.enum(['light', 'dark', 'black', 'system']),
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
export type Settings = Readonly<z.infer<typeof settingsSchema>>;
export const DEFAULT_SETTINGS: Settings = {
  id: 'workspace',
  businessUnits: [],
  statusColors: {},
  theme: 'system',
  appearancePreset: 'classic',
  connectedWorkVersion: 1,
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

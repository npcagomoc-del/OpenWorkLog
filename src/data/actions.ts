import type { Table } from 'dexie';
import type { ZodType } from 'zod';
import { db } from './db';
import { checkLinks } from './relations';
import {
  taskSchema,
  projectSchema,
  categorySchema,
  noteSchema,
  planSchema,
  dailyEntrySchema,
  settingsSchema,
  recordMeta,
  WorkspaceError,
  DEFAULT_SETTINGS,
  type CreateInput,
  type Settings,
  type DailyEntryCreateInput,
  type DailyEntry,
} from '../domain/models';
function repository<
  T extends {
    readonly id: string;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly demo: boolean;
  },
>(table: Table<T, string>, schema: ZodType<T>) {
  return {
    async create(input: CreateInput<T>): Promise<T> {
      const record = schema.parse({ ...input, ...recordMeta() });
      return db.transaction('rw', db.tables, async () => {
        await checkLinks(record);
        await table.add(record);
        return record;
      });
    },
    async update(id: string, patch: Partial<CreateInput<T>>): Promise<T> {
      return db.transaction('rw', db.tables, async () => {
        const previous = await table.get(id);
        if (!previous) throw new WorkspaceError('missing', 'This record no longer exists.');
        const record = schema.parse({ ...previous, ...patch, updatedAt: new Date().toISOString() });
        await checkLinks(record);
        await table.put(record);
        return record;
      });
    },
    async remove(id: string): Promise<void> {
      await table.delete(id);
    },
  };
}
const tasks = repository(db.tasks, taskSchema);
const projects = repository(db.projects, projectSchema);
const categories = repository(db.categories, categorySchema);
const notes = repository(db.notes, noteSchema);
const plans = repository(db.plans, planSchema);
const entries = repository(db.dailyEntries, dailyEntrySchema);
async function deleteTask(id: string): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    await db.tasks.delete(id);
    await db.notes.where('taskId').equals(id).modify({ taskId: null });
    await db.plans.where('taskId').equals(id).modify({ taskId: null });
    await db.dailyEntries.where('taskId').equals(id).modify({ taskId: null });
    await db.timers.where('taskId').equals(id).modify({ taskId: null });
  });
}
async function deleteProject(id: string): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    await db.projects.delete(id);
    await db.tasks.where('projectId').equals(id).modify({ projectId: null });
    await db.plans.where('projectId').equals(id).modify({ projectId: null });
    await db.dailyEntries.where('projectId').equals(id).modify({ projectId: null });
    await db.timers.filter((t) => t.projectId === id).modify({ projectId: null });
  });
}
async function deleteCategory(id: string): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    const linked = (
      await Promise.all([
        db.tasks.toArray(),
        db.projects.toArray(),
        db.plans.toArray(),
        db.dailyEntries.toArray(),
        db.timers.toArray(),
      ])
    ).some((records) => records.some((r) => r.categoryId === id));
    if (linked)
      throw new WorkspaceError(
        'linked',
        'This category is in use. Archive it to preserve existing links.',
      );
    await db.categories.delete(id);
  });
}
async function updateSettings(patch: Partial<Omit<Settings, 'id'>>): Promise<Settings> {
  return db.transaction('rw', db.settings, async () => {
    const current = (await db.settings.get('workspace')) ?? DEFAULT_SETTINGS;
    const settings = settingsSchema.parse({ ...current, ...patch });
    await db.settings.put(settings);
    return settings;
  });
}
async function renameNotebook(previous: string, next: string): Promise<void> {
  const name = next.trim();
  if (!name) throw new WorkspaceError('invalid', 'Notebook name is required.');
  await db.transaction('rw', db.settings, db.notes, async () => {
    await db.notes.where('notebook').equals(previous).modify({ notebook: name });
    const current = (await db.settings.get('workspace')) ?? DEFAULT_SETTINGS;
    await db.settings.put({
      ...current,
      notebooks: [
        ...new Set([...(current.notebooks ?? ['General']).filter((n) => n !== previous), name]),
      ],
    });
  });
}
async function deleteNotebook(name: string): Promise<void> {
  if (name === 'General')
    throw new WorkspaceError('invalid', 'The General notebook is kept for unfiled notes.');
  await db.transaction('rw', db.settings, db.notes, async () => {
    await db.notes.where('notebook').equals(name).modify({ notebook: 'General' });
    const current = (await db.settings.get('workspace')) ?? DEFAULT_SETTINGS;
    await db.settings.put({
      ...current,
      notebooks: [...new Set(['General', ...(current.notebooks ?? []).filter((n) => n !== name)])],
    });
  });
}
async function createDailyEntry(input: DailyEntryCreateInput): Promise<DailyEntry> {
  return db.transaction('rw', db.tables, async () => {
    if (input.planId) {
      const existing = await db.dailyEntries
        .filter((entry) => entry.planId === input.planId && entry.date === input.date)
        .first();
      if (existing) return existing;
    }
    return entries.create(input);
  });
}
async function deletePlan(id: string): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    await db.plans.delete(id);
    await db.timers.filter((timer) => timer.planId === id).modify({ planId: null });
    await db.dailyEntries.filter((entry) => entry.planId === id).modify({ planId: null });
  });
}
async function deleteDailyEntry(id: string): Promise<void> {
  await db.transaction('rw', db.dailyEntries, db.timers, async () => {
    const entry = await db.dailyEntries.get(id);
    await db.dailyEntries.delete(id);
    if (entry?.timerId) {
      const timer = await db.timers.get(entry.timerId);
      if (timer) {
        const remaining = await db.dailyEntries.where('timerId').equals(timer.id).first();
        if (remaining) await db.timers.put({ ...timer, entryId: remaining.id });
        else await db.timers.delete(timer.id);
      }
    }
  });
}
export const actions = {
  createTask: tasks.create,
  updateTask: tasks.update,
  deleteTask,
  createProject: projects.create,
  updateProject: projects.update,
  deleteProject,
  createCategory: categories.create,
  updateCategory: categories.update,
  deleteCategory,
  createNote: notes.create,
  updateNote: notes.update,
  deleteNote: notes.remove,
  createPlan: plans.create,
  updatePlan: plans.update,
  deletePlan,
  createDailyEntry,
  updateDailyEntry: entries.update,
  deleteDailyEntry,
  updateSettings,
  renameNotebook,
  deleteNotebook,
};

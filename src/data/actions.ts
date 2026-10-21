import type { Table } from 'dexie';
import type { ZodType } from 'zod';
import {
  type CreateInput,
  categorySchema,
  type DailyEntry,
  type DailyEntryCreateInput,
  dailyEntrySchema,
  noteSchema,
  type Plan,
  type PlanCreateInput,
  planSchema,
  projectSchema,
  recordMeta,
  type TaskCreateInput,
  taskSchema,
  WorkspaceError,
} from '../domain/models';
import { connectEntry, connectPlan } from './connectedWork';
import { db } from './db';
import { checkLinks } from './relations';
import {
  deleteNotebook,
  renameBusinessUnit,
  renameNotebook,
  updateSettings,
} from './settingsActions';
import { inheritedBusinessUnit } from './workUnits';

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
      return db.transaction('rw', db.tables, async () => {
        const record = schema.parse({ ...input, ...recordMeta() });
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
async function createTask(input: TaskCreateInput) {
  return db.transaction('rw', db.tables, async () =>
    tasks.create({ ...input, businessUnit: await inheritedBusinessUnit(input) }),
  );
}
const projects = repository(db.projects, projectSchema);
const categories = repository(db.categories, categorySchema);
const notes = repository(db.notes, noteSchema);
async function deleteTask(id: string): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    await db.tasks.delete(id);
    await db.notes.where('taskId').equals(id).modify({ taskId: null });
    await db.plans.where('taskId').equals(id).modify({ taskId: null, taskDetached: true });
    await db.dailyEntries.where('taskId').equals(id).modify({ taskId: null, taskDetached: true });
    await db.timers.where('taskId').equals(id).modify({ taskId: null, taskDetached: true });
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
async function createDailyEntry(input: DailyEntryCreateInput): Promise<DailyEntry> {
  return db.transaction('rw', db.tables, async () => {
    if (input.planId) {
      const existing = await db.dailyEntries
        .filter((entry) => entry.planId === input.planId && entry.date === input.date)
        .first();
      if (existing) return existing;
    }
    return connectEntry(
      dailyEntrySchema.parse({
        ...input,
        ...recordMeta(),
        businessUnit: await inheritedBusinessUnit(input),
      }),
    );
  });
}
async function createPlan(input: PlanCreateInput): Promise<Plan> {
  return db.transaction('rw', db.tables, async () =>
    connectPlan(
      planSchema.parse({
        ...input,
        ...recordMeta(),
        businessUnit: await inheritedBusinessUnit(input),
      }),
    ),
  );
}
async function updatePlan(id: string, patch: Partial<PlanCreateInput>): Promise<Plan> {
  return db.transaction('rw', db.tables, async () => {
    const previous = await db.plans.get(id);
    if (!previous) throw new WorkspaceError('missing', 'This plan no longer exists.');
    return connectPlan(
      planSchema.parse({ ...previous, ...patch, updatedAt: new Date().toISOString() }),
    );
  });
}
async function updateDailyEntry(
  id: string,
  patch: Partial<DailyEntryCreateInput>,
): Promise<DailyEntry> {
  return db.transaction('rw', db.tables, async () => {
    const previous = await db.dailyEntries.get(id);
    if (!previous) throw new WorkspaceError('missing', 'This entry no longer exists.');
    return connectEntry(
      dailyEntrySchema.parse({
        ...previous,
        ...patch,
        ...((patch.plannedStart !== undefined && patch.plannedStart !== previous.plannedStart) ||
        (patch.plannedEnd !== undefined && patch.plannedEnd !== previous.plannedEnd) ||
        patch.planId
          ? { calendarDetached: false }
          : {}),
        updatedAt: new Date().toISOString(),
      }),
    );
  });
}
async function deletePlan(id: string): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    await db.plans.delete(id);
    await db.timers
      .filter((timer) => timer.planId === id)
      .modify({ planId: null, calendarDetached: true });
    await db.dailyEntries
      .filter((entry) => entry.planId === id)
      .modify({ planId: null, calendarDetached: true });
  });
}
async function deleteDailyEntry(id: string): Promise<void> {
  await db.transaction('rw', db.dailyEntries, db.timers, async () => {
    await db.timers.filter((timer) => timer.sourceEntryId === id).modify({ sourceEntryId: null });
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
  createTask,
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
  createPlan,
  updatePlan,
  deletePlan,
  createDailyEntry,
  updateDailyEntry,
  deleteDailyEntry,
  updateSettings,
  renameBusinessUnit,
  renameNotebook,
  deleteNotebook,
};

import { z } from 'zod';
import {
  categorySchema,
  dailyEntrySchema,
  noteSchema,
  planSchema,
  projectSchema,
  settingsSchema,
  taskSchema,
  timerSchema,
  WorkspaceError,
} from '../domain/models';
import { reconcileWorkLinks } from './connectedWork';
import { db } from './db';
import { readWorkspace } from './workspace';

const backupSchema = z.object({
  format: z.literal('OpenWorkLog'),
  version: z.literal(1),
  exportedAt: z.iso.datetime(),
  data: z.object({
    tasks: z.array(taskSchema),
    projects: z.array(projectSchema),
    categories: z.array(categorySchema),
    notes: z.array(noteSchema),
    plans: z.array(planSchema),
    dailyEntries: z.array(dailyEntrySchema),
    timers: z.array(timerSchema),
    settings: settingsSchema,
  }),
});
export type Backup = z.infer<typeof backupSchema>;
export function parseBackup(text: string): Backup {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (error) {
    if (error instanceof SyntaxError)
      throw new WorkspaceError('invalid', 'This file is not valid JSON.');
    throw error;
  }
  const parsed = backupSchema.safeParse(raw);
  if (!parsed.success)
    throw new WorkspaceError(
      'invalid',
      `Invalid OpenWorkLog backup: ${parsed.error.issues
        .slice(0, 3)
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ')}`,
    );
  const data = parsed.data.data;
  for (const records of [
    data.tasks,
    data.projects,
    data.categories,
    data.notes,
    data.plans,
    data.dailyEntries,
    data.timers,
  ]) {
    if (new Set(records.map((v) => v.id)).size !== records.length)
      throw new WorkspaceError('invalid', 'Backup contains duplicate record IDs.');
  }
  const tasks = new Set(data.tasks.map((v) => v.id));
  const projects = new Set(data.projects.map((v) => v.id));
  const categories = new Set(data.categories.map((v) => v.id));
  for (const record of [
    ...data.tasks,
    ...data.projects,
    ...data.plans,
    ...data.dailyEntries,
    ...data.timers,
  ]) {
    if (record.categoryId && !categories.has(record.categoryId))
      throw new WorkspaceError('invalid', 'Backup has a missing category reference.');
  }
  for (const record of [...data.tasks, ...data.plans, ...data.dailyEntries, ...data.timers]) {
    if (record.projectId && !projects.has(record.projectId))
      throw new WorkspaceError('invalid', 'Backup has a missing project reference.');
  }
  for (const record of [...data.notes, ...data.plans, ...data.dailyEntries, ...data.timers]) {
    if (record.taskId && !tasks.has(record.taskId))
      throw new WorkspaceError('invalid', 'Backup has a missing task reference.');
  }
  const plans = new Set(data.plans.map((record) => record.id));
  const timers = new Set(data.timers.map((record) => record.id));
  const entries = new Set(data.dailyEntries.map((record) => record.id));
  for (const entry of data.dailyEntries) {
    if (entry.planId && !plans.has(entry.planId))
      throw new WorkspaceError('invalid', 'Backup has a missing calendar plan reference.');
    if (entry.timerId && !timers.has(entry.timerId))
      throw new WorkspaceError('invalid', 'Backup has a missing timer reference.');
  }
  for (const timer of data.timers)
    if (timer.planId && !plans.has(timer.planId))
      throw new WorkspaceError('invalid', 'Backup has a missing calendar plan reference.');
  for (const timer of data.timers)
    if (timer.sourceEntryId && !entries.has(timer.sourceEntryId))
      throw new WorkspaceError('invalid', 'Backup has a missing timer source entry reference.');
  for (const timer of data.timers)
    if (timer.entryId && !entries.has(timer.entryId))
      throw new WorkspaceError('invalid', 'Backup has a missing daily entry reference.');
  for (const timer of data.timers) {
    if (
      timer.entryId !== null &&
      data.dailyEntries.find((entry) => entry.id === timer.entryId)?.timerId !== timer.id
    )
      throw new WorkspaceError(
        'invalid',
        'A saved timer must point to a daily entry that belongs to it.',
      );
  }
  for (const entry of data.dailyEntries) {
    if (entry.timerId !== null) {
      const owner = data.timers.find((timer) => timer.id === entry.timerId);
      if (!owner || owner.entryId === null || owner.state !== 'review')
        throw new WorkspaceError(
          'invalid',
          'A timed daily entry must belong to a saved review timer.',
        );
    }
  }
  if (data.timers.filter((t) => t.entryId === null).length > 1)
    throw new WorkspaceError('invalid', 'Backup contains more than one active timer.');
  return parsed.data;
}
export async function createBackup(): Promise<string> {
  return db.transaction('r', db.tables, async () =>
    JSON.stringify(
      {
        format: 'OpenWorkLog',
        version: 1,
        exportedAt: new Date().toISOString(),
        data: await readWorkspace(),
      },
      null,
      2,
    ),
  );
}
export async function restoreBackup(text: string): Promise<void> {
  const { data } = parseBackup(text);
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
    await db.tasks.bulkAdd(data.tasks);
    await db.projects.bulkAdd(data.projects);
    await db.categories.bulkAdd(data.categories);
    await db.notes.bulkAdd(data.notes);
    await db.plans.bulkAdd(data.plans);
    await db.dailyEntries.bulkAdd(data.dailyEntries);
    await db.timers.bulkAdd(data.timers);
    await db.settings.put(data.settings);
    await reconcileWorkLinks();
  });
}

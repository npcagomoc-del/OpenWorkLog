import { type DailyEntry, taskSchema } from '../domain/models';
import { db } from './db';

export async function syncDailyTask(previous: DailyEntry, entry: DailyEntry): Promise<void> {
  if (entry.isLunch || !entry.taskId) return;
  const task = await db.tasks.get(entry.taskId);
  if (!task) return;
  const changed = {
    ...(previous.title !== entry.title ? { title: entry.title } : {}),
    ...(previous.status !== entry.status ? { status: entry.status } : {}),
    ...(previous.categoryId !== entry.categoryId ? { categoryId: entry.categoryId } : {}),
    ...(previous.projectId !== entry.projectId ? { projectId: entry.projectId } : {}),
    ...((previous.businessUnit ?? '') !== (entry.businessUnit ?? '')
      ? { businessUnit: entry.businessUnit ?? '' }
      : {}),
    ...(previous.ticket !== entry.ticket ? { ticket: entry.ticket } : {}),
    ...(previous.workDone !== entry.workDone ? { latestUpdate: entry.workDone } : {}),
  };
  if (Object.keys(changed).length === 0) return;
  await db.tasks.put(taskSchema.parse({ ...task, ...changed, updatedAt: entry.updatedAt }));
}

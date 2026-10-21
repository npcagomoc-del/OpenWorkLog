import { WorkspaceError } from '../domain/models';
import { db } from './db';
export async function checkLinks(record: object): Promise<void> {
  if (
    'sourceEntryId' in record &&
    typeof record.sourceEntryId === 'string' &&
    !(await db.dailyEntries.get(record.sourceEntryId))
  )
    throw new WorkspaceError('linked', 'The linked daily entry no longer exists.');
  if (
    'taskId' in record &&
    typeof record.taskId === 'string' &&
    !(await db.tasks.get(record.taskId))
  )
    throw new WorkspaceError('linked', 'The linked task no longer exists.');
  if (
    'projectId' in record &&
    typeof record.projectId === 'string' &&
    !(await db.projects.get(record.projectId))
  )
    throw new WorkspaceError('linked', 'The linked project no longer exists.');
  if (
    'categoryId' in record &&
    typeof record.categoryId === 'string' &&
    !(await db.categories.get(record.categoryId))
  )
    throw new WorkspaceError('linked', 'The linked category no longer exists.');
  if (
    'planId' in record &&
    typeof record.planId === 'string' &&
    !(await db.plans.get(record.planId))
  )
    throw new WorkspaceError('linked', 'The linked calendar plan no longer exists.');
}

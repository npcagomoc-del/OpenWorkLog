import {
  type DailyEntry,
  type Plan,
  planSchema,
  recordMeta,
  type Status,
  taskSchema,
} from '../domain/models';
import { db } from './db';
import { checkLinks } from './relations';

type Work = Pick<
  Plan,
  | 'title'
  | 'date'
  | 'taskId'
  | 'taskDetached'
  | 'projectId'
  | 'categoryId'
  | 'createdAt'
  | 'updatedAt'
  | 'demo'
>;
async function taskFor(
  work: Work,
  status: Status,
  details: { readonly description: string; readonly ticket: string },
): Promise<string | null> {
  if (work.taskId) return work.taskId;
  if (work.taskDetached) return null;
  const settings = await db.settings.get('workspace');
  const task = taskSchema.parse({
    ...recordMeta(work.demo),
    createdAt: work.createdAt,
    updatedAt: work.updatedAt,
    title: work.title,
    description: details.description,
    status,
    priority: 'Normal',
    type: 'task',
    categoryId: work.categoryId,
    projectId: work.projectId,
    dueDate: null,
    assignee: settings?.ownerName ?? '',
    ticket: details.ticket,
    latestUpdate: '',
    subtasks: [],
    archived: false,
  });
  await checkLinks(task);
  await db.tasks.add(task);
  return task.id;
}
export async function connectPlan(plan: Plan): Promise<Plan> {
  const previous = await db.plans.get(plan.id);
  const moved =
    previous &&
    (previous.date !== plan.date ||
      previous.startMinute !== plan.startMinute ||
      previous.endMinute !== plan.endMinute);
  const related = await db.dailyEntries
    .filter((entry) => entry.planId === plan.id && !entry.isLunch)
    .toArray();
  const taskId = await taskFor(
    {
      ...plan,
      taskId:
        plan.taskId ??
        (plan.taskDetached ? null : related.find((entry) => entry.taskId)?.taskId) ??
        null,
    },
    'Open',
    { description: plan.notes, ticket: '' },
  );
  const connected = { ...plan, taskId, taskDetached: taskId ? false : plan.taskDetached };
  await checkLinks(connected);
  await db.plans.put(connected);
  for (const entry of related) {
    const plannedOnly = entry.actualStart === null && entry.actualEnd === null;
    await db.dailyEntries.put({
      ...entry,
      taskId: taskId ?? entry.taskId,
      ...(taskId ? { taskDetached: false } : {}),
      ...(moved && (plannedOnly || entry.date === plan.date)
        ? { plannedStart: plan.startMinute, plannedEnd: plan.endMinute }
        : {}),
      ...(moved && plannedOnly ? { date: plan.date } : {}),
    });
  }
  return connected;
}
export async function connectEntry(entry: DailyEntry): Promise<DailyEntry> {
  await checkLinks(entry);
  if (entry.isLunch) {
    await checkLinks(entry);
    await db.dailyEntries.put(entry);
    return entry;
  }
  const previousPlan = entry.planId ? await db.plans.get(entry.planId) : undefined;
  const taskId = await taskFor(
    {
      ...entry,
      taskId: entry.taskId ?? (entry.taskDetached ? null : previousPlan?.taskId) ?? null,
    },
    entry.status,
    { description: entry.workDone, ticket: entry.ticket },
  );
  let planId = entry.planId ?? null;
  if (entry.plannedStart !== null && entry.plannedEnd !== null && !entry.calendarDetached) {
    const matching =
      previousPlan ??
      (taskId
        ? await db.plans
            .filter(
              (plan) =>
                plan.taskId === taskId &&
                plan.date === entry.date &&
                plan.startMinute === entry.plannedStart &&
                plan.endMinute === entry.plannedEnd,
            )
            .first()
        : undefined);
    const plan = planSchema.parse({
      ...(matching ?? {
        ...recordMeta(entry.demo),
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      }),
      title: matching?.title ?? entry.title,
      date: entry.date,
      startMinute: entry.plannedStart,
      endMinute: entry.plannedEnd,
      taskId,
      taskDetached: taskId ? false : entry.taskDetached,
      projectId: entry.projectId,
      categoryId: entry.categoryId,
      notes: matching?.notes ?? '',
    });
    await connectPlan(plan);
    planId = plan.id;
  } else if (previousPlan && previousPlan.taskId !== taskId)
    await connectPlan({
      ...previousPlan,
      taskId,
      taskDetached: taskId ? false : entry.taskDetached,
    });
  const connected = { ...entry, taskId, planId, taskDetached: taskId ? false : entry.taskDetached };
  await checkLinks(connected);
  await db.dailyEntries.put(connected);
  return connected;
}
export async function reconcileWorkLinks(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    const settings = await db.settings.get('workspace');
    if (settings?.connectedWorkVersion === 1) return;
    for (const plan of await db.plans.toArray()) if (!plan.taskId) await connectPlan(plan);
    for (const entry of await db.dailyEntries.toArray()) {
      if (!entry.isLunch && (!entry.taskId || (entry.plannedStart !== null && !entry.planId)))
        await connectEntry(entry);
    }
    if (settings) await db.settings.put({ ...settings, connectedWorkVersion: 1 });
  });
}

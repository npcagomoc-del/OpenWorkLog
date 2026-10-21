import type { Category, Project, Settings, Task } from '../../domain/models';
import { statuses } from './taskLogic';
import type { TaskGroup, TaskPreferences } from './taskViewTypes';
export const defaultTaskPreferences: TaskPreferences = {
  view: 'list',
  groupBy: 'status',
  hiddenGroups: [],
  fields: {
    category: false,
    project: false,
    businessUnit: false,
    dueDate: true,
    priority: true,
    assignee: false,
    latestUpdate: false,
  },
};
export function taskGroups(
  settings: Settings,
  records: {
    readonly categories: readonly Category[];
    readonly projects: readonly Project[];
    readonly tasks: readonly Task[];
  },
): TaskGroup[] {
  const grouping = settings.taskView?.groupBy ?? 'status';
  const factories = {
    status: () =>
      statuses.map((status) => ({ id: `status:${status}`, label: status, patch: { status } })),
    category: () => [
      { id: 'category:', label: 'Uncategorized', patch: { categoryId: null } },
      ...records.categories
        .filter(
          (item) => !item.archived || records.tasks.some((task) => task.categoryId === item.id),
        )
        .map((item) => ({
          id: `category:${item.id}`,
          label: item.name,
          patch: { categoryId: item.id },
        })),
    ],
    project: () => [
      { id: 'project:', label: 'No project', patch: { projectId: null } },
      ...records.projects
        .filter(
          (item) => !item.archived || records.tasks.some((task) => task.projectId === item.id),
        )
        .map((item) => ({
          id: `project:${item.id}`,
          label: item.name,
          patch: { projectId: item.id },
        })),
    ],
    businessUnit: () =>
      [
        ...new Set([
          '',
          ...(settings.businessUnits ?? []),
          ...records.tasks.map((task) => task.businessUnit ?? ''),
        ]),
      ].map((unit) => ({
        id: `businessUnit:${unit}`,
        label: unit || 'No business unit',
        patch: { businessUnit: unit },
      })),
  } satisfies Record<TaskPreferences['groupBy'], () => TaskGroup[]>;
  return factories[grouping]();
}
export function belongsToGroup(task: Task, group: TaskGroup): boolean {
  return Object.entries(group.patch).every(([key, value]) => {
    const values = {
      status: task.status,
      categoryId: task.categoryId,
      projectId: task.projectId,
      businessUnit: task.businessUnit ?? '',
    };
    return Object.entries(values).some(([field, actual]) => field === key && actual === value);
  });
}

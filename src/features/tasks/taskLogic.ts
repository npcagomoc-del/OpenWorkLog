import type { Task } from '../../domain/models';
import { isTerminalStatus, STATUS_VALUES } from '../../domain/models';
export const statuses = STATUS_VALUES;
export const workTypes = ['task', 'operational', 'project'] as const;
export const priorities = ['Low', 'Normal', 'High'] as const;
export type TaskFilters = {
  readonly query: string;
  readonly status: string;
  readonly categoryId: string;
  readonly type: string;
  readonly projectId?: string;
  readonly businessUnit?: string;
};
export function filterTasks(tasks: readonly Task[], filters: TaskFilters): Task[] {
  const query = filters.query.trim().toLocaleLowerCase();
  return tasks
    .filter(
      (task) =>
        !task.archived &&
        (!filters.status || task.status === filters.status) &&
        (!filters.categoryId || task.categoryId === filters.categoryId) &&
        (!filters.type || task.type === filters.type) &&
        (!filters.projectId || task.projectId === filters.projectId) &&
        (!filters.businessUnit || task.businessUnit === filters.businessUnit) &&
        (!query ||
          [
            task.title,
            task.id,
            task.description,
            task.ticket,
            task.assignee,
            task.latestUpdate,
            task.businessUnit ?? '',
          ].some((value) => value.toLocaleLowerCase().includes(query))),
    )
    .sort(
      (left, right) =>
        (left.dueDate ?? '9999').localeCompare(right.dueDate ?? '9999') ||
        right.updatedAt.localeCompare(left.updatedAt),
    );
}
export function taskCounts(tasks: readonly Task[], today: string) {
  const active = tasks.filter((task) => !task.archived);
  return {
    open: active.filter((task) => task.status === 'Open').length,
    progress: active.filter((task) => task.status === 'In Progress').length,
    closed: active.filter((task) => task.status === 'Closed').length,
    overdue: active.filter(
      (task) => !isTerminalStatus(task.status) && task.dueDate && task.dueDate < today,
    ).length,
  };
}

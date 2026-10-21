import {
  STATUS_VALUES,
  isTerminalStatus,
  type DailyEntry,
  type Plan,
  type Status,
  type Workspace,
} from '../../domain/models';
import { entryMinutes } from '../../domain/time';
import { matchesBusinessUnit } from '../reports/reportUnits';
import { activityBuckets } from './executiveActivity';

export type ExecutiveScope = {
  readonly from: string;
  readonly to: string;
  readonly categoryId: string;
  readonly owner: string;
  readonly businessUnit?: string;
};
export type StatusCount = { readonly status: Status; readonly count: number };
export type PortfolioRow = {
  readonly label: string;
  readonly total: number;
  readonly counts: readonly StatusCount[];
};
export type OwnerWork = {
  readonly name: string;
  readonly open: number;
  readonly closed: number;
  readonly total: number;
  readonly minutes: number;
  readonly counts: readonly StatusCount[];
};
function counts(records: readonly { readonly status: Status }[]): StatusCount[] {
  return STATUS_VALUES.map((status) => ({
    status,
    count: records.filter((record) => record.status === status).length,
  }));
}
export function executiveMetrics(workspace: Workspace, scope: ExecutiveScope, today: string) {
  const taskMap = new Map(workspace.tasks.map((task) => [task.id, task]));
  const projectMap = new Map(workspace.projects.map((project) => [project.id, project]));
  const ownerName = (value: string | undefined) => value?.trim() || 'Unassigned';
  const projectOwner = (id: string | null) => ownerName(id ? projectMap.get(id)?.owner : undefined);
  const activityOwner = (record: DailyEntry | Plan) => {
    const task = record.taskId ? taskMap.get(record.taskId) : undefined;
    return task ? ownerName(task.assignee) : projectOwner(record.projectId);
  };
  const activityCategory = (record: DailyEntry | Plan) => {
    const task = record.taskId ? taskMap.get(record.taskId) : undefined;
    const projectId = record.projectId ?? task?.projectId;
    return (
      record.categoryId ??
      task?.categoryId ??
      (projectId ? projectMap.get(projectId)?.categoryId : null) ??
      null
    );
  };
  const activityUnit = (record: DailyEntry | Plan) => {
    const task = record.taskId ? taskMap.get(record.taskId) : undefined;
    const projectId = record.projectId ?? task?.projectId;
    return (
      record.businessUnit?.trim() ??
      task?.businessUnit?.trim() ??
      (projectId ? projectMap.get(projectId)?.businessUnit?.trim() : '') ??
      ''
    );
  };
  const matches = (category: string | null, owner: string, businessUnit: string | undefined) =>
    (!scope.categoryId || category === scope.categoryId) &&
    (!scope.owner || owner === scope.owner) &&
    matchesBusinessUnit(businessUnit, scope.businessUnit);
  const tasks = workspace.tasks.filter(
    (task) =>
      !task.archived &&
      matches(
        task.categoryId ??
          (task.projectId ? projectMap.get(task.projectId)?.categoryId : null) ??
          null,
        ownerName(task.assignee),
        task.businessUnit,
      ),
  );
  const projects = workspace.projects.filter(
    (project) =>
      !project.archived &&
      matches(project.categoryId, ownerName(project.owner), project.businessUnit),
  );
  const inRange = (date: string) =>
    scope.from <= scope.to && date >= scope.from && date <= scope.to;
  const allEntries = workspace.dailyEntries.filter(
    (entry) =>
      inRange(entry.date) &&
      matches(activityCategory(entry), activityOwner(entry), activityUnit(entry)),
  );
  const entries = allEntries.filter((entry) => !entry.isLunch);
  const plans = workspace.plans.filter(
    (plan) =>
      inRange(plan.date) &&
      matches(activityCategory(plan), activityOwner(plan), activityUnit(plan)),
  );
  const knownPlanIds = new Set(workspace.plans.map((plan) => plan.id));
  const plannedEntries = entries.map((entry) =>
    entry.planId && !knownPlanIds.has(entry.planId) ? { ...entry, planId: null } : entry,
  );
  const activity = activityBuckets(plannedEntries, plans, scope);
  const loggedMinutes = entries.reduce((sum, entry) => sum + entryMinutes(entry), 0);
  const plannedMinutes = activity.reduce((sum, bucket) => sum + bucket.planned, 0);
  const breakMinutes = allEntries
    .filter((entry) => entry.isLunch)
    .reduce(
      (sum, entry) =>
        sum +
        (entry.actualSegments?.reduce(
          (duration, segment) => duration + segment.endMinute - segment.startMinute,
          0,
        ) ??
          (entry.actualStart !== null && entry.actualEnd !== null
            ? entry.actualEnd - entry.actualStart
            : 0)),
      0,
    );
  const overdue = tasks
    .filter(
      (task) => !isTerminalStatus(task.status) && task.dueDate !== null && task.dueDate < today,
    )
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''));
  const dueToday = tasks.filter((task) => !isTerminalStatus(task.status) && task.dueDate === today);
  const categoryMap = new Map<string | null, number>();
  for (const entry of entries)
    categoryMap.set(
      activityCategory(entry),
      (categoryMap.get(activityCategory(entry)) ?? 0) + entryMinutes(entry),
    );
  const categoryTime = [...categoryMap]
    .map(([id, minutes]) => ({
      id,
      name: workspace.categories.find((category) => category.id === id)?.name ?? 'Uncategorized',
      minutes,
    }))
    .filter((row) => row.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);
  const ownerNames = new Set([
    ...tasks.map((task) => ownerName(task.assignee)),
    ...entries.map(activityOwner),
  ]);
  const ownerWork: OwnerWork[] = [...ownerNames]
    .map((name) => {
      const assigned = tasks.filter((task) => ownerName(task.assignee) === name);
      return {
        name,
        open: assigned.filter((task) => !isTerminalStatus(task.status)).length,
        closed: assigned.filter((task) => task.status === 'Closed').length,
        total: assigned.length,
        counts: counts(assigned),
        minutes: entries
          .filter((entry) => activityOwner(entry) === name)
          .reduce((sum, entry) => sum + entryMinutes(entry), 0),
      };
    })
    .sort((a, b) => b.open - a.open || b.minutes - a.minutes || a.name.localeCompare(b.name));
  const portfolio: PortfolioRow[] = [
    { label: 'Operational tasks', records: tasks.filter((task) => task.type === 'operational') },
    { label: 'Other tasks', records: tasks.filter((task) => task.type !== 'operational') },
    { label: 'Projects', records: projects },
  ].map((row) => ({ label: row.label, total: row.records.length, counts: counts(row.records) }));
  const projectDates = projects
    .filter((project) => !isTerminalStatus(project.status) && project.dueDate)
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
    .slice(0, 5);
  return {
    categoryLabel:
      workspace.categories.find((category) => category.id === scope.categoryId)?.name ??
      'All categories',
    tasks,
    projects,
    entries,
    plans,
    loggedMinutes,
    plannedMinutes,
    breakMinutes,
    overdue,
    dueToday,
    categoryTime,
    ownerWork,
    portfolio,
    activity,
    taskCounts: counts(tasks),
    projectCounts: counts(projects),
    projectDates,
    activeProjects: projects.filter((project) => !isTerminalStatus(project.status)).length,
    openTasks: tasks.filter((task) => !isTerminalStatus(task.status)).length,
    demo: [...tasks, ...projects, ...allEntries, ...plans].some((record) => record.demo),
  };
}
export type ExecutiveMetrics = ReturnType<typeof executiveMetrics>;

import type { DailyEntry, Plan, Workspace } from '../../domain/models';
export const UNASSIGNED_UNIT = '__unassigned__';
export function activityBusinessUnit(record: DailyEntry | Plan, workspace: Workspace): string {
  const task = workspace.tasks.find((item) => item.id === record.taskId);
  const project = workspace.projects.find(
    (item) => item.id === (record.projectId ?? task?.projectId),
  );
  return (
    record.businessUnit?.trim() ?? task?.businessUnit?.trim() ?? project?.businessUnit?.trim() ?? ''
  );
}
export function businessUnitOptions(workspace: Workspace): string[] {
  return [
    ...new Set(
      [
        ...workspace.settings.businessUnits,
        ...workspace.tasks.map((record) => record.businessUnit || ''),
        ...workspace.projects.map((record) => record.businessUnit || ''),
        ...workspace.dailyEntries.map((record) => record.businessUnit || ''),
        ...workspace.plans.map((record) => record.businessUnit || ''),
      ].filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b));
}
export function matchesBusinessUnit(
  value: string | undefined,
  filter: string | undefined,
): boolean {
  return !filter || (filter === UNASSIGNED_UNIT ? !value?.trim() : value?.trim() === filter);
}
export function businessUnitFilterLabel(filter: string | undefined): string {
  return filter === UNASSIGNED_UNIT ? 'Unassigned' : filter || 'All business units';
}

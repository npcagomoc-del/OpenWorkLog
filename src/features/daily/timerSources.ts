import type { DailyEntry, Plan, Workspace } from '../../domain/models';
import { minuteLabel } from '../../domain/time';

export type TimerSource = {
  readonly key: string;
  readonly kind: 'entry' | 'plan';
  readonly title: string;
  readonly date: string;
  readonly plannedStart: number | null;
  readonly plannedEnd: number | null;
  readonly sourceEntryId: string | null;
  readonly planId: string | null;
  readonly taskId: string | null;
  readonly taskDetached: boolean;
  readonly projectId: string | null;
  readonly categoryId: string | null;
};
export function entryTimerSource(entry: DailyEntry): TimerSource {
  return {
    key: `entry:${entry.id}`, kind: 'entry', title: entry.title, date: entry.date,
    plannedStart: entry.plannedStart, plannedEnd: entry.plannedEnd,
    sourceEntryId: entry.id, planId: entry.planId ?? null, taskId: entry.taskId,
    projectId: entry.projectId, categoryId: entry.categoryId, taskDetached: entry.taskDetached ?? false,
  };
}
function planTimerSource(plan: Plan): TimerSource {
  return {
    key: `plan:${plan.id}`, kind: 'plan', title: plan.title, date: plan.date,
    plannedStart: plan.startMinute, plannedEnd: plan.endMinute,
    sourceEntryId: null, planId: plan.id, taskId: plan.taskId,
    projectId: plan.projectId, categoryId: plan.categoryId, taskDetached: plan.taskDetached ?? false,
  };
}
export function scheduledTimerSources(workspace: Workspace, date: string): readonly TimerSource[] {
  const entries = workspace.dailyEntries.filter(entry => entry.date === date && !entry.isLunch);
  const representedPlans = new Set(entries.map(entry => entry.planId));
  return [
    ...entries.map(entryTimerSource),
    ...workspace.plans.filter(plan => plan.date === date && !representedPlans.has(plan.id)).map(planTimerSource),
  ].sort((a, b) => (a.plannedStart ?? 1440) - (b.plannedStart ?? 1440) || a.title.localeCompare(b.title));
}
export function plannedWindow(source: Pick<TimerSource, 'date' | 'plannedStart' | 'plannedEnd'>): string {
  return source.plannedStart !== null && source.plannedEnd !== null
    ? `${source.date} · ${minuteLabel(source.plannedStart)}–${minuteLabel(source.plannedEnd)}`
    : `${source.date} · No planned time`;
}

import { CalendarClock } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Timer, Workspace } from '../../domain/models';
import { plannedWindow } from './timerSources';

export function TimerPlanContext({ timer, workspace }: { readonly timer: Timer; readonly workspace: Workspace }) {
  const task = workspace.tasks.find(item => item.id === timer.taskId);
  const entry = workspace.dailyEntries.find(item => item.id === timer.sourceEntryId);
  const plan = workspace.plans.find(item => item.id === timer.planId);
  const date = timer.plannedDate ?? entry?.date ?? plan?.date;
  const start = timer.plannedStart ?? entry?.plannedStart ?? plan?.startMinute ?? null;
  const end = timer.plannedEnd ?? entry?.plannedEnd ?? plan?.endMinute ?? null;
  const first = timer.segments[0];
  const actualStart = first ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone: workspace.settings.timezone }).format(new Date(first.start)) : '';
  if (!date && !task) return null;
  return <div className="timer-plan-context"><CalendarClock size={18} aria-hidden="true" /><div>
    {date && <strong>Planned: {plannedWindow({ date, plannedStart: start, plannedEnd: end })}</strong>}
    {task && <Link className="text-link" to={`/tasks?search=${encodeURIComponent(task.title)}`}>Task: {task.title}</Link>}
    {entry && <Link className="text-link" to={`/daily?date=${entry.date}&entry=${encodeURIComponent(entry.id)}`}>Open linked daily entry</Link>}
    <span>Started: {actualStart}</span>
  </div></div>;
}

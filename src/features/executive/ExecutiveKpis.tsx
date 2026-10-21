import { BriefcaseBusiness, CheckSquare2, Timer, TriangleAlert } from 'lucide-react';
import { Card } from '../../components/ui';
import { formatDuration } from '../../domain/time';
import type { ExecutiveMetrics } from './executiveMetrics';
type Props = {
  readonly metrics: ExecutiveMetrics;
  readonly today: string;
  readonly invalidRange: boolean;
};
export function ExecutiveKpis({ metrics, today, invalidRange }: Props) {
  return (
    <div className="executive-kpis">
      <Card className="executive-kpi" role="group" aria-label="Unfinished tasks">
        <div className="split">
          <span>Unfinished tasks</span>
          <CheckSquare2 size={22} aria-hidden="true" />
        </div>
        <strong>{metrics.openTasks}</strong>
        <span className="small muted">Open and In Progress · current</span>
      </Card>
      <Card className="executive-kpi" role="group" aria-label="Active projects">
        <div className="split">
          <span>Active projects</span>
          <BriefcaseBusiness size={22} aria-hidden="true" />
        </div>
        <strong>{metrics.activeProjects}</strong>
        <span className="small muted">
          {metrics.projects.length} {metrics.projects.length === 1 ? 'project' : 'projects'} in
          scope · current
        </span>
      </Card>
      <Card
        className={`executive-kpi ${metrics.overdue.length ? 'executive-kpi-attention' : ''}`}
        role="group"
        aria-label="Overdue tasks"
      >
        <div className="split">
          <span>Overdue tasks</span>
          <TriangleAlert size={22} aria-hidden="true" />
        </div>
        <strong>{metrics.overdue.length}</strong>
        <span className="small muted">
          {metrics.dueToday.length} more due today · {today}
        </span>
      </Card>
      <Card className="executive-kpi executive-kpi-time" role="group" aria-label="Productive time">
        <div className="split">
          <span>Productive time</span>
          <Timer size={22} aria-hidden="true" />
        </div>
        <strong>{invalidRange ? '—' : formatDuration(metrics.loggedMinutes)}</strong>
        <span className="small muted">Selected period · breaks excluded</span>
      </Card>
    </div>
  );
}

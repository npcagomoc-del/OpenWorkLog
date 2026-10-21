import { ScrollablePreview } from '../reports/ScrollablePreview';
import { ArrowUpRight, Clock3, FolderKanban } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Card, StatusBadge } from '../../components/ui';
import { formatDuration } from '../../domain/time';
import type { ExecutiveMetrics } from './executiveMetrics';

export function ExecutivePortfolio({ metrics }: { readonly metrics: ExecutiveMetrics }) {
  return (
    <Card className="card-pad stack executive-portfolio">
      <div className="split">
        <div>
          <p className="eyebrow">Current portfolio</p>
          <h2>Operational tasks & projects</h2>
        </div>
        <Link className="text-link" to="/reports">
          Reports <ArrowUpRight size={16} />
        </Link>
      </div>
      <ScrollablePreview label="Current portfolio status table">
        <table className="data-table executive-summary-table">
          <caption className="visually-hidden">
            Current unarchived task and project status counts
          </caption>
          <thead>
            <tr>
              <th>Category</th>
              <th>Quantity</th>
              {metrics.taskCounts.map((item) => (
                <th key={item.status}>
                  <StatusBadge status={item.status} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.portfolio.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>
                  <strong>{row.total}</strong>
                </td>
                {row.counts.map((item) => (
                  <td key={item.status}>{item.count}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollablePreview>
      <p className="small muted">
        Projects are counted once. Their linked tasks stay in the task rows. The Other tasks row
        includes personal and project-type tasks. Archived records are excluded.
      </p>
      <div className="executive-portfolio-links">
        <Link className="text-link" to="/tasks">
          Task tracker <ArrowUpRight size={16} />
        </Link>
        <Link className="text-link" to="/projects">
          Project list <ArrowUpRight size={16} />
        </Link>
      </div>
    </Card>
  );
}
export function ExecutiveAttention({ metrics }: { readonly metrics: ExecutiveMetrics }) {
  const due = [...metrics.overdue, ...metrics.dueToday].slice(0, 5);
  return (
    <div className="executive-two-columns">
      <Card className="card-pad stack">
        <div className="split">
          <div>
            <p className="eyebrow">Current due dates</p>
            <h2>Tasks needing attention</h2>
          </div>
          <Clock3 size={22} aria-hidden="true" />
        </div>
        <p className="small muted">
          Unfinished tasks due today or earlier, using the workspace time zone.
        </p>
        {due.length ? (
          <ul className="executive-record-list">
            {due.map((task) => (
              <li key={task.id}>
                <Link to={`/tasks?search=${encodeURIComponent(task.title)}`}>
                  <strong>{task.title}</strong>
                  <span className="small muted">
                    {task.assignee || 'Unassigned'} · {task.dueDate}
                  </span>
                </Link>
                <StatusBadge status={task.status} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="executive-empty muted">No unfinished tasks due today or earlier.</p>
        )}
        <Link className="text-link" to="/tasks">
          Review all tasks <ArrowUpRight size={16} />
        </Link>
      </Card>
      <Card className="card-pad stack">
        <div className="split">
          <div>
            <p className="eyebrow">Current project dates</p>
            <h2>Project due dates</h2>
          </div>
          <FolderKanban size={22} aria-hidden="true" />
        </div>
        <p className="small muted">
          Nearest saved due dates for projects that are still open or in progress.
        </p>
        {metrics.projectDates.length ? (
          <ul className="executive-record-list">
            {metrics.projectDates.map((project) => (
              <li key={project.id}>
                <div>
                  <strong>{project.name}</strong>
                  <span className="small muted">
                    {project.owner || 'Unassigned'} · {project.dueDate}
                  </span>
                </div>
                <StatusBadge status={project.status} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="executive-empty muted">No dates set for unfinished projects.</p>
        )}
        <Link className="text-link" to="/projects">
          View projects <ArrowUpRight size={16} />
        </Link>
      </Card>
    </div>
  );
}
export function ExecutiveWorkload({ metrics }: { readonly metrics: ExecutiveMetrics }) {
  const largest = Math.max(1, ...metrics.ownerWork.map((owner) => owner.open));
  return (
    <Card className="card-pad stack">
      <div>
        <p className="eyebrow">Current assignment</p>
        <h2>Work by owner</h2>
        <p className="small muted">
          Bars show unfinished tasks. Time belongs to the selected period; it is not a capacity
          estimate.
        </p>
      </div>
      {metrics.ownerWork.length ? (
        <ul className="executive-owner-list">
          {metrics.ownerWork.map((owner) => (
            <li key={owner.name}>
              <div className="split">
                {owner.name === 'Unassigned' ? (
                  <strong>Unassigned</strong>
                ) : (
                  <Link
                    className="text-link"
                    to={`/tasks?search=${encodeURIComponent(owner.name)}`}
                  >
                    {owner.name}
                  </Link>
                )}
                <Badge>{owner.open} unfinished</Badge>
              </div>
              <meter
                min={0}
                max={largest}
                value={owner.open}
                aria-label={`${owner.name}: ${owner.open} unfinished tasks`}
              >
                {owner.open}
              </meter>
              <div className="split small muted">
                <span>
                  {owner.closed} closed · {owner.total} {owner.total === 1 ? 'task' : 'tasks'} total
                </span>
                <span>{formatDuration(owner.minutes)} logged</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="executive-empty muted">No task assignments or logged time in this scope.</p>
      )}
    </Card>
  );
}

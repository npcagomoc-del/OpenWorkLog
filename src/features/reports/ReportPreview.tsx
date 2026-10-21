import { FileSpreadsheet } from 'lucide-react';
import { Badge, Card, EmptyState, StatusBadge } from '../../components/ui';
import type { DailyEntry, Task, Workspace } from '../../domain/models';
import { entryMinutes, formatDuration, minuteLabel } from '../../domain/time';
import { ScrollablePreview } from './ScrollablePreview';
import { activityBusinessUnit } from './reportUnits';
type Props = {
  readonly mode: 'daily' | 'tracker';
  readonly entries: readonly DailyEntry[];
  readonly tasks: readonly Task[];
  readonly workspace: Workspace;
};
export function ReportPreview({ mode, entries, tasks, workspace }: Props) {
  const records = mode === 'daily' ? entries : tasks;
  return (
    <Card className="report-preview">
      <div className="split card-pad">
        <h2>{mode === 'daily' ? 'Daily report preview' : 'Tracker preview'}</h2>
        <span className="small muted">CSV includes all source fields</span>
      </div>
      {records.length === 0 ? (
        <EmptyState
          icon={<FileSpreadsheet size={28} />}
          title="No records in this report"
          description={
            mode === 'daily'
              ? 'Choose another date range or add entries in Daily log.'
              : 'Create a task or import a tracker CSV to get started.'
          }
        />
      ) : (
        <ScrollablePreview label="Report preview table">
          <table className="data-table">
            <caption className="visually-hidden">
              {mode === 'daily' ? 'Daily report' : 'Task tracker'} preview
            </caption>
            {mode === 'daily' ? (
              <>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Task / activity</th>
                    <th>Business Unit</th>
                    <th>Work done</th>
                    <th>Actual time</th>
                    <th>Productive</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.date}</td>
                      <td>
                        {entry.title}
                        {entry.isLunch && <Badge>Lunch / break</Badge>}
                      </td>
                      <td>{activityBusinessUnit(entry, workspace) || 'Unassigned'}</td>
                      <td className="report-description">{entry.workDone || '—'}</td>
                      <td>
                        {entry.actualStart !== null && entry.actualEnd !== null
                          ? `${minuteLabel(entry.actualStart)}–${minuteLabel(entry.actualEnd)}`
                          : '—'}
                      </td>
                      <td>{formatDuration(entryMinutes(entry))}</td>
                      <td>{entry.isLunch ? '—' : <StatusBadge status={entry.status} />}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            ) : (
              <>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Business Unit</th>
                    <th>Category</th>
                    <th>By whom</th>
                    <th>By when</th>
                    <th>Status</th>
                    <th>Latest update</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        {task.title}
                        {task.archived && <Badge>Archived</Badge>}
                      </td>
                      <td>{task.businessUnit || 'Unassigned'}</td>
                      <td>
                        {workspace.categories.find((category) => category.id === task.categoryId)
                          ?.name ?? '—'}
                      </td>
                      <td>{task.assignee || '—'}</td>
                      <td>{task.dueDate ?? '—'}</td>
                      <td>
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="report-description">{task.latestUpdate || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </table>
        </ScrollablePreview>
      )}
    </Card>
  );
}

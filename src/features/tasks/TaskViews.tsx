import { CalendarDays, Trash2 } from 'lucide-react';
import { Badge, Card, IconButton, StatusBadge } from '../../components/ui';
import type { Task } from '../../domain/models';
import { TaskBoard } from './TaskBoard';
import { TaskName, TaskStatus } from './TaskControls';
import type { TaskViewProps } from './taskViewTypes';

export function TaskViews(props: TaskViewProps) {
  const { tasks, view, categories, projects, settings, onEdit, onDelete, onRename, onStatus } =
    props;
  const categoryName = (task: Task) =>
    categories.find((category) => category.id === task.categoryId)?.name ?? 'Uncategorized';
  const projectName = (task: Task) =>
    projects.find((project) => project.id === task.projectId)?.name;
  if (view === 'table')
    return (
      <Card className="table-scroll">
        <table className="data-table task-table">
          <caption className="visually-hidden">Task tracker</caption>
          <thead>
            <tr>
              {[
                'ID',
                'Task',
                'Category',
                'By whom',
                'By when',
                'Status',
                'Latest update',
                'Actions',
              ].map((label) => (
                <th key={label} scope="col">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>
                  <span className="small muted" title={task.id}>
                    {task.id.slice(0, 8)}
                  </span>
                </td>
                <td>
                  <TaskName task={task} onRename={onRename} onEdit={onEdit} />
                  {projectName(task) && <span className="small muted">{projectName(task)}</span>}
                </td>
                <td>{categoryName(task)}</td>
                <td>{task.assignee || '—'}</td>
                <td>{task.dueDate || '—'}</td>
                <td>
                  <StatusBadge status={task.status} />
                  <TaskStatus task={task} onStatus={onStatus} />
                </td>
                <td>{task.latestUpdate || '—'}</td>
                <td>
                  <IconButton label={`Delete ${task.title}`} onClick={() => onDelete(task)}>
                    <Trash2 size={17} />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    );
  if (view === 'board') return <TaskBoard {...props} />;
  return (
    <Card className="task-list">
      {tasks.map((task) => (
        <article key={task.id} className="task-row">
          <div className="task-row-main">
            <div className="cluster">
              <TaskName task={task} onRename={onRename} onEdit={onEdit} />
              {task.priority === 'High' && <Badge tone="yellow">High priority</Badge>}
            </div>
            <div className="cluster small muted">
              <span>{categoryName(task)}</span>
              <span>{settings.typeLabels[task.type]}</span>
              {projectName(task) && <span>{projectName(task)}</span>}
              {task.dueDate && (
                <span className="cluster task-due">
                  <CalendarDays size={14} />
                  {task.dueDate}
                </span>
              )}
              {task.subtasks.length > 0 && (
                <span>
                  {task.subtasks.filter((item) => item.done).length}/{task.subtasks.length} steps
                </span>
              )}
            </div>
            {task.latestUpdate && <p className="task-update small muted">{task.latestUpdate}</p>}
          </div>
          <div className="task-row-actions">
            <StatusBadge status={task.status} />
            <TaskStatus task={task} onStatus={onStatus} />
            <IconButton label={`Delete ${task.title}`} onClick={() => onDelete(task)}>
              <Trash2 size={17} />
            </IconButton>
          </div>
        </article>
      ))}
    </Card>
  );
}

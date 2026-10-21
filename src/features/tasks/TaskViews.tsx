import { Card } from '../../components/ui';
import type { Task } from '../../domain/models';
import { TaskBoard } from './TaskBoard';
import { TaskActions, TaskName, TaskStatus } from './TaskControls';
import type { TaskViewProps } from './taskViewTypes';
export function TaskViews(props: TaskViewProps) {
  const { tasks, view, categories, projects, preferences, onEdit, onStatus } = props;
  const fields = preferences.fields;
  const metadata = (task: Task) =>
    [
      fields.category ? categories.find((item) => item.id === task.categoryId)?.name : '',
      fields.project ? projects.find((item) => item.id === task.projectId)?.name : '',
      fields.businessUnit ? task.businessUnit : '',
      fields.dueDate ? task.dueDate : '',
      fields.assignee ? task.assignee : '',
      fields.priority && task.priority !== 'Normal' ? `${task.priority} priority` : '',
    ]
      .filter(Boolean)
      .join(' · ');
  if (view === 'board') return <TaskBoard key={preferences.groupBy} {...props} />;
  if (view === 'table')
    return (
      <Card className="table-scroll">
        <table className="data-table task-table">
          <caption className="visually-hidden">Task tracker</caption>
          <thead>
            <tr>
              <th scope="col">Task</th>
              <th scope="col">Details</th>
              <th scope="col">Status</th>
              {fields.latestUpdate && <th scope="col">Latest update</th>}
              <th scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>
                  <TaskName task={task} onEdit={onEdit} />
                </td>
                <td className="small muted">{metadata(task) || '—'}</td>
                <td>
                  <TaskStatus task={task} onStatus={onStatus} />
                </td>
                {fields.latestUpdate && <td>{task.latestUpdate || '—'}</td>}
                <td>
                  <TaskActions {...props} task={task} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    );
  return (
    <Card className="task-list">
      {tasks.map((task) => (
        <article key={task.id} className="task-row">
          <div className="task-row-main">
            <TaskName task={task} onEdit={onEdit} />
            {metadata(task) && <div className="small muted task-row-meta">{metadata(task)}</div>}
            {fields.latestUpdate && task.latestUpdate && (
              <p className="task-update small muted">{task.latestUpdate}</p>
            )}
          </div>
          <div className="task-row-actions">
            <TaskStatus task={task} onStatus={onStatus} />
            <TaskActions {...props} task={task} />
          </div>
        </article>
      ))}
    </Card>
  );
}

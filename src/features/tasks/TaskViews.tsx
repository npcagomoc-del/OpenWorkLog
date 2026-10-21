import { CalendarDays, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge, Button, Card, IconButton, StatusBadge } from '../../components/ui';
import type { Category, Project, Settings, Status, Task } from '../../domain/models';
import { statuses } from './taskLogic';

type TaskViewProps = {
  readonly tasks: readonly Task[];
  readonly categories: readonly Category[];
  readonly projects: readonly Project[];
  readonly settings: Settings;
  readonly view: 'list' | 'table' | 'board';
  readonly onEdit: (task: Task) => void;
  readonly onDelete: (task: Task) => void;
  readonly onRename: (task: Task, title: string) => Promise<boolean>;
  readonly onStatus: (task: Task, status: Status) => void;
};

function TaskName({
  task,
  onRename,
  onEdit,
}: Pick<TaskViewProps, 'onRename' | 'onEdit'> & { readonly task: Task }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [busy, setBusy] = useState(false);
  const renameInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (editing) renameInput.current?.focus();
  }, [editing]);
  async function save() {
    if (!title.trim()) return;
    setBusy(true);
    try {
      if (await onRename(task, title.trim())) setEditing(false);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="task-name">
      {editing ? (
        <form
          className="cluster"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <input
            aria-label="Rename task"
            ref={renameInput}
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setEditing(false);
            }}
          />
          <Button size="sm" busy={busy} type="submit">
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </form>
      ) : (
        <>
          <button type="button" className="task-title" onClick={() => onEdit(task)}>
            {task.title}
          </button>
          <IconButton
            label={`Rename ${task.title}`}
            onClick={() => {
              setTitle(task.title);
              setEditing(true);
            }}
          >
            <Pencil size={14} />
          </IconButton>
        </>
      )}
      {task.demo && <Badge>Demo</Badge>}
    </div>
  );
}

function TaskStatus({ task, onStatus }: Pick<TaskViewProps, 'onStatus'> & { readonly task: Task }) {
  const tones = { Open: 'open', 'In Progress': 'progress', Closed: 'closed' } as const;
  return (
    <select
      id={`task-status-${task.id}`}
      className={`task-status-select task-status-select--${tones[task.status]}`}
      aria-label={`Move ${task.title} to status`}
      value={task.status}
      onChange={(event) => {
        const status = statuses.find((value) => value === event.target.value);
        if (status) onStatus(task, status);
      }}
    >
      {statuses.map((status) => (
        <option key={status}>{status}</option>
      ))}
    </select>
  );
}

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
  if (view === 'board')
    return (
      <div className="task-board">
        {statuses.map((status) => (
          <section className="task-board-column" key={status} aria-label={`${status} tasks`}>
            <div className="split">
              <StatusBadge status={status} />
              <span className="muted small">
                {tasks.filter((task) => task.status === status).length}
              </span>
            </div>
            <div className="stack">
              {tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <Card className="task-board-card" key={task.id}>
                    <span className="small muted">{categoryName(task)}</span>
                    <TaskName task={task} onRename={onRename} onEdit={onEdit} />
                    {projectName(task) && <span className="small muted">{projectName(task)}</span>}
                    {task.latestUpdate && <p className="small task-update">{task.latestUpdate}</p>}
                    <div className="split">
                      <span className="small muted">{task.dueDate || 'No due date'}</span>
                      <IconButton label={`Delete ${task.title}`} onClick={() => onDelete(task)}>
                        <Trash2 size={16} />
                      </IconButton>
                    </div>
                    <label className="small muted" htmlFor={`task-status-${task.id}`}>
                      Move to
                      <TaskStatus task={task} onStatus={onStatus} />
                    </label>
                  </Card>
                ))}
              {!tasks.some((task) => task.status === status) && (
                <p className="small muted task-board-empty">No tasks here</p>
              )}
            </div>
          </section>
        ))}
      </div>
    );
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

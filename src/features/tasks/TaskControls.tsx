import { Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge, Button, IconButton } from '../../components/ui';
import type { Task } from '../../domain/models';
import { statuses } from './taskLogic';
import type { TaskViewProps } from './taskViewTypes';

export function TaskName({
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

export function TaskStatus({
  task,
  onStatus,
}: Pick<TaskViewProps, 'onStatus'> & { readonly task: Task }) {
  const tones = { Open: 'open', 'In Progress': 'progress', Closed: 'closed' } as const;
  return (
    <select
      id={`task-status-${task.id}`}
      className={`task-status-select task-status-select--${tones[task.status]}`}
      aria-label={`Move ${task.title} to status`}
      value={task.status}
      onChange={(event) => {
        const status = statuses.find((value) => value === event.target.value);
        if (status) void onStatus(task, status);
      }}
    >
      {statuses.map((status) => (
        <option key={status}>{status}</option>
      ))}
    </select>
  );
}

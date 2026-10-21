import { MoreHorizontal } from 'lucide-react';
import { useRef, useState } from 'react';
import { Badge, Button, Modal, StatusControl } from '../../components/ui';
import type { Task } from '../../domain/models';
import type { TaskViewProps } from './taskViewTypes';
export function TaskName({
  task,
  onEdit,
}: Pick<TaskViewProps, 'onEdit'> & { readonly task: Task }) {
  return (
    <div className="task-name">
      <button type="button" className="task-title" onClick={() => onEdit(task)}>
        <span style={{ color: 'var(--text)' }}>{task.title}</span>
      </button>
      {task.demo && <Badge>Demo</Badge>}
    </div>
  );
}
export function TaskStatus({
  task,
  onStatus,
}: Pick<TaskViewProps, 'onStatus'> & { readonly task: Task }) {
  return (
    <StatusControl
      value={task.status}
      label={`Move ${task.title} to status`}
      onChange={(status) => {
        void onStatus(task, status);
      }}
    />
  );
}
export function TaskActions({
  task,
  groups,
  onEdit,
  onDelete,
  onMove,
}: Pick<TaskViewProps, 'groups' | 'onEdit' | 'onDelete' | 'onMove'> & { readonly task: Task }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  function close() {
    setOpen(false);
    trigger.current?.focus();
  }
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="icon-button"
        aria-label={`Actions for ${task.title}`}
        onClick={() => setOpen(true)}
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <Modal open={open} onClose={close} title={`Task actions: ${task.title}`} size="sm">
          <div className="stack">
            <Button
              onClick={() => {
                close();
                onEdit(task);
              }}
            >
              Edit task
            </Button>
            <label className="stack small">
              Move to
              <select
                aria-label={`Move ${task.title} to group`}
                defaultValue=""
                onChange={(event) => {
                  const group = groups.find((item) => item.id === event.target.value);
                  if (group) {
                    void onMove(task, group);
                    close();
                  }
                }}
              >
                <option value="" disabled>
                  Choose destination
                </option>
                {groups.map((group) => (
                  <option value={group.id} key={group.id}>
                    {group.label}
                  </option>
                ))}
              </select>
            </label>
            <Button
              variant="danger"
              onClick={() => {
                close();
                onDelete(task);
              }}
            >
              Delete task
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

import { useDraggable } from '@dnd-kit/core';
import { GripVertical, Trash2 } from 'lucide-react';
import { IconButton } from '../../components/ui';
import type { Task } from '../../domain/models';
import { TaskName, TaskStatus } from './TaskControls';
import type { TaskViewProps } from './taskViewTypes';

type CardProps = Pick<TaskViewProps, 'onEdit' | 'onRename' | 'onDelete' | 'onStatus'> & {
  readonly task: Task;
  readonly category: string;
  readonly project: string | undefined;
};

export function TaskBoardCard({ task, category, project, ...callbacks }: CardProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({
    id: task.id,
  });
  return (
    <article
      ref={setNodeRef}
      className={`card task-board-card${isDragging ? ' task-board-card--dragging' : ''}`}
    >
      <div className="split">
        <span className="small muted">{category}</span>
        <button
          id={`task-drag-${task.id}`}
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="icon-button task-drag-handle"
          aria-label={`Drag ${task.title}`}
          title="Drag to another status. Keyboard: Space, arrows, Space."
        >
          <GripVertical size={18} />
        </button>
      </div>
      <TaskName task={task} onRename={callbacks.onRename} onEdit={callbacks.onEdit} />
      {project && <span className="small muted">{project}</span>}
      {task.latestUpdate && <p className="small task-update">{task.latestUpdate}</p>}
      <div className="split">
        <span className="small muted">{task.dueDate || 'No due date'}</span>
        <IconButton label={`Delete ${task.title}`} onClick={() => callbacks.onDelete(task)}>
          <Trash2 size={16} />
        </IconButton>
      </div>
      <label className="small muted" htmlFor={`task-status-${task.id}`}>
        Move to
        <TaskStatus task={task} onStatus={callbacks.onStatus} />
      </label>
    </article>
  );
}

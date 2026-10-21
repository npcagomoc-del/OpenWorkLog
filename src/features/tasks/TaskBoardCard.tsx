import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';

import type { Task } from '../../domain/models';
import { TaskActions, TaskName, TaskStatus } from './TaskControls';
import type { TaskViewProps } from './taskViewTypes';
export function TaskBoardCard({ task, ...props }: TaskViewProps & { readonly task: Task }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({
    id: task.id,
  });
  const { preferences, categories, projects } = props;
  const fields = preferences.fields;
  const details = [
    fields.category && preferences.groupBy !== 'category'
      ? categories.find((item) => item.id === task.categoryId)?.name
      : '',
    fields.project && preferences.groupBy !== 'project'
      ? projects.find((item) => item.id === task.projectId)?.name
      : '',
    fields.businessUnit && preferences.groupBy !== 'businessUnit' ? task.businessUnit : '',
    fields.dueDate ? task.dueDate : '',
    fields.priority && task.priority !== 'Normal' ? `${task.priority} priority` : '',
    fields.assignee ? task.assignee : '',
  ].filter(Boolean);
  return (
    <article
      ref={setNodeRef}
      className={`card task-board-card${isDragging ? ' task-board-card--dragging' : ''}`}
    >
      <div className="task-card-tools">
        <button
          id={`task-drag-${task.id}`}
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
          className="icon-button task-drag-handle"
          aria-label={`Drag ${task.title}`}
          title="Drag to another group. Keyboard: Space, arrows, Space."
        >
          <GripVertical size={18} />
        </button>
        {preferences.groupBy !== 'status' && <TaskStatus task={task} onStatus={props.onStatus} />}
        <TaskActions {...props} task={task} />
      </div>
      <TaskName task={task} onEdit={props.onEdit} />
      {details.length > 0 && <p className="small muted task-card-meta">{details.join(' · ')}</p>}
      {fields.latestUpdate && task.latestUpdate && (
        <p className="small task-update">{task.latestUpdate}</p>
      )}
    </article>
  );
}

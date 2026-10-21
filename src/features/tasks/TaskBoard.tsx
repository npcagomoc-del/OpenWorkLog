import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToWindowEdges, snapCenterToCursor } from '@dnd-kit/modifiers';
import { type ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Card, StatusBadge } from '../../components/ui';
import type { Status, Task } from '../../domain/models';
import { TaskBoardCard } from './TaskBoardCard';
import {
  boardCollision,
  boardKeyboardCoordinates,
  dropStatus,
  statusDropId,
} from './taskBoardDrag';
import { statuses } from './taskLogic';
import type { TaskViewProps } from './taskViewTypes';
import './taskBoard.css';

function BoardColumn({
  status,
  count,
  children,
}: {
  readonly status: Status;
  readonly count: number;
  readonly children: ReactNode;
}) {
  const { setNodeRef, isOver, active } = useDroppable({ id: statusDropId(status) });
  return (
    <section
      ref={setNodeRef}
      className={`task-board-column${active ? ' task-board-column--ready' : ''}${isOver ? ' task-board-column--over' : ''}`}
      aria-label={`${status} tasks`}
    >
      <div className="split">
        <StatusBadge status={status} />
        <span className="muted small">{count}</span>
      </div>
      <div className="stack">{children}</div>
      {active && (
        <p className="task-drop-hint small">
          {isOver ? `Release to move to ${status}` : `Drop here: ${status}`}
        </p>
      )}
    </section>
  );
}

export function TaskBoard(props: TaskViewProps) {
  const { tasks, categories, projects, onStatus } = props;
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [keyboardDrag, setKeyboardDrag] = useState(false);
  const [focusTarget, setFocusTarget] = useState<{
    readonly id: string;
    readonly status: Status;
  } | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: boardKeyboardCoordinates(tasks),
      scrollBehavior: 'auto',
    }),
  );
  useEffect(() => {
    if (
      focusTarget &&
      tasks.some((task) => task.id === focusTarget.id && task.status === focusTarget.status)
    ) {
      document.getElementById(`task-drag-${focusTarget.id}`)?.focus();
      setFocusTarget(null);
    }
  }, [focusTarget, tasks]);
  async function finish({ active, over }: DragEndEvent) {
    setActiveTask(null);
    const task = tasks.find((item) => item.id === active.id);
    const status = dropStatus(over?.id);
    if (!task || !status || task.status === status) return;
    const moved = await onStatus(task, status);
    if (moved && keyboardDrag) setFocusTarget({ id: task.id, status });
  }
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={boardCollision}
      onDragStart={({ active, activatorEvent }) => {
        setActiveTask(tasks.find((task) => task.id === active.id) ?? null);
        setKeyboardDrag(activatorEvent instanceof KeyboardEvent);
      }}
      onDragCancel={() => setActiveTask(null)}
      onDragEnd={(event) => {
        void finish(event);
      }}
      accessibility={{
        screenReaderInstructions: {
          draggable:
            'Press Space or Enter to pick up this task. Right or Down moves to the next status. Left or Up moves to the previous status. Press Space or Enter to drop, or Escape to cancel.',
        },
        announcements: {
          onDragStart: ({ active }) =>
            `Picked up ${tasks.find((task) => task.id === active.id)?.title ?? 'task'}.`,
          onDragOver: ({ over }) =>
            over ? `Over ${dropStatus(over.id) ?? 'board'}.` : 'Outside the status columns.',
          onDragEnd: ({ over }) =>
            over ? `Dropped in ${dropStatus(over.id) ?? 'board'}.` : 'No change to task status.',
          onDragCancel: () => 'Move cancelled. Task status unchanged.',
        },
      }}
    >
      <p className="small muted task-board-help">
        Drag a task by its handle to change status. On touch, hold the handle briefly. You can also
        use Move to.
      </p>
      <div className="task-board">
        {statuses.map((status) => {
          const columnTasks = tasks.filter((task) => task.status === status);
          return (
            <BoardColumn status={status} key={status} count={columnTasks.length}>
              {columnTasks.map((task) => (
                <TaskBoardCard
                  key={task.id}
                  task={task}
                  category={
                    categories.find((category) => category.id === task.categoryId)?.name ??
                    'Uncategorized'
                  }
                  project={projects.find((project) => project.id === task.projectId)?.name}
                  onEdit={props.onEdit}
                  onRename={props.onRename}
                  onDelete={props.onDelete}
                  onStatus={onStatus}
                />
              ))}
              {!columnTasks.length && <p className="small muted task-board-empty">No tasks here</p>}
            </BoardColumn>
          );
        })}
      </div>
      {createPortal(
        <div aria-hidden="true" className="task-drag-visual">
          <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor, restrictToWindowEdges]}>
            {activeTask && (
              <Card className="task-drag-preview">
                <StatusBadge status={activeTask.status} />
                <strong>{activeTask.title}</strong>
                <span className="small muted">Moving task</span>
              </Card>
            )}
          </DragOverlay>
        </div>,
        document.body,
      )}
    </DndContext>
  );
}

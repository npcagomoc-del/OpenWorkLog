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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useShell } from '../../app/ShellContext';
import { Card, StatusBadge } from '../../components/ui';
import type { Task } from '../../domain/models';
import { TaskBoardCard } from './TaskBoardCard';
import { boardCollision, boardKeyboardCoordinates, dropGroup, groupDropId } from './taskBoardDrag';
import { belongsToGroup } from './taskGroups';
import type { TaskGroup, TaskViewProps } from './taskViewTypes';
import './taskBoard.css';

function BoardColumn({
  group,
  count,
  children,
}: {
  readonly group: TaskGroup;
  readonly count: number;
  readonly children: ReactNode;
}) {
  const { setNodeRef, isOver, active } = useDroppable({ id: groupDropId(group) });
  return (
    <section
      ref={setNodeRef}
      className={`task-board-column${active ? ' task-board-column--ready' : ''}${isOver ? ' task-board-column--over' : ''}`}
      aria-label={`${group.label} tasks`}
    >
      <div className="split task-column-heading">
        <h2>{group.patch.status ? <StatusBadge status={group.patch.status} /> : group.label}</h2>
        <span className="muted small">{count}</span>
      </div>
      <div className="task-column-cards">{children}</div>
      {active && (
        <p className="task-drop-hint small">
          {isOver ? `Release to move to ${group.label}` : `Drop here: ${group.label}`}
        </p>
      )}
    </section>
  );
}
export function TaskBoard(props: TaskViewProps) {
  const { tasks, groups, onMove } = props;
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [keyboardDrag, setKeyboardDrag] = useState(false);
  const { focusMode } = useShell();
  const viewport = useRef<HTMLElement>(null);
  const [laneIndex, setLaneIndex] = useState(0);
  const keyboardGroup = useRef<TaskGroup | null>(null);
  const [focusTarget, setFocusTarget] = useState<{
    readonly id: string;
    readonly group: TaskGroup;
  } | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: boardKeyboardCoordinates(tasks, groups, keyboardGroup),
      scrollBehavior: 'auto',
    }),
  );
  useEffect(() => {
    if (
      focusTarget &&
      tasks.some((task) => task.id === focusTarget.id && belongsToGroup(task, focusTarget.group))
    ) {
      document.getElementById(`task-drag-${focusTarget.id}`)?.focus();
      setFocusTarget(null);
    }
  }, [focusTarget, tasks]);
  function goToLane(index: number) {
    const target = viewport.current?.querySelectorAll<HTMLElement>('.task-board-column')[index];
    const container = viewport.current;
    if (!target || !container) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    container.scrollTo({
      left: target.offsetLeft - container.offsetLeft,
      behavior: reducedMotion ? 'instant' : 'smooth',
    });
    setLaneIndex(index);
  }
  function updateLaneIndex() {
    const container = viewport.current;
    if (!container) return;
    const lanes = [...container.querySelectorAll<HTMLElement>('.task-board-column')];
    const closest = lanes.reduce((best, lane, index) => {
      const current = lanes[best];
      if (!current) return index;
      const position = container.offsetLeft + container.scrollLeft;
      return Math.abs(lane.offsetLeft - position) < Math.abs(current.offsetLeft - position)
        ? index : best;
    }, 0);
    setLaneIndex(closest);
  }
  async function finish({ active, over }: DragEndEvent) {
    setActiveTask(null);
    const task = tasks.find((item) => item.id === active.id);
    const group = keyboardDrag
      ? (keyboardGroup.current ?? dropGroup(groups, over?.id))
      : dropGroup(groups, over?.id);
    if (!task || !group || belongsToGroup(task, group)) return;
    if ((await onMove(task, group)) && keyboardDrag) setFocusTarget({ id: task.id, group });
  }
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={boardCollision}
      onDragStart={({ active, activatorEvent }) => {
        keyboardGroup.current = null;
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
            'Press Space or Enter to pick up. Arrows move between groups. Space or Enter drops, Escape cancels.',
        },
        announcements: {
          onDragStart: ({ active }) =>
            `Picked up ${tasks.find((task) => task.id === active.id)?.title ?? 'task'}.`,
          onDragOver: ({ over }) =>
            over ? `Over ${dropGroup(groups, over.id)?.label ?? 'board'}.` : 'Outside the groups.',
          onDragEnd: ({ over }) =>
            over
              ? `Dropped in ${dropGroup(groups, over.id)?.label ?? 'board'}.`
              : 'No change to task.',
          onDragCancel: () => 'Move cancelled. Task unchanged.',
        },
      }}
    >
      {!focusMode && <p className="small muted task-board-help">
        Drag a handle to change{' '}
        {props.preferences.groupBy === 'businessUnit' ? 'business unit' : props.preferences.groupBy}
        . Hold briefly on touch, or use Actions → Move to.
      </p>}
      {focusMode && groups.length > 0 && <nav className="task-board-lane-nav" aria-label="Board lanes">
        <button type="button" className="icon-button" aria-label="Previous lane" disabled={laneIndex === 0} onClick={() => goToLane(laneIndex - 1)}><ChevronLeft size={20} /></button>
        <span className="task-board-lane-label" aria-live="polite">{groups[laneIndex]?.label ?? groups[0]?.label} <span className="muted">{laneIndex + 1} / {groups.length}</span></span>
        <button type="button" className="icon-button" aria-label="Next lane" disabled={laneIndex >= groups.length - 1} onClick={() => goToLane(laneIndex + 1)}><ChevronRight size={20} /></button>
      </nav>}
      <section ref={viewport} className="task-board-viewport" aria-label="Task board columns" onScroll={updateLaneIndex}>
        <div className="task-board">
          {groups.map((group) => {
            const columnTasks = tasks.filter((task) => belongsToGroup(task, group));
            return (
              <BoardColumn group={group} key={group.id} count={columnTasks.length}>
                {columnTasks.map((task) => (
                  <TaskBoardCard {...props} key={task.id} task={task} />
                ))}
                {!columnTasks.length && (
                  <p className="small muted task-board-empty">No tasks here</p>
                )}
              </BoardColumn>
            );
          })}
        </div>
      </section>
      {createPortal(
        <div aria-hidden="true" className="task-drag-visual">
          <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor, restrictToWindowEdges]}>
            {activeTask && (
              <Card className="task-drag-preview">
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

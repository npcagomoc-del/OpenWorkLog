import { useDraggable, useDroppable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import type { Plan } from '../../domain/models';
import { type CalendarSlot, calendarPlanId, calendarSlotId } from './calendarDrag';
import { timeInput } from './calendarLogic';
import type { PlanInterval } from './calendarResize';
import { usePlanResize } from './usePlanResize';
import './calendarResize.css';

export function CalendarDropSlot({
  slot,
  lunch,
  active,
  occupied,
  onCreate,
}: {
  readonly slot: CalendarSlot;
  readonly lunch: boolean;
  readonly active: boolean;
  readonly occupied: boolean;
  readonly onCreate: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: calendarSlotId(slot) });
  return (
    <button
      ref={setNodeRef}
      type="button"
      data-calendar-date={slot.date}
      data-calendar-minute={slot.minute}
      className={`calendar-slot ${lunch ? 'calendar-slot--lunch' : ''} ${active && isOver ? 'calendar-slot--drop' : ''}`}
      disabled={occupied}
      onClick={onCreate}
      aria-label={
        active && isOver
          ? `Move here · ${timeInput(slot.minute)}, ${slot.date}`
          : `Plan ${slot.date} at ${timeInput(slot.minute)}${lunch ? ', lunch break' : ''}`
      }
    >
      {active && isOver ? (
        <span>Move here · {timeInput(slot.minute)}</span>
      ) : (
        lunch && <span>Lunch</span>
      )}
    </button>
  );
}

export function CalendarPlanBlock({
  plan,
  lane,
  laneCount,
  start,
  end,
  saving,
  onPlan,
  onResizePreview,
}: {
  readonly plan: Plan;
  readonly lane: number;
  readonly laneCount: number;
  readonly start: number;
  readonly end: number;
  readonly saving: boolean;
  readonly onPlan: (plan: Plan) => void;
  readonly onResizePreview: (id: string, interval: PlanInterval | null) => void;
}) {
  const resize = usePlanResize(plan, (interval) => onResizePreview(plan.id, interval));
  const interval = resize.interval;
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: calendarPlanId(plan.id),
    disabled: saving || resize.saving || resize.active,
  });
  return (
    <div
      ref={setNodeRef}
      className={`calendar-block ${isDragging ? 'calendar-block--dragging' : ''} ${resize.active ? 'calendar-block--resizing' : ''}`}
      data-calendar-plan={plan.id}
      style={{
        top: `${((Math.max(interval.startMinute, start) - start) / 30) * 3.5}rem`,
        height: `${((Math.min(interval.endMinute, end) - Math.max(interval.startMinute, start)) / 30) * 3.5}rem`,
        left: `calc(${(lane / laneCount) * 100}% + 3px)`,
        width: `calc(${100 / laneCount}% - 6px)`,
      }}
    >
      <button
        type="button"
        className="calendar-block-open"
        onClick={() => onPlan(plan)}
        title={`${plan.title} · ${timeInput(plan.startMinute)}–${timeInput(plan.endMinute)}`}
      >
        <strong>{plan.title}</strong>
        <span>
          {timeInput(interval.startMinute)}–{timeInput(interval.endMinute)}
        </span>
      </button>
      {(['start', 'end'] as const).map((edge) => (
        <button
          key={edge}
          type="button"
          className={`calendar-resize-handle calendar-resize-handle--${edge}`}
          aria-label={`Resize ${edge} of ${plan.title}`}
          aria-describedby={`calendar-resize-help-${plan.id}`}
          aria-pressed={resize.active}
          disabled={saving || resize.saving || isDragging}
          title={`Resize ${edge} · arrows change 30 minutes · Enter saves · Escape cancels`}
          onPointerDown={(event) => resize.pointerDown(event, edge)}
          onPointerMove={resize.pointerMove}
          onPointerUp={(event) => {
            event.stopPropagation();
            void resize.commit();
          }}
          onPointerCancel={resize.cancel}
          onLostPointerCapture={resize.lostCapture}
          onKeyDown={(event) => resize.keyDown(event, edge)}
          onBlur={() => {
            if (resize.active && !resize.saving) resize.cancel();
          }}
        >
          <span aria-hidden="true" />
        </button>
      ))}
      <span className="visually-hidden" id={`calendar-resize-help-${plan.id}`}>
        Arrow keys resize by 30 minutes. Enter saves. Escape cancels.
      </span>
      <span
        className={resize.active ? 'calendar-resize-feedback' : 'visually-hidden'}
        role="status"
      >
        {resize.message}
      </span>
      <button
        ref={setActivatorNodeRef}
        id={`calendar-handle-${plan.id}`}
        type="button"
        className="calendar-drag-handle"
        {...attributes}
        {...listeners}
        disabled={saving}
        aria-label={`Move plan ${plan.title}`}
        title="Drag to another time · Space then arrow keys to move"
      >
        <GripVertical size={17} aria-hidden="true" />
      </button>
    </div>
  );
}

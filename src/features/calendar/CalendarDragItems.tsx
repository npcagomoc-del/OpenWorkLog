import { useDraggable, useDroppable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import type { Plan } from '../../domain/models';
import { type CalendarSlot, calendarPlanId, calendarSlotId } from './calendarDrag';
import { timeInput } from './calendarLogic';

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
}: {
  readonly plan: Plan;
  readonly lane: number;
  readonly laneCount: number;
  readonly start: number;
  readonly end: number;
  readonly saving: boolean;
  readonly onPlan: (plan: Plan) => void;
}) {
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: calendarPlanId(plan.id),
    disabled: saving,
  });
  return (
    <div
      ref={setNodeRef}
      className={`calendar-block ${isDragging ? 'calendar-block--dragging' : ''}`}
      data-calendar-plan={plan.id}
      style={{
        top: `${((Math.max(plan.startMinute, start) - start) / 30) * 3.5}rem`,
        height: `${((Math.min(plan.endMinute, end) - Math.max(plan.startMinute, start)) / 30) * 3.5}rem`,
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
          {timeInput(plan.startMinute)}–{timeInput(plan.endMinute)}
        </span>
      </button>
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

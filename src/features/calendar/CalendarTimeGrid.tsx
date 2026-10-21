import { DndContext, DragOverlay } from '@dnd-kit/core';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Plan, Settings } from '../../domain/models';
import { todayKey } from '../../domain/time';
import { CalendarDropSlot, CalendarPlanBlock } from './CalendarDragItems';
import { calendarPlanId, useCalendarDrag } from './calendarDrag';
import type { PlanInterval } from './calendarResize';
import './calendarDrag.css';
import { parseDate, planLanes, plansForDate, timeInput } from './calendarLogic';

export function CalendarTimeGrid({
  dates,
  plans,
  settings,
  workHours,
  onSelect,
  onPlan,
  onCreate,
}: {
  readonly dates: readonly string[];
  readonly plans: readonly Plan[];
  readonly settings: Settings;
  readonly workHours: boolean;
  readonly onSelect: (date: string) => void;
  readonly onPlan: (plan: Plan) => void;
  readonly onCreate: (date: string, minute: number) => void;
}) {
  const [previews, setPreviews] = useState<ReadonlyMap<string, PlanInterval>>(new Map());
  function previewResize(id: string, interval: PlanInterval | null) {
    setPreviews((current) => {
      const next = new Map(current);
      if (interval) next.set(id, interval);
      else next.delete(id);
      return next;
    });
  }
  const today = todayKey(new Date(), settings.timezone);
  const start = workHours ? Math.floor(settings.workStart / 30) * 30 : 0;
  const end = workHours ? Math.ceil(settings.workEnd / 30) * 30 : 1440;
  const slots = Array.from({ length: (end - start) / 30 }, (_, index) => start + index * 30);
  const drag = useCalendarDrag({ dates, slots, plans });
  return (
    <DndContext
      sensors={drag.sensors}
      autoScroll={{ threshold: { x: 0.08, y: 0.08 } }}
      collisionDetection={drag.collisionDetection}
      onDragStart={drag.start}
      onDragCancel={drag.cancel}
      onDragEnd={(event) => void drag.finish(event)}
      onDragOver={(event) => drag.over(event.over?.id ?? null)}
      accessibility={{
        announcements: {
          onDragStart: ({ active }) =>
            `Picked up ${plans.find((plan) => calendarPlanId(plan.id) === active.id)?.title ?? 'plan'}.`,
          onDragOver: ({ over }) =>
            over ? drag.describe(over.id) : 'Outside the calendar. Drop to cancel.',
          onDragEnd: () => 'Move ended.',
          onDragCancel: () => 'Move cancelled. The plan stays at its previous time.',
        },
        screenReaderInstructions: {
          draggable:
            'To move this plan, press Space or Enter. Use up and down arrows for half-hour steps, left and right for another day. Press Space or Enter to save, or Escape to cancel.',
        },
      }}
    >
      <p className="calendar-drag-help small muted">
        {drag.active && drag.target
          ? `Move to ${drag.target.date} at ${timeInput(drag.target.minute)}`
          : 'Move with the grip. On touch, tap the grip to show resize edges. Drag an edge, or use Up/Down then Enter. Escape cancels.'}
      </p>
      <section
        className="calendar-time-scroll"
        aria-label="Calendar time grid"
        aria-busy={drag.saving}
      >
        <div
          className={`calendar-time-grid ${dates.length > 1 ? 'calendar-time-grid--week' : ''}`}
          style={{ gridTemplateColumns: `4rem repeat(${dates.length}, minmax(0, 1fr))` }}
        >
          <div className="calendar-time-corner">24h</div>
          {dates.map((date) => (
            <button
              type="button"
              key={date}
              className={`calendar-date-header ${date === today ? 'calendar-date-header--today' : ''}`}
              onClick={() => onSelect(date)}
            >
              <span>{parseDate(date).toLocaleDateString(undefined, { weekday: 'short' })}</span>
              <strong>{parseDate(date).getDate()}</strong>
            </button>
          ))}
          <div className="calendar-times">
            {slots.map((minute) => (
              <div key={minute}>{timeInput(minute)}</div>
            ))}
          </div>
          {dates.map((date) => {
            const positioned = planLanes(
              plansForDate(plans, date).filter(
                (plan) => plan.endMinute > start && plan.startMinute < end,
              ),
            );
            const laneCount = Math.max(1, ...positioned.map((item) => item.lane + 1));
            return (
              <div
                className="calendar-day-track"
                key={date}
                style={{ height: `${slots.length * 3.5}rem` }}
              >
                {slots.map((minute) => (
                  <CalendarDropSlot
                    key={minute}
                    slot={{ date, minute }}
                    lunch={minute < settings.lunchEnd && minute + 30 > settings.lunchStart}
                    active={drag.active !== null}
                    occupied={positioned.some(({ plan }) => {
                      const interval = previews.get(plan.id) ?? plan;
                      return interval.startMinute < minute + 30 && interval.endMinute > minute;
                    })}
                    onCreate={() => onCreate(date, minute)}
                  />
                ))}
                {positioned.map(({ plan, lane }) => (
                  <CalendarPlanBlock
                    key={plan.id}
                    plan={plan}
                    lane={lane}
                    laneCount={laneCount}
                    start={start}
                    end={end}
                    saving={drag.saving}
                    onPlan={onPlan}
                    onResizePreview={previewResize}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </section>
      {createPortal(
        <DragOverlay dropAnimation={null}>
          {drag.active && (
            <div className="calendar-drag-preview" aria-hidden="true">
              <strong>{drag.active.title}</strong>
              <span>
                {timeInput(drag.active.startMinute)}–{timeInput(drag.active.endMinute)}
              </span>
            </div>
          )}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  );
}

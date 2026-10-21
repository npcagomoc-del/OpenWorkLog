import {
  type CollisionDetection,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  type KeyboardCoordinateGetter,
  KeyboardSensor,
  MouseSensor,
  pointerWithin,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '../../components/ui';
import { actions } from '../../data/actions';
import type { Plan } from '../../domain/models';
import { timeInput } from './calendarLogic';

export type CalendarSlot = { readonly date: string; readonly minute: number };
export const calendarSlotId = (slot: CalendarSlot) => `calendar-slot:${slot.date}:${slot.minute}`;
export const calendarPlanId = (id: string) => `calendar-plan:${id}`;

export function useCalendarDrag(input: {
  readonly dates: readonly string[];
  readonly slots: readonly number[];
  readonly plans: readonly Plan[];
}) {
  const { dates, slots, plans } = input;
  const [active, setActive] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const [target, setTarget] = useState<CalendarSlot | null>(null);
  const keyboardTarget = useRef<CalendarSlot | null>(null);
  const keyboard = useRef(false);
  const focusTarget = useRef<{ readonly id: string; readonly slot: CalendarSlot } | null>(null);
  useEffect(() => {
    if (saving) return;
    const target = focusTarget.current;
    if (
      target &&
      plans.some(
        (plan) =>
          plan.id === target.id &&
          plan.date === target.slot.date &&
          plan.startMinute === target.slot.minute,
      )
    ) {
      document.getElementById(`calendar-handle-${target.id}`)?.focus();
      focusTarget.current = null;
    }
  }, [plans, saving]);
  const { toast } = useToast();
  const destinations = new Map(
    dates.flatMap((date) =>
      slots.map((minute) => {
        const slot = { date, minute };
        return [calendarSlotId(slot), slot] as const;
      }),
    ),
  );
  const coordinates: KeyboardCoordinateGetter = (event, { context }) => {
    const current = keyboardTarget.current;
    if (!current) return;
    const changes: Readonly<Record<string, readonly [number, number]>> = {
      ArrowUp: [0, -30],
      ArrowDown: [0, 30],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
    };
    const change = changes[event.code];
    if (!change) return;
    event.preventDefault();
    const date = dates[dates.indexOf(current.date) + change[0]];
    const minute = current.minute + change[1];
    if (!date || !slots.includes(minute)) return;
    const next = { date, minute };
    const node = context.droppableContainers.get(calendarSlotId(next))?.node.current;
    if (!node) return;
    keyboardTarget.current = next;
    setTarget(next);
    node.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    const rect = node.getBoundingClientRect();
    return { x: rect.left, y: rect.top };
  };
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: coordinates, scrollBehavior: 'auto' }),
  );
  const collisionDetection: CollisionDetection = (args) => {
    if (keyboard.current && keyboardTarget.current)
      return [{ id: calendarSlotId(keyboardTarget.current) }];
    return args.pointerCoordinates ? pointerWithin(args) : closestCenter(args);
  };
  function start(event: DragStartEvent) {
    const plan = plans.find((item) => calendarPlanId(item.id) === event.active.id);
    if (!plan) return;
    keyboard.current = event.activatorEvent instanceof KeyboardEvent;
    keyboardTarget.current = { date: plan.date, minute: Math.floor(plan.startMinute / 30) * 30 };
    setActive(plan);
  }
  function cancel() {
    setActive(null);
    setTarget(null);
    keyboardTarget.current = null;
    keyboard.current = false;
  }
  async function finish(event: DragEndEvent) {
    const plan = plans.find((item) => calendarPlanId(item.id) === event.active.id);
    const destination = keyboard.current
      ? keyboardTarget.current
      : event.over
        ? destinations.get(String(event.over.id))
        : undefined;
    const restoreFocus = keyboard.current;
    cancel();
    if (!plan || !destination) return;
    const endMinute = destination.minute + plan.endMinute - plan.startMinute;
    if (endMinute > 1440) {
      toast('This plan would end after midnight. Choose an earlier start.', 'error');
      return;
    }
    if (plan.date === destination.date && plan.startMinute === destination.minute) return;
    setSaving(true);
    try {
      await actions.updatePlan(plan.id, {
        date: destination.date,
        startMinute: destination.minute,
        endMinute,
      });
      if (restoreFocus) focusTarget.current = { id: plan.id, slot: destination };
      toast(
        `Moved to ${destination.date}, ${timeInput(destination.minute)}–${timeInput(endMinute)}.`,
      );
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not move this plan.', 'error');
    } finally {
      setSaving(false);
    }
  }
  return {
    active,
    saving,
    target,
    sensors,
    collisionDetection,
    start,
    cancel,
    finish,
    describe: (id: string | number) => {
      const slot = destinations.get(String(id));
      return slot ? `Target ${slot.date} at ${timeInput(slot.minute)}.` : 'Outside the calendar.';
    },
    over: (id: string | number | null) =>
      setTarget(id === null ? null : (destinations.get(String(id)) ?? null)),
  };
}

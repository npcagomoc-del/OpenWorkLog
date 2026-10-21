import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from 'react';
import { useToast } from '../../components/ui';
import { actions } from '../../data/actions';
import type { Plan } from '../../domain/models';
import { timeInput } from './calendarLogic';
import { type PlanInterval, type ResizeEdge, resizeInterval } from './calendarResize';

type ResizeSession = {
  readonly edge: ResizeEdge;
  readonly originY: number;
  readonly pixelsPerMinute: number;
};

export function usePlanResize(plan: Plan, onPreview: (interval: PlanInterval | null) => void) {
  const [preview, setPreview] = useState<PlanInterval | null>(null);
  const latest = useRef<PlanInterval | null>(null);
  const focusButton = useRef<HTMLButtonElement | null>(null);
  const session = useRef<ResizeSession | null>(null);
  const [saving, setSaving] = useState(false);
  const restoreFocus = useRef(false);
  useEffect(() => {
    if (!saving && restoreFocus.current) {
      focusButton.current?.focus();
      restoreFocus.current = false;
    }
  }, [saving]);
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  function update(interval: PlanInterval) {
    latest.current = interval;
    setPreview(interval);
    onPreview(interval);
    setMessage(
      `${timeInput(interval.startMinute)}–${timeInput(interval.endMinute)}, ${interval.endMinute - interval.startMinute} minutes. Enter saves; Escape cancels.`,
    );
  }
  function cancel() {
    latest.current = null;
    setPreview(null);
    onPreview(null);
    session.current = null;
    setMessage('Resize cancelled. Original planned time retained.');
  }
  async function commit() {
    const interval = latest.current;
    restoreFocus.current = true;
    session.current = null;
    if (
      !interval ||
      (interval.startMinute === plan.startMinute && interval.endMinute === plan.endMinute)
    ) {
      setPreview(null);
      onPreview(null);
      latest.current = null;
      return;
    }
    setSaving(true);
    try {
      await actions.updatePlan(plan.id, interval);
      setMessage(`Saved ${timeInput(interval.startMinute)}–${timeInput(interval.endMinute)}.`);
      toast(
        `Planned time updated: ${timeInput(interval.startMinute)}–${timeInput(interval.endMinute)}.`,
      );
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not resize this plan.', 'error');
    } finally {
      latest.current = null;
      setPreview(null);
      onPreview(null);
      setSaving(false);
    }
  }
  function pointerDown(event: PointerEvent<HTMLButtonElement>, edge: ResizeEdge) {
    if (event.button !== 0 || saving) return;
    event.stopPropagation();
    const track = event.currentTarget.closest('.calendar-day-track');
    const slot = track?.querySelector('.calendar-slot');
    if (!slot) return;
    focusButton.current = event.currentTarget;
    event.currentTarget.setPointerCapture(event.pointerId);
    session.current = {
      edge,
      originY: event.clientY,
      pixelsPerMinute: slot.getBoundingClientRect().height / 30,
    };
    update(plan);
  }
  function pointerMove(event: PointerEvent<HTMLButtonElement>) {
    const current = session.current;
    if (!current || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    update(
      resizeInterval(plan, {
        edge: current.edge,
        minute:
          (current.edge === 'start' ? plan.startMinute : plan.endMinute) +
          (event.clientY - current.originY) / current.pixelsPerMinute,
      }),
    );
  }
  function keyDown(event: KeyboardEvent<HTMLButtonElement>, edge: ResizeEdge) {
    if (saving) return;
    focusButton.current = event.currentTarget;
    event.stopPropagation();
    if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (latest.current) void commit();
      else update(plan);
      return;
    }
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    const current = latest.current ?? plan;
    update(
      resizeInterval(current, {
        edge,
        minute:
          (edge === 'start' ? current.startMinute : current.endMinute) +
          (event.key === 'ArrowDown' ? 30 : -30),
      }),
    );
  }
  return {
    interval: preview ?? plan,
    active: preview !== null,
    saving,
    message,
    pointerDown,
    pointerMove,
    keyDown,
    cancel,
    commit,
    lostCapture: () => {
      if (session.current) cancel();
    },
  };
}

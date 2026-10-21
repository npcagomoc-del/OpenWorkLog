import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import type { InkDocument, InkPoint, InkStroke } from '../../domain/ink';
import { eraseAt, paintInk, pointFromClient } from './inkGeometry';

type Props = {
  readonly ink: InkDocument;
  readonly onCommit: (ink: InkDocument) => void;
  readonly tool: 'pen' | 'eraser';
  readonly color: string;
  readonly width: number;
  readonly finger: boolean;
  readonly expanded: boolean;
};
type Gesture = {
  readonly pointer: number;
  readonly before: InkDocument;
  readonly stroke: InkStroke;
  drawing: InkDocument;
};
export function InkCanvas({ ink, onCommit, tool, color, width, finger, expanded }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const active = useRef<Gesture | null>(null);
  const latest = useRef(ink);
  const commit = useRef(onCommit);
  const frame = useRef(0);
  const [limit, setLimit] = useState('');
  latest.current = ink;
  commit.current = onCommit;
  const redraw = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      if (canvas.current) paintInk(canvas.current, active.current?.drawing ?? latest.current);
    });
  }, []);
  useEffect(() => {
    latest.current = ink;
    active.current = null;
    redraw();
  }, [ink, redraw]);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const observer = new ResizeObserver(redraw);
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame.current);
      const gesture = active.current;
      if (gesture && gesture.drawing !== gesture.before) commit.current(gesture.drawing);
    };
  }, [redraw]);
  function point(event: PointerEvent<HTMLCanvasElement>): InkPoint {
    return pointFromClient(
      event.clientX,
      event.clientY,
      event.pressure,
      event.currentTarget.getBoundingClientRect(),
      ink.width,
      ink.height,
    );
  }
  function append(sample: InkPoint) {
    const gesture = active.current;
    if (!gesture) return;
    if (tool === 'eraser') {
      const strokes = eraseAt(gesture.drawing.strokes, sample, 14);
      if (strokes.length !== gesture.drawing.strokes.length)
        gesture.drawing = { ...gesture.drawing, strokes };
    } else {
      const total = gesture.before.strokes.reduce((sum, stroke) => sum + stroke.points.length, 0);
      if (gesture.stroke.points.length >= 10000 || total + gesture.stroke.points.length >= 100000) {
        setLimit('This page reached its point limit. Start another note to keep writing.');
        return;
      }
      const previous = gesture.stroke.points.at(-1);
      if (previous && Math.hypot(sample.x - previous.x, sample.y - previous.y) < 0.8) return;
      gesture.stroke.points.push(sample);
      gesture.drawing = { ...gesture.before, strokes: [...gesture.before.strokes, gesture.stroke] };
    }
    redraw();
  }
  function start(event: PointerEvent<HTMLCanvasElement>) {
    if (active.current || (event.pointerType === 'touch' && !finger) || event.button > 0) return;
    if (tool === 'pen' && ink.strokes.length >= 2000) {
      setLimit('This page reached 2,000 strokes. Start another note to keep writing.');
      return;
    }
    event.preventDefault();
    setLimit('');
    active.current = {
      pointer: event.pointerId,
      before: ink,
      drawing: ink,
      stroke: { id: crypto.randomUUID(), color, width, points: [] },
    };
    if (event.nativeEvent.isTrusted) event.currentTarget.setPointerCapture(event.pointerId);
    append(point(event));
  }
  function move(event: PointerEvent<HTMLCanvasElement>) {
    if (active.current?.pointer !== event.pointerId) return;
    event.preventDefault();
    const coalesced = event.nativeEvent.getCoalescedEvents?.() ?? [];
    for (const sample of coalesced)
      append(
        pointFromClient(
          sample.clientX,
          sample.clientY,
          sample.pressure,
          event.currentTarget.getBoundingClientRect(),
          ink.width,
          ink.height,
        ),
      );
    append(point(event));
  }
  function finish(event: PointerEvent<HTMLCanvasElement>, cancel: boolean) {
    const gesture = active.current;
    if (!gesture || gesture.pointer !== event.pointerId) return;
    if (!cancel) append(point(event));
    active.current = null;
    if (!cancel && gesture.drawing !== gesture.before) onCommit(gesture.drawing);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    redraw();
  }
  return (
    <div className="ink-paper-wrap">
      <canvas
        ref={canvas}
        className="ink-paper"
        aria-label="Handwriting canvas"
        style={{
          aspectRatio: `${ink.width} / ${ink.height}`,
          width: expanded ? `max(100%, calc(100cqh * ${ink.width / ink.height}))` : '100%',
          touchAction: finger ? 'none' : 'pan-x pan-y pinch-zoom',
        }}
        onPointerEnter={(event) => {
          if (active.current) return;
          event.currentTarget.style.touchAction =
            event.pointerType === 'pen' || finger ? 'none' : 'pan-x pan-y pinch-zoom';
        }}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={(event) => finish(event, false)}
        onPointerCancel={(event) => finish(event, true)}
        onLostPointerCapture={(event) => finish(event, true)}
      >
        Handwriting is a drawing. Use the typed Study notes field for a text description or keyboard
        entry.
      </canvas>
      {limit && (
        <p role="status" className="small">
          {limit}
        </p>
      )}
    </div>
  );
}


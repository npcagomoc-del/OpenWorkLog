import type { InkDocument, InkPoint, InkStroke } from '../../domain/ink';

export function blankInk(): InkDocument {
  return { version: 1, width: 1200, height: 900, strokes: [] };
}
export function pointFromClient(
  x: number,
  y: number,
  pressure: number,
  bounds: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
  width: number,
  height: number,
): InkPoint {
  return {
    x:
      Math.round(Math.max(0, Math.min(width, ((x - bounds.left) * width) / bounds.width)) * 100) /
      100,
    y:
      Math.round(Math.max(0, Math.min(height, ((y - bounds.top) * height) / bounds.height)) * 100) /
      100,
    pressure: pressure > 0 ? Math.min(1, pressure) : 0.5,
  };
}
function distanceToSegment(point: InkPoint, start: InkPoint, end: InkPoint): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = dx * dx + dy * dy;
  const fraction =
    length === 0
      ? 0
      : Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / length));
  return Math.hypot(point.x - start.x - fraction * dx, point.y - start.y - fraction * dy);
}
export function eraseAt(
  strokes: readonly InkStroke[],
  point: InkPoint,
  radius: number,
): InkStroke[] {
  return strokes.filter(
    (stroke) =>
      !stroke.points.some((end, index) => {
        const start = stroke.points[index - 1] ?? end;
        return distanceToSegment(point, start, end) <= radius + stroke.width / 2;
      }),
  );
}
export function paintInk(canvas: HTMLCanvasElement, ink: InkDocument): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  const bounds = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 3);
  canvas.width = Math.max(1, Math.round(bounds.width * ratio));
  canvas.height = Math.max(1, Math.round(bounds.height * ratio));
  context.scale(canvas.width / ink.width, canvas.height / ink.height);
  context.lineCap = 'round';
  context.lineJoin = 'round';
  for (const stroke of ink.strokes) {
    context.fillStyle = stroke.color;
    context.strokeStyle = stroke.color;
    for (const [index, point] of stroke.points.entries()) {
      const previous = stroke.points[index - 1];
      const width = stroke.width * (0.35 + point.pressure * 1.3);
      context.beginPath();
      if (previous) {
        context.lineWidth = width;
        context.moveTo(previous.x, previous.y);
        context.lineTo(point.x, point.y);
        context.stroke();
      } else {
        context.arc(point.x, point.y, width / 2, 0, Math.PI * 2);
        context.fill();
      }
    }
  }
}

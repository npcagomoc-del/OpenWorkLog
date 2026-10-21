import { describe, expect, it } from 'vitest';
import { resizeInterval } from './calendarResize';

describe('calendar duration boundaries', () => {
  const interval = { startMinute: 540, endMinute: 600 };
  it('snaps either edge while retaining the opposite edge', () => {
    expect(resizeInterval(interval, { edge: 'end', minute: 644 })).toEqual({
      startMinute: 540,
      endMinute: 630,
    });
    expect(resizeInterval(interval, { edge: 'start', minute: 508 })).toEqual({
      startMinute: 510,
      endMinute: 600,
    });
  });
  it('keeps snapping when the untouched edge was entered between grid lines', () => {
    expect(
      resizeInterval({ startMinute: 545, endMinute: 615 }, { edge: 'start', minute: 610 })
        .startMinute,
    ).toBe(570);
    expect(
      resizeInterval({ startMinute: 545, endMinute: 615 }, { edge: 'end', minute: 540 }).endMinute,
    ).toBe(600);
  });
  it('clamps to the day and keeps at least a half-hour interval', () => {
    expect(resizeInterval(interval, { edge: 'start', minute: -90 }).startMinute).toBe(0);
    expect(resizeInterval(interval, { edge: 'end', minute: 1500 }).endMinute).toBe(1440);
    expect(resizeInterval(interval, { edge: 'start', minute: 700 }).startMinute).toBe(570);
    expect(resizeInterval(interval, { edge: 'end', minute: 100 }).endMinute).toBe(570);
  });
});

import { describe, expect, it } from 'vitest';
import type { Plan } from '../../domain/models';
import { calendarDates, navigateDate, parseTime, planLanes, timeInput } from './calendarLogic';

function plan(id: string, startMinute: number, endMinute: number): Plan {
  return {
    id,
    title: id,
    date: '2026-10-21',
    startMinute,
    endMinute,
    taskId: null,
    projectId: null,
    categoryId: null,
    notes: '',
    demo: false,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
  };
}
describe('calendar boundaries', () => {
  it('clamps month navigation at month end without skipping February', () => {
    expect(navigateDate('2026-01-31', 'month', 1)).toBe('2026-02-28');
    expect(navigateDate('2024-01-31', 'month', 1)).toBe('2024-02-29');
    expect(navigateDate('2026-03-31', 'month', -1)).toBe('2026-02-28');
  });
  it('respects Monday and Sunday week starts across year boundaries', () => {
    expect(calendarDates('2026-01-01', 'week', 1)).toEqual([
      '2025-12-29',
      '2025-12-30',
      '2025-12-31',
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
      '2026-01-04',
    ]);
    expect(calendarDates('2026-01-01', 'week', 0)[0]).toBe('2025-12-28');
    expect(calendarDates('2026-02-01', 'month', 1)).toHaveLength(42);
  });
  it('puts overlapping plans in separate lanes and reuses a free lane', () => {
    const result = planLanes([plan('a', 480, 540), plan('b', 510, 570), plan('c', 540, 600)]);
    expect(result.map((item) => [item.plan.id, item.lane])).toEqual([
      ['a', 0],
      ['b', 1],
      ['c', 0],
    ]);
  });
  it('represents midnight end without losing the final half-hour', () => {
    expect(timeInput(1440)).toBe('24:00');
    expect(parseTime('23:30')).toBe(1410);
  });
});

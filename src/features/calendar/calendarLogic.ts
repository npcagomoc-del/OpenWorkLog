import type { Plan } from '../../domain/models';

export type CalendarView = 'day' | 'week' | 'month';
export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function parseDate(key: string): Date {
  return new Date(`${key}T12:00:00`);
}
export function shiftDate(key: string, days: number): string {
  const date = parseDate(key);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}
export function navigateDate(key: string, view: CalendarView, direction: number): string {
  if (view !== 'month') return shiftDate(key, direction * (view === 'week' ? 7 : 1));
  const date = parseDate(key);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + direction);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, last));
  return dateKey(date);
}
export function calendarDates(key: string, view: CalendarView, weekStartsOn: 0 | 1): string[] {
  if (view === 'day') return [key];
  const date = parseDate(key);
  if (view === 'month') date.setDate(1);
  const offset = (date.getDay() - weekStartsOn + 7) % 7;
  const first = shiftDate(dateKey(date), -offset);
  return Array.from({ length: view === 'week' ? 7 : 42 }, (_, index) => shiftDate(first, index));
}
export function timeInput(minute: number): string {
  return `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
}
export function parseTime(value: string): number {
  const [hours = '0', minutes = '0'] = value.split(':');
  return Number(hours) * 60 + Number(minutes);
}
export function plansForDate(plans: readonly Plan[], date: string): Plan[] {
  return plans
    .filter((plan) => plan.date === date)
    .sort(
      (left, right) => left.startMinute - right.startMinute || left.endMinute - right.endMinute,
    );
}
export function planLanes(plans: readonly Plan[]) {
  const ends: number[] = [];
  return [...plans]
    .sort((left, right) => left.startMinute - right.startMinute)
    .map((plan) => {
      let lane = ends.findIndex((end) => end <= plan.startMinute);
      if (lane < 0) lane = ends.length;
      ends[lane] = plan.endMinute;
      return { plan, lane };
    });
}

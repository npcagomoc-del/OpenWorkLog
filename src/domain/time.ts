import type { DailyEntry, Timer } from './models';
export type Allocation = { readonly slot: number; readonly minutes: number };
export function todayKey(now = new Date(), timezone = 'Asia/Manila'): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}
export function minuteLabel(minute: number): string {
  return `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
}
export function formatDuration(minutes: number): string {
  if (minutes > 0 && minutes < 1) return minutes * 60 < 1 ? '<1s' : `${Math.floor(minutes * 60)}s`;
  const value = Math.round(minutes);
  return value < 60
    ? `${value}m`
    : `${Math.floor(value / 60)}h${value % 60 ? ` ${value % 60}m` : ''}`;
}
export function allocateMinutes(startMinute: number, endMinute: number): Allocation[] {
  const result: Allocation[] = [];
  for (let cursor = Math.max(0, startMinute); cursor < Math.min(1440, endMinute); ) {
    const slot = Math.floor(cursor / 30);
    const end = Math.min((slot + 1) * 30, endMinute, 1440);
    result.push({ slot, minutes: end - cursor });
    cursor = end;
  }
  return result;
}
export function entryAllocations(entry: DailyEntry): Allocation[] {
  if (entry.isLunch) return [];
  const segments =
    entry.actualSegments ??
    (entry.actualStart !== null && entry.actualEnd !== null
      ? [{ startMinute: entry.actualStart, endMinute: entry.actualEnd }]
      : []);
  const slots = new Map<number, number>();
  for (const segment of segments)
    for (const a of allocateMinutes(segment.startMinute, segment.endMinute))
      slots.set(a.slot, (slots.get(a.slot) ?? 0) + a.minutes);
  return [...slots].map(([slot, minutes]) => ({ slot, minutes }));
}
export function entryMinutes(entry: DailyEntry): number {
  return entryAllocations(entry).reduce((sum, a) => sum + a.minutes, 0);
}
export function timerElapsedSeconds(timer: Timer, now = new Date()): number {
  return timer.segments.reduce(
    (sum, segment) =>
      sum +
      Math.max(
        0,
        ((segment.end ? new Date(segment.end) : now).getTime() -
          new Date(segment.start).getTime()) /
          1000,
      ),
    0,
  );
}
export function localMinute(date: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  return (
    Number(parts.find((p) => p.type === 'hour')?.value ?? 0) * 60 +
    Number(parts.find((p) => p.type === 'minute')?.value ?? 0)
  );
}

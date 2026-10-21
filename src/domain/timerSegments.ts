import type { Timer } from './models';
export type ActiveSegment = { readonly startMinute: number; readonly endMinute: number };
export function timerSegmentsByDate(timer: Timer, timezone: string): Map<string, ActiveSegment[]> {
  const dates = new Map<string, ActiveSegment[]>();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  for (const segment of timer.segments) {
    const end = Date.parse(segment.end ?? new Date().toISOString());
    let cursor = Date.parse(segment.start);
    while (cursor < end) {
      const at = new Date(cursor);
      const parts = formatter.formatToParts(at);
      const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '00';
      const date = `${get('year')}-${get('month')}-${get('day')}`;
      const startMinute =
        Number(get('hour')) * 60 +
        Number(get('minute')) +
        at.getUTCSeconds() / 60 +
        at.getUTCMilliseconds() / 60000;
      const finish = Math.min(end, (Math.floor(cursor / 60000) + 1) * 60000);
      const endMinute = startMinute + (finish - cursor) / 60000;
      // Merge adjacent minute slices; offset changes and pauses keep separate segments.
      const values = dates.get(date) ?? [];
      const previous = values.at(-1);
      if (previous && Math.abs(previous.endMinute - startMinute) < 0.0000001)
        values.splice(values.length - 1, 1, { startMinute: previous.startMinute, endMinute });
      else values.push({ startMinute, endMinute });
      dates.set(date, values);
      cursor = finish;
    }
  }
  return dates;
}

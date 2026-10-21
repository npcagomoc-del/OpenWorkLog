import type { DailyEntry, Plan } from '../../domain/models';
import { entryMinutes } from '../../domain/time';

export type ActivityBucket = {
  readonly from: string;
  readonly to: string;
  readonly actual: number;
  readonly planned: number;
};
const DAY = 86_400_000;
export function activityBuckets(
  entries: readonly DailyEntry[],
  plans: readonly Plan[],
  range: { readonly from: string; readonly to: string },
): ActivityBucket[] {
  const start = Date.parse(`${range.from}T00:00:00Z`);
  const days = Math.floor((Date.parse(`${range.to}T00:00:00Z`) - start) / DAY) + 1;
  if (!Number.isFinite(days) || days < 1) return [];
  const bucketDays = Math.ceil(days / 14);
  const result: ActivityBucket[] = [];
  const date = (offset: number) => new Date(start + offset * DAY).toISOString().slice(0, 10);
  for (let offset = 0; offset < days; offset += bucketDays) {
    const from = date(offset);
    const to = date(Math.min(days - 1, offset + bucketDays - 1));
    const inBucket = (value: string) => value >= from && value <= to;
    result.push({
      from,
      to,
      actual: entries
        .filter((entry) => inBucket(entry.date))
        .reduce((sum, entry) => sum + entryMinutes(entry), 0),
      planned:
        plans
          .filter((plan) => inBucket(plan.date))
          .reduce((sum, plan) => sum + plan.endMinute - plan.startMinute, 0) +
        entries
          .filter((entry) => inBucket(entry.date) && !entry.planId)
          .reduce(
            (sum, entry) =>
              sum +
              (entry.plannedStart !== null && entry.plannedEnd !== null
                ? entry.plannedEnd - entry.plannedStart
                : 0),
            0,
          ),
    });
  }
  return result;
}

export type PlanInterval = { readonly startMinute: number; readonly endMinute: number };
export type ResizeEdge = 'start' | 'end';

export function resizeInterval(
  interval: PlanInterval,
  change: { readonly edge: ResizeEdge; readonly minute: number },
): PlanInterval {
  const snapped = Math.round(change.minute / 30) * 30;
  return change.edge === 'start'
    ? {
        startMinute: Math.max(
          0,
          Math.min(snapped, Math.floor((interval.endMinute - 30) / 30) * 30),
        ),
        endMinute: interval.endMinute,
      }
    : {
        startMinute: interval.startMinute,
        endMinute: Math.min(
          1440,
          Math.max(snapped, Math.ceil((interval.startMinute + 30) / 30) * 30),
        ),
      };
}

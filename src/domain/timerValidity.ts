type Timeline = {
  readonly state: 'running' | 'paused' | 'review';
  readonly entryId: string | null;
  readonly segments: readonly { readonly start: string; readonly end: string | null }[];
};
export function validTimerTimeline(timer: Timeline): boolean {
  if (timer.entryId !== null && timer.state !== 'review') return false;
  if (
    timer.segments.filter((segment) => segment.end === null).length !==
    (timer.state === 'running' ? 1 : 0)
  )
    return false;
  return timer.segments.every((segment, index) => {
    if (segment.end === null && index !== timer.segments.length - 1) return false;
    const previous = timer.segments[index - 1];
    return (
      !previous || (previous.end !== null && Date.parse(previous.end) <= Date.parse(segment.start))
    );
  });
}

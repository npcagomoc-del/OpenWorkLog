import { Play, Plus } from 'lucide-react';
import { IconButton, StatusBadge } from '../../components/ui';
import type { DailyEntry, Settings } from '../../domain/models';
import { entryMinutes, formatDuration, minuteLabel } from '../../domain/time';

type Props = { readonly entries: readonly DailyEntry[]; readonly settings: Settings; readonly workHours: boolean; readonly onAdd: (minute: number) => void; readonly onEdit: (entry: DailyEntry) => void; readonly onStart: (entry: DailyEntry) => void; readonly timerActive: boolean };
function bounds(entry: DailyEntry): readonly [number, number] | null {
  if (entry.actualSegments?.length) return [
    Math.min(...entry.actualSegments.map(segment => segment.startMinute)),
    Math.max(...entry.actualSegments.map(segment => segment.endMinute)),
  ];
  if (entry.actualStart !== null && entry.actualEnd !== null) return [entry.actualStart, entry.actualEnd];
  return entry.plannedStart !== null && entry.plannedEnd !== null ? [entry.plannedStart, entry.plannedEnd] : null;
}
function segmentClock(minute: number): string {
  const seconds = Math.round(minute * 60);
  return minute % 1 === 0 ? minuteLabel(minute) : `${minuteLabel(Math.floor(minute))}:${String(seconds % 60).padStart(2, '0')}`;
}
function actualLabel(entry: DailyEntry): string {
  const segments = entry.actualSegments;
  if (segments?.length) return segments.map(segment => `${segmentClock(segment.startMinute)}–${segmentClock(segment.endMinute)}`).join(', ');
  return entry.actualStart !== null && entry.actualEnd !== null ? `${minuteLabel(entry.actualStart)}–${minuteLabel(entry.actualEnd)}` : 'Not recorded';
}
export function DailyTimeline({ entries, settings, workHours, onAdd, onEdit, onStart, timerActive }: Props) {
  const slots = Array.from({ length: 48 }, (_, slot) => slot).filter(slot => !workHours || (slot * 30 < settings.workEnd && slot * 30 + 30 > settings.workStart));
  const firstSlot = slots[0] ?? 0;
  const lastSlot = (slots.at(-1) ?? 47) + 1;
  const laneEnds: number[] = [];
  const blocks = entries.flatMap(entry => {
    const interval = bounds(entry);
    if (!interval || interval[1] <= firstSlot * 30 || interval[0] >= lastSlot * 30) return [];
    return [{ entry, start: Math.max(firstSlot, Math.floor(interval[0] / 30)), end: Math.min(lastSlot, Math.ceil(interval[1] / 30)) }];
  }).sort((a, b) => a.start - b.start || a.end - b.end).map(block => {
    const free = laneEnds.findIndex(end => end <= block.start);
    const lane = free < 0 ? laneEnds.length : free;
    laneEnds[lane] = block.end;
    return { ...block, lane };
  });
  return <section className="daily-timeline" aria-label={`${workHours ? 'Work hours' : 'Full day'} daily timeline`}>
    <div className="timeline-heading"><span>Time</span><span>Planned & actual activities · saved work</span></div>
    <div className="daily-span-grid" style={{ gridTemplateRows: `repeat(${slots.length}, minmax(4.5rem, auto))`, gridTemplateColumns: `5.5rem repeat(${Math.max(1, laneEnds.length)}, minmax(0, 1fr))` }}>
      {slots.map((slot, index) => <div key={slot} className={`daily-grid-slot ${slot * 30 < settings.lunchEnd && slot * 30 + 30 > settings.lunchStart ? 'daily-grid-slot--lunch' : ''}`} data-slot={slot} style={{ gridRow: index + 1, gridColumn: '1 / -1' }}>
        <div className="daily-slot-time"><time>{minuteLabel(slot * 30)}</time><IconButton label={`Add activity at ${minuteLabel(slot * 30)}`} onClick={() => onAdd(slot * 30)}><Plus size={14} /></IconButton></div>
      </div>)}
      {blocks.map(({ entry, start, end, lane }) => <article key={entry.id} className="daily-activity-block" style={{ gridRow: `${start - firstSlot + 1} / ${end - firstSlot + 1}`, gridColumn: lane + 2 }}>
        <div className="daily-activity-title"><button type="button" onClick={() => onEdit(entry)} aria-label={`Edit ${entry.title} at ${minuteLabel(start * 30)}`} title={entry.title}>{entry.title}</button>{!entry.isLunch && <IconButton disabled={timerActive} onClick={() => onStart(entry)} label={`Start timer for ${entry.title}`}><Play size={14} /></IconButton>}</div>
        <div className="daily-activity-meta">{!entry.isLunch && <StatusBadge status={entry.status} />}<span>{entry.businessUnit || 'Unassigned'}</span></div>
        <p className="small muted">Planned: {entry.plannedStart !== null && entry.plannedEnd !== null ? `${minuteLabel(entry.plannedStart)}–${minuteLabel(entry.plannedEnd)}` : 'Not scheduled'}</p>
        <p className="small">Actual: {actualLabel(entry)}{entry.actualStart !== null && <> · {entry.isLunch ? 'Break' : `${formatDuration(entryMinutes(entry))} active · saved`}</>}</p>
        {(entry.actualSegments?.length ?? 0) > 1 && <p className="small muted">Gaps between actual intervals are excluded.</p>}
        {entry.workDone && <p className="small daily-activity-work">{entry.workDone}</p>}
      </article>)}
    </div>
  </section>;
}

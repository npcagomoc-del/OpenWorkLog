import { Play, Plus } from 'lucide-react';
import { Button, StatusBadge } from '../../components/ui';
import type { DailyEntry, Settings } from '../../domain/models';
import { allocateMinutes, entryAllocations, formatDuration, minuteLabel } from '../../domain/time';

type Props = { readonly entries: readonly DailyEntry[]; readonly settings: Settings; readonly workHours: boolean; readonly onAdd: (minute: number) => void; readonly onEdit: (entry: DailyEntry) => void; readonly onStart: (entry: DailyEntry) => void; readonly timerActive: boolean };
export function DailyTimeline({ entries, settings, workHours, onAdd, onEdit, onStart, timerActive }: Props) {
  const slots = Array.from({ length: 48 }, (_, slot) => slot).filter(slot => !workHours || (slot * 30 < settings.workEnd && slot * 30 + 30 > settings.workStart));
  const rows = entries.map(entry => ({ entry, actual: entryAllocations(entry), planned: entry.plannedStart !== null && entry.plannedEnd !== null ? allocateMinutes(entry.plannedStart, entry.plannedEnd) : [], lunch: entry.isLunch && entry.actualStart !== null && entry.actualEnd !== null ? allocateMinutes(entry.actualStart, entry.actualEnd) : [] }));
  return <section className="daily-timeline" aria-label={`${workHours ? 'Work hours' : 'Full day'} daily timeline`}>
    <div className="timeline-heading"><span>Time</span><span>Activity & work done</span><span>Actual</span></div>
    {slots.map(slot => {
      const start = slot * 30;
      const isLunch = start < settings.lunchEnd && start + 30 > settings.lunchStart;
      const items = rows.filter(row => row.actual.some(part => part.slot === slot) || row.planned.some(part => part.slot === slot) || row.lunch.some(part => part.slot === slot));
      return <div key={slot} className={`timeline-row ${isLunch ? 'timeline-row--lunch' : ''}`} data-slot={slot}>
        <div className="timeline-time"><time>{minuteLabel(start)}</time><span>{minuteLabel(start + 30)}</span></div>
        <div className="timeline-activities">{items.length ? items.map(({ entry, actual }) => {
          const allocation = actual.find(part => part.slot === slot);
          return <div className="timeline-item" key={entry.id}><div className="stack"><button type="button" className="timeline-entry" onClick={() => onEdit(entry)} key={entry.id} aria-label={`Edit ${entry.title} at ${minuteLabel(start)}`}><div className="split"><strong>{entry.title}</strong>{!entry.isLunch && <StatusBadge status={entry.status} />}</div><span className="small muted">{entry.workDone || (entry.isLunch ? 'Excluded from productive time' : 'Add work done or review details')}</span><span className="timeline-mobile-duration">{allocation ? formatDuration(allocation.minutes) : entry.isLunch ? 'Break' : 'Planned'}</span></button>{!entry.isLunch && <div className="timeline-entry-actions"><Button size="sm" variant="ghost" disabled={timerActive} onClick={() => onStart(entry)} aria-label={`Start timer for ${entry.title} at ${minuteLabel(start)}`}><Play size={14} />Start timer</Button></div>}</div><span className="timeline-minutes">{allocation ? formatDuration(allocation.minutes) : entry.isLunch ? 'Break' : 'Planned'}</span></div>;
        }) : <Button className="empty-slot" variant="ghost" onClick={() => onAdd(start)} aria-label={`${isLunch ? 'Lunch / break' : 'Add activity'} at ${minuteLabel(start)}`}><Plus size={14} />{isLunch ? 'Lunch / break' : 'Add activity'}</Button>}</div>

      </div>;
    })}
  </section>;
}





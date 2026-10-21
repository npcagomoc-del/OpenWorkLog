import { useState } from 'react';
import { z } from 'zod';
import { useSearchParams } from 'react-router-dom';
import { CalendarDays, ChevronLeft, ChevronRight, Download, Plus, Trash2 } from 'lucide-react';
import { Button, Card, ConfirmDialog, IconButton, Notice, PageHeader, SegmentedControl, StatusBadge, useToast } from '../../components/ui';
import { actions } from '../../data/actions';
import { exportDailyCsv } from '../../data/csv';
import { saveTimerEntry, timerEntryDraft } from '../../data/timers';
import { useWorkspace } from '../../data/useWorkspace';
import type { DailyEntry, DailyEntryCreateInput } from '../../domain/models';
import { entryMinutes, formatDuration, todayKey } from '../../domain/time';
import { downloadText } from '../../lib/download';
import { blankEntry, errorMessage } from './entryForm';
import { DailyTimeline } from './DailyTimeline';
import { EntryEditor } from './EntryEditor';
import { TimerCard } from './TimerCard';
import './daily.css';

type Editor = { readonly input: DailyEntryCreateInput; readonly id: string | null };
export default function DailyPage() {
  const workspace = useWorkspace();
  const [params, setParams] = useSearchParams();
  const dateInput = z.iso.date().safeParse(params.get('date'));
  const date = dateInput.success ? dateInput.data : todayKey(new Date(), workspace.settings.timezone);
  const [view, setView] = useState<'work' | 'full'>('work');
  const [editor, setEditor] = useState<Editor | null>(null);
  const [dismissedReview, setDismissedReview] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<DailyEntry | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const entries = workspace.dailyEntries.filter(entry => entry.date === date);
  const productive = entries.reduce((total, entry) => total + entryMinutes(entry), 0);
  const timer = workspace.timers.find(item => item.entryId === null);
  const review = timer?.state === 'review' && timer.id !== dismissedReview ? timer : undefined;
  const queryEntry = workspace.dailyEntries.find(entry => entry.id === params.get('entry'));
  const currentEditor = editor ?? (queryEntry ? { input: queryEntry, id: queryEntry.id } : null);
  const unscheduled = entries.filter(entry => entry.actualStart === null && entry.plannedStart === null);
  function changeDate(value: string) { if (value) setParams({ date: value }); }
  function shiftDate(amount: number) { const value = new Date(`${date}T12:00:00Z`); value.setUTCDate(value.getUTCDate() + amount); changeDate(value.toISOString().slice(0, 10)); }
  function closeEditor() { setEditor(null); if (params.has('entry')) setParams({ date }); }
  async function removeEntry() {
    if (!deleting) return;
    setBusy(true); setError('');
    try { await actions.deleteDailyEntry(deleting.id); setDeleting(null); toast('Entry deleted.'); } catch (caught) { setError(errorMessage(caught)); } finally { setBusy(false); }
  }
  return <div className="page-stack">
    <PageHeader eyebrow="Your working day" title="Daily log" description="Plan your time. Keep a clear record of the work you did." actions={<><Button onClick={() => { downloadText(`daily-log-${date}.csv`, exportDailyCsv(workspace, date), 'text/csv;charset=utf-8'); toast('Daily CSV downloaded.'); }}><Download size={16} />Export CSV</Button><Button variant="primary" onClick={() => setEditor({ input: blankEntry(date), id: null })}><Plus size={18} />Add entry</Button></>} />
    {error && <Notice tone="error">{error}</Notice>}
    {entries.some(entry => entry.demo) && <Notice>Demo entries are included in this day. Remove demo data in Settings when you are ready.</Notice>}
    <TimerCard workspace={workspace} timer={timer} onReview={() => setDismissedReview(null)} />
    <div className="daily-summary"><Card className="card-pad"><span className="eyebrow">Daily tasks</span><strong>{entries.filter(entry => !entry.isLunch).length}</strong><span className="small muted">Entries for this date</span></Card><Card className="card-pad"><span className="eyebrow">Productive time</span><strong>{formatDuration(productive)}</strong><span className="small muted">Actual work · breaks excluded</span></Card><Card className="card-pad"><span className="eyebrow">Closed entries</span><strong>{entries.filter(entry => !entry.isLunch && entry.status === 'Closed').length}</strong><span className="small muted">Daily entry status</span></Card></div>
    <Card>
      <div className="split daily-toolbar"><div className="cluster"><IconButton label="Previous day" onClick={() => shiftDate(-1)}><ChevronLeft size={18} /></IconButton><label className="date-control"><CalendarDays size={18} aria-hidden="true" /><span className="visually-hidden">Daily log date</span><input aria-label="Daily log date" type="date" value={date} onChange={event => changeDate(event.target.value)} /></label><IconButton label="Next day" onClick={() => shiftDate(1)}><ChevronRight size={18} /></IconButton><Button size="sm" variant="ghost" onClick={() => changeDate(todayKey(new Date(), workspace.settings.timezone))}>Today</Button></div><SegmentedControl label="Timeline hours" value={view} onChange={setView} options={[{ value: 'work', label: 'Work hours' }, { value: 'full', label: 'Full day · 24h' }]} /></div>
      <DailyTimeline entries={entries} settings={workspace.settings} workHours={view === 'work'} onAdd={minute => setEditor({ input: blankEntry(date, minute), id: null })} onEdit={entry => setEditor({ input: entry, id: entry.id })} />
    </Card>
    {unscheduled.length > 0 && <Card className="card-pad stack"><h2>Without a time</h2><p className="muted small">These entries are saved for this day. Add planned or actual times to place them on the timeline.</p>{unscheduled.map(entry => <div className="split" key={entry.id}><Button variant="ghost" onClick={() => setEditor({ input: entry, id: entry.id })}>{entry.title}</Button><StatusBadge status={entry.status} /></div>)}</Card>}
    {entries.length > 0 && <details className="card card-pad"><summary>Manage this day's entries ({entries.length})</summary><div className="stack entry-manage">{entries.map(entry => <div className="split" key={entry.id}><Button variant="ghost" onClick={() => setEditor({ input: entry, id: entry.id })}>{entry.title}</Button><IconButton label={`Delete ${entry.title}`} onClick={() => setDeleting(entry)}><Trash2 size={16} /></IconButton></div>)}</div></details>}
    {currentEditor && <EntryEditor key={currentEditor.id ?? 'new'} initial={currentEditor.input} workspace={workspace} title={currentEditor.id ? 'Edit daily entry' : 'Add daily entry'} onClose={closeEditor} onSave={async input => { if (currentEditor.id) await actions.updateDailyEntry(currentEditor.id, input); else await actions.createDailyEntry(input); toast('Daily entry saved.'); }} />}
    {!currentEditor && review && <EntryEditor key={review.id} initial={timerEntryDraft(review, workspace.settings)} workspace={workspace} title="Review your session" timerReview onClose={() => setDismissedReview(review.id)} onSave={async input => { await saveTimerEntry(review.id, input); changeDate(input.date); toast('Work log saved. Linked task remains unchanged.'); }} />}
    <ConfirmDialog open={deleting !== null} onClose={() => setDeleting(null)} title="Delete this daily entry?" description="This removes the log entry. Linked tasks and projects are kept." confirmLabel="Delete entry" destructive busy={busy} onConfirm={() => void removeEntry()} />
  </div>;
}


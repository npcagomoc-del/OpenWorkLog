import { useState } from 'react';
import { Download, FileSpreadsheet, Upload } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Field, Notice, PageHeader, SegmentedControl, StatusBadge, useToast } from '../../components/ui';
import { exportDailyCsv, exportTasksCsv } from '../../data/csv';
import { useWorkspace } from '../../data/useWorkspace';
import { STATUSES } from '../../domain/models';
import { entryMinutes, formatDuration, minuteLabel, todayKey } from '../../domain/time';
import { downloadText } from '../../lib/download';
import { CsvImport } from './CsvImport';
import { ScrollablePreview } from './ScrollablePreview';
import './reports.css';

export default function ReportsPage() {
  const workspace = useWorkspace();
  const [mode, setMode] = useState<'daily' | 'tracker'>('daily');
  const [from, setFrom] = useState(() => todayKey(new Date(), workspace.settings.timezone));
  const [to, setTo] = useState(() => todayKey(new Date(), workspace.settings.timezone));
  const [allDates, setAllDates] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();
  const invalidRange = !allDates && (!from || !to || from > to);
  const entries = workspace.dailyEntries.filter(entry => allDates || (entry.date >= from && entry.date <= to)).sort((a, b) => a.date.localeCompare(b.date) || (a.actualStart ?? a.plannedStart ?? 1440) - (b.actualStart ?? b.plannedStart ?? 1440));
  const tasks = workspace.tasks.filter(task => includeArchived || !task.archived);
  const work = entries.filter(entry => !entry.isLunch);
  const minutes = work.reduce((total, entry) => total + entryMinutes(entry), 0);
  const records = mode === 'daily' ? entries : tasks;
  function exportCsv() {
    const data = { ...workspace, dailyEntries: entries, tasks };
    downloadText(mode === 'daily' ? `daily-report-${allDates ? 'all-dates' : `${from}-to-${to}`}.csv` : 'task-tracker.csv', mode === 'daily' ? exportDailyCsv(data) : exportTasksCsv(data), 'text/csv;charset=utf-8');
    toast(`${mode === 'daily' ? 'Daily report' : 'Task tracker'} CSV downloaded.`);
  }
  return <div className="page-stack">
    <PageHeader eyebrow="Records and exports" title="Reports" description="Preview your records and download the same data as a CSV." actions={<><Button onClick={() => setImporting(true)}><Upload size={16} />Import tracker CSV</Button><Button variant="primary" onClick={exportCsv} disabled={mode === 'daily' && invalidRange}><Download size={16} />Download CSV</Button></>} />
    <Card className="card-pad stack"><div className="split"><SegmentedControl value={mode} onChange={setMode} label="Report type" options={[{ value: 'daily', label: 'Daily report' }, { value: 'tracker', label: 'Task tracker' }]} /><Badge>{records.length} records</Badge></div>
      {mode === 'daily' ? <div className="report-filters"><Field label="From date" htmlFor="report-from"><input id="report-from" type="date" value={from} disabled={allDates} onChange={event => setFrom(event.target.value)} /></Field><Field label="To date" htmlFor="report-to"><input id="report-to" type="date" value={to} disabled={allDates} onChange={event => setTo(event.target.value)} /></Field><label className="report-checkbox"><input type="checkbox" checked={allDates} onChange={event => setAllDates(event.target.checked)} />All dates</label></div> : <label className="report-checkbox"><input type="checkbox" checked={includeArchived} onChange={event => setIncludeArchived(event.target.checked)} />Include archived tasks</label>}
      {mode === 'daily' && invalidRange && <Notice tone="error">Choose a valid date range. The end date must be on or after the start date.</Notice>}
      {records.some(record => record.demo) && <Notice>Demo records are included in this preview and export.</Notice>}
    </Card>
    <Card className="card-pad stack"><h2>Report summary</h2>{mode === 'daily' ? <><p>{work.length} daily work {work.length === 1 ? 'entry' : 'entries'} with <strong>{formatDuration(minutes)} of actual productive time</strong>{allDates ? ' across all saved dates' : ` from ${from} to ${to}`}. Lunch and breaks are excluded from time totals.</p><div className="cluster">{STATUSES.map(status => <div className="cluster" key={status}><StatusBadge status={status} /><strong>{work.filter(entry => entry.status === status).length}</strong></div>)}</div></> : <><p>{tasks.length} {includeArchived ? 'saved' : 'active'} tasks in the tracker. Status reflects each task's current state.</p><div className="cluster">{STATUSES.map(status => <div className="cluster" key={status}><StatusBadge status={status} /><strong>{tasks.filter(task => task.status === status).length}</strong></div>)}</div></>}</Card>
    <Card className="report-preview"><div className="split card-pad"><h2>{mode === 'daily' ? 'Daily report preview' : 'Tracker preview'}</h2><span className="small muted">CSV includes all source fields</span></div>{records.length === 0 ? <EmptyState icon={<FileSpreadsheet size={28} />} title="No records in this report" description={mode === 'daily' ? 'Choose another date range or add entries in Daily log.' : 'Create a task or import a tracker CSV to get started.'} /> : <ScrollablePreview label="Report preview table"><table className="data-table"><caption className="visually-hidden">{mode === 'daily' ? 'Daily report' : 'Task tracker'} preview</caption>{mode === 'daily' ? <><thead><tr><th>Date</th><th>Task / activity</th><th>Work done</th><th>Actual time</th><th>Productive</th><th>Status</th></tr></thead><tbody>{entries.map(entry => <tr key={entry.id}><td>{entry.date}</td><td>{entry.title}{entry.isLunch && <Badge>Lunch / break</Badge>}</td><td className="report-description">{entry.workDone || '—'}</td><td>{entry.actualStart !== null && entry.actualEnd !== null ? `${minuteLabel(entry.actualStart)}–${minuteLabel(entry.actualEnd)}` : '—'}</td><td>{formatDuration(entryMinutes(entry))}</td><td>{entry.isLunch ? '—' : <StatusBadge status={entry.status} />}</td></tr>)}</tbody></> : <><thead><tr><th>Task</th><th>Category</th><th>By whom</th><th>By when</th><th>Status</th><th>Latest update</th></tr></thead><tbody>{tasks.map(task => <tr key={task.id}><td>{task.title}{task.archived && <Badge>Archived</Badge>}</td><td>{workspace.categories.find(category => category.id === task.categoryId)?.name ?? '—'}</td><td>{task.assignee || '—'}</td><td>{task.dueDate ?? '—'}</td><td><StatusBadge status={task.status} /></td><td className="report-description">{task.latestUpdate || '—'}</td></tr>)}</tbody></>}</table></ScrollablePreview>}</Card>
    {importing && <CsvImport workspace={workspace} onClose={() => setImporting(false)} />}
  </div>;
}





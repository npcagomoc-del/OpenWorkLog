import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, ClipboardList, Plus } from 'lucide-react';
import { Badge, Button, Card, EmptyState, PageHeader, StatusBadge } from '../../components/ui';
import { useWorkspace } from '../../data/useWorkspace';
import { STATUSES } from '../../domain/models';
import { entryMinutes, formatDuration, todayKey } from '../../domain/time';
import './dashboard.css';

export default function DashboardPage() {
  const workspace = useWorkspace();
  const today = todayKey(new Date(), workspace.settings.timezone);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const date = selectedDate ?? today;
  const entries = workspace.dailyEntries.filter(entry => entry.date === date && !entry.isLunch);
  const tasks = workspace.tasks.filter(task => !task.archived);
  const projects = workspace.projects.filter(project => !project.archived);
  const minutes = entries.reduce((total, entry) => total + entryMinutes(entry), 0);
  const statusCounts = STATUSES.map(status => ({ status, count: entries.filter(entry => entry.status === status).length }));
  const categoryMinutes = [...workspace.categories.map(category => ({ id: category.id, name: category.name })), { id: null, name: 'Uncategorized' }].map(category => ({ ...category, minutes: entries.filter(entry => entry.categoryId === category.id).reduce((total, entry) => total + entryMinutes(entry), 0) })).filter(category => category.minutes > 0).sort((a, b) => b.minutes - a.minutes);
  const dueTasks = tasks.filter(task => task.dueDate !== null && task.dueDate <= date && task.status !== 'Closed');
  const demo = entries.some(entry => entry.demo) || tasks.some(task => task.demo) || projects.some(project => project.demo);
  return <div className="page-stack">
    <PageHeader eyebrow="Dashboard" title="Overview" description="Your daily activity and the tasks that need attention." actions={<Link className="button button--primary button--md" to="/tasks"><Plus size={18} />Manage tasks</Link>} />
    {demo && <div className="cluster"><Badge tone="yellow">Includes demo data</Badge><span className="small muted">Example records are labeled. Remove them in Settings.</span></div>}
    <div className="split"><div><h2>Daily tasks</h2><p className="small muted">Counts and time below belong to the selected day.</p></div><label className="dashboard-date"><CalendarDays size={18} aria-hidden="true" /><span className="visually-hidden">Dashboard date</span><input aria-label="Dashboard date" type="date" value={date} onChange={event => { if (event.target.value) setSelectedDate(event.target.value); }} /></label></div>
    <div className="stat-grid dashboard-stats"><Card className="stat-card"><span className="muted small">Daily task entries</span><strong>{entries.length}</strong><span className="small muted">{date === today ? 'Today' : date}</span></Card><Card className="stat-card"><span className="muted small">Productive time</span><strong>{formatDuration(minutes)}</strong><span className="small muted">Actual · excludes breaks</span></Card>{statusCounts.map(({ status, count }) => <Card className="stat-card" key={status}><StatusBadge status={status} /><strong>{count}</strong><span className="small muted">Daily entries</span></Card>)}</div>
    <div className="dashboard-columns"><Card className="card-pad stack"><div className="split"><h2>Your day, in detail</h2><Link className="text-link" to={`/daily?date=${date}`}>Open daily log <ArrowUpRight size={15} /></Link></div>
      {entries.length ? <div className="dashboard-entry-list">{entries.map(entry => <Link className="dashboard-entry" key={entry.id} to={`/daily?date=${date}&entry=${entry.id}`}><div className="stack"><strong>{entry.title}</strong><span className="small muted">{entry.workDone || 'No work description yet'}</span><StatusBadge status={entry.status} /></div><span className="dashboard-duration">{formatDuration(entryMinutes(entry))}</span></Link>)}</div> : <EmptyState icon={<ClipboardList size={28} />} title="No entries for this day" description="Add a daily entry or start a timer to see your work here." action={<Link className="button button--secondary button--md" to={`/daily?date=${date}`}>Open daily log</Link>} />}
    </Card><Card className="card-pad stack"><div><h2>Where time went</h2><p className="small muted">Actual productive time by category</p></div>{categoryMinutes.length ? categoryMinutes.map(category => <div className="stack time-breakdown" key={category.id ?? 'none'}><div className="split"><span>{category.name}</span><strong>{formatDuration(category.minutes)}</strong></div><meter className="time-bar" aria-label={`${category.name} productive minutes`} min={0} max={minutes} value={category.minutes}>{formatDuration(category.minutes)}</meter></div>) : <p className="muted small">Time appears here once actual work is logged.</p>}<div className="dashboard-note"><strong>Plan and actual stay separate.</strong><p className="small muted">Planned blocks do not add to productive time. Timer pauses and lunch are excluded.</p></div></Card></div>
    <div className="split"><div><h2>Portfolio overview</h2><p className="small muted">All current, unarchived tasks and projects on this device.</p></div><Link className="text-link" to="/reports">Reports <ArrowUpRight size={15} /></Link></div>
    <div className="dashboard-portfolio"><Card className="card-pad stack"><div className="split"><h3>Tasks</h3><Badge>{tasks.length} total</Badge></div>{STATUSES.map(status => <div key={status} className="split"><StatusBadge status={status} /><strong>{tasks.filter(task => task.status === status).length}</strong></div>)}<Link className="text-link" to="/tasks">View task tracker</Link></Card><Card className="card-pad stack"><div className="split"><h3>Projects</h3><Badge>{projects.length} total</Badge></div>{STATUSES.map(status => <div key={status} className="split"><StatusBadge status={status} /><strong>{projects.filter(project => project.status === status).length}</strong></div>)}<Link className="text-link" to="/projects">View projects</Link></Card><Card className="card-pad stack"><div className="split"><h3>Due by {date === today ? 'today' : date}</h3><Badge tone={dueTasks.length ? 'yellow' : 'neutral'}>{dueTasks.length}</Badge></div>{dueTasks.length ? dueTasks.slice(0, 4).map(task => <div className="split" key={task.id}><span>{task.title}</span><span className="small muted">{task.dueDate}</span></div>) : <p className="small muted">No open tasks due by this date.</p>}<Link className="text-link" to="/tasks">Review due dates</Link></Card></div>
    <Button className="dashboard-today" variant="ghost" onClick={() => setSelectedDate(today)} disabled={date === today}>Back to today</Button>
  </div>;
}



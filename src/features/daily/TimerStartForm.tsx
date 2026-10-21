import { useState } from 'react';
import { CalendarClock, Play } from 'lucide-react';
import { Button, Field } from '../../components/ui';
import { startTimer } from '../../data/timers';
import type { Workspace } from '../../domain/models';
import { plannedWindow, scheduledTimerSources } from './timerSources';

type Props = {
  readonly workspace: Workspace;
  readonly date: string;
  readonly busy: boolean;
  readonly run: (operation: () => Promise<unknown>) => Promise<void>;
  readonly onStarted: () => void;
};
export function TimerStartForm({ workspace, date, busy, run, onStarted }: Props) {
  const [sourceKey, setSourceKey] = useState('');
  const [title, setTitle] = useState('');
  const [taskId, setTaskId] = useState('');
  const sources = scheduledTimerSources(workspace, date);
  const source = sources.find(item => item.key === sourceKey);
  const linkedTask = workspace.tasks.find(task => task.id === (source?.taskId ?? taskId));
  function chooseSource(key: string) {
    setSourceKey(key);
    const selected = sources.find(item => item.key === key);
    if (selected) { setTitle(selected.title); setTaskId(selected.taskId ?? ''); }
  }
  return <form className="timer-start-form" onSubmit={event => {
    event.preventDefault();
    void run(async () => {
      await startTimer({
        title: title.trim() || source?.title || linkedTask?.title || '',
        sourceEntryId: source?.sourceEntryId ?? null,
        planId: source?.planId ?? null,
        taskId: source?.taskId ?? linkedTask?.id ?? null,
        projectId: source?.projectId ?? linkedTask?.projectId ?? null,
        categoryId: source?.categoryId ?? linkedTask?.categoryId ?? null,
      });
      onStarted();
    });
  }}>
    <Field label="Planned work" htmlFor="timer-source" hint={`Calendar plans and daily activities for ${date}. Change the daily log date to see another day.`}>
      <select id="timer-source" value={sourceKey} onChange={event => chooseSource(event.target.value)}>
        <option value="">New session or existing task</option>
        {sources.map(item => <option value={item.key} key={item.key}>{plannedWindow(item)} · {item.title}</option>)}
      </select>
    </Field>
    {source && <div className="timer-plan-context"><CalendarClock size={18} aria-hidden="true" /><div><strong>{source.title}</strong><span>{plannedWindow(source)}</span><span>Task: {linkedTask?.title ?? (source.taskDetached ? 'No linked task' : 'Linked when saved')}</span></div></div>}
    <p className="small muted">Timer time is recorded from now. Planned times stay visible with the session.</p>
    <div className="timer-start">
      <Field label="Linked task" htmlFor="timer-task"><select id="timer-task" value={source?.taskId ?? taskId} onChange={event => {
        setSourceKey(''); setTaskId(event.target.value);
        const task = workspace.tasks.find(item => item.id === event.target.value);
        if (task) setTitle(task.title);
      }}><option value="">{source?.taskDetached ? 'No linked task' : 'New task from this session'}</option>{workspace.tasks.filter(task => !task.archived).map(task => <option value={task.id} key={task.id}>{task.title}</option>)}</select></Field>
      <Field label="Session name" htmlFor="timer-title"><input id="timer-title" required value={title} onChange={event => setTitle(event.target.value)} placeholder="What will you work on?" /></Field>
      <Button type="submit" variant="primary" busy={busy}><Play size={16} />Start timer</Button>
    </div>
  </form>;
}

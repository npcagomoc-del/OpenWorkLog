import { useEffect, useState } from 'react';
import { Pause, Play, Square, TimerReset } from 'lucide-react';
import { Button, Card, ConfirmDialog, Field, Notice, useToast } from '../../components/ui';
import { discardTimer, pauseTimer, resumeTimer, startTimer, stopTimer } from '../../data/timers';
import type { Timer, Workspace } from '../../domain/models';
import { timerElapsedSeconds } from '../../domain/time';
import { errorMessage } from './entryForm';

type Props = { readonly workspace: Workspace; readonly timer: Timer | undefined; readonly onReview: () => void };
export function TimerCard({ workspace, timer, onReview }: Props) {
  const [title, setTitle] = useState('');
  const [taskId, setTaskId] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const { toast } = useToast();
  useEffect(() => { if (timer?.state !== 'running') return; const interval = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(interval); }, [timer?.state]);
  async function run(operation: () => Promise<unknown>) {
    setBusy(true); setError('');
    try { await operation(); } catch (caught) { setError(errorMessage(caught)); } finally { setBusy(false); }
  }
  const elapsed = timer ? Math.floor(timerElapsedSeconds(timer, now)) : 0;
  const clock = [Math.floor(elapsed / 3600), Math.floor(elapsed / 60) % 60, elapsed % 60].map(value => String(value).padStart(2, '0')).join(':');
  return <Card className="card-pad timer-card">
    <div className="split"><div><div className="eyebrow">Focus timer</div><h2>{timer ? timer.title : 'Start a work session'}</h2><p className="small muted">{timer ? 'Your session is saved on this device, including pauses.' : 'Start a session, then review your work before saving it.'}</p></div>{timer && <output className="timer-clock" aria-live="off" aria-label={`${elapsed} seconds elapsed`}>{clock}<span>{timer.state === 'review' ? 'Ready to review' : timer.state === 'paused' ? 'Paused' : 'Running'}</span></output>}</div>
    {error && <Notice tone="error">{error}</Notice>}
    {timer ? <div className="cluster">
      {timer.state === 'running' && <Button busy={busy} onClick={() => void run(() => pauseTimer(timer.id))}><Pause size={16} />Pause</Button>}
      {timer.state === 'paused' && <Button variant="primary" busy={busy} onClick={() => void run(() => resumeTimer(timer.id))}><Play size={16} />Resume</Button>}
      {timer.state !== 'review' && <Button busy={busy} onClick={() => void run(async () => { await stopTimer(timer.id); onReview(); })}><Square size={16} />Stop and review</Button>}
      {timer.state === 'review' && <Button variant="primary" onClick={onReview}>Review session</Button>}
      <Button variant="ghost" onClick={() => setConfirmDiscard(true)} disabled={busy}><TimerReset size={16} />Discard</Button>
    </div> : <form className="timer-start" onSubmit={event => { event.preventDefault(); void run(async () => { const task = workspace.tasks.find(item => item.id === taskId); await startTimer({ title: title.trim() || task?.title || '', taskId: task?.id ?? null, projectId: task?.projectId ?? null, categoryId: task?.categoryId ?? null }); toast('Timer started.'); }); }}>
      <Field label="Linked task" htmlFor="timer-task"><select id="timer-task" value={taskId} onChange={event => { setTaskId(event.target.value); const task = workspace.tasks.find(item => item.id === event.target.value); if (task) setTitle(task.title); }}><option value="">Standalone activity</option>{workspace.tasks.filter(task => !task.archived).map(task => <option value={task.id} key={task.id}>{task.title}</option>)}</select></Field>
      <Field label="Session name" htmlFor="timer-title"><input id="timer-title" required value={title} onChange={event => setTitle(event.target.value)} placeholder="What will you work on?" /></Field>
      <Button type="submit" variant="primary" busy={busy}><Play size={16} />Start timer</Button>
    </form>}
    <ConfirmDialog open={confirmDiscard} onClose={() => setConfirmDiscard(false)} title="Discard this timer?" description="This session's time will be removed. Saved work logs and linked tasks are kept." confirmLabel="Discard session" destructive busy={busy} onConfirm={() => void run(async () => { if (timer) await discardTimer(timer.id); setConfirmDiscard(false); toast('Timer discarded.'); })} />
  </Card>;
}



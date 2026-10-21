import { useState } from 'react';
import { Button, Field, Modal, Notice } from '../../components/ui';
import { STATUSES, statusSchema, type DailyEntryCreateInput, type Workspace } from '../../domain/models';
import { clockValue, errorMessage, linkedTaskEntry, withEntryTimes } from './entryForm';

type Props = {
  readonly initial: DailyEntryCreateInput;
  readonly workspace: Workspace;
  readonly title: string;
  readonly timerReview?: boolean;
  readonly onClose: () => void;
  readonly onSave: (entry: DailyEntryCreateInput) => Promise<void>;
};
export function EntryEditor({ initial, workspace, title, timerReview = false, onClose, onSave }: Props) {
  const [entry, setEntry] = useState(() => { const task = workspace.tasks.find(item => item.id === initial.taskId); const project = workspace.projects.find(item => item.id === initial.projectId); return { ...initial, ticket: initial.ticket || task?.ticket || '', projectName: initial.projectName || project?.name || '', projectLink: initial.projectLink || project?.link || '', subtasks: initial.subtasks || task?.subtasks.map(item => `${item.done ? '[x]' : '[ ]'} ${item.title}`).join('\n') || '' }; });
  const [times, setTimes] = useState({ plannedStart: clockValue(initial.plannedStart), plannedEnd: clockValue(initial.plannedEnd), actualStart: clockValue(initial.actualStart), actualEnd: clockValue(initial.actualEnd) });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  function patch(update: Partial<DailyEntryCreateInput>) { setEntry(current => ({ ...current, ...update })); }
  async function save() {
    setBusy(true); setError('');
    try {
      const updated = withEntryTimes(entry, times, initial);
      await onSave(updated); onClose();
    } catch (caught) { setError(errorMessage(caught)); } finally { setBusy(false); }
  }
  return <Modal open onClose={onClose} title={title} size="lg" footer={<><Button onClick={onClose} disabled={busy}>Cancel</Button><Button type="submit" form="daily-entry-form" variant="primary" busy={busy}>{timerReview ? 'Save work log' : 'Save entry'}</Button></>}>
    <form id="daily-entry-form" className="stack" onSubmit={event => { event.preventDefault(); void save(); }}>
      {error && <Notice tone="error">{error}</Notice>}
      {timerReview && <Notice>Review the work you did. Pauses are excluded automatically. Saving this log leaves the linked task status unchanged.</Notice>}
      <div className="form-grid">
        <Field label="Date" htmlFor="entry-date"><input id="entry-date" type="date" required value={entry.date} disabled={timerReview} onChange={event => patch({ date: event.target.value })} /></Field>
        <Field label="Linked task / operational task" htmlFor="entry-task"><select id="entry-task" value={entry.taskId ?? ''} onChange={event => setEntry(current => { const linked = linkedTaskEntry(current, workspace.tasks.find(task => task.id === event.target.value)); const project = workspace.projects.find(item => item.id === linked.projectId); return { ...linked, projectName: project?.name ?? linked.projectName, projectLink: project?.link ?? linked.projectLink }; })}><option value="">No linked task</option>{workspace.tasks.filter(task => !task.archived || task.id === entry.taskId).map(task => <option key={task.id} value={task.id}>{task.title}</option>)}</select></Field>
        <div className="field-full"><Field label="Task / activity" htmlFor="entry-title"><input id="entry-title" required value={entry.title} onChange={event => patch({ title: event.target.value })} placeholder="What are you working on?" /></Field></div>
        <Field label="Category" htmlFor="entry-category"><select id="entry-category" value={entry.categoryId ?? ''} onChange={event => patch({ categoryId: event.target.value || null })}><option value="">Uncategorized</option>{workspace.categories.filter(category => !category.archived || category.id === entry.categoryId).map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
        <Field label="Entry status" htmlFor="entry-status"><select id="entry-status" value={entry.status} onChange={event => patch({ status: statusSchema.parse(event.target.value) })}>{STATUSES.map(status => <option key={status}>{status}</option>)}</select></Field>
        {(['plannedStart', 'plannedEnd', 'actualStart', 'actualEnd'] as const).map(key => <Field key={key} label={{ plannedStart: 'Planned from', plannedEnd: 'Planned to', actualStart: 'Actual from', actualEnd: 'Actual to' }[key]} htmlFor={`entry-${key}`} hint="HH:mm · 24-hour time"><input id={`entry-${key}`} inputMode="numeric" placeholder="HH:mm" value={times[key]} readOnly={timerReview && key.startsWith('actual')} onChange={event => setTimes(current => ({ ...current, [key]: event.target.value }))} /></Field>)}
        <div className="field-full"><Field label="Work done" htmlFor="entry-work"><textarea id="entry-work" rows={3} value={entry.workDone} onChange={event => patch({ workDone: event.target.value })} placeholder="Describe the actual work and result." /></Field></div>
      </div>
      <label className="check-row"><input type="checkbox" checked={entry.isLunch} onChange={event => patch({ isLunch: event.target.checked })} />Lunch / break — exclude from productive time</label>
      <details className="entry-details"><summary>More details · project, ticket, subtasks and remarks</summary><div className="form-grid">
        <Field label="Linked project" htmlFor="entry-project"><select id="entry-project" value={entry.projectId ?? ''} onChange={event => { const project = workspace.projects.find(item => item.id === event.target.value); patch({ projectId: project?.id ?? null, projectName: project?.name ?? entry.projectName, projectLink: project?.link ?? entry.projectLink }); }}><option value="">No linked project</option>{workspace.projects.filter(project => !project.archived || project.id === entry.projectId).map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></Field>
        <Field label="Ticket number" htmlFor="entry-ticket"><input id="entry-ticket" value={entry.ticket} onChange={event => patch({ ticket: event.target.value })} /></Field>
        <Field label="Project name" htmlFor="entry-project-name"><input id="entry-project-name" value={entry.projectName} onChange={event => patch({ projectName: event.target.value })} /></Field>
        <Field label="Project link" htmlFor="entry-project-link"><input id="entry-project-link" type="url" value={entry.projectLink} onChange={event => patch({ projectLink: event.target.value })} placeholder="https://" /></Field>
        <Field label="Subtasks" htmlFor="entry-subtasks"><textarea id="entry-subtasks" rows={3} value={entry.subtasks} onChange={event => patch({ subtasks: event.target.value })} /></Field>
        <Field label="Remarks" htmlFor="entry-remarks"><textarea id="entry-remarks" rows={3} value={entry.remarks} onChange={event => patch({ remarks: event.target.value })} /></Field>
      </div></details>
      {!timerReview && initial.timerId && <p className="small muted">Changing actual times replaces the timer's saved segments with the manual interval.</p>}
    </form>
  </Modal>;
}



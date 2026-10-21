import { useState } from 'react';
import { Button, Field, Modal, Notice, useToast } from '../../components/ui';
import { actions } from '../../data/actions';
import { useWorkspace } from '../../data/useWorkspace';
import type { Plan, PlanCreateInput } from '../../domain/models';
import { parseTime, timeInput } from './calendarLogic';

export function PlanEditor({
  plan,
  initial,
  onClose,
}: {
  readonly plan: Plan | null;
  readonly initial: { readonly date: string; readonly minute: number };
  readonly onClose: () => void;
}) {
  const { tasks, projects, categories } = useWorkspace();
  const [draft, setDraft] = useState<PlanCreateInput>(
    plan ?? {
      title: '',
      date: initial.date,
      startMinute: initial.minute,
      endMinute: Math.min(initial.minute + 30, 1440),
      taskId: null,
      projectId: null,
      categoryId: null,
      notes: '',
    },
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  async function save() {
    setBusy(true);
    setError('');
    try {
      if (plan) await actions.updatePlan(plan.id, draft);
      else await actions.createPlan(draft);
      toast(plan ? 'Plan updated' : 'Added to your calendar');
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save plan');
    } finally {
      setBusy(false);
    }
  }
  function linkTask(id: string) {
    const task = tasks.find((item) => item.id === id);
    setDraft({
      ...draft,
      taskId: id || null,
      ...(task
        ? {
            title: draft.title || task.title,
            projectId: task.projectId,
            categoryId: task.categoryId,
          }
        : {}),
    });
  }
  return (
    <Modal
      open
      onClose={onClose}
      title={plan ? 'Edit plan' : 'Plan your time'}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" busy={busy} type="submit" form="plan-editor">
            Save plan
          </Button>
        </>
      }
    >
      <form
        id="plan-editor"
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        {error && <Notice tone="error">{error}</Notice>}
        <Field
          label="Linked task"
          htmlFor="plan-task"
          hint="Use an existing task to keep its project and category connected."
        >
          <select
            id="plan-task"
            value={draft.taskId ?? ''}
            onChange={(event) => linkTask(event.target.value)}
          >
            <option value="">Independent plan</option>
            {tasks
              .filter((task) => !task.archived || task.id === draft.taskId)
              .map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Plan title" htmlFor="plan-title">
          <input
            id="plan-title"
            required
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
          />
        </Field>
        <Field label="Date" htmlFor="plan-date">
          <input
            id="plan-date"
            type="date"
            required
            value={draft.date}
            onChange={(event) => setDraft({ ...draft, date: event.target.value })}
          />
        </Field>
        <div className="form-grid">
          <Field label="From" htmlFor="plan-start">
            <input
              id="plan-start"
              type="time"
              step={60}
              required
              value={timeInput(draft.startMinute)}
              onChange={(event) =>
                setDraft({ ...draft, startMinute: parseTime(event.target.value) })
              }
            />
          </Field>
          <Field label="To" htmlFor="plan-end" hint="Choose 24:00 for the end of this day.">
            <select
              id="plan-end"
              value={draft.endMinute}
              onChange={(event) => setDraft({ ...draft, endMinute: Number(event.target.value) })}
            >
              {Array.from(
                new Set([
                  ...Array.from({ length: 48 }, (_, index) => (index + 1) * 30),
                  draft.endMinute,
                ]),
              )
                .sort((a, b) => a - b)
                .map((minute) => (
                  <option value={minute} key={minute}>
                    {timeInput(minute)}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Project" htmlFor="plan-project">
            <select
              id="plan-project"
              value={draft.projectId ?? ''}
              onChange={(event) => setDraft({ ...draft, projectId: event.target.value || null })}
            >
              <option value="">No project</option>
              {projects
                .filter((project) => !project.archived || project.id === draft.projectId)
                .map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Category" htmlFor="plan-category">
            <select
              id="plan-category"
              value={draft.categoryId ?? ''}
              onChange={(event) => setDraft({ ...draft, categoryId: event.target.value || null })}
            >
              <option value="">Uncategorized</option>
              {categories
                .filter((category) => !category.archived || category.id === draft.categoryId)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </Field>
        </div>
        <Field label="Notes" htmlFor="plan-notes">
          <textarea
            id="plan-notes"
            rows={3}
            value={draft.notes}
            onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
          />
        </Field>
      </form>
    </Modal>
  );
}

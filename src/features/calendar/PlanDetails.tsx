import { FilePenLine, Pencil, Play, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  ConfirmDialog,
  Modal,
  Notice,
  StatusBadge,
  useToast,
} from '../../components/ui';
import { actions } from '../../data/actions';
import { startTimer } from '../../data/timers';
import { useWorkspace } from '../../data/useWorkspace';
import type { Plan } from '../../domain/models';
import { categoryForPlan } from './calendarCategory';
import { parseDate, timeInput } from './calendarLogic';

export function PlanDetails({
  plan,
  onEdit,
  onClose,
}: {
  readonly plan: Plan;
  readonly onEdit: () => void;
  readonly onClose: () => void;
}) {
  const { tasks, projects, categories, dailyEntries, timers } = useWorkspace();
  const task = tasks.find((item) => item.id === plan.taskId);
  const project = projects.find((item) => item.id === plan.projectId);
  const category = categoryForPlan(plan, tasks, categories);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  async function logWork() {
    setBusy(true);
    setError('');
    try {
      const existing = dailyEntries.find(
        (entry) => entry.planId === plan.id && entry.date === plan.date,
      );
      const entry =
        existing ??
        (await actions.createDailyEntry({
          date: plan.date,
          plannedStart: plan.startMinute,
          plannedEnd: plan.endMinute,
          actualStart: null,
          actualEnd: null,
          taskId: plan.taskId,
          projectId: plan.projectId,
          categoryId: plan.categoryId,
          title: plan.title,
          ticket: task?.ticket ?? '',
          projectName: project?.name ?? '',
          projectLink: project?.link ?? '',
          subtasks: task?.subtasks.map((item) => item.title).join('\n') ?? '',
          workDone: '',
          remarks: plan.notes,
          status: task?.status ?? 'Open',
          businessUnit: plan.businessUnit ?? task?.businessUnit ?? project?.businessUnit ?? '',
          isLunch: false,
          timerId: null,
          planId: plan.id,
        }));
      navigate(`/daily?date=${plan.date}&entry=${encodeURIComponent(entry.id)}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to open a daily entry');
    } finally {
      setBusy(false);
    }
  }
  async function start() {
    setBusy(true);
    setError('');
    try {
      await startTimer({
        title: plan.title,
        planId: plan.id,
        sourceEntryId:
          dailyEntries.find((entry) => entry.planId === plan.id && entry.date === plan.date)?.id ??
          null,
        taskId: plan.taskId,
        projectId: plan.projectId,
        categoryId: plan.categoryId,
      });
      toast('Timer started');
      navigate('/daily');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to start timer');
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    setError('');
    try {
      await actions.deletePlan(plan.id);
      toast('Plan deleted');
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to delete plan');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Modal
        open
        onClose={onClose}
        title={plan.title}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(true)}>
              <Trash2 size={17} />
              Delete
            </Button>
            <Button onClick={onEdit}>
              <Pencil size={17} />
              Edit plan
            </Button>
          </>
        }
      >
        <div className="stack">
          {error && <Notice tone="error">{error}</Notice>}
          <p className="calendar-detail-date">
            {parseDate(plan.date).toLocaleDateString(undefined, { dateStyle: 'full' })}
            <br />
            <strong>
              {timeInput(plan.startMinute)}–{timeInput(plan.endMinute)}
            </strong>
          </p>
          <div className="cluster">
            {task && <StatusBadge status={task.status} />}
            {category && <Badge>{category.name}</Badge>}
            {plan.demo && <Badge>Demo</Badge>}
          </div>
          {task && (
            <p className="small">
              <span className="muted">Task</span>
              <br />
              {task.title}
            </p>
          )}
          {project && (
            <p className="small">
              <span className="muted">Project</span>
              <br />
              {project.name}
            </p>
          )}
          {(plan.businessUnit ?? task?.businessUnit ?? project?.businessUnit) && (
            <p className="small">
              <span className="muted">Business Unit / Requested for</span>
              <br />
              {plan.businessUnit ?? task?.businessUnit ?? project?.businessUnit}
            </p>
          )}
          {plan.notes && <p className="calendar-notes">{plan.notes}</p>}
          <Button
            variant="primary"
            onClick={() => {
              void logWork();
            }}
            busy={busy}
          >
            <FilePenLine size={18} />
            {dailyEntries.some((entry) => entry.planId === plan.id && entry.date === plan.date)
              ? 'Open daily entry'
              : 'Log work from this plan'}
          </Button>
          <Button
            className="calendar-timer-action"
            size="sm"
            onClick={() => {
              void start();
            }}
            busy={busy}
            disabled={timers.some((timer) => timer.entryId === null)}
          >
            <Play size={18} />
            Start timer
          </Button>
          {timers.some((timer) => timer.entryId === null) && (
            <p className="small muted">
              Finish or review the current timer in Daily log before starting another.
            </p>
          )}
          <p className="small muted">
            Planned time stays separate from actual work. Starting a timer records time from now.
          </p>
        </div>
      </Modal>
      <ConfirmDialog
        open={deleting}
        title="Delete this plan?"
        description="Linked tasks and any saved daily entry will be kept."
        onClose={() => setDeleting(false)}
        onConfirm={() => {
          void remove();
        }}
        destructive
        confirmLabel="Delete plan"
        busy={busy}
      />
    </>
  );
}

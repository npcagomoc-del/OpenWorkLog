import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Field, Modal, Notice, useToast } from '../../components/ui';
import { actions } from '../../data/actions';
import { useWorkspace } from '../../data/useWorkspace';
import type { Task, WorkType } from '../../domain/models';
import { BusinessUnitField } from './BusinessUnitField';
import { TaskSubtasks } from './TaskSubtasks';
import { priorities, statuses, workTypes } from './taskLogic';

type TaskInput = Parameters<typeof actions.createTask>[0];
const blankTask: TaskInput = {
  title: '',
  description: '',
  status: 'Open',
  priority: 'Normal',
  type: 'task',
  categoryId: null,
  projectId: null,
  dueDate: null,
  assignee: '',
  ticket: '',
  latestUpdate: '',
  subtasks: [],
  archived: false,
  businessUnit: '',
};

export function TaskEditor({
  task,
  onClose,
  initialProjectId = null,
  initialType = 'task',
}: {
  readonly task: Task | null;
  readonly onClose: () => void;
  readonly initialProjectId?: string | null;
  readonly initialType?: WorkType;
}) {
  const { categories, projects, settings } = useWorkspace();
  const [draft, setDraft] = useState<TaskInput>(
    task ?? {
      ...blankTask,
      projectId: initialProjectId,
      type: initialType,
      businessUnit: projects.find((project) => project.id === initialProjectId)?.businessUnit ?? '',
    },
  );
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  async function save() {
    setBusy(true);
    setError('');
    try {
      if (task) await actions.updateTask(task.id, draft);
      else await actions.createTask(draft);
      toast(task ? 'Task updated' : 'Task created');
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save this task.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      open
      onClose={onClose}
      title={task ? 'Edit task' : 'New task'}
      size="lg"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="task-editor" variant="primary" busy={busy}>
            Save task
          </Button>
        </>
      }
    >
      <form
        id="task-editor"
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        {error && <Notice tone="error">{error}</Notice>}
        <Field label="Task" htmlFor="task-title">
          <input
            id="task-title"
            required
            maxLength={240}
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            placeholder="What needs to happen?"
          />
        </Field>
        <div className="form-grid">
          <Field label="Status" htmlFor="task-status">
            <select
              id="task-status"
              value={draft.status}
              onChange={(event) => {
                const status = statuses.find((value) => value === event.target.value);
                if (status) setDraft({ ...draft, status });
              }}
            >
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </Field>
          <Field label="Work type" htmlFor="task-type">
            <select
              id="task-type"
              value={draft.type}
              onChange={(event) => {
                const type = workTypes.find((value) => value === event.target.value);
                if (type) setDraft({ ...draft, type });
              }}
            >
              {workTypes.map((type) => (
                <option key={type} value={type}>
                  {settings.typeLabels[type]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Category" htmlFor="task-category">
            <select
              id="task-category"
              value={draft.categoryId ?? ''}
              onChange={(event) => setDraft({ ...draft, categoryId: event.target.value || null })}
            >
              <option value="">Uncategorized</option>
              {categories
                .filter((category) => !category.archived || category.id === draft.categoryId)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                    {category.archived ? ' (archived)' : ''}
                  </option>
                ))}
            </select>
          </Field>
          <Field
            label="Parent project"
            htmlFor="task-project"
            hint="Links this task to a project without making another copy."
          >
            <select
              id="task-project"
              value={draft.projectId ?? ''}
              onChange={(event) => {
                const project = projects.find((item) => item.id === event.target.value);
                setDraft({
                  ...draft,
                  projectId: project?.id ?? null,
                  businessUnit: task ? draft.businessUnit : (project?.businessUnit ?? ''),
                });
              }}
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
          <BusinessUnitField
            id="task-business-unit"
            value={draft.businessUnit ?? ''}
            units={settings.businessUnits}
            onChange={(businessUnit) => setDraft({ ...draft, businessUnit })}
          />
          <Field label="By whom" htmlFor="task-owner">
            <input
              id="task-owner"
              value={draft.assignee}
              onChange={(event) => setDraft({ ...draft, assignee: event.target.value })}
              placeholder="Your name or owner"
            />
          </Field>
          <Field label="By when" htmlFor="task-due">
            <input
              id="task-due"
              type="date"
              value={draft.dueDate ?? ''}
              onChange={(event) => setDraft({ ...draft, dueDate: event.target.value || null })}
            />
          </Field>
          <Field label="Priority" htmlFor="task-priority">
            <select
              id="task-priority"
              value={draft.priority}
              onChange={(event) => {
                const priority = priorities.find((value) => value === event.target.value);
                if (priority) setDraft({ ...draft, priority });
              }}
            >
              {priorities.map((priority) => (
                <option key={priority}>{priority}</option>
              ))}
            </select>
          </Field>
          <Field label="Ticket number" htmlFor="task-ticket">
            <input
              id="task-ticket"
              value={draft.ticket}
              onChange={(event) => setDraft({ ...draft, ticket: event.target.value })}
            />
          </Field>
        </div>
        <Field label="Description" htmlFor="task-description">
          <textarea
            id="task-description"
            rows={2}
            value={draft.description}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
          />
        </Field>
        <Field label="Latest update" htmlFor="task-update">
          <textarea
            id="task-update"
            rows={2}
            value={draft.latestUpdate}
            onChange={(event) => setDraft({ ...draft, latestUpdate: event.target.value })}
          />
        </Field>
        <TaskSubtasks
          items={draft.subtasks}
          onChange={(subtasks) => setDraft({ ...draft, subtasks })}
        />
        <p className="small muted">
          Categories and work-type names are editable in{' '}
          <Link to="/settings" onClick={onClose}>
            Settings
          </Link>
          .
        </p>
      </form>
    </Modal>
  );
}

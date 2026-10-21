import { useState } from 'react';
import { Button, Field, Modal, Notice, useToast } from '../../components/ui';
import { actions } from '../../data/actions';
import { useWorkspace } from '../../data/useWorkspace';
import type { Project, ProjectCreateInput } from '../../domain/models';
import { statuses } from './taskLogic';

const blank: ProjectCreateInput = {
  name: '',
  description: '',
  status: 'Open',
  categoryId: null,
  dueDate: null,
  owner: '',
  link: '',
  archived: false,
};
export function ProjectEditor({
  project,
  onClose,
}: {
  readonly project: Project | null;
  readonly onClose: () => void;
}) {
  const { categories } = useWorkspace();
  const [draft, setDraft] = useState<ProjectCreateInput>(project ?? blank);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  async function save() {
    setBusy(true);
    setError('');
    try {
      if (project) await actions.updateProject(project.id, draft);
      else await actions.createProject(draft);
      toast(project ? 'Project updated' : 'Project created');
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save project');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      open
      onClose={onClose}
      title={project ? 'Edit project' : 'New project'}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" form="project-editor" busy={busy}>
            Save project
          </Button>
        </>
      }
    >
      <form
        id="project-editor"
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        {error && <Notice tone="error">{error}</Notice>}
        <Field label="Project name" htmlFor="project-name">
          <input
            id="project-name"
            required
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          />
        </Field>
        <Field label="Description" htmlFor="project-description">
          <textarea
            id="project-description"
            rows={3}
            value={draft.description}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
          />
        </Field>
        <div className="form-grid">
          <Field label="Status" htmlFor="project-status">
            <select
              id="project-status"
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
          <Field label="Category" htmlFor="project-category">
            <select
              id="project-category"
              value={draft.categoryId ?? ''}
              onChange={(event) => setDraft({ ...draft, categoryId: event.target.value || null })}
            >
              <option value="">Uncategorized</option>
              {categories
                .filter((item) => !item.archived || item.id === draft.categoryId)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Owner" htmlFor="project-owner">
            <input
              id="project-owner"
              value={draft.owner}
              onChange={(event) => setDraft({ ...draft, owner: event.target.value })}
            />
          </Field>
          <Field label="Due date" htmlFor="project-due">
            <input
              id="project-due"
              type="date"
              value={draft.dueDate ?? ''}
              onChange={(event) => setDraft({ ...draft, dueDate: event.target.value || null })}
            />
          </Field>
        </div>
        <Field label="Project link" htmlFor="project-link" hint="Optional website or document URL">
          <input
            id="project-link"
            type="url"
            value={draft.link}
            onChange={(event) => setDraft({ ...draft, link: event.target.value })}
            placeholder="https://"
          />
        </Field>
      </form>
    </Modal>
  );
}

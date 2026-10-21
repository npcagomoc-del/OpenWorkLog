import { ExternalLink, FolderKanban, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  IconButton,
  PageHeader,
  StatusBadge,
  useToast,
} from '../../components/ui';
import { actions } from '../../data/actions';
import { useWorkspace } from '../../data/useWorkspace';
import type { Project } from '../../domain/models';
import { ProjectEditor } from './ProjectEditor';
import { statuses } from './taskLogic';
import './tasks.css';

export default function ProjectsPage() {
  const { projects, tasks, categories } = useWorkspace();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [editor, setEditor] = useState<{ readonly project: Project | null } | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const visible = projects.filter(
    (project) =>
      !project.archived &&
      (!status || project.status === status) &&
      `${project.name} ${project.description} ${project.owner}`
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase()),
  );
  async function remove() {
    if (!deleting) return;
    setBusy(true);
    try {
      await actions.deleteProject(deleting.id);
      setDeleting(null);
      toast('Project deleted. Linked tasks and work history are preserved.');
    } catch (cause) {
      toast(cause instanceof Error ? cause.message : 'Unable to delete project', 'error');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="THE BIGGER PICTURE"
        title="Projects"
        description="Bring related work together, with a clear owner and next step."
        actions={
          <Button variant="primary" onClick={() => setEditor({ project: null })}>
            <Plus size={18} />
            New project
          </Button>
        }
      />
      <Card className="card-pad">
        <div className="cluster">
          <input
            aria-label="Search projects"
            placeholder="Search projects or owners"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            aria-label="Filter project status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            {statuses.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <span className="small muted">{visible.length} projects</span>
        </div>
      </Card>
      <div className="project-grid">
        {visible.map((project) => {
          const linked = tasks.filter((task) => !task.archived && task.projectId === project.id);
          const closed = linked.filter((task) => task.status === 'Closed').length;
          const progress = linked.length ? Math.round((closed / linked.length) * 100) : 0;
          const safeLink = /^https?:\/\//i.test(project.link) ? project.link : null;
          return (
            <Card className="card-pad project-card" key={project.id}>
              <div className="split">
                <StatusBadge status={project.status} />
                {project.demo && <Badge>Demo</Badge>}
                <div className="cluster">
                  <IconButton label={`Edit ${project.name}`} onClick={() => setEditor({ project })}>
                    <Pencil size={17} />
                  </IconButton>
                  <IconButton label={`Delete ${project.name}`} onClick={() => setDeleting(project)}>
                    <Trash2 size={17} />
                  </IconButton>
                </div>
              </div>
              <h2>{project.name}</h2>
              <p className="small muted">
                {project.description || 'Add a description to give this project context.'}
              </p>
              <div className="cluster small muted">
                <span>
                  {categories.find((category) => category.id === project.categoryId)?.name ??
                    'Uncategorized'}
                </span>
                <span>{project.owner || 'No owner'}</span>
                <span>{project.dueDate ? `Due ${project.dueDate}` : 'No due date'}</span>
              </div>
              <div className="split small">
                <span>
                  {closed} of {linked.length} tasks closed
                </span>
                <span>{progress}%</span>
              </div>
              <div
                className="project-progress"
                role="progressbar"
                aria-label={`${project.name} task progress`}
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span style={{ width: `${progress}%` }} />
              </div>
              <div className="split">
                <Link className="text-link" to={`/tasks?project=${encodeURIComponent(project.id)}`}>
                  View linked tasks
                </Link>
                {safeLink && (
                  <a
                    className="text-link cluster"
                    href={safeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Project link
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      {!visible.length && (
        <Card>
          <EmptyState
            icon={<FolderKanban size={28} />}
            title={projects.length ? 'No matching projects' : 'Give your work a home'}
            description="Create a project, then link the tasks that move it forward."
            action={<Button onClick={() => setEditor({ project: null })}>Create project</Button>}
          />
        </Card>
      )}
      {editor && <ProjectEditor project={editor.project} onClose={() => setEditor(null)} />}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this project?"
        description="Its tasks, calendar plans and daily entries will be kept, with their project link removed."
        onConfirm={() => {
          void remove();
        }}
        onClose={() => setDeleting(null)}
        busy={busy}
        destructive
        confirmLabel="Delete project"
      />
    </div>
  );
}

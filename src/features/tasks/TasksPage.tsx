import { Maximize2, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useShell } from '../../app/ShellContext';
import { Button, Card, ConfirmDialog, EmptyState, PageHeader, useToast } from '../../components/ui';
import { actions } from '../../data/actions';
import { exportTasksCsv } from '../../data/csv';
import { useWorkspace } from '../../data/useWorkspace';
import type { Status, Task } from '../../domain/models';
import { todayKey } from '../../domain/time';
import { downloadText } from '../../lib/download';
import { TaskEditor } from './TaskEditor';
import { TaskToolbar } from './TaskToolbar';
import { TaskViews } from './TaskViews';
import type { TaskFilters } from './taskLogic';
import { filterTasks, taskCounts, workTypes } from './taskLogic';
import './tasks.css';

export default function TasksPage() {
  const workspace = useWorkspace();
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState<TaskFilters>({
    query: params.get('search') ?? '',
    status: '',
    categoryId: '',
    type: params.get('type') ?? '',
  });
  const [view, setView] = useState<'list' | 'table' | 'board'>('list');
  const [editor, setEditor] = useState<{ readonly task: Task | null } | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [busy, setBusy] = useState(false);
  const { focusMode, setFocusMode } = useShell();
  const { toast } = useToast();
  const projectId = params.get('project');
  useEffect(() => {
    setFilters((current) => ({
      ...current,
      query: params.get('search') ?? '',
      type: params.get('type') ?? '',
    }));
  }, [params]);
  const filtered = useMemo(
    () =>
      filterTasks(workspace.tasks, filters).filter(
        (task) => !projectId || task.projectId === projectId,
      ),
    [workspace.tasks, filters, projectId],
  );
  const counts = taskCounts(workspace.tasks, todayKey(new Date(), workspace.settings.timezone));
  async function rename(task: Task, title: string) {
    try {
      await actions.updateTask(task.id, { title });
      toast('Task renamed');
      return true;
    } catch (cause) {
      toast(cause instanceof Error ? cause.message : 'Unable to rename task', 'error');
      return false;
    }
  }
  async function move(task: Task, next: Status) {
    try {
      await actions.updateTask(task.id, { status: next });
      toast(`Moved to ${next}`);
      return true;
    } catch (cause) {
      toast(cause instanceof Error ? cause.message : 'Unable to move task', 'error');
      return false;
    }
  }
  async function remove() {
    if (!deleting) return;
    setBusy(true);
    try {
      await actions.deleteTask(deleting.id);
      setDeleting(null);
      toast('Task deleted. Its work history is preserved.');
    } catch (cause) {
      toast(cause instanceof Error ? cause.message : 'Unable to delete task', 'error');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="page-stack tasks-page">
      <PageHeader
        eyebrow="YOUR WORKSPACE"
        title="My tasks"
        description="A clear view of what needs your attention."
        actions={
          <>
            <Button onClick={() => setFocusMode(!focusMode)} aria-pressed={focusMode}>
              <Maximize2 size={17} />
              {focusMode ? 'Exit focus' : 'Focus view'}
            </Button>
            <Button variant="primary" onClick={() => setEditor({ task: null })}>
              <Plus size={18} />
              New task
            </Button>
          </>
        }
      />
      <div className="stat-grid task-stats">
        {[
          { label: 'Open', value: counts.open, tone: 'open' },
          { label: 'In progress', value: counts.progress, tone: 'progress' },
          { label: 'Closed', value: counts.closed, tone: 'closed' },
          { label: 'Overdue', value: counts.overdue, tone: 'overdue' },
        ].map((item) => (
          <Card className={`stat-card task-stat task-stat--${item.tone}`} key={item.label}>
            <span className="small muted">{item.label}</span>
            <strong>{item.value}</strong>
          </Card>
        ))}
      </div>
      <TaskToolbar
        filters={filters}
        onFilter={(patch) => setFilters((current) => ({ ...current, ...patch }))}
        categories={workspace.categories}
        typeLabels={workspace.settings.typeLabels}
        view={view}
        onView={setView}
        onExport={() =>
          downloadText(
            `task-tracker-${todayKey()}.csv`,
            exportTasksCsv({ ...workspace, tasks: filtered }),
            'text/csv;charset=utf-8',
          )
        }
      />
      <div className="split small muted">
        <span>
          {filtered.length} {filtered.length === 1 ? 'task' : 'tasks'}
          {projectId && (
            <>
              {' '}
              in{' '}
              {workspace.projects.find((project) => project.id === projectId)?.name ??
                'selected project'}{' '}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const next = new URLSearchParams(params);
                  next.delete('project');
                  setParams(next);
                }}
              >
                Clear project filter
              </Button>
            </>
          )}
        </span>
        <Link to="/settings" className="text-link">
          Manage categories & types
        </Link>
      </div>
      {filtered.length ? (
        <TaskViews
          tasks={filtered}
          categories={workspace.categories}
          projects={workspace.projects}
          settings={workspace.settings}
          view={view}
          onEdit={(task) => setEditor({ task })}
          onDelete={setDeleting}
          onRename={rename}
          onStatus={move}
        />
      ) : (
        <Card>
          <EmptyState
            title={workspace.tasks.length ? 'No matching tasks' : 'Start with one task'}
            description={
              workspace.tasks.length
                ? 'Try a different search or filter.'
                : 'Give your work a name, an owner and a next step.'
            }
            action={
              <Button variant="primary" onClick={() => setEditor({ task: null })}>
                Create task
              </Button>
            }
          />
        </Card>
      )}
      {editor && (
        <TaskEditor
          task={editor.task}
          onClose={() => setEditor(null)}
          initialProjectId={projectId}
          initialType={workTypes.find((value) => value === filters.type) ?? 'task'}
        />
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this task?"
        description="Daily entries, plans and notes will keep their history. Their link to this task will be removed."
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          void remove();
        }}
        confirmLabel="Delete task"
        destructive
        busy={busy}
      />
    </div>
  );
}

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
import { TaskSummary } from './TaskSummary';
import { TaskToolbar } from './TaskToolbar';
import { TaskViews } from './TaskViews';
import { taskGroups } from './taskGroups';
import type { TaskFilters } from './taskLogic';
import { filterTasks, workTypes } from './taskLogic';
import type { TaskGroup } from './taskViewTypes';
import { useTaskPreferences } from './useTaskPreferences';
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
  const { preferences, savePreferences } = useTaskPreferences(workspace.settings);
  const groups = taskGroups({ ...workspace.settings, taskView: preferences }, workspace);
  const visibleGroups = groups.filter((group) => !preferences.hiddenGroups.includes(group.id));

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
  const boardFocus = focusMode && preferences.view === 'board';
  const filtered = useMemo(
    () =>
      filterTasks(workspace.tasks, filters).filter(
        (task) => !projectId || task.projectId === projectId,
      ),
    [workspace.tasks, filters, projectId],
  );
  function clearFilters() {
    setFilters({ query: '', status: '', categoryId: '', type: '', projectId: '', businessUnit: '' });
    const next = new URLSearchParams(params);
    next.delete('project');
    next.delete('search');
    next.delete('type');
    setParams(next);
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
  async function moveGroup(task: Task, group: TaskGroup) {
    try {
      await actions.updateTask(task.id, group.patch);
      toast(`Moved to ${group.label}`);
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
    <div className={`page-stack tasks-page${boardFocus ? ' tasks-page--board-focus' : ''}`}>
      {!boardFocus && <PageHeader
        eyebrow="YOUR WORKSPACE"
        title="My tasks"
        description="A clear view of what needs your attention."
        actions={
          <>
            <Button onClick={() => setFocusMode(!focusMode)} aria-pressed={focusMode}>
              <Maximize2 size={17} />
              {focusMode ? 'Exit focus' : preferences.view === 'board' ? 'Focus board' : 'Focus view'}
            </Button>
            <Button variant="primary" onClick={() => setEditor({ task: null })}>
              <Plus size={18} />
              New task
            </Button>
          </>
        }
      />}
      {!boardFocus && <TaskSummary
        tasks={workspace.tasks}
        today={todayKey(new Date(), workspace.settings.timezone)}
      />}
      <TaskToolbar
        onClearFilters={clearFilters}
        projectFilterActive={Boolean(projectId)}
        focus={boardFocus}
        onExitFocus={() => setFocusMode(false)}
        onNewTask={() => setEditor({ task: null })}
        filters={filters}
        onFilter={(patch) => setFilters((current) => ({ ...current, ...patch }))}
        categories={workspace.categories}
        projects={workspace.projects}
        settings={workspace.settings}
        preferences={preferences}
        groups={groups}
        onPreferences={(next) => {
          void savePreferences(next);
        }}
        onExport={() =>
          downloadText(
            `task-tracker-${todayKey()}.csv`,
            exportTasksCsv({ ...workspace, tasks: filtered }),
            'text/csv;charset=utf-8',
          )
        }
      />
      {!boardFocus && <div className="split small muted">
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
      </div>}
      {filtered.length ? (
        <TaskViews
          tasks={filtered}
          categories={workspace.categories}
          projects={workspace.projects}
          settings={workspace.settings}
          view={preferences.view}
          onEdit={(task) => setEditor({ task })}
          onDelete={setDeleting}
          preferences={preferences}
          groups={visibleGroups}
          onMove={moveGroup}
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
              <Button
                variant="primary"
                onClick={() => {
                  if (workspace.tasks.length) clearFilters();
                  else setEditor({ task: null });
                }}
              >
                {workspace.tasks.length ? 'Clear filters' : 'Create task'}
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

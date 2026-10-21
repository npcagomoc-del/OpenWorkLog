import { db } from './db';
import { actions } from './actions';
import { todayKey } from '../domain/time';
import { DEFAULT_SETTINGS, recordMeta, type Workspace } from '../domain/models';
export async function initializeWorkspace(): Promise<void> {
  await db.transaction('rw', db.settings, db.categories, async () => {
    if (await db.settings.get('workspace')) return;
    await db.settings.put(DEFAULT_SETTINGS);
    await db.categories.bulkAdd([
      { ...recordMeta(), name: 'General', color: '#4f7cff', archived: false },
      { ...recordMeta(), name: 'Operations', color: '#19a47a', archived: false },
      { ...recordMeta(), name: 'Learning', color: '#9367d8', archived: false },
    ]);
  });
}
export async function readWorkspace(): Promise<Workspace> {
  const [tasks, projects, categories, notes, plans, dailyEntries, timers, settings] =
    await Promise.all([
      db.tasks.toArray(),
      db.projects.toArray(),
      db.categories.toArray(),
      db.notes.toArray(),
      db.plans.toArray(),
      db.dailyEntries.toArray(),
      db.timers.toArray(),
      db.settings.get('workspace'),
    ]);
  return {
    tasks,
    projects,
    categories,
    notes,
    plans,
    dailyEntries,
    timers,
    settings: settings ?? DEFAULT_SETTINGS,
  };
}
export async function clearDemoData(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    for (const task of await db.tasks.filter((record) => record.demo).toArray())
      await actions.deleteTask(task.id);
    for (const project of await db.projects.filter((record) => record.demo).toArray())
      await actions.deleteProject(project.id);
    for (const table of [db.categories, db.notes, db.plans, db.dailyEntries, db.timers]) {
      const records = await table.toArray();
      await table.bulkDelete(records.filter((v) => v.demo).map((v) => v.id));
    }
  });
}
export async function loadDemoData(): Promise<void> {
  await initializeWorkspace();
  await db.transaction('rw', db.tables, async () => {
    if ((await db.tasks.toArray()).some((v) => v.demo)) return;
    const category = (await db.categories.toArray())[0];
    const project = {
      ...recordMeta(true),
      name: 'Demo · Workspace launch',
      description: 'Example project. Edit or remove the demo in Settings.',
      status: 'In Progress' as const,
      categoryId: category?.id ?? null,
      dueDate: null,
      owner: 'You',
      link: '',
      archived: false,
    };
    await db.projects.add(project);
    await db.tasks.bulkAdd(
      ['Plan this week', 'Review the project checklist', 'Write a daily update'].map(
        (title, index) => ({
          ...recordMeta(true),
          title: `Demo · ${title}`,
          description: 'Sample task for exploring OpenWorkLog.',
          status: index === 1 ? ('In Progress' as const) : ('Open' as const),
          priority: 'Normal' as const,
          type: 'task' as const,
          categoryId: category?.id ?? null,
          projectId: project.id,
          dueDate: todayKey(),
          assignee: 'You',
          ticket: '',
          latestUpdate: '',
          subtasks: [],
          archived: false,
        }),
      ),
    );
    await db.notes.add({
      ...recordMeta(true),
      title: 'Demo · A place for what you learn',
      notebook: 'Getting started',
      content:
        '# Welcome to Study Notes\n\nKeep useful explanations, checklists, and references together.\n\n- [ ] Try editing this note\n- [ ] Add a reference',
      summary: 'A reusable space for study and reference.',
      questions: 'What would I like to learn next?',
      references: '',
      taskId: null,
      pinned: true,
      archived: false,
      reviewedAt: null,
    });
  });
}

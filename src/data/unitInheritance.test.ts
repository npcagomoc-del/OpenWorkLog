import { beforeEach, expect, it } from 'vitest';
import type { DailyEntryCreateInput } from '../domain/models';
import { actions } from './actions';
import { createBackup, parseBackup, restoreBackup } from './backup';
import { db } from './db';
import { initializeWorkspace } from './workspace';

const taskInput = {
  title: 'Unit work',
  description: '',
  status: 'Open' as const,
  priority: 'Normal' as const,
  type: 'task' as const,
  categoryId: null,
  projectId: null,
  dueDate: null,
  assignee: '',
  ticket: '',
  latestUpdate: '',
  subtasks: [],
  archived: false,
};
const planInput = {
  title: 'Plan',
  date: '2026-10-21',
  startMinute: 480,
  endMinute: 510,
  taskId: null,
  projectId: null,
  categoryId: null,
  notes: '',
};
const entryInput: DailyEntryCreateInput = {
  title: 'Entry',
  date: '2026-10-21',
  taskId: null,
  projectId: null,
  categoryId: null,
  plannedStart: null,
  plannedEnd: null,
  actualStart: null,
  actualEnd: null,
  ticket: '',
  projectName: '',
  projectLink: '',
  subtasks: '',
  workDone: '',
  remarks: '',
  status: 'Open',
  isLunch: false,
  timerId: null,
};
beforeEach(async () => {
  await db.delete();
  await db.open();
  await initializeWorkspace();
});
async function projectWithUnit() {
  return actions.createProject({
    name: 'Marine',
    description: '',
    status: 'Open',
    categoryId: null,
    dueDate: null,
    owner: '',
    link: '',
    archived: false,
    businessUnit: 'Marine',
  });
}
it('creates an explicitly unassigned task while inheriting only an omitted unit', async () => {
  const project = await projectWithUnit();
  const blank = await actions.createTask({ ...taskInput, projectId: project.id, businessUnit: '' });
  const inherited = await actions.createTask({ ...taskInput, projectId: project.id });
  expect([blank.businessUnit, inherited.businessUnit]).toEqual(['', 'Marine']);
});
it('creates an explicitly unassigned plan and canonical task while omitted unit inherits', async () => {
  const project = await projectWithUnit();
  const blank = await actions.createPlan({ ...planInput, projectId: project.id, businessUnit: '' });
  const inherited = await actions.createPlan({ ...planInput, projectId: project.id });
  expect([blank.businessUnit, inherited.businessUnit]).toEqual(['', 'Marine']);
  expect((await db.tasks.get(blank.taskId ?? ''))?.businessUnit).toBe('');
});
it('creates an explicitly unassigned daily entry and generated plan while omitted unit inherits', async () => {
  const project = await projectWithUnit();
  const blank = await actions.createDailyEntry({
    ...entryInput,
    projectId: project.id,
    businessUnit: '',
    plannedStart: 480,
    plannedEnd: 510,
  });
  const inherited = await actions.createDailyEntry({ ...entryInput, projectId: project.id });
  expect([blank.businessUnit, inherited.businessUnit]).toEqual(['', 'Marine']);
  expect((await db.plans.get(blank.planId ?? ''))?.businessUnit).toBe('');
  expect((await db.tasks.get(blank.taskId ?? ''))?.businessUnit).toBe('');
});
it('inherits an explicitly unassigned task snapshot instead of its assigned project', async () => {
  const project = await projectWithUnit();
  const task = await actions.createTask({ ...taskInput, projectId: project.id, businessUnit: '' });
  const plan = await actions.createPlan({ ...planInput, taskId: task.id, projectId: project.id });
  expect(plan.businessUnit).toBe('');
});
it('restores old backup units as unassigned without inheriting newly linked project context', async () => {
  const project = await projectWithUnit();
  await actions.createPlan({ ...planInput, projectId: project.id });
  const backup = parseBackup(await createBackup());
  await restoreBackup(
    JSON.stringify({
      ...backup,
      data: {
        ...backup.data,
        plans: backup.data.plans.map(({ businessUnit: _unit, ...plan }) => plan),
        tasks: backup.data.tasks.map(({ businessUnit: _unit, ...task }) => task),
      },
    }),
  );
  expect((await db.plans.toArray()).map((plan) => plan.businessUnit)).toEqual(['']);
  expect((await db.tasks.toArray()).map((task) => task.businessUnit)).toEqual(['']);
});
it('inherits an explicitly unassigned selected plan snapshot after its parent task changes unit', async () => {
  const project = await projectWithUnit();
  const plan = await actions.createPlan({ ...planInput, projectId: project.id, businessUnit: '' });
  await actions.updateTask(plan.taskId ?? '', { businessUnit: 'Office' });
  const entry = await actions.createDailyEntry({
    ...entryInput,
    planId: plan.id,
    projectId: project.id,
  });
  expect(entry.businessUnit).toBe('');
});

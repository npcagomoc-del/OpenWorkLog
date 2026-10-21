import { beforeEach, expect, it, vi } from 'vitest';
import {
  DEFAULT_SETTINGS,
  isTerminalStatus,
  recordMeta,
  STATUS_VALUES,
  taskSchema,
  timerSchema,
} from '../domain/models';
import { actions } from './actions';
import { createBackup, parseBackup, restoreBackup } from './backup';
import { exportTasksCsv, previewTasksCsv } from './csv';
import { db } from './db';
import { initializeWorkspace, readWorkspace } from './workspace';

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
beforeEach(async () => {
  await db.delete();
  await db.open();
  await initializeWorkspace();
});
it('accepts all five statuses and defaults older records to an empty business unit', () => {
  expect(
    ['Open', 'In Progress', 'On Hold', 'Closed', 'Cancelled'].map(
      (status) => taskSchema.parse({ ...taskInput, ...recordMeta(), status }).status,
    ),
  ).toEqual(['Open', 'In Progress', 'On Hold', 'Closed', 'Cancelled']);
  expect(taskSchema.parse({ ...taskInput, ...recordMeta() })).toHaveProperty('businessUnit', '');
});
it('round trips five statuses and business units through task CSV', async () => {
  const workspace = await readWorkspace();
  const preview = previewTasksCsv(
    'Task,Status,Business Unit\r\nAlpha,On Hold,Marine\r\nBeta,Cancelled,Office',
    workspace,
  );
  expect(preview.errors).toEqual([]);
  expect(preview.rows.map((row) => row.businessUnit)).toEqual(['Marine', 'Office']);
  await actions.createTask({ ...taskInput, businessUnit: 'Marine', status: 'On Hold' });
  expect(exportTasksCsv(await readWorkspace())).toContain('"Business Unit"');
  expect(exportTasksCsv(await readWorkspace())).toContain('"Marine"');
});
it('inherits project units into connected plans and tasks without rewriting saved history', async () => {
  const project = await actions.createProject({
    name: 'Project',
    description: '',
    status: 'Open',
    categoryId: null,
    dueDate: null,
    owner: '',
    link: '',
    archived: false,
    businessUnit: 'Marine',
  });
  const plan = await actions.createPlan({
    title: 'Review',
    date: '2026-10-21',
    startMinute: 480,
    endMinute: 510,
    taskId: null,
    projectId: project.id,
    categoryId: null,
    notes: '',
  });
  expect(plan.businessUnit).toBe('Marine');
  expect((await db.tasks.get(plan.taskId ?? ''))?.businessUnit).toBe('Marine');
  await actions.updateProject(project.id, { businessUnit: 'Office' });
  expect((await db.plans.get(plan.id))?.businessUnit).toBe('Marine');
});
it('restores old backup defaults and partial status palettes', async () => {
  await actions.createTask(taskInput);
  const backup = parseBackup(await createBackup());
  const legacyTasks = backup.data.tasks.map(({ businessUnit: _unit, ...task }) => task);
  const { businessUnits: _units, statusColors: _colors, ...settings } = DEFAULT_SETTINGS;
  await restoreBackup(
    JSON.stringify({ ...backup, data: { ...backup.data, tasks: legacyTasks, settings } }),
  );
  expect((await readWorkspace()).tasks[0]?.businessUnit).toBe('');
  expect((await readWorkspace()).settings.statusColors).toEqual({});
  const saved = await actions.updateSettings({ statusColors: { 'On Hold': '#ff8844' } });
  expect(saved.statusColors).toEqual({ 'On Hold': '#ff8844' });
});

it('classifies hold as unfinished and cancellation as terminal without treating it as completion', () => {
  expect(STATUS_VALUES.filter(isTerminalStatus)).toEqual(['Closed', 'Cancelled']);
  expect(isTerminalStatus('On Hold')).toBe(false);
});
it('renames exact units across records and timer snapshots in one transaction', async () => {
  const task = await actions.createTask({ ...taskInput, businessUnit: 'Marine' });
  const plan = await actions.createPlan({
    title: 'Review',
    date: '2026-10-21',
    startMinute: 480,
    endMinute: 510,
    taskId: task.id,
    projectId: null,
    categoryId: null,
    notes: '',
  });
  const timer = timerSchema.parse({
    ...recordMeta(),
    title: 'Timed review',
    businessUnit: 'Marine',
    taskId: task.id,
    projectId: null,
    categoryId: null,
    state: 'paused',
    entryId: null,
    sourceDetails: {
      ticket: '',
      projectName: '',
      projectLink: '',
      subtasks: '',
      businessUnit: 'Marine',
    },
    segments: [{ start: '2026-10-21T00:00:00Z', end: '2026-10-21T00:05:00Z' }],
  });
  await db.timers.add(timer);
  await actions.updateSettings({ businessUnits: ['Marine', 'Office'] });
  await actions.renameBusinessUnit('Marine', 'Vessel');
  expect((await db.tasks.get(task.id))?.businessUnit).toBe('Vessel');
  expect((await db.plans.get(plan.id))?.businessUnit).toBe('Vessel');
  expect((await db.timers.get(timer.id))?.sourceDetails?.businessUnit).toBe('Vessel');
  expect((await readWorkspace()).settings.businessUnits).toEqual(['Office', 'Vessel']);
});
it('rolls back a business unit rename if settings persistence fails', async () => {
  const task = await actions.createTask({ ...taskInput, businessUnit: 'Marine' });
  const failure = vi
    .spyOn(db.settings, 'put')
    .mockRejectedValueOnce(new DOMException('Storage failed', 'QuotaExceededError'));
  await expect(actions.renameBusinessUnit('Marine', 'Vessel')).rejects.toThrow('Storage failed');
  failure.mockRestore();
  expect((await db.tasks.get(task.id))?.businessUnit).toBe('Marine');
});
it('keeps an unassigned saved snapshot empty after its linked task changes unit', async () => {
  const plan = await actions.createPlan({
    title: 'Unassigned',
    date: '2026-10-21',
    startMinute: 480,
    endMinute: 510,
    taskId: null,
    projectId: null,
    categoryId: null,
    notes: '',
  });
  await actions.updateTask(plan.taskId ?? '', { businessUnit: 'Marine' });
  const edited = await actions.updatePlan(plan.id, { notes: 'Retain original context' });
  expect(edited.businessUnit).toBe('');
});

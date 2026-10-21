import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  dailyEntrySchema,
  planSchema,
  projectSchema,
  taskSchema,
  type Workspace,
} from '../../domain/models';
import { executiveMetrics } from './executiveMetrics';
import { executiveCsv } from './executiveCsv';

const meta = { createdAt: '2026-10-21T00:00:00Z', updatedAt: '2026-10-21T00:00:00Z', demo: false };
const task = (id: string) =>
  taskSchema.parse({
    ...meta,
    id,
    title: id,
    description: '',
    status: 'Open',
    priority: 'Normal',
    type: 'operational',
    categoryId: 'ops',
    projectId: null,
    dueDate: '2026-10-20',
    assignee: 'NPC',
    ticket: '',
    latestUpdate: '',
    subtasks: [],
    archived: false,
  });
const project = projectSchema.parse({
  ...meta,
  id: 'p',
  name: 'Network upgrade',
  description: '',
  status: 'In Progress',
  categoryId: 'ops',
  dueDate: '2026-10-30',
  owner: 'NPC',
  link: '',
  archived: false,
});
const entry = (id: string) =>
  dailyEntrySchema.parse({
    ...meta,
    id,
    date: '2026-10-21',
    plannedStart: 480,
    plannedEnd: 540,
    actualStart: 490,
    actualEnd: 530,
    taskId: 't',
    projectId: 'p',
    categoryId: 'ops',
    title: id,
    ticket: '',
    projectName: '',
    projectLink: '',
    subtasks: '',
    workDone: '',
    remarks: '',
    status: 'Closed',
    isLunch: false,
    timerId: null,
    planId: 'plan',
  });
const plan = planSchema.parse({
  ...meta,
  id: 'plan',
  title: 'Scheduled upgrade',
  date: '2026-10-21',
  startMinute: 480,
  endMinute: 540,
  taskId: 't',
  projectId: 'p',
  categoryId: 'ops',
  notes: '',
});
const scope = { from: '2026-10-21', to: '2026-10-21', categoryId: '', owner: '' };
function workspace(): Workspace {
  return {
    tasks: [
      { ...task('t'), type: 'project', projectId: 'p' },
      { ...task('old'), archived: true },
    ],
    projects: [project],
    categories: [{ ...meta, id: 'ops', name: 'Operations', color: '#0969c7', archived: false }],
    plans: [plan],
    dailyEntries: [entry('entry')],
    timers: [],
    notes: [],
    settings: DEFAULT_SETTINGS,
  };
}

describe('executive metrics', () => {
  it('counts project records once and keeps project tasks in the task totals', () => {
    const result = executiveMetrics(workspace(), scope, '2026-10-21');
    expect(result.tasks).toHaveLength(1);
    expect(result.projects).toHaveLength(1);
    expect(result.portfolio.map((row) => [row.label, row.total])).toEqual([
      ['Operational tasks', 0],
      ['Other tasks', 1],
      ['Projects', 1],
    ]);
    expect(result.overdue).toHaveLength(1);
  });
  it('uses actual segments, excludes lunch and counts linked planned time once', () => {
    const data = workspace();
    const result = executiveMetrics(
      {
        ...data,
        dailyEntries: [
          {
            ...entry('entry'),
            actualSegments: [
              { startMinute: 490, endMinute: 500 },
              { startMinute: 520, endMinute: 530 },
            ],
          },
          { ...entry('lunch'), isLunch: true, actualStart: 720, actualEnd: 780, planId: null },
        ],
      },
      scope,
      '2026-10-21',
    );
    expect(result.loggedMinutes).toBe(20);
    expect(result.breakMinutes).toBe(60);
    expect(result.plannedMinutes).toBe(60);
    expect(result.activity[0]).toMatchObject({ actual: 20, planned: 60 });
  });
  it('filters period data without turning current portfolio into a historical snapshot', () => {
    const result = executiveMetrics(
      workspace(),
      { ...scope, from: '2026-10-20', to: '2026-10-20' },
      '2026-10-21',
    );
    expect(result.loggedMinutes).toBe(0);
    expect(result.plannedMinutes).toBe(0);
    expect(result.tasks).toHaveLength(1);
    expect(result.overdue).toHaveLength(1);
  });
  it('retains historical hours of archived tasks and filters owners and categories consistently', () => {
    const data = workspace();
    const result = executiveMetrics(
      { ...data, dailyEntries: [{ ...entry('history'), taskId: 'old' }] },
      { ...scope, categoryId: 'ops', owner: 'NPC' },
      '2026-10-21',
    );
    expect(result.loggedMinutes).toBe(40);
    expect(result.ownerWork[0]).toMatchObject({ name: 'NPC', open: 1, minutes: 40 });
    expect(
      executiveMetrics(data, { ...scope, owner: 'Another owner' }, '2026-10-21').tasks,
    ).toHaveLength(0);
  });
  it('counts a daily planned interval with no plan record and bounds chart buckets for long ranges', () => {
    const data = workspace();
    const result = executiveMetrics(
      { ...data, plans: [], dailyEntries: [{ ...entry('manual'), planId: null }] },
      { ...scope, from: '2000-01-01', to: '2099-12-31' },
      '2026-10-21',
    );
    expect(result.plannedMinutes).toBe(60);
    expect(result.activity.length).toBeLessThanOrEqual(14);
    expect(result.activity.reduce((sum, bucket) => sum + bucket.planned, 0)).toBe(60);
  });
  it('exports exact summary values and protects formula-like category text', () => {
    const data = workspace();
    const result = executiveMetrics(
      {
        ...data,
        categories: [
          {
            ...data.categories[0],
            ...meta,
            id: 'ops',
            name: '=SUM(1,2)',
            color: '#0969c7',
            archived: false,
          },
        ],
      },
      scope,
      '2026-10-21',
    );
    const csv = executiveCsv(result, scope);
    expect(csv).toContain('"\'=SUM(1,2)"');
    expect(csv).toContain('"Productive time","40"');
    expect(csv).toContain('"Planned time","60"');
  });
});

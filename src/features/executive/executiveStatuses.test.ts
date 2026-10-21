import { describe, expect, it } from 'vitest';
import { parse } from 'csv-parse/sync';
import {
  DEFAULT_SETTINGS,
  STATUS_VALUES,
  dailyEntrySchema,
  projectSchema,
  taskSchema,
  type Workspace,
} from '../../domain/models';
import { executiveMetrics } from './executiveMetrics';
import { executiveCsv } from './executiveCsv';
const meta = { createdAt: '2026-10-21T00:00:00Z', updatedAt: '2026-10-21T00:00:00Z', demo: false };
const scope = { from: '2026-10-21', to: '2026-10-21', categoryId: '', owner: '' };
function fixture(): Workspace {
  return {
    tasks: STATUS_VALUES.map((status, index) =>
      taskSchema.parse({
        ...meta,
        id: `t${index}`,
        title: status,
        description: '',
        priority: 'Normal',
        type: 'operational',
        categoryId: null,
        projectId: null,
        ticket: '',
        latestUpdate: '',
        subtasks: [],
        archived: false,
        status,
        businessUnit: 'Operations',
        dueDate: '2026-10-20',
        assignee: 'NPC',
      }),
    ),
    projects: STATUS_VALUES.map((status, index) =>
      projectSchema.parse({
        ...meta,
        id: `p${index}`,
        name: status,
        description: '',
        categoryId: null,
        owner: '',
        link: '',
        archived: false,
        status,
        businessUnit: 'Operations',
        dueDate: '2026-10-20',
      }),
    ),
    dailyEntries: [
      dailyEntrySchema.parse({
        ...meta,
        id: 'history',
        date: scope.from,
        title: 'Work before cancellation',
        plannedStart: null,
        plannedEnd: null,
        projectId: null,
        categoryId: null,
        ticket: '',
        projectName: '',
        projectLink: '',
        subtasks: '',
        workDone: '',
        remarks: '',
        isLunch: false,
        timerId: null,
        taskId: 't4',
        status: 'Closed',
        businessUnit: 'Historic unit',
        actualStart: 480,
        actualEnd: 540,
      }),
    ],
    plans: [],
    timers: [],
    notes: [],
    categories: [],
    settings: DEFAULT_SETTINGS,
  };
}
describe('five status reporting', () => {
  it('counts every status once and excludes cancellation from unfinished and closed completion', () => {
    const result = executiveMetrics(fixture(), scope, scope.to);
    expect(result.taskCounts.map((item) => [item.status, item.count])).toEqual(
      STATUS_VALUES.map((status) => [status, 1]),
    );
    expect(result.openTasks).toBe(3);
    expect(result.activeProjects).toBe(3);
    expect(result.overdue).toHaveLength(3);
    expect(result.ownerWork[0]).toMatchObject({ open: 3, closed: 1, total: 5, minutes: 60 });
    expect(result.loggedMinutes).toBe(60);
  });
  it('uses saved activity unit before current linked task unit and falls back for legacy history', () => {
    const data = fixture();
    const history = executiveMetrics(data, { ...scope, businessUnit: 'Historic unit' }, scope.to);
    expect(history.tasks).toHaveLength(0);
    expect(history.loggedMinutes).toBe(60);
    const current = executiveMetrics(data, { ...scope, businessUnit: 'Operations' }, scope.to);
    expect(current.tasks).toHaveLength(5);
    expect(current.loggedMinutes).toBe(0);
    const legacy = executiveMetrics(
      {
        ...data,
        dailyEntries: data.dailyEntries.map((entry) => ({ ...entry, businessUnit: undefined })),
      },
      { ...scope, businessUnit: 'Operations' },
      scope.to,
    );
    expect(legacy.loggedMinutes).toBe(60);
    const unassigned = executiveMetrics(
      { ...data, dailyEntries: data.dailyEntries.map((entry) => ({ ...entry, businessUnit: '' })) },
      { ...scope, businessUnit: '__unassigned__' },
      scope.to,
    );
    expect(unassigned.loggedMinutes).toBe(60);
    expect(unassigned.tasks).toHaveLength(0);
  });
  it('exports aligned five-status CSV columns with exact totals and business unit scope', () => {
    const selected = { ...scope, businessUnit: 'Operations' };
    const result = executiveMetrics(fixture(), selected, scope.to);
    const rows: readonly Record<string, string>[] = parse(executiveCsv(result, selected), {
      columns: true,
      bom: true,
    });
    const tasks = rows.find((row) => row['Item'] === 'Operational tasks');
    expect(STATUS_VALUES.map((status) => tasks?.[status])).toEqual(['1', '1', '1', '1', '1']);
    expect(tasks?.['Value']).toBe('5');
    expect(rows.every((row) => row['Business Unit Filter'] === 'Operations')).toBe(true);
  });
});

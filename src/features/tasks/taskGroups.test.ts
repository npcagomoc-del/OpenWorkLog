import { describe, expect, it } from 'vitest';
import type { Settings, Task } from '../../domain/models';
import { DEFAULT_SETTINGS } from '../../domain/models';
import { belongsToGroup, taskGroups } from './taskGroups';

const task: Task = {
  id: 't',
  title: 'Task',
  description: '',
  status: 'Open',
  priority: 'Normal',
  type: 'task',
  categoryId: null,
  projectId: null,
  businessUnit: 'Operations',
  dueDate: null,
  assignee: '',
  ticket: '',
  latestUpdate: '',
  subtasks: [],
  archived: false,
  demo: false,
  createdAt: '',
  updatedAt: '',
};
describe('task board grouping', () => {
  it('includes all five status destinations and excludes terminal cancelled from other groups', () => {
    const groups = taskGroups(DEFAULT_SETTINGS, { tasks: [task], projects: [], categories: [] });
    expect(groups.map((group) => group.label)).toEqual([
      'Open',
      'In Progress',
      'On Hold',
      'Closed',
      'Cancelled',
    ]);
    expect(
      groups.filter((group) => belongsToGroup(task, group)).map((group) => group.label),
    ).toEqual(['Open']);
  });
  it('retains unknown business units and group moves only patch the grouping field', () => {
    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      taskView: {
        view: 'board',
        groupBy: 'businessUnit',
        hiddenGroups: [],
        fields: {
          category: false,
          project: false,
          businessUnit: true,
          dueDate: true,
          priority: true,
          assignee: false,
          latestUpdate: false,
        },
      },
    };
    const groups = taskGroups(settings, { tasks: [task], projects: [], categories: [] });
    expect(groups.map((group) => group.label)).toEqual(['No business unit', 'Operations']);
    expect(groups[1]?.patch).toEqual({ businessUnit: 'Operations' });
    expect(groups[0]?.patch).toEqual({ businessUnit: '' });
  });
});

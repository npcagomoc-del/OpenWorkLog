import { describe, expect, it } from 'vitest';
import type { Task } from '../../domain/models';
import { filterTasks, taskCounts } from './taskLogic';

const task: Task = {
  id: 'task-1',
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
  demo: false,
  title: 'Check the backup',
  description: 'Restore verification',
  status: 'Open',
  priority: 'Normal',
  type: 'operational',
  categoryId: 'systems',
  projectId: 'project-1',
  dueDate: '2026-10-20',
  assignee: 'Pat',
  ticket: 'INC-102',
  latestUpdate: 'Waiting for restore window',
  subtasks: [],
  archived: false,
};
const filters = { query: '', status: '', categoryId: '', type: '' };
describe('task filtering and overview', () => {
  it('combines search with status, category and editable-label-independent work type', () => {
    const selected = filterTasks([task, { ...task, id: 'task-2', type: 'task' }], {
      query: 'inc-102',
      status: 'Open',
      categoryId: 'systems',
      type: 'operational',
    });
    expect(selected.map((item) => item.id)).toEqual(['task-1']);
    expect(filterTasks([task], { ...filters, query: 'restORE' })).toHaveLength(1);
    expect(filterTasks([task], { ...filters, categoryId: 'other' })).toHaveLength(0);
  });
  it('keeps archived work out and sorts due work before unscheduled work', () => {
    const result = filterTasks(
      [
        { ...task, id: 'unscheduled', dueDate: null },
        { ...task, id: 'archived', archived: true },
        task,
      ],
      filters,
    );
    expect(result.map((item) => item.id)).toEqual(['task-1', 'unscheduled']);
  });
  it('does not count closed or archived work as overdue', () => {
    expect(
      taskCounts(
        [
          task,
          { ...task, id: 'closed', status: 'Closed' },
          { ...task, id: 'archived', archived: true },
        ],
        '2026-10-21',
      ),
    ).toEqual({ open: 1, progress: 0, closed: 1, overdue: 1 });
  });
});

import { describe, expect, it } from 'vitest';
import type { Category } from '../../domain/models';
import { categoryForPlan } from './calendarCategory';

const category = (id: string, color: string): Category => ({
  id, name: id, color, archived: false,
  createdAt: '', updatedAt: '', demo: false,
});
const plan = { taskId: 'task-1', categoryId: 'old' };

describe('calendar category identity', () => {
  it('uses the current linked task category when the task is recategorized', () => {
    const old = category('old', '#123456');
    const current = category('current', '#b58a16');
    const task = { id: 'task-1', categoryId: 'current' };
    expect(categoryForPlan(plan, [task], [old, current])).toBe(current);
  });

  it('falls back to the plan category and handles retired category IDs', () => {
    const old = category('old', '#123456');
    expect(categoryForPlan(plan, [], [old])).toBe(old);
    expect(categoryForPlan(plan, [], [])).toBeUndefined();
  });

  it('shows no category when a linked task category is cleared', () => {
    const old = category('old', '#123456');
    expect(categoryForPlan(plan, [{ id: 'task-1', categoryId: null }], [old])).toBeUndefined();
  });
});

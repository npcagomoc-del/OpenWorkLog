import { beforeEach, expect, it } from 'vitest';
import { actions } from './actions';
import { db } from './db';
import { initializeWorkspace } from './workspace';

beforeEach(async () => {
  await db.delete();
  await db.open();
  await initializeWorkspace();
});
async function fixture() {
  const plan = await actions.createPlan({
    title: 'Work',
    date: '2026-10-21',
    startMinute: 480,
    endMinute: 510,
    taskId: null,
    projectId: null,
    categoryId: null,
    notes: '',
  });
  const category = await actions.createCategory({
    name: 'Changed',
    color: '#123456',
    archived: false,
  });
  return { plan, category };
}
it('propagates an explicit plan category edit and clear to its linked task', async () => {
  const { plan, category } = await fixture();
  await actions.updatePlan(plan.id, { categoryId: category.id });
  expect((await db.tasks.get(plan.taskId ?? ''))?.categoryId).toBe(category.id);
  await actions.updatePlan(plan.id, { categoryId: null });
  expect((await db.tasks.get(plan.taskId ?? ''))?.categoryId).toBeNull();
});
it('preserves newer canonical category during unchanged full form and rescheduling', async () => {
  const { plan, category } = await fixture();
  await actions.updateTask(plan.taskId ?? '', { categoryId: category.id });
  await actions.updatePlan(plan.id, { ...plan, date: '2026-10-22' });
  expect((await db.tasks.get(plan.taskId ?? ''))?.categoryId).toBe(category.id);
});
it('keeps deleted tasks detached and rolls back invalid category updates', async () => {
  const { plan, category } = await fixture();
  await expect(actions.updatePlan(plan.id, { categoryId: 'missing' })).rejects.toThrow();
  expect((await db.tasks.get(plan.taskId ?? ''))?.categoryId).toBeNull();
  expect((await db.plans.get(plan.id))?.categoryId).toBeNull();
  await actions.deleteTask(plan.taskId ?? '');
  await actions.updatePlan(plan.id, { categoryId: category.id });
  expect(await db.tasks.count()).toBe(0);
  expect((await db.plans.get(plan.id))?.taskDetached).toBe(true);
});
it('applies the chosen category when explicitly creating a plan linked to an existing task', async () => {
  const { plan, category } = await fixture();
  await actions.createPlan({ ...plan, date: '2026-10-23', categoryId: category.id });
  expect((await db.tasks.get(plan.taskId ?? ''))?.categoryId).toBe(category.id);
  await actions.createPlan({ ...plan, date: '2026-10-24', categoryId: null });
  expect((await db.tasks.get(plan.taskId ?? ''))?.categoryId).toBeNull();
});

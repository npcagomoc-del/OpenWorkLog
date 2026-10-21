import { db } from './db';

export type WorkUnitSource = {
  readonly businessUnit?: string | undefined;
  readonly taskId?: string | null | undefined;
  readonly planId?: string | null | undefined;
  readonly projectId?: string | null | undefined;
};
/** Capture context at creation; explicit snapshots, including Unassigned, take precedence. */
export async function inheritedBusinessUnit(work: WorkUnitSource): Promise<string> {
  if (work.businessUnit !== undefined) return work.businessUnit;
  const plan = work.planId ? await db.plans.get(work.planId) : undefined;
  if (!work.taskId && plan?.businessUnit !== undefined) return plan.businessUnit;
  const taskId = work.taskId ?? plan?.taskId;
  const task = taskId ? await db.tasks.get(taskId) : undefined;
  if (task?.businessUnit !== undefined) return task.businessUnit;
  if (plan?.businessUnit !== undefined) return plan.businessUnit;
  const projectId = work.projectId ?? task?.projectId ?? plan?.projectId;
  const project = projectId ? await db.projects.get(projectId) : undefined;
  return project?.businessUnit ?? '';
}

import type { CSSProperties } from 'react';
import type { Category, Plan, Task } from '../../domain/models';

export function categoryForPlan(
  plan: Pick<Plan, 'taskId' | 'categoryId'>,
  tasks: readonly Pick<Task, 'id' | 'categoryId'>[],
  categories: readonly Category[],
): Category | undefined {
  const task = tasks.find((item) => item.id === plan.taskId);
  const categoryId = task ? task.categoryId : plan.categoryId;
  return categories.find((item) => item.id === categoryId);
}

export function categoryStyle(category: Category | undefined): CSSProperties {
  if (!category) return {};
  const style: CSSProperties & { '--calendar-category-color': string } = {
    '--calendar-category-color': category.color,
  };
  return style;
}

import { Card } from '../../components/ui';
import type { Task } from '../../domain/models';
import { taskCounts } from './taskLogic';
export function TaskSummary({
  tasks,
  today,
}: {
  readonly tasks: readonly Task[];
  readonly today: string;
}) {
  const counts = taskCounts(tasks, today);
  const items = [
    { label: 'Open', value: counts.open },
    { label: 'In progress', value: counts.progress },
    {
      label: 'On Hold',
      value: tasks.filter((task) => !task.archived && task.status === 'On Hold').length,
    },
    { label: 'Closed', value: counts.closed },
    {
      label: 'Cancelled',
      value: tasks.filter((task) => !task.archived && task.status === 'Cancelled').length,
    },
    { label: 'Overdue', value: counts.overdue },
  ];
  return (
    <div className="task-stats">
      {items.map((item) => (
        <Card className="task-stat" key={item.label}>
          <span className="small muted">{item.label}</span>
          <strong>{item.value}</strong>
        </Card>
      ))}
    </div>
  );
}

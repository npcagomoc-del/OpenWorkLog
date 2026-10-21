import type { Category, Project, Settings, Status, Task } from '../../domain/models';

export type TaskViewProps = {
  readonly tasks: readonly Task[];
  readonly categories: readonly Category[];
  readonly projects: readonly Project[];
  readonly settings: Settings;
  readonly view: 'list' | 'table' | 'board';
  readonly onEdit: (task: Task) => void;
  readonly onDelete: (task: Task) => void;
  readonly onRename: (task: Task, title: string) => Promise<boolean>;
  readonly onStatus: (task: Task, status: Status) => Promise<boolean>;
};

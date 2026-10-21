import type { Category, Project, Settings, Status, Task } from '../../domain/models';
export type TaskPreferences = NonNullable<Settings['taskView']>;
export type TaskGroup = {
  readonly id: string;
  readonly label: string;
  readonly patch: Partial<Pick<Task, 'status' | 'categoryId' | 'projectId' | 'businessUnit'>>;
};
export type TaskViewProps = {
  readonly tasks: readonly Task[];
  readonly categories: readonly Category[];
  readonly projects: readonly Project[];
  readonly settings: Settings;
  readonly view: 'list' | 'table' | 'board';
  readonly preferences: TaskPreferences;
  readonly groups: readonly TaskGroup[];
  readonly onEdit: (task: Task) => void;
  readonly onDelete: (task: Task) => void;
  readonly onStatus: (task: Task, status: Status) => Promise<boolean>;
  readonly onMove: (task: Task, group: TaskGroup) => Promise<boolean>;
};

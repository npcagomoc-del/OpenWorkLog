import Dexie, { type Table } from 'dexie';
import type {
  Task,
  Project,
  Category,
  Note,
  Plan,
  DailyEntry,
  Timer,
  Settings,
} from '../domain/models';
export class WorkLogDatabase extends Dexie {
  readonly tasks: Table<Task, string>;
  readonly projects: Table<Project, string>;
  readonly categories: Table<Category, string>;
  readonly notes: Table<Note, string>;
  readonly plans: Table<Plan, string>;
  readonly dailyEntries: Table<DailyEntry, string>;
  readonly timers: Table<Timer, string>;
  readonly settings: Table<Settings, string>;
  constructor(name = 'OpenWorkLog') {
    super(name);
    this.version(1).stores({
      tasks: 'id,status,categoryId,projectId,dueDate',
      projects: 'id,status,categoryId',
      categories: 'id,name',
      notes: 'id,notebook,taskId',
      plans: 'id,date,taskId,projectId',
      dailyEntries: 'id,date,taskId,projectId,timerId',
      timers: 'id,state,taskId',
      settings: 'id',
    });
    this.tasks = this.table('tasks');
    this.projects = this.table('projects');
    this.categories = this.table('categories');
    this.notes = this.table('notes');
    this.plans = this.table('plans');
    this.dailyEntries = this.table('dailyEntries');
    this.timers = this.table('timers');
    this.settings = this.table('settings');
  }
}
export const db = new WorkLogDatabase();

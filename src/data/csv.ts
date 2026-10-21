import { recordMeta, type TaskCreateInput, taskSchema, type Workspace } from '../domain/models';
import { entryMinutes, minuteLabel } from '../domain/time';
import { db } from './db';
import { checkLinks } from './relations';

function segmentTime(minute: number): string {
  const seconds = Math.round(minute * 60);
  return [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}
function cell(value: string): string {
  const safe = /^[\s]*[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}
function csv(rows: readonly (readonly string[])[]): string {
  return '\uFEFF' + rows.map((row) => row.map(cell).join(',')).join('\r\n');
}
export function exportTasksCsv(workspace: Workspace): string {
  return csv([
    [
      'ID',
      'Task',
      'Category',
      'By Whom',
      'By When',
      'Status',
      'Latest Update',
      'Type',
      'Priority',
      'Project',
      'Description',
      'Ticket',
      'Business Unit',
    ],
    ...workspace.tasks.map((task) => [
      task.id,
      task.title,
      workspace.categories.find((c) => c.id === task.categoryId)?.name ?? '',
      task.assignee,
      task.dueDate ?? '',
      task.status,
      task.latestUpdate,
      workspace.settings.typeLabels[task.type],
      task.priority,
      workspace.projects.find((p) => p.id === task.projectId)?.name ?? '',
      task.description,
      task.ticket,
      task.businessUnit ?? '',
    ]),
  ]);
}
export function exportDailyCsv(workspace: Workspace, date?: string): string {
  const time = (v: number | null) => (v === null ? '' : minuteLabel(v));
  return csv([
    [
      'Date',
      'Planned From',
      'Planned To',
      'Category',
      'Ticket Number',
      'Project Name',
      'Project Link',
      'Task',
      'Subtasks',
      'Work done',
      'Actual From',
      'Actual To',
      'Status',
      'Remarks',
      'Lunch',
      'Productive Minutes',
      'Active Segments',
      'Business Unit',
    ],
    ...workspace.dailyEntries
      .filter((e) => !date || e.date === date)
      .map((e) => [
        e.date,
        time(e.plannedStart),
        time(e.plannedEnd),
        workspace.categories.find((c) => c.id === e.categoryId)?.name ?? '',
        e.ticket,
        e.projectName || workspace.projects.find((p) => p.id === e.projectId)?.name || '',
        e.projectLink,
        e.title,
        e.subtasks,
        e.workDone,
        time(e.actualStart),
        time(e.actualEnd),
        e.status,
        e.remarks,
        e.isLunch ? 'Yes' : 'No',
        String(Number(entryMinutes(e).toFixed(2))),
        e.actualSegments
          ?.map(
            (segment) => segmentTime(segment.startMinute) + '–' + segmentTime(segment.endMinute),
          )
          .join('; ') ?? '',
        e.businessUnit ?? '',
      ]),
  ]);
}
export type CsvPreview = {
  readonly rows: TaskCreateInput[];
  readonly errors: { row: number; message: string }[];
};
function parseRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;
  const input = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '"') {
      if (quoted && input[i + 1] === '"') {
        value += '"';
        i++;
      } else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(value);
      value = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && input[i + 1] === '\n') i++;
      row.push(value);
      if (row.some((v) => v.trim())) rows.push(row);
      row = [];
      value = '';
    } else value += char ?? '';
  }
  if (quoted) throw new SyntaxError('An opening quote is not closed.');
  row.push(value);
  if (row.some((v) => v.trim())) rows.push(row);
  return rows;
}
export function previewTasksCsv(text: string, workspace: Workspace): CsvPreview {
  const errors: { row: number; message: string }[] = [];
  const result: TaskCreateInput[] = [];
  let rows: string[][];
  try {
    rows = parseRows(text);
  } catch (error) {
    if (error instanceof SyntaxError)
      return { rows: [], errors: [{ row: 1, message: error.message }] };
    throw error;
  }
  const headers = rows.shift()?.map((h) => h.trim().toLowerCase()) ?? [];
  if (!headers.includes('task') || !headers.includes('status'))
    return { rows: [], errors: [{ row: 1, message: 'CSV requires Task and Status columns.' }] };
  if (new Set(headers).size !== headers.length)
    return { rows: [], errors: [{ row: 1, message: 'CSV has duplicate column headers.' }] };
  rows.forEach((row, index) => {
    if (row.length !== headers.length) {
      errors.push({ row: index + 2, message: 'Column count does not match the header.' });
      return;
    }
    const get = (name: string) => row[headers.indexOf(name)]?.trim() ?? '';
    const categoryName = get('category');
    const projectName = get('project');
    const category = workspace.categories.find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
    );
    const project = workspace.projects.find(
      (p) => p.name.toLowerCase() === projectName.toLowerCase(),
    );
    if (categoryName && !category) {
      errors.push({
        row: index + 2,
        message: `Unknown category: ${categoryName}. Add the category first.`,
      });
      return;
    }
    if (projectName && !project) {
      errors.push({
        row: index + 2,
        message: `Unknown project: ${projectName}. Add the project first.`,
      });
      return;
    }
    const typeText = get('type');
    const type =
      Object.entries(workspace.settings.typeLabels).find(
        ([, label]) => label.toLowerCase() === typeText.toLowerCase(),
      )?.[0] ?? 'task';
    const parsed = taskSchema.safeParse({
      ...recordMeta(),
      title: get('task'),
      businessUnit: get('business unit'),
      description: get('description'),
      status: get('status'),
      priority: get('priority') || 'Normal',
      type,
      categoryId: category?.id ?? null,
      projectId: project?.id ?? null,
      dueDate: get('by when') || null,
      assignee: get('by whom'),
      ticket: get('ticket'),
      latestUpdate: get('latest update'),
      subtasks: [],
      archived: false,
    });
    if (!parsed.success) {
      errors.push({
        row: index + 2,
        message: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      });
      return;
    }
    const {
      id: _id,
      createdAt: _created,
      updatedAt: _updated,
      demo: _demo,
      ...input
    } = parsed.data;
    result.push(input);
  });
  return { rows: result, errors };
}
export async function importTasksCsv(rows: readonly TaskCreateInput[]): Promise<void> {
  const records = rows.map((row) => taskSchema.parse({ ...row, ...recordMeta() }));
  await db.transaction('rw', db.tables, async () => {
    for (const record of records) await checkLinks(record);
    await db.tasks.bulkAdd(records);
  });
}

import { DEFAULT_SETTINGS, type Settings, settingsSchema, WorkspaceError } from '../domain/models';
import { db } from './db';

export async function updateSettings(patch: Partial<Omit<Settings, 'id'>>): Promise<Settings> {
  return db.transaction('rw', db.settings, async () => {
    const current = (await db.settings.get('workspace')) ?? DEFAULT_SETTINGS;
    const settings = settingsSchema.parse({ ...current, ...patch });
    await db.settings.put(settings);
    return settings;
  });
}
export async function renameNotebook(previous: string, next: string): Promise<void> {
  const name = next.trim();
  if (!name) throw new WorkspaceError('invalid', 'Notebook name is required.');
  await db.transaction('rw', db.settings, db.notes, async () => {
    await db.notes.where('notebook').equals(previous).modify({ notebook: name });
    const current = (await db.settings.get('workspace')) ?? DEFAULT_SETTINGS;
    await db.settings.put({
      ...current,
      notebooks: [
        ...new Set([...(current.notebooks ?? ['General']).filter((n) => n !== previous), name]),
      ],
    });
  });
}
export async function deleteNotebook(name: string): Promise<void> {
  if (name === 'General')
    throw new WorkspaceError('invalid', 'The General notebook is kept for unfiled notes.');
  await db.transaction('rw', db.settings, db.notes, async () => {
    await db.notes.where('notebook').equals(name).modify({ notebook: 'General' });
    const current = (await db.settings.get('workspace')) ?? DEFAULT_SETTINGS;
    await db.settings.put({
      ...current,
      notebooks: [...new Set(['General', ...(current.notebooks ?? []).filter((n) => n !== name)])],
    });
  });
}

/** A deliberate rename updates every exact unit label, including historical snapshots. */
export async function renameBusinessUnit(previous: string, next: string): Promise<void> {
  const name = next.trim();
  if (!name) throw new WorkspaceError('invalid', 'Business Unit name is required.');
  await db.transaction('rw', db.tables, async () => {
    await db.tasks
      .filter((record) => record.businessUnit === previous)
      .modify({ businessUnit: name });
    await db.projects
      .filter((record) => record.businessUnit === previous)
      .modify({ businessUnit: name });
    await db.plans
      .filter((record) => record.businessUnit === previous)
      .modify({ businessUnit: name });
    await db.dailyEntries
      .filter((record) => record.businessUnit === previous)
      .modify({ businessUnit: name });
    const timers = await db.timers.toArray();
    await db.timers.bulkPut(
      timers.map((timer) => ({
        ...timer,
        businessUnit: timer.businessUnit === previous ? name : timer.businessUnit,
        ...(timer.sourceDetails?.businessUnit === previous
          ? { sourceDetails: { ...timer.sourceDetails, businessUnit: name } }
          : {}),
      })),
    );
    const current = (await db.settings.get('workspace')) ?? DEFAULT_SETTINGS;
    await db.settings.put(
      settingsSchema.parse({
        ...current,
        ...(current.taskView
          ? {
              taskView: {
                ...current.taskView,
                hiddenGroups: [
                  ...new Set(
                    current.taskView.hiddenGroups.map((key) =>
                      key === `businessUnit:${previous}` ? `businessUnit:${name}` : key,
                    ),
                  ),
                ],
              },
            }
          : {}),
        businessUnits: [
          ...new Set([...(current.businessUnits ?? []).filter((unit) => unit !== previous), name]),
        ],
      }),
    );
  });
}

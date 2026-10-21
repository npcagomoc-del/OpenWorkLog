import type { InkDocument } from '../domain/ink';
import { type Note, noteSchema, WorkspaceError } from '../domain/models';
import { db } from './db';

type InkUpdate = { readonly ink: InkDocument; readonly expectedRestoreGeneration: string };
export async function updateNoteInk(id: string, update: InkUpdate): Promise<Note> {
  return db.transaction('rw', db.settings, db.notes, async () => {
    const generation = (await db.settings.get('workspace'))?.restoreGeneration ?? '';
    if (generation !== update.expectedRestoreGeneration)
      throw new WorkspaceError(
        'stale',
        'The workspace was restored. This earlier drawing was not saved.',
      );
    const previous = await db.notes.get(id);
    if (!previous) throw new WorkspaceError('missing', 'This note no longer exists.');
    const note = noteSchema.parse({
      ...previous,
      ink: update.ink,
      reviewedAt: null,
      updatedAt: new Date().toISOString(),
    });
    await db.notes.put(note);
    return note;
  });
}

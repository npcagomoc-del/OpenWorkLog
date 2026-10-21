import { beforeEach, expect, it } from 'vitest';
import { actions } from './actions';
import { createBackup, restoreBackup } from './backup';
import { db } from './db';
import { initializeWorkspace } from './workspace';

beforeEach(async () => {
  await db.delete();
  await db.open();
  await initializeWorkspace();
});
it('rejects a queued ink write captured before a restore with the same note ID', async () => {
  const note = await actions.createNote({
    title: 'Study',
    notebook: 'General',
    content: '',
    summary: '',
    questions: '',
    references: '',
    taskId: null,
    pinned: false,
    archived: false,
    reviewedAt: null,
  });
  const backup = await createBackup();
  const expectedRestoreGeneration = (await db.settings.get('workspace'))?.restoreGeneration ?? '';
  await restoreBackup(backup);
  const ink = { version: 1, width: 800, height: 600, strokes: [] } as const;
  await expect(
    actions.updateNoteInk(note.id, { ink: { ...ink, strokes: [] }, expectedRestoreGeneration }),
  ).rejects.toMatchObject({ code: 'stale' });
  expect((await db.notes.get(note.id))?.ink).toBeUndefined();
});
it('allows current generation ink writes, changes token each restore, and leaves token intact on invalid restore', async () => {
  const note = await actions.createNote({
    title: 'Study',
    notebook: 'General',
    content: '',
    summary: '',
    questions: '',
    references: '',
    taskId: null,
    pinned: false,
    archived: false,
    reviewedAt: null,
  });
  const backup = await createBackup();
  await restoreBackup(backup);
  const first = (await db.settings.get('workspace'))?.restoreGeneration ?? '';
  await actions.updateNoteInk(note.id, {
    ink: { version: 1, width: 800, height: 600, strokes: [] },
    expectedRestoreGeneration: first,
  });
  expect((await db.notes.get(note.id))?.ink?.strokes).toEqual([]);
  await expect(restoreBackup('{}')).rejects.toThrow();
  expect((await db.settings.get('workspace'))?.restoreGeneration).toBe(first);
  await restoreBackup(backup);
  expect((await db.settings.get('workspace'))?.restoreGeneration).not.toBe(first);
});
it('serializes restore and an old in-flight ink transaction without retaining the stale drawing', async () => {
  const note = await actions.createNote({
    title: 'Study',
    notebook: 'General',
    content: '',
    summary: '',
    questions: '',
    references: '',
    taskId: null,
    pinned: false,
    archived: false,
    reviewedAt: null,
  });
  const backup = await createBackup();
  await Promise.allSettled([
    restoreBackup(backup),
    actions.updateNoteInk(note.id, {
      ink: { version: 1, width: 800, height: 600, strokes: [] },
      expectedRestoreGeneration: '',
    }),
  ]);
  expect((await db.notes.get(note.id))?.ink).toBeUndefined();
});

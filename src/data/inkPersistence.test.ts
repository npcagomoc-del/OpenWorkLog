import { beforeEach, expect, it } from 'vitest';
import { inkDocumentSchema } from '../domain/ink';
import { actions } from './actions';
import { createBackup, parseBackup, restoreBackup } from './backup';
import { db } from './db';
import { initializeWorkspace } from './workspace';

const ink = {
  version: 1,
  width: 800,
  height: 600,
  strokes: [
    { id: 'stroke-1', color: '#123456', width: 3, points: [{ x: 15, y: 20, pressure: 0.5 }] },
  ],
} as const;
beforeEach(async () => {
  await db.delete();
  await db.open();
  await initializeWorkspace();
});
it('retains validated ink and appearance through text edits, export and restore', async () => {
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
    ink: inkDocumentSchema.parse(ink),
  });
  await actions.updateNote(note.id, { content: 'Text beside drawing' });
  await actions.updateSettings({ appearancePreset: 'claude' });
  const backup = await createBackup();
  expect(parseBackup(backup).data.notes[0]?.ink).toEqual(ink);
  await restoreBackup(backup);
  expect((await db.notes.get(note.id))?.ink).toEqual(ink);
  expect((await db.settings.get('workspace'))?.appearancePreset).toBe('claude');
});
it('accepts old version 1 backups without ink or appearance', async () => {
  const backup = parseBackup(await createBackup());
  const { appearancePreset: _appearance, ...settings } = backup.data.settings;
  const parsed = parseBackup(JSON.stringify({ ...backup, data: { ...backup.data, settings } }));
  expect(parsed.version).toBe(1);
  expect(parsed.data.settings.appearancePreset).toBe('classic');
});
it.each([
  { ...ink, version: 2 },
  { ...ink, width: 0 },
  { ...ink, height: 9000 },
  { ...ink, extra: true },
  { ...ink, strokes: [{ ...ink.strokes[0], color: 'url(example)' }] },
  { ...ink, strokes: [{ ...ink.strokes[0], width: 0 }] },
  { ...ink, strokes: [{ ...ink.strokes[0], points: [{ x: 801, y: 0, pressure: 0.5 }] }] },
  { ...ink, strokes: [{ ...ink.strokes[0], points: [{ x: 1, y: 0, pressure: 1.1 }] }] },
  { ...ink, strokes: [ink.strokes[0], ink.strokes[0]] },
  {
    ...ink,
    strokes: Array.from({ length: 2001 }, (_, index) => ({ ...ink.strokes[0], id: String(index) })),
  },
  {
    ...ink,
    strokes: [
      { ...ink.strokes[0], points: Array.from({ length: 10001 }, () => ink.strokes[0].points[0]) },
    ],
  },
])('rejects invalid ink without replacing workspace', async (invalidInk) => {
  const backup = parseBackup(await createBackup());
  const note = await actions.createNote({
    title: 'Keep',
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
  await expect(
    restoreBackup(
      JSON.stringify({
        ...backup,
        data: { ...backup.data, notes: [{ ...note, ink: invalidInk }] },
      }),
    ),
  ).rejects.toThrow();
  expect((await db.notes.get(note.id))?.title).toBe('Keep');
});
it('rejects an excessive aggregate point budget and nonfinite coordinates', () => {
  const strokes = Array.from({ length: 11 }, (_, index) => ({
    ...ink.strokes[0],
    id: String(index),
    points: Array.from({ length: 10000 }, () => ink.strokes[0].points[0]),
  }));
  expect(inkDocumentSchema.safeParse({ ...ink, strokes }).success).toBe(false);
  expect(
    inkDocumentSchema.safeParse({
      ...ink,
      strokes: [{ ...ink.strokes[0], points: [{ x: Number.NaN, y: 0, pressure: 0.5 }] }],
    }).success,
  ).toBe(false);
});
it('persists and resets a custom action accent and rejects unsupported appearance values', async () => {
  await actions.updateSettings({ actionAccent: '#123abc', appearancePreset: 'apple' });
  await restoreBackup(await createBackup());
  expect((await db.settings.get('workspace'))?.actionAccent).toBe('#123abc');
  await actions.updateSettings({ actionAccent: undefined });
  expect((await db.settings.get('workspace'))?.actionAccent).toBeUndefined();
  const backup = parseBackup(await createBackup());
  expect(() =>
    parseBackup(
      JSON.stringify({
        ...backup,
        data: {
          ...backup.data,
          settings: { ...backup.data.settings, appearancePreset: 'unsupported' },
        },
      }),
    ),
  ).toThrow();
});

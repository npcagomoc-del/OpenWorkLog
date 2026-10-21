import { beforeEach, expect, it, vi } from 'vitest';
import type { Settings } from '../domain/models';
import { actions } from './actions';
import { db } from './db';
import { initializeWorkspace } from './workspace';

function viewWithGroups(hiddenGroups: string[]): NonNullable<Settings['taskView']> {
  return {
    view: 'board',
    groupBy: 'businessUnit',
    hiddenGroups,
    fields: {
      priority: true,
      category: false,
      project: false,
      businessUnit: true,
      dueDate: true,
      assignee: false,
      latestUpdate: false,
    },
  };
}
beforeEach(async () => {
  await db.delete();
  await db.open();
  await initializeWorkspace();
});
it('keeps a renamed business unit hidden and deduplicates an already hidden target', async () => {
  await actions.updateSettings({
    businessUnits: ['Marine', 'Vessel'],
    taskView: viewWithGroups([
      'businessUnit:Marine',
      'businessUnit:Vessel',
      'project:Marine',
      'businessUnit:Marine West',
    ]),
  });
  await actions.renameBusinessUnit('Marine', 'Vessel');
  const settings = await db.settings.get('workspace');
  expect(settings?.taskView?.hiddenGroups).toEqual([
    'businessUnit:Vessel',
    'project:Marine',
    'businessUnit:Marine West',
  ]);
  expect(settings?.businessUnits).toEqual(['Vessel']);
  expect(settings?.taskView?.view).toBe('board');
});
it('rolls back unit records and the hidden group preference together on persistence failure', async () => {
  const project = await actions.createProject({
    name: 'Marine work',
    description: '',
    status: 'Open',
    categoryId: null,
    dueDate: null,
    owner: '',
    link: '',
    archived: false,
    businessUnit: 'Marine',
  });
  await actions.updateSettings({
    businessUnits: ['Marine'],
    taskView: viewWithGroups(['businessUnit:Marine']),
  });
  const failure = vi
    .spyOn(db.settings, 'put')
    .mockRejectedValueOnce(new DOMException('Storage failed', 'QuotaExceededError'));
  await expect(actions.renameBusinessUnit('Marine', 'Vessel')).rejects.toThrow('Storage failed');
  failure.mockRestore();
  expect((await db.projects.get(project.id))?.businessUnit).toBe('Marine');
  const settings = await db.settings.get('workspace');
  expect(settings?.taskView?.hiddenGroups).toEqual(['businessUnit:Marine']);
  expect(settings?.businessUnits).toEqual(['Marine']);
});

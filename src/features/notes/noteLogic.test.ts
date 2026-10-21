import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { Note } from '../../domain/models';
import { NoteContent } from './NoteContent';
import { filterNotes, parseTags, toggleChecklist } from './noteLogic';

const note: Note = {
  id: 'note-one',
  createdAt: '2026-10-20T08:00:00.000Z',
  updatedAt: '2026-10-21T08:00:00.000Z',
  demo: false,
  title: 'DNS basics',
  notebook: 'Networks',
  content: 'Recursive resolution',
  summary: 'Name to address',
  questions: 'What does TTL do?',
  references: '',
  taskId: null,
  pinned: false,
  archived: false,
  reviewedAt: null,
  tags: ['networking'],
};
describe('study note behavior', () => {
  it('searches study questions and tags within the chosen notebook', () => {
    expect(
      filterNotes([note], {
        query: 'TTL',
        notebook: 'Networks',
        tag: 'networking',
        view: 'active',
      }),
    ).toEqual([note]);
    expect(
      filterNotes([note], { query: 'TTL', notebook: 'Security', tag: '', view: 'active' }),
    ).toEqual([]);
  });
  it('keeps reviewed notes out of the review queue even if metadata updates later', () => {
    const reviewed = { ...note, reviewedAt: '2026-10-20T09:00:00.000Z' };
    expect(filterNotes([reviewed], { query: '', notebook: '', tag: '', view: 'review' })).toEqual(
      [],
    );
    expect(
      filterNotes([{ ...reviewed, reviewedAt: null }], {
        query: '',
        notebook: '',
        tag: '',
        view: 'review',
      }),
    ).toHaveLength(1);
  });
  it('separates archive view and puts pinned notes first', () => {
    const pinned = { ...note, id: 'pin', pinned: true };
    const archived = { ...note, id: 'archive', archived: true };
    expect(
      filterNotes([note, archived, pinned], {
        query: '',
        notebook: '',
        tag: '',
        view: 'active',
      }).map((value) => value.id),
    ).toEqual(['pin', 'note-one']);
    expect(filterNotes([archived], { query: '', notebook: '', tag: '', view: 'archived' })).toEqual(
      [archived],
    );
  });
  it('toggles only the selected checklist line and retains all other text', () => {
    const text = '# Test\n- [ ] First\n- [X] Second\nRaw [ ] text';
    expect(toggleChecklist(text, 1)).toBe('# Test\n- [x] First\n- [X] Second\nRaw [ ] text');
    expect(toggleChecklist(text, 2)).toBe('# Test\n- [ ] First\n- [ ] Second\nRaw [ ] text');
    expect(parseTags(' DNS, routing, DNS, , ')).toEqual(['DNS', 'routing']);
  });
  it('renders user HTML and script URLs as inert text', () => {
    const html = renderToStaticMarkup(
      createElement(NoteContent, {
        content:
          '<script>alert(1)</script>\n[link](javascript:alert(1))\n<img src=x onerror=alert(1)>',
      }),
    );
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('href=');
    expect(html).toContain('&lt;script&gt;');
  });
});

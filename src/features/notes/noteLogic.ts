import type { Note } from '../../domain/models';

export type NoteFilter = 'active' | 'pinned' | 'review' | 'archived';
export function filterNotes(
  notes: readonly Note[],
  filter: {
    readonly query: string;
    readonly notebook: string;
    readonly tag: string;
    readonly view: NoteFilter;
  },
): Note[] {
  const query = filter.query.trim().toLocaleLowerCase();
  return notes
    .filter((note) => {
      const matchesView: Record<NoteFilter, boolean> = {
        active: !note.archived,
        pinned: !note.archived && note.pinned,
        review: !note.archived && !note.reviewedAt,
        archived: note.archived,
      };
      return (
        matchesView[filter.view] &&
        (!filter.notebook || note.notebook === filter.notebook) &&
        (!filter.tag || (note.tags ?? []).includes(filter.tag)) &&
        (!query ||
          [
            note.title,
            note.content,
            note.summary,
            note.questions,
            note.notebook,
            ...(note.tags ?? []),
          ]
            .join(' ')
            .toLocaleLowerCase()
            .includes(query))
      );
    })
    .sort(
      (left, right) =>
        Number(right.pinned) - Number(left.pinned) || right.updatedAt.localeCompare(left.updatedAt),
    );
}
export function parseTags(value: string): string[] {
  return [
    ...new Set(
      value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ];
}
export function toggleChecklist(content: string, lineIndex: number): string {
  return content
    .split('\n')
    .map((line, index) =>
      index === lineIndex
        ? line.replace(
            /^(\s*-\s*\[)([ xX])(\])/,
            (_, prefix: string, mark: string, suffix: string) =>
              `${prefix}${mark === ' ' ? 'x' : ' '}${suffix}`,
          )
        : line,
    )
    .join('\n');
}

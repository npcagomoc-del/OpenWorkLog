import { Archive, Check, Pencil, Pin, RotateCcw, Trash2 } from 'lucide-react';
import { Badge, Button, Card, IconButton } from '../../components/ui';
import type { Note, NoteCreateInput } from '../../domain/models';
import { NoteContent } from './NoteContent';
import { toggleChecklist } from './noteLogic';

type Props = {
  readonly note: Note;
  readonly taskTitle: string | undefined;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
  readonly onUpdate: (patch: Partial<NoteCreateInput>) => void;
  readonly busy: boolean;
};
export function NoteReader({ note, taskTitle, onEdit, onDelete, onUpdate, busy }: Props) {
  return (
    <Card className="note-reader">
      <div className="note-reader-head stack">
        <div className="split">
          <div className="cluster">
            <span className="eyebrow">{note.notebook}</span>
            {note.demo && <Badge>Demo</Badge>}
            {note.archived && <Badge>Archived</Badge>}
          </div>
          <div className="cluster">
            <IconButton
              label={note.pinned ? 'Unpin note' : 'Pin note'}
              disabled={busy}
              aria-pressed={note.pinned}
              onClick={() => onUpdate({ pinned: !note.pinned })}
            >
              <Pin size={18} />
            </IconButton>
            <IconButton
              label={note.archived ? 'Restore note' : 'Archive note'}
              disabled={busy}
              onClick={() => onUpdate({ archived: !note.archived })}
            >
              {note.archived ? <RotateCcw size={18} /> : <Archive size={18} />}
            </IconButton>
            <IconButton label="Delete note" disabled={busy} onClick={onDelete}>
              <Trash2 size={18} />
            </IconButton>
          </div>
        </div>
        <h2>{note.title}</h2>
        <div className="split">
          <p className="small muted">Updated {new Date(note.updatedAt).toLocaleDateString()}</p>
          <Button size="sm" onClick={onEdit}>
            <Pencil size={16} />
            Edit note
          </Button>
        </div>
        {(note.tags ?? []).length > 0 && (
          <div className="cluster">
            {note.tags?.map((tag) => (
              <Badge key={tag} tone="blue">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="note-reader-body stack">
        {note.summary && (
          <section className="note-summary">
            <h3>Key takeaway</h3>
            <p>{note.summary}</p>
          </section>
        )}
        {note.content ? (
          <NoteContent
            content={note.content}
            onToggle={(line) => {
              if (!busy)
                onUpdate({ content: toggleChecklist(note.content, line), reviewedAt: null });
            }}
          />
        ) : (
          <p className="muted">
            This note is ready for your ideas. Choose Edit note to start writing.
          </p>
        )}
        {note.questions && (
          <section className="note-review-questions">
            <h3>Review questions</h3>
            <p>{note.questions}</p>
          </section>
        )}
        {note.references && (
          <section>
            <h3>References</h3>
            <p className="note-text">{note.references}</p>
          </section>
        )}
        {taskTitle && <p className="small muted">Related task: {taskTitle}</p>}
      </div>
      <footer className="note-reader-footer split">
        <div className="small muted">
          {note.reviewedAt
            ? `Reviewed ${new Date(note.reviewedAt).toLocaleDateString()}`
            : 'Ready for your next review'}
        </div>
        <Button disabled={busy} onClick={() => onUpdate({ reviewedAt: new Date().toISOString() })}>
          <Check size={18} />
          Mark reviewed
        </Button>
      </footer>
    </Card>
  );
}

import { BookOpen, FolderPlus, Pin, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  Notice,
  PageHeader,
  SegmentedControl,
  Spinner,
  useToast,
} from '../../components/ui';
import { actions } from '../../data/actions';
import { useWorkspace } from '../../data/useWorkspace';
import type { Note, NoteCreateInput } from '../../domain/models';
import { NotebookManager } from './NotebookManager';
import { NoteEditor } from './NoteEditor';
import { NoteReader } from './NoteReader';
import { filterNotes, type NoteFilter } from './noteLogic';
import './notes.css';

export default function NotesPage() {
  const workspace = useWorkspace();
  const [searchParams] = useSearchParams();
  const linkedId = searchParams.get('note');
  const linkedNote = workspace.notes.find((note) => note.id === linkedId);
  const linkedNoteId = linkedNote?.id;
  const linkedArchived = linkedNote?.archived;
  const [query, setQuery] = useState('');
  const [notebook, setNotebook] = useState('');
  const [tag, setTag] = useState('');
  const [view, setView] = useState<NoteFilter>('active');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ readonly note: Note | null } | null>(null);
  const [manage, setManage] = useState(false);
  const [deleting, setDeleting] = useState<Note | null>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  useEffect(() => {
    if (!linkedNoteId) return;
    setSelectedId(linkedNoteId);
    setView(linkedArchived ? 'archived' : 'active');
    setQuery('');
    setNotebook('');
    setTag('');
  }, [linkedNoteId, linkedArchived]);
  const notebooks = [
    ...new Set([
      'General',
      ...(workspace.settings.notebooks ?? []),
      ...workspace.notes.map((note) => note.notebook),
    ]),
  ].sort();
  const selectedNotebook = notebooks.includes(notebook) ? notebook : '';
  const notes = filterNotes(workspace.notes, { query, notebook: selectedNotebook, tag, view });
  const selected = notes.find((note) => note.id === selectedId) ?? notes[0];
  const tags = [...new Set(workspace.notes.flatMap((note) => note.tags ?? []))].sort();
  async function update(patch: Partial<NoteCreateInput>) {
    if (!selected) return;
    setBusy(true);
    try {
      await actions.updateNote(selected.id, patch);
      toast('Note updated.');
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : 'Could not update note.', 'error');
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!deleting) return;
    setBusy(true);
    try {
      await actions.deleteNote(deleting.id);
      setDeleting(null);
      toast('Note deleted.');
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : 'Could not delete note.', 'error');
    } finally {
      setBusy(false);
    }
  }
  if (workspace.error) return <Notice tone="error">{workspace.error}</Notice>;
  if (!workspace.ready) return <Spinner />;
  return (
    <div className="page-stack notes-page">
      <PageHeader
        title="Study Notes"
        description="Learn, connect ideas and come back to what matters."
        actions={
          <>
            <Button onClick={() => setManage(true)}>
              <FolderPlus size={18} />
              Notebooks
            </Button>
            <Button variant="primary" onClick={() => setEditor({ note: null })}>
              <Plus size={18} />
              New note
            </Button>
          </>
        }
      />
      <div className="notes-toolbar">
        <div className="notes-search">
          <Search size={18} aria-hidden="true" />
          <input
            aria-label="Search study notes"
            placeholder="Search notes, ideas or tags"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Field label="Notebook filter" htmlFor="notebook-filter">
          <select
            id="notebook-filter"
            value={selectedNotebook}
            onChange={(event) => setNotebook(event.target.value)}
          >
            <option value="">All notebooks</option>
            {notebooks.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </Field>
        <Field label="Tag filter" htmlFor="tag-filter">
          <select id="tag-filter" value={tag} onChange={(event) => setTag(event.target.value)}>
            <option value="">All tags</option>
            {tags.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </Field>
      </div>
      <SegmentedControl
        label="Note collection"
        value={view}
        onChange={setView}
        options={[
          { value: 'active', label: 'All notes' },
          { value: 'pinned', label: 'Pinned' },
          { value: 'review', label: 'To review' },
          { value: 'archived', label: 'Archived' },
        ]}
      />
      {notes.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BookOpen size={28} />}
            title={
              workspace.notes.length ? 'No notes in this view' : 'Make room for what you learn'
            }
            description={
              workspace.notes.length
                ? 'Try another notebook, tag or search.'
                : 'Create a notebook, capture ideas and add questions for your next review.'
            }
            action={
              <Button variant="primary" onClick={() => setEditor({ note: null })}>
                Create a study note
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="notes-layout">
          <Card className="notes-list">
            <div className="notes-list-caption small muted">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </div>
            <ul>
              {notes.map((note) => (
                <li key={note.id}>
                  <button
                    type="button"
                    className={`note-list-item ${selected?.id === note.id ? 'is-selected' : ''}`}
                    aria-current={selected?.id === note.id ? 'true' : undefined}
                    onClick={() => setSelectedId(note.id)}
                  >
                    <span className="split">
                      <span className="small muted">{note.notebook}</span>
                      {note.pinned && <Pin size={14} aria-label="Pinned" />}
                    </span>
                    <strong>{note.title}</strong>
                    <span className="note-excerpt">
                      {note.summary || note.content || 'No content yet'}
                    </span>
                    <span className="small muted">
                      {new Date(note.updatedAt).toLocaleDateString()}
                      {note.demo && <> · Demo</>}
                    </span>
                    {!note.reviewedAt && <Badge tone="blue">To review</Badge>}
                  </button>
                </li>
              ))}
            </ul>
          </Card>
          {selected && (
            <NoteReader
              note={selected}
              restoreGeneration={workspace.settings.restoreGeneration ?? ''}
              busy={busy}
              taskTitle={workspace.tasks.find((task) => task.id === selected.taskId)?.title}
              onEdit={() => setEditor({ note: selected })}
              onDelete={() => setDeleting(selected)}
              onUpdate={(patch) => void update(patch)}
            />
          )}
        </div>
      )}
      {editor && (
        <NoteEditor
          note={editor.note}
          notebook={selectedNotebook}
          notebooks={notebooks}
          tasks={workspace.tasks}
          onClose={() => setEditor(null)}
          onSaved={(note) => {
            setEditor(null);
            setSelectedId(note.id);
            setQuery('');
            setTag('');
            setNotebook(note.notebook);
            setView(note.archived ? 'archived' : 'active');
          }}
        />
      )}
      {manage && <NotebookManager names={notebooks} onClose={() => setManage(false)} />}
      <ConfirmDialog
        open={deleting !== null}
        title="Delete study note?"
        description={`“${deleting?.title ?? ''}” will be permanently deleted. Archive it instead if you want to keep it.`}
        confirmLabel="Delete note"
        destructive
        busy={busy}
        onClose={() => {
          if (!busy) setDeleting(null);
        }}
        onConfirm={() => void remove()}
      />
    </div>
  );
}

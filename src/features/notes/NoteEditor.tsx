import { useState } from 'react';
import { Button, Field, Modal, Notice, SegmentedControl, useToast } from '../../components/ui';
import { actions } from '../../data/actions';
import type { Note, NoteCreateInput, Task } from '../../domain/models';
import { NoteContent } from './NoteContent';
import { NoteStudyFields } from './NoteStudyFields';
import { parseTags } from './noteLogic';

type Props = {
  readonly note: Note | null;
  readonly notebook: string;
  readonly notebooks: readonly string[];
  readonly tasks: readonly Task[];
  readonly onClose: () => void;
  readonly onSaved: (note: Note) => void;
};
export function NoteEditor({ note, notebook, notebooks, tasks, onClose, onSaved }: Props) {
  const [draft, setDraft] = useState<NoteCreateInput>(
    note ?? {
      title: '',
      notebook: notebook || 'General',
      content: '',
      summary: '',
      questions: '',
      references: '',
      taskId: null,
      pinned: false,
      archived: false,
      reviewedAt: null,
      tags: [],
    },
  );
  const [tags, setTags] = useState((note?.tags ?? []).join(', '));
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const dirty =
    JSON.stringify(draft) !==
      JSON.stringify(
        note ?? {
          title: '',
          notebook: notebook || 'General',
          content: '',
          summary: '',
          questions: '',
          references: '',
          taskId: null,
          pinned: false,
          archived: false,
          reviewedAt: null,
          tags: [],
        },
      ) || tags !== (note?.tags ?? []).join(', ');
  const [discard, setDiscard] = useState(false);
  async function save() {
    setBusy(true);
    setError('');
    try {
      const input = {
        ...draft,
        title: draft.title.trim(),
        notebook: draft.notebook.trim() || 'General',
        tags: parseTags(tags),
        reviewedAt: null,
      };
      const saved = note
        ? await actions.updateNote(note.id, input)
        : await actions.createNote(input);
      toast('Study note saved.');
      onSaved(saved);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not save your note.');
    } finally {
      setBusy(false);
    }
  }
  function close() {
    if (busy) return;
    if (dirty) setDiscard(true);
    else onClose();
  }
  return (
    <Modal
      open
      title={note ? 'Edit study note' : 'New study note'}
      size="lg"
      onClose={close}
      footer={
        <>
          <Button disabled={busy} onClick={close}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="study-note-form" busy={busy}>
            Save note
          </Button>
        </>
      }
    >
      <form
        id="study-note-form"
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        {discard && (
          <Notice tone="warning">
            <div className="stack">
              <span>Discard your unsaved changes?</span>
              <div className="cluster">
                <Button variant="danger" onClick={onClose}>
                  Discard changes
                </Button>
                <Button onClick={() => setDiscard(false)}>Keep editing</Button>
              </div>
            </div>
          </Notice>
        )}
        {error && <Notice tone="error">{error}</Notice>}
        <Field label="Note title" htmlFor="note-title">
          <input
            id="note-title"
            required
            maxLength={200}
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            placeholder="What are you learning?"
          />
        </Field>
        <div className="form-grid">
          <Field label="Notebook" htmlFor="note-notebook">
            <select
              id="note-notebook"
              value={draft.notebook}
              onChange={(event) => setDraft({ ...draft, notebook: event.target.value })}
            >
              {[...new Set([...notebooks, draft.notebook])].map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </Field>
          <Field label="Tags" htmlFor="note-tags" hint="Separate tags with commas.">
            <input
              id="note-tags"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="networking, certification"
            />
          </Field>
        </div>
        <div className="split">
          <SegmentedControl
            label="Editor mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'write', label: 'Write' },
              { value: 'preview', label: 'Preview' },
            ]}
          />
          {mode === 'write' && (
            <div className="cluster">
              <Button
                size="sm"
                onClick={() =>
                  setDraft({
                    ...draft,
                    content: `${draft.content}${draft.content ? '\n' : ''}## Heading\n`,
                  })
                }
              >
                + Heading
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  setDraft({
                    ...draft,
                    content: `${draft.content}${draft.content ? '\n' : ''}- [ ] `,
                  })
                }
              >
                + Checklist
              </Button>
            </div>
          )}
        </div>
        {mode === 'write' ? (
          <Field
            label="Study notes"
            htmlFor="note-content"
            hint="Use # headings, - bullets, - [ ] checklists and > quotes. Text and HTML stay safe as text."
          >
            <textarea
              id="note-content"
              className="note-editor-body"
              rows={12}
              value={draft.content}
              onChange={(event) => setDraft({ ...draft, content: event.target.value })}
              placeholder="Explain it in your own words…"
            />
          </Field>
        ) : (
          <div className="note-editor-preview">
            <NoteContent content={draft.content || 'Your note preview will appear here.'} />
          </div>
        )}
        <NoteStudyFields draft={draft} setDraft={setDraft} tasks={tasks} />
      </form>
    </Modal>
  );
}

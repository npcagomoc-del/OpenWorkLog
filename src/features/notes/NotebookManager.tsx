import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  Button,
  ConfirmDialog,
  Field,
  IconButton,
  Modal,
  Notice,
  useToast,
} from '../../components/ui';
import { actions } from '../../data/actions';

function NotebookRow({
  name,
  onDelete,
  names,
}: {
  readonly name: string;
  readonly onDelete: (name: string) => void;
  readonly names: readonly string[];
}) {
  const [draft, setDraft] = useState(name);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  async function rename() {
    if (
      names.some(
        (value) => value !== name && value.toLocaleLowerCase() === draft.trim().toLocaleLowerCase(),
      )
    ) {
      toast('A notebook with that name already exists.', 'error');
      return;
    }
    setBusy(true);
    try {
      await actions.renameNotebook(name, draft);
      toast('Notebook renamed.');
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : 'Could not rename notebook.', 'error');
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      className="cluster notebook-row"
      onSubmit={(event) => {
        event.preventDefault();
        void rename();
      }}
    >
      <input
        aria-label={`Notebook name: ${name}`}
        required
        maxLength={80}
        value={draft}
        disabled={name === 'General'}
        onChange={(event) => setDraft(event.target.value)}
      />
      <Button
        type="submit"
        size="sm"
        busy={busy}
        disabled={draft.trim() === name || name === 'General'}
      >
        Rename
      </Button>
      <IconButton
        label={`Delete notebook ${name}`}
        disabled={busy || name === 'General'}
        onClick={() => onDelete(name)}
      >
        <Trash2 size={18} />
      </IconButton>
    </form>
  );
}

export function NotebookManager({
  names,
  onClose,
}: {
  readonly names: readonly string[];
  readonly onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  async function add() {
    if (names.some((value) => value.toLocaleLowerCase() === name.trim().toLocaleLowerCase())) {
      setError('That notebook already exists.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await actions.updateSettings({ notebooks: [...names, name.trim()] });
      setName('');
      toast('Notebook created.');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not create notebook.');
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!deleting) return;
    setBusy(true);
    try {
      await actions.deleteNotebook(deleting);
      toast('Notebook deleted. Notes moved to General.');
      setDeleting(null);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not delete notebook.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Modal
        open
        title="Manage notebooks"
        onClose={() => {
          if (!busy) onClose();
        }}
        footer={
          <Button onClick={onClose} disabled={busy}>
            Done
          </Button>
        }
      >
        <div className="stack">
          <p className="muted">
            Keep a notebook for each subject. Deleting a notebook moves its notes to General.
          </p>
          <form
            className="stack"
            onSubmit={(event) => {
              event.preventDefault();
              void add();
            }}
          >
            <Field label="New notebook name" htmlFor="new-notebook">
              <input
                id="new-notebook"
                required
                maxLength={80}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Network fundamentals"
              />
            </Field>
            <div>
              <Button variant="primary" type="submit" busy={busy}>
                Create notebook
              </Button>
            </div>
          </form>
          {error && <Notice tone="error">{error}</Notice>}
          {names.map((notebook) => (
            <NotebookRow key={notebook} name={notebook} names={names} onDelete={setDeleting} />
          ))}
        </div>
      </Modal>
      <ConfirmDialog
        open={deleting !== null}
        title="Delete notebook?"
        description={`Notes in “${deleting ?? ''}” will move to General. The notes themselves will be kept.`}
        confirmLabel="Delete notebook"
        destructive
        busy={busy}
        onClose={() => {
          if (!busy) setDeleting(null);
        }}
        onConfirm={() => void remove()}
      />
    </>
  );
}

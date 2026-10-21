import { useState } from 'react';
import { Button, Card, Field, IconButton, Notice, useToast } from '../../components/ui';
import { Pencil, X } from 'lucide-react';
import { actions } from '../../data/actions';
import type { Settings } from '../../domain/models';

export function BusinessUnitSettings({
  settings,
  save,
}: {
  readonly settings: Settings;
  readonly save: (patch: Partial<Settings>) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [renaming, setRenaming] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  async function submit() {
    const next = name.trim();
    if (!next) {
      setError('Enter a Business Unit name.');
      return;
    }
    if (
      settings.businessUnits.some(
        (unit) => unit !== renaming && unit.toLocaleLowerCase() === next.toLocaleLowerCase(),
      )
    ) {
      setError('That Business Unit already exists.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (renaming) {
        await actions.renameBusinessUnit(renaming, next);
        toast('Business Unit renamed across linked work.');
      } else {
        await actions.updateSettings({ businessUnits: [...settings.businessUnits, next] });
        toast('Business Unit saved.');
      }
      setName('');
      setRenaming(null);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not save Business Unit.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card className="card-pad stack" id="business-units">
      <div>
        <h2>Business Units</h2>
        <p className="muted">
          Save suggestions for work forms. You can also enter a new name when recording work, or
          leave it unassigned.
        </p>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <form
        className="business-unit-add"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <Field
          label={renaming ? `Rename ${renaming}` : 'New Business Unit'}
          htmlFor="business-unit-name"
        >
          <input
            id="business-unit-name"
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Button type="submit" busy={busy} disabled={!name.trim()}>
          {renaming ? 'Save rename' : 'Add unit'}
        </Button>
        {renaming && (
          <Button
            disabled={busy}
            onClick={() => {
              setName('');
              setRenaming(null);
            }}
          >
            Cancel rename
          </Button>
        )}
      </form>
      <p className="small muted">
        Rename updates existing linked work and saved suggestions. Removing a suggestion keeps its
        name on existing work.
      </p>
      <ul className="business-unit-list">
        {settings.businessUnits.map((unit) => (
          <li key={unit}>
            <span>{unit}</span>
            <IconButton
              label={`Rename ${unit}`}
              disabled={busy}
              onClick={() => {
                setRenaming(unit);
                setName(unit);
              }}
            >
              <Pencil size={16} />
            </IconButton>
            <IconButton
              label={`Remove ${unit} suggestion`}
              disabled={busy}
              onClick={() =>
                void save({
                  businessUnits: settings.businessUnits.filter((value) => value !== unit),
                })
              }
            >
              <X size={16} />
            </IconButton>
          </li>
        ))}
      </ul>
      {settings.businessUnits.length === 0 && (
        <p className="small muted">No saved Business Units yet.</p>
      )}
    </Card>
  );
}

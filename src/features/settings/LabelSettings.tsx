import { useState } from 'react';
import { Button, Card, Field } from '../../components/ui';
import type { Settings } from '../../domain/models';

type Props = {
  readonly settings: Settings;
  readonly save: (patch: Partial<Settings>) => Promise<void>;
};
export function LabelSettings({ settings, save }: Props) {
  const [labels, setLabels] = useState(settings.typeLabels);
  const [ownerName, setOwnerName] = useState(settings.ownerName ?? '');
  const [busy, setBusy] = useState(false);
  async function submit() {
    setBusy(true);
    try {
      await save({
        ownerName: ownerName.trim(),
        typeLabels: {
          task: labels.task.trim(),
          operational: labels.operational.trim(),
          project: labels.project.trim(),
        },
      });
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card className="card-pad stack" id="labels">
      <div>
        <h2>Your workspace language</h2>
        <p className="muted">
          Rename work types to match your team. Existing records keep their links.
        </p>
      </div>
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <Field label="Your name" htmlFor="owner-name" hint="A local profile, saved on this device.">
          <input
            id="owner-name"
            value={ownerName}
            maxLength={100}
            onChange={(event) => setOwnerName(event.target.value)}
            placeholder="Your name"
            autoComplete="name"
          />
        </Field>
        <div className="form-grid">
          {(
            [
              ['task', 'Task label'],
              ['operational', 'Operational work label'],
              ['project', 'Project label'],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label} htmlFor={`label-${key}`}>
              <input
                id={`label-${key}`}
                required
                maxLength={40}
                value={labels[key]}
                onChange={(event) => setLabels({ ...labels, [key]: event.target.value })}
              />
            </Field>
          ))}
        </div>
        <div>
          <Button variant="primary" type="submit" busy={busy}>
            Save labels & profile
          </Button>
        </div>
      </form>
    </Card>
  );
}

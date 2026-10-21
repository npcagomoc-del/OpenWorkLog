import { useState } from 'react';
import { Button, Card, Field, Notice } from '../../components/ui';
import type { Settings } from '../../domain/models';
import { clockInput, scheduleSchema } from './settingsLogic';

type Props = {
  readonly settings: Settings;
  readonly save: (patch: Partial<Settings>) => Promise<void>;
};
export function ScheduleSettings({ settings, save }: Props) {
  const [draft, setDraft] = useState({
    workStart: clockInput(settings.workStart),
    workEnd: clockInput(settings.workEnd),
    lunchStart: clockInput(settings.lunchStart),
    lunchEnd: clockInput(settings.lunchEnd),
    timezone: settings.timezone,
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit() {
    const parsed = scheduleSchema.safeParse(draft);
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(' '));
      return;
    }
    setError('');
    setBusy(true);
    try {
      await save(parsed.data);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card className="card-pad stack" id="schedule">
      <div>
        <h2>Your working day</h2>
        <p className="muted">
          Daily reports keep all 24 hours. These settings define the work-hours view and lunch
          period.
        </p>
      </div>
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div className="form-grid">
          {(
            [
              ['workStart', 'Work starts'],
              ['workEnd', 'Work ends'],
              ['lunchStart', 'Lunch starts'],
              ['lunchEnd', 'Lunch ends'],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label} htmlFor={key}>
              <input
                required
                id={key}
                type="time"
                value={draft[key]}
                onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
              />
            </Field>
          ))}
        </div>
        <Field
          label="Time zone"
          htmlFor="timezone"
          hint="Use an IANA time zone, for example Asia/Manila or Europe/London."
        >
          <input
            required
            id="timezone"
            list="timezones"
            value={draft.timezone}
            onChange={(event) => setDraft({ ...draft, timezone: event.target.value })}
          />
          <datalist id="timezones">
            <option value="Asia/Manila" />
            <option value="Asia/Taipei" />
            <option value="Asia/Singapore" />
            <option value="UTC" />
            <option value="Europe/London" />
            <option value="America/New_York" />
          </datalist>
        </Field>
        {error && <Notice tone="error">{error}</Notice>}
        <div>
          <Button variant="primary" type="submit" busy={busy}>
            Save schedule
          </Button>
        </div>
      </form>
    </Card>
  );
}

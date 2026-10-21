import { useState } from 'react';
import { actions } from '../../data/actions';
import { z } from 'zod';
import { Button, Card, Field, Notice, useToast } from '../../components/ui';
import { DEFAULT_STATUS_COLORS, deriveStatusPalette } from '../../components/statusPalette';
import { STATUSES, type Settings } from '../../domain/models';

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const PREVIEW_THEMES = [
  { label: 'Light', surface: '#ffffff' },
  { label: 'Dark', surface: '#1b1e24' },
  { label: 'Super dark', surface: '#101010' },
] as const;
export function StatusColorSettings({ settings }: { readonly settings: Settings }) {
  const [colors, setColors] = useState({ ...DEFAULT_STATUS_COLORS, ...settings.statusColors });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const valid = STATUSES.every((status) => hexColor.safeParse(colors[status]).success);
  async function submit(reset: boolean) {
    setBusy(true);
    setError('');
    try {
      await actions.updateSettings({ statusColors: reset ? {} : colors });
      if (reset) setColors({ ...DEFAULT_STATUS_COLORS });
      toast(reset ? 'Default status colors restored.' : 'Status colors saved.');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not save status colors.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card className="card-pad stack" id="status-colors">
      <div>
        <h2>Status colors</h2>
        <p className="muted">
          Choose a color for each status. Text, tints and charts adapt to stay readable in every
          appearance.
        </p>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          if (valid) void submit(false);
        }}
      >
        {STATUSES.map((status, index) => {
          const color = colors[status];
          const parsed = hexColor.safeParse(color);
          const preview = parsed.success ? parsed.data : DEFAULT_STATUS_COLORS[status];
          return (
            <div className="status-color-row" key={status}>
              <div className="status-color-inputs">
                <Field label={status} htmlFor={`status-color-${index}`}>
                  <input
                    id={`status-color-${index}`}
                    type="color"
                    value={preview}
                    aria-label={`${status} color picker`}
                    onChange={(event) => setColors({ ...colors, [status]: event.target.value })}
                  />
                </Field>
                <Field
                  label="Hex color"
                  htmlFor={`status-hex-${index}`}
                  error={parsed.success ? '' : 'Use # followed by six hex digits.'}
                >
                  <input
                    id={`status-hex-${index}`}
                    aria-label={`${status} hex color`}
                    value={color}
                    maxLength={7}
                    pattern="#[0-9a-fA-F]{6}"
                    required
                    aria-invalid={!parsed.success}
                    onChange={(event) => setColors({ ...colors, [status]: event.target.value })}
                  />
                </Field>
              </div>
              <section
                className="status-color-previews"
                aria-label={`${status} appearance previews`}
              >
                {PREVIEW_THEMES.map((theme) => {
                  const palette = deriveStatusPalette({ color: preview, surface: theme.surface });
                  return (
                    <div
                      key={theme.label}
                      className="status-preview"
                      style={{ background: theme.surface }}
                    >
                      <span
                        className="status-badge"
                        style={{ color: palette.foreground, background: palette.background }}
                      >
                        {status}
                      </span>
                      <small
                        style={{
                          color: deriveStatusPalette({
                            color: theme.surface,
                            surface: theme.surface,
                          }).foreground,
                        }}
                      >
                        {theme.label}
                      </small>
                    </div>
                  );
                })}
              </section>
            </div>
          );
        })}
        <div className="cluster">
          <Button type="submit" variant="primary" busy={busy} disabled={!valid}>
            Save status colors
          </Button>
          <Button disabled={busy} onClick={() => void submit(true)}>
            Reset to defaults
          </Button>
        </div>
      </form>
    </Card>
  );
}

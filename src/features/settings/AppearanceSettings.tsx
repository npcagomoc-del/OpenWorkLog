import { Monitor, Moon, MoonStar, Sun } from 'lucide-react';
import { Card, Field, SegmentedControl } from '../../components/ui';
import type { Settings } from '../../domain/models';

type Props = {
  readonly settings: Settings;
  readonly save: (patch: Partial<Settings>) => Promise<void>;
};
export function AppearanceSettings({ settings, save }: Props) {
  return (
    <Card className="card-pad stack" id="appearance">
      <div>
        <h2>Make it comfortable</h2>
        <p className="muted">Choose how your workspace looks on this device.</p>
      </div>
      <Field label="Appearance">
        <SegmentedControl
          label="Appearance"
          value={settings.theme}
          onChange={(theme) => void save({ theme })}
          options={[
            { value: 'light', label: 'Light', icon: <Sun size={18} /> },
            { value: 'dark', label: 'Dark', icon: <Moon size={18} /> },
            { value: 'black', label: 'Super dark', icon: <MoonStar size={18} /> },
            { value: 'system', label: 'System', icon: <Monitor size={18} /> },
          ]}
        />
      </Field>
      <fieldset className="appearance-presets">
        <legend>Surface style</legend>
        <p className="muted small">Choose the neutral surfaces and default button color. Status and category colors stay separate.</p>
        <div className="appearance-preset-grid">
          {([
            { value: 'classic', label: 'Default', detail: 'OpenWorkLog blue' },
            { value: 'apple', label: 'Apple', detail: 'Cool neutral · blue' },
            { value: 'claude', label: 'Warm', detail: 'Warm neutral · terracotta' },
          ] as const).map((preset) => (
            <button
              type="button"
              key={preset.value}
              className={`appearance-preset appearance-preset--${preset.value}`}
              aria-pressed={settings.appearancePreset === preset.value}
              onClick={() => void save({ appearancePreset: preset.value })}
            >
              <span className="appearance-preview" aria-hidden="true">
                <span className="appearance-preview-panel" />
                <span className="appearance-preview-action" />
              </span>
              <strong>{preset.label}</strong>
              <span>{preset.detail}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <Field label="Button color" hint="Links, focus rings and primary buttons use a readable shade. Status colors stay independent.">
        <div className="appearance-accent-row">
          {settings.actionAccent ? (
            <input
              id="action-accent"
              type="color"
              aria-label="Custom button color"
              value={settings.actionAccent}
              onChange={(event) => void save({ actionAccent: event.target.value })}
            />
          ) : (
            <button
              id="action-accent"
              type="button"
              className="appearance-customize"
              onClick={() => void save({ actionAccent: getComputedStyle(document.documentElement).getPropertyValue('--accent-seed').trim() })}
            >
              Customize button color
            </button>
          )}
          <span className="appearance-current-accent" aria-hidden="true" />
          <button type="button" className="text-link" disabled={!settings.actionAccent} onClick={() => void save({ actionAccent: undefined })}>
            Restore default button color
          </button>
        </div>
      </Field>
      <div className="form-grid">
        <Field label="Text size">
          <SegmentedControl
            label="Text size"
            value={settings.textSize}
            onChange={(textSize) => void save({ textSize })}
            options={[
              { value: 'normal', label: 'Comfortable' },
              { value: 'large', label: 'Large' },
            ]}
          />
        </Field>
        <Field label="Time format">
          <SegmentedControl
            label="Time format"
            value={settings.timeFormat}
            onChange={(timeFormat) => void save({ timeFormat })}
            options={[
              { value: '24h', label: '24-hour' },
              { value: '12h', label: '12-hour' },
            ]}
          />
        </Field>
      </div>
      <label className="settings-check">
        <input
          type="checkbox"
          checked={settings.sidebarCollapsed}
          onChange={(event) => void save({ sidebarCollapsed: event.target.checked })}
        />
        Keep the sidebar collapsed
      </label>
      <Field label="Week starts on" htmlFor="week-start">
        <select
          id="week-start"
          value={settings.weekStartsOn}
          onChange={(event) => void save({ weekStartsOn: event.target.value === '0' ? 0 : 1 })}
        >
          <option value="1">Monday</option>
          <option value="0">Sunday</option>
        </select>
      </Field>
    </Card>
  );
}

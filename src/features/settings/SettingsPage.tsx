import { useState } from 'react';
import { Notice, PageHeader, Spinner, useToast } from '../../components/ui';
import { actions } from '../../data/actions';
import { useWorkspace } from '../../data/useWorkspace';
import type { Settings } from '../../domain/models';
import { AppearanceSettings } from './AppearanceSettings';
import { BackupSettings } from './BackupSettings';
import { CategorySettings } from './CategorySettings';
import { LabelSettings } from './LabelSettings';
import { ScheduleSettings } from './ScheduleSettings';
import './settings.css';

export default function SettingsPage() {
  const workspace = useWorkspace();
  const [error, setError] = useState('');
  const { toast } = useToast();
  async function save(patch: Partial<Settings>) {
    setError('');
    try {
      await actions.updateSettings(patch);
      toast('Preferences saved.');
    } catch (failure) {
      const message = failure instanceof Error ? failure.message : 'Could not save preferences.';
      setError(message);
      toast(message, 'error');
    }
  }
  if (workspace.error) return <Notice tone="error">{workspace.error}</Notice>;
  if (!workspace.ready) return <Spinner />;
  const { settings, categories } = workspace;
  return (
    <div className="page-stack settings-page">
      <PageHeader title="Settings" description="A workspace that fits the way you work." />
      {error && <Notice tone="error">{error}</Notice>}
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          <a href="#appearance">Appearance</a>
          <a href="#schedule">Working day</a>
          <a href="#labels">Labels & profile</a>
          <a href="#categories">Categories</a>
          <a href="#data">Data & backup</a>
        </nav>
        <div className="stack settings-content">
          <AppearanceSettings settings={settings} save={save} />
          <ScheduleSettings
            key={`${settings.workStart}-${settings.workEnd}-${settings.lunchStart}-${settings.lunchEnd}-${settings.timezone}`}
            settings={settings}
            save={save}
          />
          <LabelSettings
            key={JSON.stringify([settings.typeLabels, settings.ownerName])}
            settings={settings}
            save={save}
          />
          <CategorySettings categories={categories} />
          <BackupSettings />
        </div>
      </div>
    </div>
  );
}

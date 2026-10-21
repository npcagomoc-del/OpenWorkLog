import { Download, HardDrive, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Badge, Button, Card, ConfirmDialog, Notice, useToast } from '../../components/ui';
import { createBackup, parseBackup, restoreBackup } from '../../data/backup';
import { downloadText } from '../../lib/download';

type BackupPreview = {
  readonly filename: string;
  readonly text: string;
  readonly backup: ReturnType<typeof parseBackup>;
};
export function BackupSettings() {
  const [preview, setPreview] = useState<BackupPreview | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  async function download() {
    setBusy(true);
    setError('');
    try {
      downloadText(
        `OpenWorkLog-backup-${new Date().toISOString().slice(0, 10)}.json`,
        await createBackup(),
        'application/json',
      );
      toast('Backup downloaded. Keep a copy outside this browser.');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not create a backup.');
    } finally {
      setBusy(false);
    }
  }
  async function selectFile(file: File) {
    setError('');
    setPreview(null);
    setConfirm(false);
    setBusy(true);
    try {
      const text = await file.text();
      setPreview({ filename: file.name, text, backup: parseBackup(text) });
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'This file could not be read. Your existing data is unchanged.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function restore() {
    if (!preview) return;
    setBusy(true);
    setError('');
    try {
      await restoreBackup(preview.text);
      setPreview(null);
      setConfirm(false);
      toast('Backup restored. Your workspace is ready.');
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'Restore failed. Your existing data is unchanged.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card className="card-pad stack" id="data">
      <div className="split">
        <div>
          <h2>Your data</h2>
          <p className="muted">
            Back up this workspace before clearing browser data or changing devices.
          </p>
        </div>
        <Badge tone="green">
          <HardDrive size={14} />
          Saved on this device
        </Badge>
      </div>
      <div className="settings-storage">
        <strong>Local workspace</strong>
        <p>
          Your records are stored in this browser on this device. A backup includes tasks, projects,
          plans, daily entries, timers, notes, categories and preferences.
        </p>
        <p className="small muted">
          Cloud sync: not configured. Your backup file is the way to transfer this workspace.
        </p>
      </div>
      <div className="cluster">
        <Button variant="primary" busy={busy} onClick={() => void download()}>
          <Download size={18} />
          Download backup
        </Button>
        <Button disabled={busy} onClick={() => input.current?.click()}>
          <Upload size={18} />
          Choose backup to restore
        </Button>
      </div>
      <input
        hidden
        style={{ display: 'none' }}
        ref={input}
        type="file"
        accept=".json,application/json"
        aria-label="Choose OpenWorkLog backup"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void selectFile(file);
          event.target.value = '';
        }}
      />
      {error && (
        <Notice tone="error">
          {error}
          <br />
          Your existing data has not been replaced.
        </Notice>
      )}
      {preview && (
        <div className="settings-storage stack">
          <div>
            <h3>Review this backup</h3>
            <p className="backup-filename">{preview.filename}</p>
            <p className="small muted">
              Version {preview.backup.version} · Created{' '}
              {new Date(preview.backup.exportedAt).toLocaleString()}
            </p>
          </div>
          <dl className="backup-counts">
            {Object.entries({
              Tasks: preview.backup.data.tasks.length,
              Projects: preview.backup.data.projects.length,
              Notes: preview.backup.data.notes.length,
              'Daily entries': preview.backup.data.dailyEntries.length,
              Plans: preview.backup.data.plans.length,
              Categories: preview.backup.data.categories.length,
            }).map(([label, count]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{count}</dd>
              </div>
            ))}
          </dl>
          <Notice tone="warning">
            Restoring replaces every record and preference currently saved on this device. Download
            a backup first if you want to keep them.
          </Notice>
          <div className="cluster">
            <Button variant="danger" disabled={busy} onClick={() => setConfirm(true)}>
              Replace workspace with this backup
            </Button>
            <Button disabled={busy} onClick={() => setPreview(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirm}
        title="Replace this workspace?"
        description="All current local records and preferences will be replaced by the validated backup shown above. This cannot be undone without another backup."
        confirmLabel="Yes, replace workspace"
        destructive
        busy={busy}
        onClose={() => {
          if (!busy) setConfirm(false);
        }}
        onConfirm={() => void restore()}
      />
    </Card>
  );
}

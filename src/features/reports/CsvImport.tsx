import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button, Field, Modal, Notice, StatusBadge, useToast } from '../../components/ui';
import { importTasksCsv, previewTasksCsv, type CsvPreview } from '../../data/csv';
import type { TaskCreateInput, Workspace } from '../../domain/models';
import { errorMessage } from '../daily/entryForm';

import { ScrollablePreview } from './ScrollablePreview';

type Preview = Omit<CsvPreview, 'rows'> & {
  readonly rows: readonly (TaskCreateInput & { readonly previewKey: string })[];
};
type Props = { readonly workspace: Workspace; readonly onClose: () => void };
export function CsvImport({ workspace, onClose }: Props) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [filename, setFilename] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  async function readFile(file: File | undefined) {
    setPreview(null);
    setError('');
    if (!file) return;
    setFilename(file.name);
    setBusy(true);
    try {
      const parsed = previewTasksCsv(await file.text(), workspace);
      setPreview({
        ...parsed,
        rows: parsed.rows.map((row) => ({ ...row, previewKey: crypto.randomUUID() })),
      });
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }
  async function importRows() {
    if (!preview || preview.errors.length || !preview.rows.length) return;
    setBusy(true);
    setError('');
    try {
      await importTasksCsv(preview.rows);
      toast(`${preview.rows.length} tasks imported.`);
      onClose();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      open
      onClose={onClose}
      title="Import tracker CSV"
      size="lg"
      footer={
        <>
          <Button onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => void importRows()}
            busy={busy}
            disabled={!preview || preview.errors.length > 0 || preview.rows.length === 0}
          >
            <Upload size={16} />
            Import {preview?.rows.length ?? 0} tasks
          </Button>
        </>
      }
    >
      <div className="stack">
        <p className="muted">
          Preview a tracker CSV before adding tasks. Required columns: Task and Status. Allowed
          statuses: Open, In Progress, Closed.
        </p>
        <Notice>
          Import adds new tasks; it does not replace existing records. Category and project names
          must already exist. Use JSON backup in Settings to restore a complete workspace.
        </Notice>
        <Field label="Tracker CSV file" htmlFor="tracker-csv">
          <input
            id="tracker-csv"
            type="file"
            accept=".csv,text/csv"
            disabled={busy}
            onChange={(event) => void readFile(event.target.files?.[0])}
          />
        </Field>
        {error && <Notice tone="error">{error}</Notice>}
        {preview && (
          <>
            <p>
              <strong>{filename}</strong> · {preview.rows.length} valid task rows ·{' '}
              {preview.errors.length} errors
            </p>
            {preview.errors.length > 0 && (
              <Notice tone="error">
                <strong>Fix these rows before importing.</strong>
                <ul>
                  {preview.errors.map((issue) => (
                    <li key={`${issue.row}-${issue.message}`}>
                      Row {issue.row}: {issue.message}
                    </li>
                  ))}
                </ul>
              </Notice>
            )}
            {preview.rows.length > 0 && (
              <ScrollablePreview label="Import preview table">
                <table className="data-table">
                  <caption className="visually-hidden">CSV import preview</caption>
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>By whom</th>
                      <th>By when</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 50).map((row) => (
                      <tr key={row.previewKey}>
                        <td>{row.title}</td>
                        <td>{row.assignee || '—'}</td>
                        <td>{row.dueDate ?? '—'}</td>
                        <td>
                          <StatusBadge status={row.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollablePreview>
            )}
            {preview.rows.length > 50 && (
              <p className="small muted">
                Showing the first 50 rows. All {preview.rows.length} valid rows will be imported.
              </p>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

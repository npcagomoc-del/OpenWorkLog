import { useState } from 'react';
import { Download, Upload } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  Field,
  Notice,
  PageHeader,
  SegmentedControl,
  StatusBadge,
  useToast,
} from '../../components/ui';
import { exportDailyCsv, exportTasksCsv } from '../../data/csv';
import { useWorkspace } from '../../data/useWorkspace';
import { STATUSES } from '../../domain/models';
import { entryMinutes, formatDuration, todayKey } from '../../domain/time';
import { downloadText } from '../../lib/download';
import { activityBusinessUnit, businessUnitOptions, matchesBusinessUnit } from './reportUnits';
import { CsvImport } from './CsvImport';
import { ReportPreview } from './ReportPreview';
import './reports.css';

export default function ReportsPage() {
  const workspace = useWorkspace();
  const [mode, setMode] = useState<'daily' | 'tracker'>('daily');
  const [from, setFrom] = useState(() => todayKey(new Date(), workspace.settings.timezone));
  const [to, setTo] = useState(() => todayKey(new Date(), workspace.settings.timezone));
  const [allDates, setAllDates] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [businessUnit, setBusinessUnit] = useState('');
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();
  const invalidRange = !allDates && (!from || !to || from > to);
  const entries = workspace.dailyEntries
    .filter(
      (entry) =>
        (allDates || (entry.date >= from && entry.date <= to)) &&
        matchesBusinessUnit(activityBusinessUnit(entry, workspace), businessUnit),
    )
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        (a.actualStart ?? a.plannedStart ?? 1440) - (b.actualStart ?? b.plannedStart ?? 1440),
    );
  const tasks = workspace.tasks.filter(
    (task) =>
      (includeArchived || !task.archived) && matchesBusinessUnit(task.businessUnit, businessUnit),
  );
  const work = entries.filter((entry) => !entry.isLunch);
  const minutes = work.reduce((total, entry) => total + entryMinutes(entry), 0);
  const records = mode === 'daily' ? entries : tasks;
  function exportCsv() {
    const data = {
      ...workspace,
      dailyEntries: entries.map((entry) => ({
        ...entry,
        businessUnit: activityBusinessUnit(entry, workspace),
      })),
      tasks,
    };
    downloadText(
      mode === 'daily'
        ? `daily-report-${allDates ? 'all-dates' : `${from}-to-${to}`}.csv`
        : 'task-tracker.csv',
      mode === 'daily' ? exportDailyCsv(data) : exportTasksCsv(data),
      'text/csv;charset=utf-8',
    );
    toast(`${mode === 'daily' ? 'Daily report' : 'Task tracker'} CSV downloaded.`);
  }
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Records and exports"
        title="Reports"
        description="Preview your records and download the same data as a CSV."
        actions={
          <>
            <Button onClick={() => setImporting(true)}>
              <Upload size={16} />
              Import tracker CSV
            </Button>
            <Button
              variant="primary"
              onClick={exportCsv}
              disabled={mode === 'daily' && invalidRange}
            >
              <Download size={16} />
              Download CSV
            </Button>
          </>
        }
      />
      <Card className="card-pad stack">
        <div className="split">
          <SegmentedControl
            value={mode}
            onChange={setMode}
            label="Report type"
            options={[
              { value: 'daily', label: 'Daily report' },
              { value: 'tracker', label: 'Task tracker' },
            ]}
          />
          <Badge>{records.length} records</Badge>
        </div>
        {mode === 'daily' ? (
          <div className="report-filters">
            <Field label="From date" htmlFor="report-from">
              <input
                id="report-from"
                type="date"
                value={from}
                disabled={allDates}
                onChange={(event) => setFrom(event.target.value)}
              />
            </Field>
            <Field label="To date" htmlFor="report-to">
              <input
                id="report-to"
                type="date"
                value={to}
                disabled={allDates}
                onChange={(event) => setTo(event.target.value)}
              />
            </Field>
            <label className="report-checkbox">
              <input
                type="checkbox"
                checked={allDates}
                onChange={(event) => setAllDates(event.target.checked)}
              />
              All dates
            </label>
          </div>
        ) : (
          <label className="report-checkbox">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(event) => setIncludeArchived(event.target.checked)}
            />
            Include archived tasks
          </label>
        )}
        <Field label="Business Unit" htmlFor="report-business-unit">
          <select
            id="report-business-unit"
            value={businessUnit}
            onChange={(event) => setBusinessUnit(event.target.value)}
          >
            <option value="">All business units</option>
            <option value="__unassigned__">Unassigned</option>
            {businessUnitOptions(workspace).map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </Field>
        {mode === 'daily' && invalidRange && (
          <Notice tone="error">
            Choose a valid date range. The end date must be on or after the start date.
          </Notice>
        )}
        {records.some((record) => record.demo) && (
          <Notice>Demo records are included in this preview and export.</Notice>
        )}
      </Card>
      <Card className="card-pad stack">
        <h2>Report summary</h2>
        {mode === 'daily' ? (
          <>
            <p>
              {work.length} daily work {work.length === 1 ? 'entry' : 'entries'} with{' '}
              <strong>{formatDuration(minutes)} of actual productive time</strong>
              {allDates ? ' across all saved dates' : ` from ${from} to ${to}`}. Lunch and breaks
              are excluded from time totals.
            </p>
            <div className="cluster">
              {STATUSES.map((status) => (
                <div className="cluster" key={status}>
                  <StatusBadge status={status} />
                  <strong>{work.filter((entry) => entry.status === status).length}</strong>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <p>
              {tasks.length} {includeArchived ? 'saved' : 'active'} tasks in the tracker. Status
              reflects each task's current state.
            </p>
            <div className="cluster">
              {STATUSES.map((status) => (
                <div className="cluster" key={status}>
                  <StatusBadge status={status} />
                  <strong>{tasks.filter((task) => task.status === status).length}</strong>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
      <ReportPreview mode={mode} entries={entries} tasks={tasks} workspace={workspace} />
      {importing && <CsvImport workspace={workspace} onClose={() => setImporting(false)} />}
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, PageHeader, useToast } from '../../components/ui';
import { useWorkspace } from '../../data/useWorkspace';
import { formatDuration, todayKey } from '../../domain/time';
import { downloadText } from '../../lib/download';
import { ActivityChart, StatusRing } from './ExecutiveCharts';
import { ExecutiveFilters, daysBefore } from './ExecutiveFilters';
import { ExecutiveKpis } from './ExecutiveKpis';
import { ExecutiveAttention, ExecutivePortfolio, ExecutiveWorkload } from './ExecutivePortfolio';
import { executiveCsv } from './executiveCsv';
import { executiveMetrics, type ExecutiveScope } from './executiveMetrics';
import './executive.css';

export default function ExecutivePage() {
  const workspace = useWorkspace();
  const today = todayKey(new Date(), workspace.settings.timezone);
  const [scope, setScope] = useState<ExecutiveScope>(() => ({
    from: daysBefore(today, 6),
    to: today,
    categoryId: '',
    owner: '',
  }));
  const { toast } = useToast();
  const invalidRange = !scope.from || !scope.to || scope.from > scope.to;
  const metrics = useMemo(
    () => executiveMetrics(workspace, scope, today),
    [workspace, scope, today],
  );
  const owners = [
    ...new Set([
      ...workspace.tasks.map((task) => task.assignee.trim() || 'Unassigned'),
      ...workspace.projects.map((project) => project.owner.trim() || 'Unassigned'),
    ]),
  ].sort((a, b) => a.localeCompare(b));
  function exportSummary() {
    downloadText(
      `executive-summary-${scope.from}-to-${scope.to}.csv`,
      executiveCsv(metrics, scope),
      'text/csv;charset=utf-8',
    );
    toast('Executive summary CSV downloaded.');
  }
  return (
    <div className="page-stack executive-page">
      <PageHeader
        eyebrow="Executive dashboard"
        title="Executive overview"
        description="Current work, project status and the time behind it."
        actions={
          <Button variant="primary" onClick={exportSummary} disabled={invalidRange}>
            <Download size={18} />
            Export summary CSV
          </Button>
        }
      />
      <ExecutiveFilters
        scope={scope}
        onChange={(value) => setScope((current) => ({ ...current, ...value }))}
        today={today}
        invalidRange={invalidRange}
        categories={workspace.categories}
        owners={owners}
      />
      {metrics.demo && (
        <div className="cluster executive-demo">
          <Badge tone="yellow">Includes demo data</Badge>
          <span className="small muted">
            Example records are included in these figures and exports.
          </span>
        </div>
      )}
      <ExecutiveKpis metrics={metrics} today={today} invalidRange={invalidRange} />
      <div className="executive-main-grid">
        <ExecutivePortfolio metrics={metrics} />
        <StatusRing counts={metrics.taskCounts} />
      </div>
      {!invalidRange && <ActivityChart activity={metrics.activity} />}
      <div className="executive-two-columns">
        <ExecutiveWorkload metrics={metrics} />
        <Card className="card-pad stack">
          <div>
            <p className="eyebrow">Selected period</p>
            <h2>Time by category</h2>
            <p className="small muted">Actual productive time from Daily log.</p>
          </div>
          {metrics.categoryTime.length ? (
            <ul className="executive-category-list">
              {metrics.categoryTime.map((category) => (
                <li key={category.id ?? 'uncategorized'}>
                  <div className="split">
                    <strong>{category.name}</strong>
                    <span>{formatDuration(category.minutes)}</span>
                  </div>
                  <meter
                    min={0}
                    max={Math.max(1, metrics.loggedMinutes)}
                    value={category.minutes}
                    aria-label={`${category.name}: ${formatDuration(category.minutes)} productive time`}
                  >
                    {formatDuration(category.minutes)}
                  </meter>
                </li>
              ))}
            </ul>
          ) : (
            <p className="executive-empty muted">No productive time logged in this scope.</p>
          )}
          <Link className="text-link" to="/daily">
            Open daily log
          </Link>
        </Card>
      </div>
      <ExecutiveAttention metrics={metrics} />
    </div>
  );
}

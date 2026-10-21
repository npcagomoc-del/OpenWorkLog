import './executiveCharts.css';
import { ScrollablePreview } from '../reports/ScrollablePreview';
import { Card, StatusBadge } from '../../components/ui';
import { statusColor } from '../../components/statusPalette';
import { formatDuration } from '../../domain/time';
import type { ActivityBucket } from './executiveActivity';
import type { StatusCount } from './executiveMetrics';

const ringLength = 2 * Math.PI * 46;

export function StatusRing({ counts }: { readonly counts: readonly StatusCount[] }) {
  const total = counts.reduce((sum, item) => sum + item.count, 0);
  const closed = counts.find((item) => item.status === 'Closed')?.count ?? 0;
  let offset = 0;
  return (
    <Card className="card-pad executive-status stack">
      <div>
        <p className="eyebrow">Current task status</p>
        <h2>Work at a glance</h2>
      </div>
      <div className="executive-status-content">
        <div className="executive-ring">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle className="executive-ring-track" cx="60" cy="60" r="46" />
            {counts.map((item) => {
              const length = total ? (item.count / total) * ringLength : 0;
              const position = offset;
              offset += length;
              return (
                <circle
                  key={item.status}
                  className="executive-ring-segment"
                  style={{ stroke: statusColor(item.status) }}
                  cx="60"
                  cy="60"
                  r="46"
                  strokeDasharray={`${length} ${ringLength - length}`}
                  strokeDashoffset={-position}
                />
              );
            })}
          </svg>
          <div className="executive-ring-label">
            <strong>{closed}</strong>
            <span>of {total} closed</span>
          </div>
        </div>
        <ul className="executive-status-legend">
          {counts.map((item) => (
            <li key={item.status}>
              <StatusBadge status={item.status} />
              <strong>{item.count}</strong>
            </li>
          ))}
        </ul>
      </div>
      <details className="executive-chart-data">
        <summary>View status figures</summary>
        <ScrollablePreview label="Current task status figures">
          <table className="data-table">
            <caption className="visually-hidden">Current task statuses with exact counts</caption>
            <thead>
              <tr>
                <th>Status</th>
                <th>Tasks</th>
              </tr>
            </thead>
            <tbody>
              {counts.map((item) => (
                <tr key={item.status}>
                  <th scope="row">{item.status}</th>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total</th>
                <td>{total}</td>
              </tr>
            </tfoot>
          </table>
        </ScrollablePreview>
      </details>{' '}
      <p className="small muted">
        Current saved task statuses. Closed records completed work; Cancelled records stopped work.
      </p>
    </Card>
  );
}
export function ActivityChart({ activity }: { readonly activity: readonly ActivityBucket[] }) {
  const largest = Math.max(60, ...activity.flatMap((bucket) => [bucket.actual, bucket.planned]));
  const hasTime = activity.some((bucket) => bucket.actual > 0 || bucket.planned > 0);
  return (
    <Card className="card-pad stack executive-activity">
      <div className="split">
        <div>
          <p className="eyebrow">Selected period</p>
          <h2>Planned time and work logged</h2>
        </div>
        <div className="executive-chart-legend small">
          <span>
            <i className="executive-swatch-planned" />
            Planned
          </span>
          <span>
            <i className="executive-swatch-actual" />
            Logged
          </span>
        </div>
      </div>
      <p className="small muted">
        Each date range below includes its first and last day. Logged time excludes pauses, lunch
        and breaks.
      </p>
      <ScrollablePreview label="Planned and logged time chart">
        <div
          className="executive-chart"
          style={{
            gridTemplateColumns: `repeat(${Math.max(1, activity.length)}, minmax(3rem, 1fr))`,
          }}
        >
          {activity.map((bucket) => (
            <div className="executive-chart-bucket" key={bucket.from}>
              <div className="executive-chart-bars" aria-hidden="true">
                <span
                  className="executive-planned-bar"
                  style={{ height: `${(bucket.planned / largest) * 100}%` }}
                />
                <span
                  className="executive-actual-bar"
                  style={{ height: `${(bucket.actual / largest) * 100}%` }}
                />
              </div>
              <span className="executive-chart-date">
                {bucket.from.slice(5)}
                {bucket.from !== bucket.to && (
                  <>
                    <br />–{bucket.to.slice(5)}
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      </ScrollablePreview>
      {!hasTime && (
        <p className="executive-chart-empty muted">No planned or logged time in this period.</p>
      )}
      <details className="executive-chart-data">
        <summary>View time figures</summary>
        <ScrollablePreview label="Planned and logged time figures">
          <table className="data-table">
            <caption className="visually-hidden">
              Exact planned and productive time by date range
            </caption>
            <thead>
              <tr>
                <th>Date range</th>
                <th>Planned</th>
                <th>Logged</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((bucket) => (
                <tr key={bucket.from}>
                  <td>
                    {bucket.from}
                    {bucket.from !== bucket.to && ` to ${bucket.to}`}
                  </td>
                  <td>{formatDuration(bucket.planned)}</td>
                  <td>{formatDuration(bucket.actual)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollablePreview>
      </details>
    </Card>
  );
}

import { CalendarRange } from 'lucide-react';
import { Button, Card, Field, Notice } from '../../components/ui';
import type { Category } from '../../domain/models';
import type { ExecutiveScope } from './executiveMetrics';

export function daysBefore(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) - days * 86_400_000).toISOString().slice(0, 10);
}
type Props = {
  readonly scope: ExecutiveScope;
  readonly onChange: (value: Partial<ExecutiveScope>) => void;
  readonly categories: readonly Category[];
  readonly owners: readonly string[];
  readonly today: string;
  readonly invalidRange: boolean;
};
export function ExecutiveFilters({
  scope,
  onChange,
  categories,
  owners,
  today,
  invalidRange,
}: Props) {
  return (
    <Card className="card-pad executive-filters stack">
      <div className="split">
        <div className="cluster">
          <CalendarRange size={20} aria-hidden="true" />
          <strong>Activity period</strong>
        </div>
        <div className="cluster">
          <Button size="sm" onClick={() => onChange({ from: daysBefore(today, 6), to: today })}>
            Last 7 days
          </Button>
          <Button size="sm" onClick={() => onChange({ from: daysBefore(today, 29), to: today })}>
            Last 30 days
          </Button>
        </div>
      </div>
      <div className="executive-filter-grid">
        <Field label="Activity from" htmlFor="executive-from">
          <input
            id="executive-from"
            type="date"
            value={scope.from}
            onChange={(event) => onChange({ from: event.target.value })}
          />
        </Field>
        <Field label="Activity to" htmlFor="executive-to">
          <input
            id="executive-to"
            type="date"
            value={scope.to}
            onChange={(event) => onChange({ to: event.target.value })}
          />
        </Field>
        <Field label="Category" htmlFor="executive-category">
          <select
            id="executive-category"
            value={scope.categoryId}
            onChange={(event) => onChange({ categoryId: event.target.value })}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
                {category.archived ? ' (archived)' : ''}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Owner" htmlFor="executive-owner">
          <select
            id="executive-owner"
            value={scope.owner}
            onChange={(event) => onChange({ owner: event.target.value })}
          >
            <option value="">All owners</option>
            {owners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <p className="small muted">
        Dates filter logged and planned time. Portfolio counts show current unarchived records;
        category and owner apply to both.
      </p>
      {invalidRange && (
        <Notice tone="error">
          Choose a valid activity period. The end date must be on or after the start date.
        </Notice>
      )}
    </Card>
  );
}

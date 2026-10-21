import type { ExecutiveMetrics, ExecutiveScope } from './executiveMetrics';
function cell(value: string | number): string {
  const text = String(value);
  const safe = /^\s*[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}
export function executiveCsv(metrics: ExecutiveMetrics, scope: ExecutiveScope): string {
  const rows: (string | number)[][] = [
    [
      'Scope',
      'Item',
      'Value',
      'Unit',
      'Open',
      'In Progress',
      'Closed',
      'Productive Minutes',
      'Planned Minutes',
      'From',
      'To',
      'Category Filter',
      'Owner Filter',
    ],
  ];
  const round = (value: number) => Number(value.toFixed(2));
  const filters = [metrics.categoryLabel, scope.owner || 'All owners'];
  const period = (item: string, value: number, unit: string) => [
    'Selected period',
    item,
    round(value),
    unit,
    '',
    '',
    '',
    '',
    '',
    scope.from,
    scope.to,
    ...filters,
  ];
  for (const row of metrics.portfolio)
    rows.push([
      'Current portfolio',
      row.label,
      row.total,
      'records',
      ...row.counts.map((count) => count.count),
      '',
      '',
      '',
      '',
      ...filters,
    ]);
  rows.push(
    period('Productive time', metrics.loggedMinutes, 'minutes'),
    period('Planned time', metrics.plannedMinutes, 'minutes'),
    period('Break time', metrics.breakMinutes, 'minutes'),
  );
  rows.push([
    'Current portfolio',
    'Overdue tasks',
    metrics.overdue.length,
    'tasks',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ...filters,
  ]);
  for (const category of metrics.categoryTime)
    rows.push(period(category.name, category.minutes, 'productive minutes'));
  for (const owner of metrics.ownerWork)
    rows.push([
      'Current workload / period time',
      owner.name,
      owner.total,
      'tasks',
      ...owner.counts.map((count) => count.count),
      round(owner.minutes),
      '',
      scope.from,
      scope.to,
      ...filters,
    ]);
  for (const bucket of metrics.activity)
    rows.push([
      'Selected-period activity',
      `${bucket.from} to ${bucket.to}`,
      '',
      '',
      '',
      '',
      '',
      round(bucket.actual),
      round(bucket.planned),
      bucket.from,
      bucket.to,
      ...filters,
    ]);
  return `\uFEFF${rows.map((row) => row.map(cell).join(',')).join('\r\n')}`;
}

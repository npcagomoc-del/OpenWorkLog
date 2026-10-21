import { Columns3, Download, List, Search, Table2 } from 'lucide-react';
import { Button, Card, Field, SegmentedControl } from '../../components/ui';
import type { Category, Settings } from '../../domain/models';
import type { TaskFilters } from './taskLogic';
import { statuses, workTypes } from './taskLogic';

type TaskView = 'list' | 'table' | 'board';
const viewOptions = [
  { value: 'list', label: 'List', icon: <List size={17} /> },
  { value: 'table', label: 'Table', icon: <Table2 size={17} /> },
  { value: 'board', label: 'Kanban', icon: <Columns3 size={17} /> },
] as const;
export function TaskToolbar({
  filters,
  onFilter,
  categories,
  typeLabels,
  view,
  onView,
  onExport,
}: {
  readonly filters: TaskFilters;
  readonly onFilter: (patch: Partial<TaskFilters>) => void;
  readonly categories: readonly Category[];
  readonly typeLabels: Settings['typeLabels'];
  readonly view: TaskView;
  readonly onView: (view: TaskView) => void;
  readonly onExport: () => void;
}) {
  return (
    <Card className="card-pad stack task-toolbar">
      <div className="split">
        <div className="task-search">
          <Search size={18} aria-hidden="true" />
          <input
            aria-label="Search tasks"
            placeholder="Search tasks, tickets or updates"
            value={filters.query}
            onChange={(event) => onFilter({ query: event.target.value })}
          />
        </div>
        <SegmentedControl value={view} onChange={onView} options={viewOptions} label="Task view" />
      </div>
      <div className="task-filters">
        <Field label="Status" htmlFor="filter-status">
          <select
            id="filter-status"
            value={filters.status}
            onChange={(event) => onFilter({ status: event.target.value })}
          >
            <option value="">All statuses</option>
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Category" htmlFor="filter-category">
          <select
            id="filter-category"
            value={filters.categoryId}
            onChange={(event) => onFilter({ categoryId: event.target.value })}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Work type" htmlFor="filter-type">
          <select
            id="filter-type"
            value={filters.type}
            onChange={(event) => onFilter({ type: event.target.value })}
          >
            <option value="">All types</option>
            {workTypes.map((item) => (
              <option key={item} value={item}>
                {typeLabels[item]}
              </option>
            ))}
          </select>
        </Field>
        <Button onClick={onExport}>
          <Download size={17} />
          Export CSV
        </Button>
      </div>
    </Card>
  );
}

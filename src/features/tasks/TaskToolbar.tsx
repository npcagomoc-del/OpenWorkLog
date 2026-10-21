import { Columns3, Download, List, Search, Table2 } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, Field, Modal, SegmentedControl } from '../../components/ui';
import type { Category, Project, Settings } from '../../domain/models';
import { TaskDisplayOptions } from './TaskDisplayOptions';
import type { TaskFilters } from './taskLogic';
import { statuses, workTypes } from './taskLogic';
import type { TaskGroup, TaskPreferences } from './taskViewTypes';

const viewOptions = [
  { value: 'list', label: 'List', icon: <List size={17} /> },
  { value: 'table', label: 'Table', icon: <Table2 size={17} /> },
  { value: 'board', label: 'Kanban', icon: <Columns3 size={17} /> },
] as const;
const groupingOptions = [
  { value: 'status', label: 'Status' },
  { value: 'category', label: 'Category' },
  { value: 'project', label: 'Project' },
  { value: 'businessUnit', label: 'Business Unit' },
] as const;

export function TaskToolbar({
  filters,
  onFilter,
  categories,
  projects,
  settings,
  preferences,
  groups,
  onPreferences,
  onExport,
}: {
  readonly filters: TaskFilters;
  readonly onFilter: (patch: Partial<TaskFilters>) => void;
  readonly categories: readonly Category[];
  readonly projects: readonly Project[];
  readonly settings: Settings;
  readonly preferences: TaskPreferences;
  readonly groups: readonly TaskGroup[];
  readonly onPreferences: (preferences: TaskPreferences) => void;
  readonly onExport: () => void;
}) {
  const [panel, setPanel] = useState<'filters' | 'details' | null>(null);
  const count = [
    filters.status,
    filters.categoryId,
    filters.type,
    filters.projectId,
    filters.businessUnit,
  ].filter(Boolean).length;
  return (
    <Card className="task-toolbar">
      <div className="task-toolbar-main">
        <div className="task-search">
          <Search size={18} aria-hidden="true" />
          <input
            aria-label="Search tasks"
            placeholder="Search tasks"
            value={filters.query}
            onChange={(event) => onFilter({ query: event.target.value })}
          />
        </div>
        <SegmentedControl
          value={preferences.view}
          onChange={(view) => onPreferences({ ...preferences, view })}
          options={viewOptions}
          label="Task view"
        />
        <Button onClick={() => setPanel('filters')}>Filters{count ? ` (${count})` : ''}</Button>
        <Button onClick={() => setPanel('details')}>Card details</Button>
        <Button onClick={onExport} aria-label="Export tasks CSV">
          <Download size={17} />
        </Button>
      </div>
      {preferences.view === 'board' && (
        <div className="task-group-control">
          <label htmlFor="task-group-by" className="small muted">
            Group by
          </label>
          <select
            id="task-group-by"
            value={preferences.groupBy}
            onChange={(event) => {
              const option = groupingOptions.find((item) => item.value === event.target.value);
              if (option) onPreferences({ ...preferences, groupBy: option.value });
            }}
          >
            {groupingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <Modal
        open={panel === 'filters'}
        title="Task filters"
        onClose={() => setPanel(null)}
        footer={
          <>
            <Button
              onClick={() =>
                onFilter({
                  query: '',
                  status: '',
                  categoryId: '',
                  type: '',
                  projectId: '',
                  businessUnit: '',
                })
              }
            >
              Clear filters
            </Button>
            <Button variant="primary" onClick={() => setPanel(null)}>
              Done
            </Button>
          </>
        }
      >
        <div className="form-grid">
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
                <option value={item.id} key={item.id}>
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
                  {settings.typeLabels[item]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Project" htmlFor="filter-project">
            <select
              id="filter-project"
              value={filters.projectId ?? ''}
              onChange={(event) => onFilter({ projectId: event.target.value })}
            >
              <option value="">All projects</option>
              {projects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Business Unit" htmlFor="filter-unit">
            <input
              id="filter-unit"
              list="task-filter-units"
              value={filters.businessUnit ?? ''}
              onChange={(event) => onFilter({ businessUnit: event.target.value })}
              placeholder="All business units"
            />
            <datalist id="task-filter-units">
              {settings.businessUnits?.map((unit) => (
                <option value={unit} key={unit} />
              ))}
            </datalist>
          </Field>
        </div>
      </Modal>
      <TaskDisplayOptions
        open={panel === 'details'}
        onClose={() => setPanel(null)}
        preferences={preferences}
        groups={groups}
        onPreferences={onPreferences}
      />
    </Card>
  );
}

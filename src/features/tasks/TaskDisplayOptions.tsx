import { Button, Modal } from '../../components/ui';
import type { TaskGroup, TaskPreferences } from './taskViewTypes';

const detailOptions = [
  { key: 'dueDate', label: 'Due date' },
  { key: 'priority', label: 'Priority' },
  { key: 'project', label: 'Project' },
  { key: 'category', label: 'Category' },
  { key: 'businessUnit', label: 'Business Unit' },
  { key: 'assignee', label: 'Owner' },
  { key: 'latestUpdate', label: 'Latest update' },
] as const;
export function TaskDisplayOptions({
  open,
  onClose,
  preferences,
  groups,
  onPreferences,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly preferences: TaskPreferences;
  readonly groups: readonly TaskGroup[];
  readonly onPreferences: (preferences: TaskPreferences) => void;
}) {
  return (
    <Modal
      open={open}
      title="Card details"
      onClose={onClose}
      footer={
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="stack">
        <fieldset className="task-options">
          <legend>Visible fields</legend>
          {detailOptions.map(({ key, label }) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={preferences.fields[key]}
                onChange={(event) =>
                  onPreferences({
                    ...preferences,
                    fields: { ...preferences.fields, [key]: event.target.checked },
                  })
                }
              />
              {label}
            </label>
          ))}
        </fieldset>
        <fieldset className="task-options">
          <legend>Visible groups</legend>
          {groups.map((group) => (
            <label key={group.id}>
              <input
                type="checkbox"
                checked={!preferences.hiddenGroups.includes(group.id)}
                onChange={(event) =>
                  onPreferences({
                    ...preferences,
                    hiddenGroups: event.target.checked
                      ? preferences.hiddenGroups.filter((id) => id !== group.id)
                      : [...preferences.hiddenGroups, group.id],
                  })
                }
              />
              {group.label}
            </label>
          ))}
        </fieldset>
        <p className="small muted">
          Hidden groups keep their tasks. Show them again here at any time.
        </p>
      </div>
    </Modal>
  );
}

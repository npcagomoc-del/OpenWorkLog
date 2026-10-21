import { useState } from 'react';
import { Button } from '../../components/ui';
import type { Task } from '../../domain/models';

export function TaskSubtasks({
  items,
  onChange,
}: {
  readonly items: Task['subtasks'];
  readonly onChange: (items: Task['subtasks']) => void;
}) {
  const [title, setTitle] = useState('');
  return (
    <fieldset className="task-subtasks">
      <legend>Subtasks</legend>
      {items.map((item) => (
        <div className="cluster" key={item.id}>
          <label className="task-subtask">
            <input
              type="checkbox"
              checked={item.done}
              onChange={(event) =>
                onChange(
                  items.map((existing) =>
                    existing.id === item.id
                      ? { ...existing, done: event.target.checked }
                      : existing,
                  ),
                )
              }
            />
            {item.title}
          </label>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onChange(items.filter((existing) => existing.id !== item.id))}
          >
            Remove
          </Button>
        </div>
      ))}
      <div className="cluster">
        <input
          aria-label="New subtask"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a step"
        />
        <Button
          disabled={!title.trim()}
          onClick={() => {
            onChange([...items, { id: crypto.randomUUID(), title: title.trim(), done: false }]);
            setTitle('');
          }}
        >
          Add step
        </Button>
      </div>
    </fieldset>
  );
}

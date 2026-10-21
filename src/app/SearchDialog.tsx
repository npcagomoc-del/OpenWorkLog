import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, BookOpen, ListTodo, Search } from 'lucide-react';
import { useWorkspace } from '../data/useWorkspace';
import { EmptyState, Modal, StatusBadge } from '../components/ui';
export function SearchDialog({
  open,
  onClose,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
}) {
  const { tasks, notes } = useWorkspace();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const term = query.trim().toLowerCase();
  const taskMatches = term
    ? tasks
        .filter(
          (item) =>
            !item.archived &&
            `${item.title} ${item.description} ${item.ticket}`.toLowerCase().includes(term),
        )
        .slice(0, 8)
    : [];
  const noteMatches = term
    ? notes
        .filter(
          (item) =>
            !item.archived &&
            `${item.title} ${item.content} ${item.notebook}`.toLowerCase().includes(term),
        )
        .slice(0, 6)
    : [];
  function go(path: string) {
    onClose();
    navigate(path);
  }
  return (
    <Modal open={open} onClose={onClose} title="Search your workspace">
      <div className="stack">
        <label className="search-field">
          <Search size={20} />
          <input
            aria-label="Search tasks and notes"
            placeholder="Find a task, ticket or study note…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
        </label>
        {!term ? (
          <p className="muted small">
            Search task names, descriptions, ticket numbers and your study notes.
          </p>
        ) : taskMatches.length + noteMatches.length === 0 ? (
          <EmptyState
            title="No matching work"
            description="Try a different task name, ticket number or note title."
          />
        ) : (
          <div className="search-results">
            {taskMatches.length > 0 && <p className="eyebrow">Tasks</p>}
            {taskMatches.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(`/tasks?search=${encodeURIComponent(item.title)}`)}
              >
                <ListTodo size={18} />
                <span>{item.title}</span>
                <StatusBadge status={item.status} />
                <ArrowUpRight size={16} />
              </button>
            ))}
            {noteMatches.length > 0 && <p className="eyebrow">Study notes</p>}
            {noteMatches.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(`/notes?note=${encodeURIComponent(item.id)}`)}
              >
                <BookOpen size={18} />
                <span>{item.title}</span>
                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

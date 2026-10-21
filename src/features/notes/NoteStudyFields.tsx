import { Field } from '../../components/ui';
import type { NoteCreateInput, Task } from '../../domain/models';

export function NoteStudyFields({
  draft,
  setDraft,
  tasks,
}: {
  readonly draft: NoteCreateInput;
  readonly setDraft: (draft: NoteCreateInput) => void;
  readonly tasks: readonly Task[];
}) {
  return (
    <>
      <details className="note-extra">
        <summary>Summary, review questions & references</summary>
        <div className="stack">
          {(
            [
              ['summary', 'Summary', 'The key ideas to remember'],
              ['questions', 'Review questions', 'Questions to test your understanding'],
              ['references', 'References', 'Sources, book pages or URLs'],
            ] as const
          ).map(([key, label, placeholder]) => (
            <Field key={key} label={label} htmlFor={`note-${key}`}>
              <textarea
                id={`note-${key}`}
                rows={3}
                value={draft[key]}
                onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
                placeholder={placeholder}
              />
            </Field>
          ))}
        </div>
      </details>
      <Field
        label="Related task (optional)"
        htmlFor="note-task"
        hint="Link for context. Notes do not add work accomplishments."
      >
        <select
          id="note-task"
          value={draft.taskId ?? ''}
          onChange={(event) => setDraft({ ...draft, taskId: event.target.value || null })}
        >
          <option value="">No related task</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>
      </Field>
    </>
  );
}

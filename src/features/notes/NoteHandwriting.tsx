import { Eraser, Maximize2, PenLine, Redo2, Settings2, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { Button, IconButton, Modal, Notice } from '../../components/ui';
import type { Note } from '../../domain/models';
import { InkCanvas } from './InkCanvas';
import { useInkDocument } from './useInkDocument';
import './ink.css';

export function NoteHandwriting({
  note,
  restoreGeneration,
}: {
  readonly note: Note;
  readonly restoreGeneration: string;
}) {
  const drawing = useInkDocument(note.id, note.ink, restoreGeneration);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#202733');
  const [width, setWidth] = useState(4);
  const [finger, setFinger] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [options, setOptions] = useState(false);
  const [opened, setOpened] = useState(Boolean(note.ink?.strokes.length));
  if (!opened && drawing.ink.strokes.length === 0)
    return (
      <Button onClick={() => setOpened(true)}>
        <PenLine size={18} />
        Add handwriting
      </Button>
    );
  const contents = (
    <section
      className={`note-handwriting stack ${expanded ? 'is-expanded' : ''}`}
      aria-label="Handwriting"
    >
      {!expanded && (
        <div className="split">
          <div>
            <h3>Handwriting</h3>
            <p className="small muted">Pen or mouse to write. Touch to scroll.</p>
          </div>
          <IconButton label="Expand writing area" onClick={() => setExpanded(true)}>
            <Maximize2 size={18} />
          </IconButton>
        </div>
      )}
      <div className="ink-controls">
        <fieldset className="ink-toolbar" aria-label="Handwriting tools">
          <IconButton label="Pen" aria-pressed={tool === 'pen'} onClick={() => setTool('pen')}>
            <PenLine size={18} />
          </IconButton>
          <IconButton
            label="Eraser"
            aria-pressed={tool === 'eraser'}
            onClick={() => setTool('eraser')}
          >
            <Eraser size={18} />
          </IconButton>
          <IconButton label="Undo handwriting" disabled={!drawing.canUndo} onClick={drawing.undo}>
            <Undo2 size={18} />
          </IconButton>
          <IconButton label="Redo handwriting" disabled={!drawing.canRedo} onClick={drawing.redo}>
            <Redo2 size={18} />
          </IconButton>
          <IconButton
            label="Handwriting options"
            aria-expanded={options}
            onClick={() => setOptions(!options)}
          >
            <Settings2 size={18} />
          </IconButton>
        </fieldset>
        {options && (
          <div className="ink-options stack">
            <div className="ink-tool-group">
              <label className="ink-select">
                Ink
                <select
                  aria-label="Ink color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                >
                  <option value="#202733">Black</option>
                  <option value="#0969c7">Blue</option>
                  <option value="#b52e3c">Red</option>
                  <option value="#207145">Green</option>
                </select>
              </label>
              <label className="ink-select">
                Width
                <select
                  aria-label="Pen width"
                  value={width}
                  onChange={(event) => setWidth(Number(event.target.value))}
                >
                  <option value={2}>Fine</option>
                  <option value={4}>Medium</option>
                  <option value={8}>Bold</option>
                </select>
              </label>
            </div>
            <label className="ink-finger">
              <input
                type="checkbox"
                checked={finger}
                onChange={(event) => setFinger(event.target.checked)}
              />
              Draw with finger (disables scrolling on paper)
            </label>
            <Button size="sm" onClick={() => setOptions(false)}>
              Done
            </Button>
          </div>
        )}
      </div>
      <InkCanvas
        ink={drawing.ink}
        onCommit={drawing.commit}
        tool={tool}
        color={color}
        width={width}
        finger={finger}
        expanded={expanded}
      />
      <div className="split small ink-save-row">
        <span data-testid="ink-save-state" role="status">
          {drawing.state}
        </span>
        <span data-testid="ink-stroke-count" className="muted">
          {drawing.ink.strokes.length} {drawing.ink.strokes.length === 1 ? 'stroke' : 'strokes'}
        </span>
        <Button size="sm" onClick={drawing.save}>
          Save handwriting
        </Button>
      </div>
      {drawing.error && (
        <Notice tone="error">
          {drawing.error} Your drawing remains here. Choose Save handwriting to retry.
        </Notice>
      )}
      {!expanded && (
        <p className="small muted">
          Strokes save when you lift the pen. Eraser removes whole strokes. Add a typed description
          with Edit note. Saved handwriting is included in workspace backups.
        </p>
      )}
    </section>
  );
  return expanded ? (
    <Modal open title={`Writing: ${note.title}`} size="lg" onClose={() => setExpanded(false)}>
      {contents}
    </Modal>
  ) : (
    contents
  );
}

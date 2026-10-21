import { z } from 'zod';
import { useCallback, useEffect, useRef, useState } from 'react';
import { actions } from '../../data/actions';
import { inkDocumentSchema, type InkDocument } from '../../domain/ink';
import { blankInk } from './inkGeometry';

const inkDraftSchema = z.object({ generation: z.string(), ink: inkDocumentSchema });
function recoveredInk(
  key: string,
  generation: string,
  saved: InkDocument | undefined,
): InkDocument {
  try {
    const pending = sessionStorage.getItem(key);
    if (pending) {
      const parsed = inkDraftSchema.safeParse(JSON.parse(pending));
      if (parsed.success && parsed.data.generation === generation) return parsed.data.ink;
    }
  } catch (error) {
    if (!(error instanceof Error)) throw error;
  }
  return saved ?? blankInk();
}
export function useInkDocument(noteId: string, saved: InkDocument | undefined, generation: string) {
  const key = `openworklog-ink-draft:${noteId}`;
  const [ink, setInk] = useState(() => recoveredInk(key, generation, saved));
  const [state, setState] = useState('Saved on this device');
  const [error, setError] = useState('');
  const current = useRef(ink);
  const initialSaved = useRef(saved);
  const history = useRef<InkDocument[]>([]);
  const future = useRef<InkDocument[]>([]);
  const chain = useRef(Promise.resolve());
  const pending = useRef(false);
  const revision = useRef(0);
  const persist = useCallback(
    (next: InkDocument) => {
      const version = ++revision.current;
      pending.current = true;
      setState('Saving handwriting…');
      setError('');
      try {
        sessionStorage.setItem(key, JSON.stringify({ generation, ink: next }));
      } catch (failure) {
        if (!(failure instanceof Error)) throw failure;
        setError(
          'Temporary recovery storage is unavailable. Keep this page open until saving finishes.',
        );
      }
      chain.current = chain.current.then(async () => {
        try {
          await actions.updateNoteInk(noteId, { ink: next, expectedRestoreGeneration: generation });
          if (version !== revision.current) return;
          pending.current = false;
          setState('Saved on this device');
          setError('');
          try {
            sessionStorage.removeItem(key);
          } catch (failure) {
            if (!(failure instanceof Error)) throw failure;
          }
        } catch (failure) {
          if (version !== revision.current) return;
          setState('Handwriting not saved');
          setError(failure instanceof Error ? failure.message : 'Could not save handwriting.');
        }
      });
    },
    [key, noteId, generation],
  );
  const observed = useRef(saved);
  useEffect(() => {
    if (saved === observed.current) return;
    observed.current = saved;
    if (pending.current) return;
    const next = saved ?? blankInk();
    if (JSON.stringify(next) === JSON.stringify(current.current)) return;
    history.current = [];
    future.current = [];
    current.current = next;
    setInk(next);
    setState('Saved on this device');
    setError('');
  }, [saved]);
  function replace(next: InkDocument) {
    current.current = next;
    setInk(next);
    persist(next);
  }
  function commit(next: InkDocument) {
    history.current = [...history.current.slice(-29), current.current];
    future.current = [];
    replace(next);
  }
  function undo() {
    const previous = history.current.pop();
    if (!previous) return;
    future.current.push(current.current);
    replace(previous);
  }
  function redo() {
    const next = future.current.pop();
    if (!next) return;
    history.current.push(current.current);
    replace(next);
  }
  useEffect(() => {
    function warn(event: BeforeUnloadEvent) {
      if (pending.current) event.preventDefault();
    }
    window.addEventListener('beforeunload', warn);
    // Retry a draft recovered after a reload before claiming it is saved.
    if (JSON.stringify(current.current) !== JSON.stringify(initialSaved.current ?? blankInk()))
      persist(current.current);
    return () => window.removeEventListener('beforeunload', warn);
  }, [persist]);
  return {
    ink,
    commit,
    undo,
    redo,
    canUndo: history.current.length > 0,
    canRedo: future.current.length > 0,
    state,
    error,
    save: () => persist(current.current),
  };
}

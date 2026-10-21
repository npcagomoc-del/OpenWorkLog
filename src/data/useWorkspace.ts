import { useLiveQuery } from 'dexie-react-hooks';
import { readWorkspace } from './workspace';
import { DEFAULT_SETTINGS } from '../domain/models';
export function useWorkspace() {
  const result = useLiveQuery(async () => {
    try {
      return { workspace: await readWorkspace(), error: null };
    } catch (error) {
      if (error instanceof Error) return { workspace: null, error: error.message };
      throw error;
    }
  }, []);
  const workspace = result?.workspace;
  return {
    ready: result !== undefined,
    error: result?.error ?? null,
    tasks: workspace?.tasks ?? [],
    projects: workspace?.projects ?? [],
    categories: workspace?.categories ?? [],
    notes: workspace?.notes ?? [],
    plans: workspace?.plans ?? [],
    dailyEntries: workspace?.dailyEntries ?? [],
    timers: workspace?.timers ?? [],
    settings: workspace?.settings ?? DEFAULT_SETTINGS,
  };
}

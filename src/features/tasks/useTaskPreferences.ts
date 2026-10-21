import { useEffect, useState } from 'react';
import { useToast } from '../../components/ui';
import { actions } from '../../data/actions';
import type { Settings } from '../../domain/models';
import { defaultTaskPreferences } from './taskGroups';
import type { TaskPreferences } from './taskViewTypes';
export function useTaskPreferences(settings: Settings) {
  const [preferences, setPreferences] = useState(settings.taskView ?? defaultTaskPreferences);
  const { toast } = useToast();
  useEffect(() => {
    setPreferences(settings.taskView ?? defaultTaskPreferences);
  }, [settings.taskView]);
  async function savePreferences(next: TaskPreferences) {
    setPreferences(next);
    try {
      await actions.updateSettings({ taskView: next });
    } catch (cause) {
      setPreferences(settings.taskView ?? defaultTaskPreferences);
      toast(cause instanceof Error ? cause.message : 'Unable to save view preferences', 'error');
    }
  }
  return { preferences, savePreferences };
}

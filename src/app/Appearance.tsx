import { useEffect } from 'react';
import type { Settings } from '../domain/models';
export function Appearance({ settings }: { readonly settings: Settings }) {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => {
      document.documentElement.dataset['theme'] =
        settings.theme === 'system' ? (media.matches ? 'dark' : 'light') : settings.theme;
      document.documentElement.dataset['textSize'] = settings.textSize;
    };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [settings.theme, settings.textSize]);
  return null;
}

import { useEffect } from 'react';
import type { Settings } from '../domain/models';
import { STATUSES } from '../domain/models';
import {
  DEFAULT_STATUS_COLORS,
  deriveStatusPalette,
  statusTone,
} from '../components/statusPalette';

export function Appearance({ settings }: { readonly settings: Settings }) {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => {
      const root = document.documentElement;
      const theme =
        settings.theme === 'system' ? (media.matches ? 'dark' : 'light') : settings.theme;
      root.dataset['theme'] = theme;
      root.dataset['textSize'] = settings.textSize;
      const surface = theme === 'light' ? '#ffffff' : theme === 'dark' ? '#1b1e24' : '#101010';
      for (const status of STATUSES) {
        const tone = statusTone(status);
        const custom = settings.statusColors[status];
        const seed = custom ?? DEFAULT_STATUS_COLORS[status];
        const palette = deriveStatusPalette({ color: seed, surface });
        root.style.setProperty(`--status-${tone}-color`, palette.chart);
        // Keep the established Open/Closed appearance when no custom color is selected.
        if (custom || status === 'In Progress' || status === 'On Hold' || status === 'Cancelled') {
          root.style.setProperty(`--${tone}`, palette.foreground);
          root.style.setProperty(`--${tone}-bg`, palette.background);
        } else {
          root.style.removeProperty(`--${tone}`);
          root.style.removeProperty(`--${tone}-bg`);
        }
      }
      const background = getComputedStyle(root).getPropertyValue('--bg').trim();
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', background);
    };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [settings.theme, settings.textSize, settings.statusColors]);
  return null;
}

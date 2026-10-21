import { useEffect } from 'react';
import type { Settings } from '../domain/models';
import { STATUSES } from '../domain/models';
import { resolveAccentPalette } from './accentPalette';
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
      root.dataset['preset'] = settings.appearancePreset;
      root.dataset['textSize'] = settings.textSize;
      const computed = getComputedStyle(root);
      const surface = computed.getPropertyValue('--surface').trim();
      const seed = settings.actionAccent ?? computed.getPropertyValue('--accent-seed').trim();
      const palette = resolveAccentPalette({
        seed,
        hoverSeed: computed.getPropertyValue('--accent-hover-seed').trim(),
        custom: Boolean(settings.actionAccent),
        surface,
        backgrounds: ['--bg', '--surface', '--surface-soft', '--surface-hover', '--sidebar']
          .map((role) => computed.getPropertyValue(role).trim()),
      });
      root.style.setProperty('--accent', palette.accent);
      root.style.setProperty('--accent-hover', palette.hover);
      root.style.setProperty('--accent-soft', palette.soft);
      root.style.setProperty('--on-accent', palette.onAccent);
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
  }, [settings.theme, settings.appearancePreset, settings.actionAccent, settings.textSize, settings.statusColors]);
  return null;
}

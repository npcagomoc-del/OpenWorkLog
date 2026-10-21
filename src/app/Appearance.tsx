import { useEffect } from 'react';
import type { Settings } from '../domain/models';
import { STATUSES } from '../domain/models';
import {
  DEFAULT_STATUS_COLORS,
  contrastRatio,
  deriveStatusPalette,
  statusTone,
} from '../components/statusPalette';

function blend(source: string, target: string, fraction: number) {
  return `#${[1, 3, 5]
    .map((offset) => {
      const first = Number.parseInt(source.slice(offset, offset + 2), 16);
      const last = Number.parseInt(target.slice(offset, offset + 2), 16);
      return Math.round(first + (last - first) * fraction).toString(16).padStart(2, '0');
    })
    .join('')}`;
}

function readableAccent(seed: string, surface: string) {
  const target = contrastRatio('#000000', surface) > contrastRatio('#ffffff', surface)
    ? '#000000'
    : '#ffffff';
  for (let step = 0; step <= 100; step += 1) {
    const candidate = blend(seed, target, step / 100);
    if (contrastRatio(candidate, surface) >= 4.5) return candidate;
  }
  return target;
}

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
      const accent = readableAccent(seed, surface);
      const direction = contrastRatio('#000000', surface) > contrastRatio('#ffffff', surface)
        ? '#000000'
        : '#ffffff';
      const hover = settings.actionAccent
        ? readableAccent(blend(accent, direction, 0.16), surface)
        : readableAccent(computed.getPropertyValue('--accent-hover-seed').trim(), surface);
      root.style.setProperty('--accent', accent);
      root.style.setProperty('--accent-hover', hover);
      root.style.setProperty('--accent-soft', `color-mix(in srgb, ${accent} 14%, ${surface})`);
      root.style.setProperty(
        '--on-accent',
        contrastRatio('#ffffff', accent) >= contrastRatio('#000000', accent)
          ? '#ffffff'
          : '#000000',
      );
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

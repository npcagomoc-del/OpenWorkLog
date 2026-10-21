import { Monitor, Moon, MoonStar, Sun } from 'lucide-react';

export const nextTheme = {
  system: 'light', light: 'dark', dark: 'black', black: 'system',
} as const;
export const themeIcons = {
  system: Monitor, light: Sun, dark: Moon, black: MoonStar,
} as const;
export const themeLabels = {
  system: 'system', light: 'light', dark: 'dark', black: 'super dark',
} as const;

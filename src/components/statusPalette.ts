import type { Status } from '../domain/models';

export const STATUS_TONES = {
  Open: 'open',
  'In Progress': 'progress',
  'On Hold': 'hold',
  Closed: 'closed',
  Cancelled: 'cancelled',
} as const;
export const DEFAULT_STATUS_COLORS = {
  Open: '#0969c7',
  'In Progress': '#b58a16',
  'On Hold': '#79628e',
  Closed: '#207145',
  Cancelled: '#7c696d',
} as const;
export function statusTone(status: Status) {
  return STATUS_TONES[status];
}
export function statusColor(status: Status) {
  return `var(--status-${statusTone(status)}-color)`;
}

type RGB = readonly [number, number, number];
function rgb(hex: string): RGB {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}
function luminance(hex: string) {
  const channels = rgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return (channels[0] ?? 0) * 0.2126 + (channels[1] ?? 0) * 0.7152 + (channels[2] ?? 0) * 0.0722;
}
export function contrastRatio(first: string, second: string) {
  const a = luminance(first),
    b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
function blend(source: string, target: string, fraction: number) {
  const destination = rgb(target);
  return `#${rgb(source)
    .map((channel, index) =>
      Math.round(channel + ((destination[index] ?? 0) - channel) * fraction)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}
function readable(color: string, background: string, minimum: number) {
  const target =
    contrastRatio('#000000', background) > contrastRatio('#ffffff', background)
      ? '#000000'
      : '#ffffff';
  for (let step = 0; step <= 100; step += 1) {
    const candidate = blend(color, target, step / 100);
    if (contrastRatio(candidate, background) >= minimum) return candidate;
  }
  return target;
}
export function deriveStatusPalette({
  color,
  surface,
}: {
  readonly color: string;
  readonly surface: string;
}) {
  const background = blend(surface, color, 0.16);
  return {
    background,
    foreground: readable(color, background, 4.5),
    chart: readable(color, surface, 3),
  };
}

import { contrastRatio } from '../components/statusPalette';

function blend(source: string, target: string, fraction: number) {
  return `#${[1, 3, 5]
    .map((offset) => {
      const first = Number.parseInt(source.slice(offset, offset + 2), 16);
      const last = Number.parseInt(target.slice(offset, offset + 2), 16);
      return Math.round(first + (last - first) * fraction).toString(16).padStart(2, '0');
    })
    .join('')}`;
}

function readableAccent(seed: string, backgrounds: readonly string[], surface: string) {
  const target = contrastRatio('#000000', surface) > contrastRatio('#ffffff', surface)
    ? '#000000'
    : '#ffffff';
  for (let step = 0; step <= 100; step += 1) {
    const candidate = blend(seed, target, step / 100);
    const soft = blend(surface, candidate, 0.14);
    if ([...backgrounds, soft].every((background) => contrastRatio(candidate, background) >= 4.5)) {
      return candidate;
    }
  }
  return target;
}

export function resolveAccentPalette({
  seed,
  hoverSeed,
  custom,
  surface,
  backgrounds,
}: {
  readonly seed: string;
  readonly hoverSeed: string;
  readonly custom: boolean;
  readonly surface: string;
  readonly backgrounds: readonly string[];
}) {
  const accent = readableAccent(seed, backgrounds, surface);
  const direction = contrastRatio('#000000', surface) > contrastRatio('#ffffff', surface)
    ? '#000000'
    : '#ffffff';
  const hover = readableAccent(
    custom ? blend(accent, direction, 0.16) : hoverSeed,
    backgrounds,
    surface,
  );
  return {
    accent,
    hover,
    soft: blend(surface, accent, 0.14),
    onAccent: contrastRatio('#ffffff', accent) >= contrastRatio('#000000', accent)
      ? '#ffffff'
      : '#000000',
  };
}

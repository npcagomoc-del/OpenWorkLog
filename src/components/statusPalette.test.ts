import { STATUSES } from '../domain/models';
import { describe, expect, it } from 'vitest';
import { contrastRatio, deriveStatusPalette, statusTone } from './statusPalette';

describe('custom status colors', () => {
  it.each(['#000000', '#ffffff', '#ffff00', '#00ff00', '#ff00ff', '#0969c7'])(
    'keeps %s readable in every theme',
    (color) => {
      for (const surface of ['#ffffff', '#1b1e24', '#101010']) {
        const palette = deriveStatusPalette({ color, surface });
        expect(contrastRatio(palette.foreground, palette.background)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(palette.chart, surface)).toBeGreaterThanOrEqual(3);
      }
    },
  );
  it('maps all five statuses independently', () => {
    expect(STATUSES.map((status) => statusTone(status))).toEqual([
      'open',
      'progress',
      'hold',
      'closed',
      'cancelled',
    ]);
  });
});

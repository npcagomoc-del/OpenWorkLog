import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../components/statusPalette';
import { resolveAccentPalette } from './accentPalette';

const themes = [
  { name: 'classic light', backgrounds: ['#f5f6f8', '#ffffff', '#f0f2f5', '#e9edf3', '#f8f9fb'], seed: '#0969c7', hover: '#0555a7' },
  { name: 'classic dark', backgrounds: ['#111317', '#1b1e24', '#242830', '#2d333d', '#171a20'], seed: '#77b5ff', hover: '#a0ccff' },
  { name: 'classic black', backgrounds: ['#000000', '#101010', '#181818', '#242424', '#080808'], seed: '#8bc1ff', hover: '#b8d9ff' },
  { name: 'apple light', backgrounds: ['#f5f5f7', '#ffffff', '#f0f0f2', '#e7e7eb', '#fbfbfd'], seed: '#0071e3', hover: '#0066cc' },
  { name: 'apple dark', backgrounds: ['#000000', '#272729', '#2a2a2c', '#353538', '#1c1c1e'], seed: '#2997ff', hover: '#6bb8ff' },
  { name: 'apple black', backgrounds: ['#000000', '#171719', '#242426', '#303034', '#080809'], seed: '#2997ff', hover: '#6bb8ff' },
  { name: 'warm light', backgrounds: ['#f5f4ed', '#faf9f5', '#e8e6dc', '#dedbd0', '#f0eee6'], seed: '#c96442', hover: '#b85133' },
  { name: 'warm dark', backgrounds: ['#141413', '#30302e', '#3d3d3a', '#484844', '#20201e'], seed: '#d97757', hover: '#ed9b7d' },
  { name: 'warm black', backgrounds: ['#000000', '#242422', '#30302e', '#3d3d3a', '#0b0b0a'], seed: '#d97757', hover: '#ed9b7d' },
] as const;

describe('action accent contrast', () => {
  for (const theme of themes) {
    for (const custom of [false, true]) {
      it(`${theme.name}${custom ? ' custom yellow' : ''} stays readable across neutral roles`, () => {
        const seed = custom ? '#ffdc00' : theme.seed;
        const palette = resolveAccentPalette({
          seed,
          hoverSeed: theme.hover,
          custom,
          surface: theme.backgrounds[1],
          backgrounds: theme.backgrounds,
        });
        for (const background of [...theme.backgrounds, palette.soft]) {
          expect(contrastRatio(palette.accent, background)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(palette.hover, background)).toBeGreaterThanOrEqual(4.5);
        }
        expect(contrastRatio(palette.onAccent, palette.accent)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(palette.onAccent, palette.hover)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

import { expect, it } from 'vitest';
import { formatDuration } from './time';
it('shows positive sub-minute work in seconds rather than zero minutes', () => {
  expect(formatDuration(0.3)).toBe('18s');
  expect(formatDuration(0.01)).toBe('<1s');
  expect(formatDuration(10)).toBe('10m');
});

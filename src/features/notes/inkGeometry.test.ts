import { describe, expect, it } from 'vitest';
import { eraseAt, pointFromClient } from './inkGeometry';

describe('handwriting geometry', () => {
  it('maps scaled coordinates and clamps points at paper bounds', () => {
    const bounds = { left: 20, top: 10, width: 600, height: 450 };
    expect(pointFromClient(320, 235, 0.8, bounds, 1200, 900)).toEqual({
      x: 600,
      y: 450,
      pressure: 0.8,
    });
    expect(pointFromClient(-20, 900, 0, bounds, 1200, 900)).toEqual({
      x: 0,
      y: 900,
      pressure: 0.5,
    });
  });
  it('erases a stroke intersected between sparse points', () => {
    const stroke = {
      id: 's',
      color: '#202733',
      width: 4,
      points: [
        { x: 0, y: 10, pressure: 0.5 },
        { x: 100, y: 10, pressure: 0.5 },
      ],
    };
    expect(eraseAt([stroke], { x: 50, y: 11, pressure: 0.5 }, 8)).toEqual([]);
    expect(eraseAt([stroke], { x: 50, y: 50, pressure: 0.5 }, 8)).toEqual([stroke]);
  });
});

import { describe, expect, it } from 'vitest';
import {
  diagonalSweep,
  easeInOutQuad,
} from '../../../../../../packages/core/src/canvas/draw/sweep';
import { SWEEP } from '../../../../../../packages/core/src/fx/skeleton/constants';

describe('easeInOutQuad', () => {
  it('starts, crosses and ends where it should', () => {
    expect(easeInOutQuad(0)).toBe(0);
    expect(easeInOutQuad(0.5)).toBe(0.5);
    expect(easeInOutQuad(1)).toBe(1);
    expect(easeInOutQuad(0.25)).toBeLessThan(0.25);
    expect(easeInOutQuad(0.75)).toBeGreaterThan(0.75);
  });
});

describe('diagonalSweep', () => {
  it('stays in [0, 1] and is periodic in time', () => {
    for (let i = 0; i < 400; i++) {
      const x = (i * 37) % 343;
      const y = (i * 53) % 900;
      const t = i * 17;
      const k = diagonalSweep(x, y, t, 343, 812, SWEEP);
      expect(k).toBeGreaterThanOrEqual(0);
      expect(k).toBeLessThanOrEqual(1);
      expect(
        diagonalSweep(x, y, t + SWEEP.period, 343, 812, SWEEP),
      ).toBeCloseTo(k, 9);
    }
  });

  it('peaks somewhere inside the region during a cycle', () => {
    const peak = Math.max(
      ...Array.from({ length: 60 }, (_, i) =>
        diagonalSweep(150, 40, (i / 60) * SWEEP.period, 343, 812, SWEEP),
      ),
    );
    expect(peak).toBeGreaterThan(0.9);
  });

  it('is zero outside the band', () => {
    expect(
      diagonalSweep(300, 0, 0, 343, 812, { period: 1000, slope: 0, half: 10 }),
    ).toBe(0);
  });
});

import { describe, expect, it } from 'vitest';
import {
  BAYER4,
  bayerAt,
  hash3,
} from '../../../../../../packages/core/src/canvas/draw/noise';

describe('hash3', () => {
  it('is deterministic and in [0, 1)', () => {
    for (let i = 0; i < 1000; i++) {
      const h = hash3(i, i * 3, i * 7);
      expect(h).toBe(hash3(i, i * 3, i * 7));
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(1);
    }
  });

  it('spreads neighbouring keys apart', () => {
    const values = new Set(
      Array.from({ length: 64 }, (_, i) => Math.floor(hash3(i) * 16)),
    );
    expect(values.size).toBeGreaterThan(10);
  });
});

describe('BAYER4', () => {
  it('holds sixteen distinct thresholds centred in [0, 1)', () => {
    expect(new Set(BAYER4).size).toBe(16);
    expect(Math.min(...BAYER4)).toBeCloseTo(1 / 32, 9);
    expect(Math.max(...BAYER4)).toBeCloseTo(31 / 32, 9);
  });

  it('tiles every 4 cells, negative ones included', () => {
    expect(bayerAt(0, 0)).toBe(BAYER4[0]);
    expect(bayerAt(5, 6)).toBe(bayerAt(1, 2));
    expect(bayerAt(-1, 0)).toBe(bayerAt(3, 0));
  });
});

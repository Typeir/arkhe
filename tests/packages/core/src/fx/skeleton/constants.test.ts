import { describe, expect, it } from 'vitest';
import {
  CELL_H,
  CELL_W,
  DECODE_BASE_MS,
  DECODE_PER_PX,
  GLYPHS,
  STAGGER_MAX_MS,
  SWEEP,
} from '../../../../../../packages/core/src/fx/skeleton/constants';

describe('skeleton constants', () => {
  it('keeps the ruled grid and sweep', () => {
    expect([CELL_W, CELL_H]).toEqual([10, 12]);
    expect(SWEEP.period).toBe(2400);
    expect(SWEEP.half).toBe(70);
    expect(SWEEP.slope).toBeCloseTo(Math.tan(Math.PI / 12), 12);
  });

  it('decodes a 300 px line in about half a second, staggered at most 1 s', () => {
    expect(DECODE_BASE_MS + DECODE_PER_PX * 300).toBe(550);
    expect(STAGGER_MAX_MS).toBe(1000);
  });

  it('uses Greek glyphs only, each a single code unit', () => {
    expect([...GLYPHS]).toHaveLength(GLYPHS.length);
    for (const g of GLYPHS) expect(g).toMatch(/\p{Script=Greek}/u);
  });
});

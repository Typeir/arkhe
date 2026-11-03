import { describe, expect, it } from 'vitest';
import {
  computeSlots,
  type Slotted,
} from '../../../../../../packages/core/src/fx/skeleton/slots';

const box = (x: number, y: number, w: number, h: number): Slotted => ({
  x,
  y,
  w,
  h,
  sx0: 0,
  sx1: 0,
  sy0: 0,
  sy1: 0,
});

const overlap = (a: Slotted, b: Slotted) =>
  a.sx0 < b.sx1 && b.sx0 < a.sx1 && a.sy0 < b.sy1 && b.sy0 < a.sy1;

describe('computeSlots', () => {
  it('tiles a table: rows meet halfway, cells meet halfway, edges reach the host', () => {
    const cs = [0, 1, 2].flatMap((r) =>
      [0, 1].map((c) => box(10 + c * 100, 6 + r * 24, 60, 12)),
    );
    computeSlots(cs, 200, 72);
    expect(cs[0]).toMatchObject({ sx0: 0, sy0: 0 });
    expect(cs[0]?.sx1).toBe(cs[1]?.sx0);
    expect(cs[0]?.sy1).toBe(cs[2]?.sy0);
    expect(cs[5]).toMatchObject({ sx1: 200, sy1: 72 });
    const area = cs.reduce((s, c) => s + (c.sx1 - c.sx0) * (c.sy1 - c.sy0), 0);
    expect(area).toBeCloseTo(200 * 72, 6);
  });

  it('groups side-by-side items of different heights into one row', () => {
    const cs = [
      box(0, 0, 100, 120),
      box(110, 10, 100, 12),
      box(110, 30, 100, 12),
    ];
    computeSlots(cs, 210, 130);
    for (const a of cs)
      for (const b of cs) if (a !== b) expect(overlap(a, b)).toBe(false);
    for (const c of cs) {
      expect(c.sx1).toBeGreaterThan(c.sx0);
      expect(c.sy1).toBeGreaterThan(c.sy0);
      expect(c.sx0).toBeLessThanOrEqual(c.x);
      expect(c.sx1).toBeGreaterThanOrEqual(c.x + c.w);
    }
  });

  it('gives one box the whole host and leaves overlapping boxes their own', () => {
    const one = [box(10, 10, 5, 5)];
    computeSlots(one, 50, 40);
    expect(one[0]).toMatchObject({ sx0: 0, sx1: 50, sy0: 0, sy1: 40 });
    const stacked = [box(0, 0, 20, 20), box(5, 5, 20, 20)];
    computeSlots(stacked, 50, 50);
    expect(stacked[1]).toMatchObject({ sx0: 5, sx1: 25, sy0: 5, sy1: 25 });
    computeSlots([], 10, 10);
  });
});

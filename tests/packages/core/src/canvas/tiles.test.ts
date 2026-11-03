import { describe, expect, it } from 'vitest';
import {
  CAP_PX,
  MAX_SIDE,
  planTiles,
  tilePxHeight,
  type TileLimits,
} from '../../../../../packages/core/src/canvas/tiles';

const STEP = 12;

const plan = (
  w: number,
  h: number,
  dpr: number,
  view: number,
  limits: TileLimits = {},
) => planTiles(w, h, dpr, view, { step: STEP, ...limits });

const area = (p: ReturnType<typeof planTiles>) =>
  Math.max(...p.tiles.map((b) => p.pxWidth * tilePxHeight(b, p.dpr)));

describe('planTiles', () => {
  it('gives a short element exactly one tile', () => {
    const p = plan(343, 120, 3, 812);
    expect(p.tiles).toEqual([{ y: 0, h: 120 }]);
    expect(p.dpr).toBeCloseTo(3, 5);
  });

  it('cuts tall elements into tiles no taller than the viewport, in whole steps', () => {
    const p = plan(343, 7200, 3, 812);
    expect(p.tiles.length).toBeGreaterThan(8);
    for (const b of p.tiles.slice(0, -1)) {
      expect(b.h).toBeLessThanOrEqual(812);
      expect(b.h % STEP).toBe(0);
    }
    expect(p.tiles.reduce((s, b) => s + b.h, 0)).toBe(7200);
  });

  it.each([1, 1.25, 2, 2.625, 3])(
    'keeps every tile under both caps at DPR %s',
    (dpr) => {
      for (const [w, h] of [
        [343, 30000],
        [1200, 9000],
        [3000, 4000],
        [9000, 600],
      ] as const) {
        const p = plan(w, h, dpr, 1080);
        expect(area(p)).toBeLessThanOrEqual(CAP_PX);
        expect(p.pxWidth).toBeLessThanOrEqual(MAX_SIDE);
        for (const b of p.tiles)
          expect(tilePxHeight(b, p.dpr)).toBeLessThanOrEqual(MAX_SIDE);
      }
    },
  );

  it('lowers the DPR for elements wider than the side cap allows', () => {
    const p = plan(3000, 400, 3, 812);
    expect(p.dpr).toBeLessThan(3);
    expect(p.pxWidth).toBeLessThanOrEqual(MAX_SIDE);
    expect(p.pxWidth).toBeGreaterThan(MAX_SIDE * 0.95);
  });

  it('keeps the device DPR when no cap binds, so elements share one atlas', () => {
    for (const w of [343, 390.5, 412.7, 680])
      expect(plan(w, 300, 2.625, 844).dpr).toBe(2.625);
  });

  it('maps the CSS width onto whole device pixels, never wider than the element', () => {
    const p = plan(390.5, 100, 2.625, 844);
    expect(Number.isInteger(p.pxWidth)).toBe(true);
    expect(p.cssWidth * p.dpr).toBeCloseTo(p.pxWidth, 9);
    expect(p.cssWidth).toBeLessThanOrEqual(390.5);
    expect(390.5 - p.cssWidth).toBeLessThan(1 / 2.625);
  });

  it('respects a smaller per-canvas cap, such as a share of the budget', () => {
    const cap = Math.floor((4 * 375 * 812 * 9) / 3);
    const p = plan(2000, 5000, 3, 812, { capPx: cap });
    for (const b of p.tiles)
      expect(p.pxWidth * tilePxHeight(b, p.dpr)).toBeLessThanOrEqual(cap);
  });

  it('never breaks the area cap across random elements', () => {
    let seed = 1;
    const rnd = () =>
      (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    for (let i = 0; i < 2000; i++) {
      const given = Math.round(1e6 + rnd() * (CAP_PX - 1e6));
      const p = plan(
        1 + rnd() * 6000,
        1 + rnd() * 40000,
        1 + rnd() * 3,
        500 + rnd() * 1000,
        { capPx: given },
      );
      for (const b of p.tiles) {
        expect(p.pxWidth * tilePxHeight(b, p.dpr)).toBeLessThanOrEqual(given);
        expect(tilePxHeight(b, p.dpr)).toBeLessThanOrEqual(MAX_SIDE);
      }
      expect(p.pxWidth).toBeLessThanOrEqual(MAX_SIDE);
    }
  });

  it('defaults to a one-pixel step', () => {
    const p = planTiles(100, 1001, 1, 250);
    expect(p.tiles.map((t) => t.h)).toEqual([250, 250, 250, 250, 1]);
  });
});

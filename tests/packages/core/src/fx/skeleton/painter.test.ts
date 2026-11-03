// @vitest-environment jsdom
import { FakePath, fakeContext, placeAt } from '@tests/fixtures/canvas';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { View } from '../../../../../../packages/core/src/canvas/view';
import type { SkeletonAtlas } from '../../../../../../packages/core/src/fx/skeleton/atlas';
import {
  SkeletonSlice,
  type SkeletonStyle,
} from '../../../../../../packages/core/src/fx/skeleton/painter';
import { SkeletonRegion } from '../../../../../../packages/core/src/fx/skeleton/region';

const ATLAS = {
  canvas: {},
  cw: 10,
  ch: 12,
  shape: () => [0, 0],
  glyph: () => [0, 12],
} as unknown as SkeletonAtlas;

const style = (painter: 'path' | 'atlas'): SkeletonStyle => ({
  painter,
  palette: {
    key: 'k',
    tones: Array.from({ length: 12 }, (_, i) => `t${i}`),
    front: 'front',
    bg: 'cover',
    font: 'serif',
  },
  atlas: () => ATLAS,
});

const region = (painter: 'path' | 'atlas' = 'path', reduced = false) => {
  document.body.innerHTML =
    '<div id="h" data-scope="skeleton" data-part="group"><span id="a" data-scope="skeleton" data-part="root"></span></div>';
  placeAt(document.getElementById('h') as HTMLElement, 0, 0, 100, 24);
  placeAt(document.getElementById('a') as HTMLElement, 0, 0, 40, 12);
  const r = new SkeletonRegion(
    document.getElementById('h') as HTMLElement,
    reduced,
    style(painter),
  );
  r.measure();
  return r;
};

const viewOf = () => {
  const ctx = fakeContext();
  const view = {
    ctx,
    dpr: 1,
    ox: 0,
    oy: 0,
    y0: 0,
    y1: 24,
    viewH: 800,
  } as unknown as View;
  return { ctx, view };
};

const named = (ctx: ReturnType<typeof fakeContext>, name: string) =>
  ctx.calls.filter((c) => c[0] === name);

beforeEach(() => vi.stubGlobal('Path2D', FakePath));
afterEach(() => vi.unstubAllGlobals());

describe('SkeletonSlice', () => {
  it('fills ramp shapes as one even-odd path per level', () => {
    const r = region();
    const { ctx, view } = viewOf();
    new SkeletonSlice(r, [0]).paint(view, 0, false);
    const fills = named(ctx, 'fill');
    expect(fills.length).toBeGreaterThan(0);
    expect(fills.every((f) => f[2] === 'evenodd')).toBe(true);
    expect(named(ctx, 'drawImage')).toHaveLength(0);
  });

  it('stamps shapes from the atlas with the atlas painter', () => {
    const r = region('atlas');
    const { ctx, view } = viewOf();
    new SkeletonSlice(r, [0]).paint(view, 0, false);
    expect(named(ctx, 'drawImage')).toHaveLength(4);
  });

  it('skips unchanged resting cells when pixels were kept', () => {
    const r = region('atlas', true);
    const slice = new SkeletonSlice(r, [0]);
    const first = viewOf();
    slice.paint(first.view, 0, true);
    expect(named(first.ctx, 'clearRect')).toHaveLength(4);
    const second = viewOf();
    slice.paint(second.view, 16, true);
    expect(named(second.ctx, 'drawImage')).toHaveLength(0);
  });

  it('covers swapped content and clears behind the front', () => {
    const r = region();
    r.ready(0, 0, 24);
    r.swapped = true;
    const slice = new SkeletonSlice(r, [0]);
    slice.start(0, 0, 24);
    const { ctx, view } = viewOf();
    slice.paint(view, r.boxes[0]?.dur ?? 0, false);
    expect(named(ctx, 'fillRect')[0]).toEqual(['fillRect', 0, 0, 100, 24]);
    expect(named(ctx, 'clearRect')[0]).toEqual(['clearRect', 0, 0, 100, 24]);
    expect(slice.retains).toBe(false);
  });

  it('is pending and animating until its fronts finish; settles at the last end', () => {
    const r = region();
    const slice = new SkeletonSlice(r, [0]);
    expect(slice.pending(0)).toBe(true);
    expect(slice.animating(0, 0, 24)).toBe(true);
    expect(slice.animating(0, 100, 200)).toBe(false);
    expect(slice.settlesAt()).toBe(Infinity);
    r.ready(0, 0, 24);
    slice.start(0, 0, 24);
    const end = r.boxes[0]?.dur ?? 0;
    expect(slice.settlesAt()).toBe(end);
    expect(slice.pending(end)).toBe(false);
  });

  it('never animates under reduced motion', () => {
    expect(
      new SkeletonSlice(region('path', true), [0]).animating(0, 0, 24),
    ).toBe(false);
  });

  it('draws glyphs inside a running front', () => {
    const r = region('path');
    r.ready(0, 0, 24);
    const slice = new SkeletonSlice(r, [0]);
    slice.start(0, 0, 24);
    const { ctx, view } = viewOf();
    slice.paint(view, (r.boxes[0]?.dur ?? 0) / 4, false);
    expect(named(ctx, 'drawImage').length).toBeGreaterThan(0);
  });
});

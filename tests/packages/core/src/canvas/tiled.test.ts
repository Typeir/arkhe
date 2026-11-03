// @vitest-environment jsdom
import {
  FakeIntersectionObserver,
  reportAll,
  stubBrowser,
  stubCanvas,
} from '@tests/fixtures/canvas';
import { mockRegion, mockSlice, testContext } from '@tests/fixtures/surfaces';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SENTINEL_ATTR } from '../../../../../packages/core/src/canvas/tile';
import { TiledSurface } from '../../../../../packages/core/src/canvas/tiled';

const sentinels = (host: HTMLElement) => [
  ...host.querySelectorAll<HTMLElement>(`[${SENTINEL_ATTR}]`),
];
const canvases = (host: HTMLElement) => host.querySelectorAll('canvas').length;

let host: HTMLElement;

beforeEach(() => {
  stubBrowser();
  stubCanvas();
  host = document.createElement('div');
  document.body.append(host);
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

describe('TiledSurface', () => {
  it('cuts a tall region into tiles of whole steps, one sentinel each', () => {
    const { ctx } = testContext();
    new TiledSurface(ctx, mockRegion(host, 2000, mockSlice()));
    const tops = sentinels(host).map((s) => s.style.top);
    expect(tops).toEqual(['0px', '792px', '1584px']);
    expect(canvases(host)).toBe(0);
  });

  it('gives a visible tile a canvas and paints it in full before returning', () => {
    const { ctx, painted } = testContext();
    const slice = mockSlice();
    const region = mockRegion(host, 100, slice);
    const surface = new TiledSurface(ctx, region);
    const s = sentinels(host)[0] as HTMLElement;
    const [wake, visible] = FakeIntersectionObserver.all;
    visible?.report(s, true);
    wake?.report(s, true);
    expect(canvases(host)).toBe(1);
    expect(surface.liveCanvases()).toBe(1);
    expect(slice.paint).toHaveBeenCalledTimes(1);
    const [view, , keep] = slice.paint.mock.calls[0] ?? [];
    expect(view).toMatchObject({ dpr: 2, y0: 0, y1: 100, oy: -0 });
    expect(keep).toBe(false);
    expect(painted).toHaveBeenCalledWith(region);
  });

  it('keeps pixels on later frames while the slice retains them', () => {
    const { ctx, step } = testContext();
    const slice = mockSlice();
    new TiledSurface(ctx, mockRegion(host, 100, slice));
    reportAll(sentinels(host)[0] as HTMLElement, true);
    step(16);
    step(32);
    expect(slice.paint.mock.calls.map((c) => c[2])).toEqual([false, true]);
    slice.retains = false;
    step(48);
    expect(slice.paint.mock.calls[2]?.[2]).toBe(false);
  });

  it('finishes a tile once its slice is done, then reports the region done', async () => {
    const { ctx, step, done } = testContext();
    const slice = mockSlice();
    const region = mockRegion(host, 100, slice);
    new TiledSurface(ctx, region);
    reportAll(sentinels(host)[0] as HTMLElement, true);
    slice.busy = false;
    step(16);
    await Promise.resolve();
    expect(done).toHaveBeenCalledWith(region);
    expect(canvases(host)).toBe(0);
    expect(sentinels(host)).toHaveLength(0);
  });

  it('is near until every tile is reported outside the wake margin', () => {
    const { ctx } = testContext();
    const surface = new TiledSurface(ctx, mockRegion(host, 100, mockSlice()));
    expect(surface.near()).toBe(true);
    reportAll(sentinels(host)[0] as HTMLElement, false);
    expect(surface.near()).toBe(false);
  });

  it('just repaints on a rebuild with the same geometry', () => {
    const { ctx } = testContext();
    const slice = mockSlice();
    const surface = new TiledSurface(ctx, mockRegion(host, 100, slice));
    const before = sentinels(host)[0];
    reportAll(before as HTMLElement, true);
    surface.rebuild();
    expect(sentinels(host)[0]).toBe(before);
    expect(canvases(host)).toBe(1);
  });

  it('releases a sleeping tile when sleep is release', () => {
    const { ctx } = testContext({ sleep: 'release' });
    new TiledSurface(ctx, mockRegion(host, 100, mockSlice()));
    const [s] = sentinels(host);
    reportAll(s as HTMLElement, true);
    expect(canvases(host)).toBe(1);
    reportAll(s as HTMLElement, false);
    expect(canvases(host)).toBe(0);
  });

  it('removes every canvas and sentinel on teardown', () => {
    const { ctx } = testContext();
    const surface = new TiledSurface(ctx, mockRegion(host, 2000, mockSlice()));
    for (const s of sentinels(host)) reportAll(s, true);
    surface.teardown();
    expect(host.children).toHaveLength(0);
    expect(ctx.budget.count).toBe(0);
  });
});

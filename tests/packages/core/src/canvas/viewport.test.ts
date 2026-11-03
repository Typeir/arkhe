// @vitest-environment jsdom
import { reportAll, stubBrowser, stubCanvas } from '@tests/fixtures/canvas';
import { mockRegion, mockSlice, testContext } from '@tests/fixtures/surfaces';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  VIEWPORT_ATTR,
  ViewportSurface,
} from '../../../../../packages/core/src/canvas/viewport';

const canvas = () =>
  document.querySelector<HTMLCanvasElement>(`[${VIEWPORT_ATTR}]`);

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

describe('ViewportSurface', () => {
  it('stays 0×0 until a region comes, then matches the viewport', () => {
    const { ctx } = testContext();
    const surface = new ViewportSurface(ctx);
    expect(canvas()?.width).toBe(0);
    expect(canvas()?.getAttribute('aria-hidden')).toBe('true');
    surface.add(mockRegion(host, 100, mockSlice()));
    expect([canvas()?.width, canvas()?.height]).toEqual([800, 1600]);
    expect(surface.pixels()).toBe(800 * 1600);
  });

  it('paints visible regions from their position and reports them', () => {
    const { ctx, step, painted } = testContext();
    const surface = new ViewportSurface(ctx);
    const slice = mockSlice();
    const region = mockRegion(host, 100, slice);
    surface.add(region);
    expect(surface.near(region)).toBe(true);
    reportAll(host, true);
    step(16);
    const view = slice.paint.mock.calls[0]?.[0];
    expect(view).toMatchObject({ ox: 5, oy: 0, y0: -0, y1: 800, dpr: 2 });
    expect(slice.paint.mock.calls[0]?.[2]).toBe(false);
    expect(painted).toHaveBeenCalledWith(region);
  });

  it('reports a finished region done and shrinks once none is left', () => {
    const { ctx, step, done } = testContext();
    const surface = new ViewportSurface(ctx);
    const slice = mockSlice();
    const region = mockRegion(host, 100, slice);
    surface.add(region);
    reportAll(host, true);
    slice.busy = false;
    step(16);
    expect(done).toHaveBeenCalledWith(region);
    surface.remove(region);
    expect(canvas()?.width).toBe(0);
  });

  it('settles started regions on a timer once nothing animates, in view or not', async () => {
    vi.useFakeTimers();
    const { ctx, step, done } = testContext();
    const surface = new ViewportSurface(ctx);
    const slice = mockSlice();
    slice.animating = () => false;
    slice.settlesAt = () => performance.now() + 100;
    const region = mockRegion(host, 100, slice);
    surface.add(region);
    reportAll(host, true);
    step(16);
    slice.busy = false;
    await vi.advanceTimersByTimeAsync(200);
    expect(done).toHaveBeenCalledWith(region);
    surface.destroy();
    vi.useRealTimers();
  });

  it('is not near once reported outside its margin', () => {
    const { ctx } = testContext();
    const surface = new ViewportSurface(ctx);
    const region = mockRegion(host, 100, mockSlice());
    surface.add(region);
    reportAll(host, false);
    expect(surface.near(region)).toBe(false);
  });

  it('lifts the frame cap while scrolling', () => {
    const { ctx } = testContext();
    new ViewportSurface(ctx);
    window.dispatchEvent(new Event('scroll'));
    expect(ctx.loop.uncapUntil).toBeGreaterThan(performance.now());
  });

  it('removes its canvas on destroy', () => {
    const { ctx } = testContext();
    const surface = new ViewportSurface(ctx);
    surface.add(mockRegion(host, 100, mockSlice()));
    surface.destroy();
    expect(canvas()).toBeNull();
  });
});

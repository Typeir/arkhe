// @vitest-environment jsdom
import { stubBrowser, stubCanvas } from '@tests/fixtures/canvas';
import { mockRegion, mockSlice, testContext } from '@tests/fixtures/surfaces';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CanvasTile,
  SENTINEL_ATTR,
  SLICE_MARGIN,
} from '../../../../../packages/core/src/canvas/tile';
import { TiledSurface } from '../../../../../packages/core/src/canvas/tiled';

let host: HTMLElement;

const tileOf = (over = {}, height = 2000) => {
  const env = testContext(over);
  const slice = mockSlice();
  const surface = new TiledSurface(env.ctx, mockRegion(host, height, slice));
  surface.teardown();
  const tile = new CanvasTile(surface, { y: 792, h: 792 }, slice);
  return { ...env, slice, surface, tile };
};

beforeEach(() => {
  stubBrowser();
  stubCanvas();
  host = document.createElement('div');
  document.body.append(host);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

describe('CanvasTile', () => {
  it('places an invisible sentinel over its rows', () => {
    const { tile } = tileOf();
    expect(tile.sentinel.hasAttribute(SENTINEL_ATTR)).toBe(true);
    expect(tile.sentinel.getAttribute('aria-hidden')).toBe('true');
    expect(tile.sentinel.style.top).toBe('792px');
    expect(tile.sentinel.style.height).toBe('792px');
  });

  it('gets no canvas while asleep, one once awake, painted on the next frame off screen', () => {
    const { tile, slice, step } = tileOf();
    tile.ensure();
    expect(tile.hasCanvas).toBe(false);
    tile.wake(0);
    expect(tile.hasCanvas).toBe(true);
    expect(tile.idle).toBe(true);
    expect(slice.paint).not.toHaveBeenCalled();
    step(16);
    expect(slice.paint).toHaveBeenCalledTimes(1);
  });

  it('repaints only its visible slice once painted in full', () => {
    const { tile, slice, step } = tileOf();
    tile.visible = true;
    tile.wake(0);
    step(16);
    const view = slice.paint.mock.calls[1]?.[0];
    expect(view?.y0).toBe(792);
    expect(view?.y1).toBe(Math.min(1584, 800 + SLICE_MARGIN));
  });

  it('gives its canvas back when evicted, and on context loss off screen', () => {
    const { tile, ctx } = tileOf();
    tile.wake(0);
    tile.evict();
    expect(tile.hasCanvas).toBe(false);
    expect(ctx.budget.count).toBe(0);
    tile.wake(0);
    host.querySelector('canvas')?.dispatchEvent(new Event('contextlost'));
    expect(tile.hasCanvas).toBe(false);
  });

  it('finishes off screen on a timer once its last reveal ends', async () => {
    vi.useFakeTimers();
    const { tile, slice, surface } = tileOf();
    const done = vi.spyOn(surface, 'tileDone');
    tile.wake(0);
    slice.settlesAt = () => performance.now() + 100;
    tile.setVisible(false);
    slice.busy = false;
    await vi.advanceTimersByTimeAsync(200);
    expect(done).toHaveBeenCalled();
    expect(tile.done).toBe(true);
  });

  it('removes its sentinel on destroy', () => {
    const { tile } = tileOf();
    tile.destroy();
    expect(tile.sentinel.isConnected).toBe(false);
  });
});

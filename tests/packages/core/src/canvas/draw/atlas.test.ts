// @vitest-environment jsdom
import { stubCanvas } from '@tests/fixtures/canvas';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  StampCache,
  createStampGrid,
} from '../../../../../../packages/core/src/canvas/draw/atlas';

afterEach(() => vi.unstubAllGlobals());

describe('createStampGrid', () => {
  it('sizes the canvas to the grid and wraps items to the next row', () => {
    stubCanvas();
    const grid = createStampGrid(4, 3, 10, 12);
    expect(grid?.canvas.width).toBe(40);
    expect(grid?.canvas.height).toBe(36);
    expect(grid?.at(0, 0)).toEqual([0, 0]);
    expect(grid?.at(5, 1)).toEqual([10, 24]);
  });

  it('gives null without a 2D context', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    expect(createStampGrid(1, 1, 1, 1)).toBeNull();
  });
});

describe('StampCache', () => {
  it('builds once per key until cleared', () => {
    const cache = new StampCache<number>();
    const build = vi.fn(() => 7);
    expect(cache.get('a', build)).toBe(7);
    expect(cache.get('a', build)).toBe(7);
    expect(build).toHaveBeenCalledTimes(1);
    cache.clear();
    cache.get('a', build);
    expect(build).toHaveBeenCalledTimes(2);
  });

  it('caches a null result too', () => {
    const cache = new StampCache<null>();
    const build = vi.fn(() => null);
    cache.get('a', build);
    cache.get('a', build);
    expect(build).toHaveBeenCalledTimes(1);
  });
});

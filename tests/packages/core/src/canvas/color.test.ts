// @vitest-environment jsdom
import { stubCanvas } from '@tests/fixtures/canvas';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  formatColor,
  mixRgb,
  readTokens,
  resolveColor,
} from '../../../../../packages/core/src/canvas/color';

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('style');
});

describe('formatColor', () => {
  it('writes 8-digit hex with the alpha last, clamped', () => {
    expect(formatColor([255, 0, 16], 1)).toBe('#ff0010ff');
    expect(formatColor([1, 2, 3], 0)).toBe('#01020300');
    expect(formatColor([1, 2, 3], 2)).toBe('#010203ff');
    expect(formatColor([0, 0, 0], 0.35)).toBe('#00000059');
  });
});

describe('mixRgb', () => {
  it('blends channel by channel', () => {
    expect(mixRgb([0, 100, 200], [100, 100, 0], 0.5)).toEqual([50, 100, 100]);
    expect(mixRgb([0, 0, 0], [255, 255, 255], 0)).toEqual([0, 0, 0]);
  });
});

describe('resolveColor', () => {
  it('reads the colour back from a 1×1 fill', () => {
    const made = stubCanvas();
    const pending = vi.spyOn(HTMLCanvasElement.prototype, 'getContext');
    pending.mockImplementationOnce((() => {
      const ctx = {
        fillStyle: '',
        fillRect: () => undefined,
        getImageData: () => ({ data: new Uint8ClampedArray([9, 8, 7, 255]) }),
      };
      return ctx;
    }) as unknown as HTMLCanvasElement['getContext']);
    expect(resolveColor('var(--x)')).toEqual([9, 8, 7]);
    expect(made).toHaveLength(0);
  });

  it('falls back to black without a context', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    expect(resolveColor('red')).toEqual([0, 0, 0]);
  });
});

describe('readTokens', () => {
  it('reads trimmed custom properties, empty when unset', () => {
    document.documentElement.style.setProperty('--a', '  blue ');
    expect(readTokens(document.documentElement, ['--a', '--b'])).toEqual({
      '--a': 'blue',
      '--b': '',
    });
  });
});

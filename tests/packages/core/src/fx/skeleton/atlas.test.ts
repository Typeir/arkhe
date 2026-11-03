// @vitest-environment jsdom
import { stubCanvas } from '@tests/fixtures/canvas';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildAtlas } from '../../../../../../packages/core/src/fx/skeleton/atlas';
import {
  GLYPHS,
  LEVELS,
} from '../../../../../../packages/core/src/fx/skeleton/constants';
import type { Palette } from '../../../../../../packages/core/src/fx/skeleton/palette';

const PALETTE: Palette = {
  key: 'p',
  tones: Array.from({ length: LEVELS }, (_, i) => `tone${i}`),
  front: 'front',
  bg: 'bg',
  font: 'serif',
};

afterEach(() => vi.unstubAllGlobals());

describe('buildAtlas', () => {
  it('puts the ramp in row 0 and the glyphs in the front tone below', () => {
    const [ctx] = [stubCanvas()];
    const atlas = buildAtlas(2, PALETTE);
    const c = ctx[0];
    expect(atlas).not.toBeNull();
    expect([atlas?.cw, atlas?.ch]).toEqual([20, 24]);
    expect(atlas?.canvas.width).toBe(16 * 20);
    expect(atlas?.canvas.height).toBe(3 * 24);
    expect(atlas?.shape(3)).toEqual([60, 0]);
    expect(atlas?.glyph(17)).toEqual([20, 48]);
    const fills = c?.calls.filter(([name]) => name === 'fill');
    expect(fills).toHaveLength(LEVELS);
    const texts = c?.calls.filter(([name]) => name === 'fillText');
    expect(texts?.map((t) => t[1]).join('')).toBe(GLYPHS);
    expect(c?.fillStyle).toBe('front');
  });

  it('gives null without a 2D context', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    expect(buildAtlas(1, PALETTE)).toBeNull();
  });
});

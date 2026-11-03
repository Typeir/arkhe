// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LEVELS } from '../../../../../../packages/core/src/fx/skeleton/constants';
import {
  SKELETON_TOKENS,
  readPalette,
} from '../../../../../../packages/core/src/fx/skeleton/palette';

const CHANNELS: Record<string, readonly number[]> = {
  s: [10, 10, 10],
  a: [100, 0, 0],
  b: [0, 0, 200],
};

const stubColors = () => {
  let fill = '';
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    (() => ({
      set fillStyle(v: string) {
        fill = v;
      },
      fillRect: () => undefined,
      getImageData: () => ({
        data: new Uint8ClampedArray([...(CHANNELS[fill] ?? [0, 0, 0]), 255]),
      }),
    })) as unknown as HTMLCanvasElement['getContext'],
  );
};

afterEach(() => document.documentElement.removeAttribute('style'));

describe('readPalette', () => {
  it('spreads surface to glints over the levels, muted at rest', () => {
    stubColors();
    const root = document.documentElement;
    root.style.setProperty('--skeleton-surface', 's');
    root.style.setProperty('--skeleton-glint-1', 'a');
    root.style.setProperty('--skeleton-glint-2', 'b');
    root.style.setProperty('--skeleton-bg', 'bg');
    const p = readPalette(root);
    expect(p.tones).toHaveLength(LEVELS);
    expect(p.tones[0]).toBe('#0a0a0a59');
    expect(p.tones[LEVELS - 1]).toBe('#0000c8f2');
    expect(p.front).toBe('#0000c8ff');
    expect(p.bg).toBe('bg');
    expect(p.font).toBe('serif');
    expect(JSON.parse(p.key)).toMatchObject({ bg: 'bg', font: 'serif' });
  });

  it('reads every skeleton token, and falls back to a transparent cover', () => {
    stubColors();
    expect(SKELETON_TOKENS).toContain('--skeleton-glyph-font');
    expect(readPalette(document.documentElement).bg).toBe('transparent');
  });
});

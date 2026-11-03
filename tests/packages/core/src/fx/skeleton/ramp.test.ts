import { FakePath } from '@tests/fixtures/canvas';
import { describe, expect, it } from 'vitest';
import { pathPen } from '../../../../../../packages/core/src/canvas/draw/pen';
import { LEVELS } from '../../../../../../packages/core/src/fx/skeleton/constants';
import {
  RAMP,
  rampLevel,
} from '../../../../../../packages/core/src/fx/skeleton/ramp';

const contours = (level: number) => {
  const path = new FakePath();
  RAMP[level]?.(pathPen(path as unknown as Path2D), 5, 6);
  return path.calls.map((c) => c[0]);
};

describe('RAMP', () => {
  it('has one shape per level: squares, then rhombi, then triangles', () => {
    expect(RAMP).toHaveLength(LEVELS);
    for (const l of [0, 1, 2, 3])
      expect(contours(l).every((c) => c === 'rect')).toBe(true);
    expect(contours(4).filter((c) => c === 'closePath')).toHaveLength(2);
    expect(contours(9).filter((c) => c === 'lineTo')).toHaveLength(2);
  });

  it('rests on an empty square: an outer and an inner contour', () => {
    expect(contours(0)).toEqual(['rect', 'rect']);
    expect(contours(1)).toEqual(['rect']);
  });

  it('stacks: four squares, four rhombi, three triangles', () => {
    expect(contours(3)).toHaveLength(4);
    expect(contours(7).filter((c) => c === 'moveTo')).toHaveLength(4);
    expect(contours(11).filter((c) => c === 'moveTo')).toHaveLength(3);
  });
});

describe('rampLevel', () => {
  it('rests at level 0 without sweep and never passes the top level', () => {
    for (let c = 0; c < 4; c++)
      for (let r = 0; r < 4; r++) {
        expect(rampLevel(0, c, r)).toBe(0);
        expect(rampLevel(1, c, r)).toBeLessThanOrEqual(LEVELS - 1);
      }
  });

  it('spreads mid intensity over adjacent levels', () => {
    const levels = new Set<number>();
    for (let c = 0; c < 4; c++)
      for (let r = 0; r < 4; r++) levels.add(rampLevel(0.5, c, r));
    expect(levels.size).toBe(2);
  });
});

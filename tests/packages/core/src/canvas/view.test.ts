import { describe, expect, it } from 'vitest';
import {
  VISIBLE_MARGIN,
  snapRect,
  type View,
} from '../../../../../packages/core/src/canvas/view';

const view = (dpr: number, ox = 0, oy = 0) =>
  ({ dpr, ox, oy, y0: 0, y1: 100, viewH: 100 }) as unknown as View;

describe('snapRect', () => {
  it('maps region px through the offset onto whole device px', () => {
    expect(snapRect(view(2, 5, -10), 1, 20, 10, 5)).toEqual([12, 20, 20, 10]);
  });

  it('keeps neighbouring rects seamless at fractional DPR', () => {
    const v = view(1.5);
    const [x0, , w0] = snapRect(v, 0, 0, 3.3, 1);
    const [x1] = snapRect(v, 3.3, 0, 3.3, 1);
    expect(x0 + w0).toBe(x1);
  });
});

describe('VISIBLE_MARGIN', () => {
  it('is the bare viewport', () => {
    expect(VISIBLE_MARGIN).toBe('0px');
  });
});

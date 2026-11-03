import { FakePath } from '@tests/fixtures/canvas';
import { describe, expect, it } from 'vitest';
import { pathPen } from '../../../../../../packages/core/src/canvas/draw/pen';

describe('pathPen', () => {
  it('records closed contours, never strokes', () => {
    const path = new FakePath();
    const pen = pathPen(path as unknown as Path2D);
    pen.rect(1, 2, 3, 4);
    pen.diamond(10, 10, 2);
    pen.triangle(20, 20, 3);
    expect(path.calls).toEqual([
      ['rect', 1, 2, 3, 4],
      ['moveTo', 10, 8],
      ['lineTo', 12, 10],
      ['lineTo', 10, 12],
      ['lineTo', 8, 10],
      ['closePath'],
      ['moveTo', 20, 17],
      ['lineTo', 23, 23],
      ['lineTo', 17, 23],
      ['closePath'],
    ]);
  });
});

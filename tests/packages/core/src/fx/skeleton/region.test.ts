// @vitest-environment jsdom
import { placeAt } from '@tests/fixtures/canvas';
import { afterEach, describe, expect, it } from 'vitest';
import {
  CELL_H,
  DECODE_BASE_MS,
  LATE_START_MS,
  STAGGER_PER_PX,
} from '../../../../../../packages/core/src/fx/skeleton/constants';
import type { SkeletonStyle } from '../../../../../../packages/core/src/fx/skeleton/painter';
import { SkeletonRegion } from '../../../../../../packages/core/src/fx/skeleton/region';

const STYLE = { painter: 'path' } as unknown as SkeletonStyle;
const GROUP = 'data-scope="skeleton" data-part="group"';
const SHAPE = 'data-scope="skeleton" data-part="root"';

const build = () => {
  document.body.innerHTML = `<div id="host" ${GROUP} style="border:2px solid">
      <span id="a" ${SHAPE}></span><span id="b" ${SHAPE}></span>
      <div id="inner" ${GROUP}><span id="c" ${SHAPE}></span></div>
    </div>`;
  const $ = (id: string) => document.getElementById(id) as HTMLElement;
  placeAt($('host'), 100, 50, 304, 204);
  placeAt($('a'), 102, 52, 145, 12);
  placeAt($('b'), 102, 72, 300, 25);
  placeAt($('c'), 102, 152, 100, 12);
  return $;
};

afterEach(() => document.body.replaceChildren());

describe('SkeletonRegion', () => {
  it('measures its own shapes from the padding box, size first on the cell grid', () => {
    const $ = build();
    const region = new SkeletonRegion($('host'), false, STYLE);
    region.measure();
    expect([region.width, region.height]).toEqual([300, 200]);
    expect(region.boxes).toHaveLength(2);
    const [a, b] = region.boxes;
    expect(a).toMatchObject({ x: 0, y: 0, w: 145, cols: 15, rows: 1 });
    expect(b).toMatchObject({ y: 20, cols: 30, rows: 2 });
    expect(b?.cellY).toBe(20 + (25 - 2 * CELL_H) / 2);
    expect(a?.dur).toBeCloseTo(DECODE_BASE_MS + 0.9 * 145, 9);
    expect(region.box()).toEqual({ left: 102, top: 52, bottom: 252 });
  });

  it('slices shapes by rows, one cell row either side', () => {
    const $ = build();
    const region = new SkeletonRegion($('host'), false, STYLE);
    region.measure();
    expect(region.slice(0, 10).pending(0)).toBe(true);
    expect(region.key()).toBe(region.key());
    expect(JSON.parse(region.key())).toHaveLength(2);
  });

  it('starts shapes in view at ready, staggered by depth; later ones late', () => {
    const $ = build();
    const region = new SkeletonRegion($('host'), false, STYLE);
    region.measure();
    region.ready(1000, 0, 15);
    region.startVisible([0, 1], 1000, 0, 15);
    expect(region.boxes[0]?.start).toBe(1000);
    expect(region.boxes[1]?.start).toBeNull();
    region.startVisible([0, 1], 2000, 0, 200);
    expect(region.boxes[1]?.start).toBe(
      2000 + LATE_START_MS + 20 * STAGGER_PER_PX,
    );
  });

  it('runs a front across a shape, then reports it done', () => {
    const $ = build();
    const region = new SkeletonRegion($('host'), false, STYLE);
    region.measure();
    const a = region.boxes[0];
    if (!a) throw new Error('no shape');
    expect(region.front(a, 0)).toBeNull();
    a.start = 0;
    expect(region.front(a, a.dur / 2)).toBeCloseTo((a.w + 40) / 2, 9);
    expect(region.front(a, a.dur)).toBe(Infinity);
    region.settle();
    expect(region.front(region.boxes[1] as never, 0)).toBe(Infinity);
  });

  it('reveals at once under reduced motion', () => {
    const $ = build();
    const region = new SkeletonRegion($('host'), true, STYLE);
    region.measure();
    region.ready(0, -Infinity, -Infinity);
    expect(region.boxes.every((c) => c.start === -Infinity)).toBe(true);
  });
});

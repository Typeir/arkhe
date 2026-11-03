// @vitest-environment jsdom
import { placeAt } from '@tests/fixtures/canvas';
import { afterEach, describe, expect, it } from 'vitest';
import {
  borderEdges,
  boxFromEdges,
  needsInFlowCanvas,
  paddingBox,
} from '../../../../../packages/core/src/canvas/measure';

const build = (html: string) => {
  document.body.innerHTML = html;
  return (id: string) => document.getElementById(id) as HTMLElement;
};

afterEach(() => document.body.replaceChildren());

describe('paddingBox', () => {
  it('measures inside the border', () => {
    const $ = build(
      '<div id="a" style="border-style:solid;border-width:2px 3px 4px 5px"></div>',
    );
    placeAt($('a'), 10, 20, 100, 50);
    expect(borderEdges($('a'))).toEqual({
      left: 5,
      top: 2,
      right: 3,
      bottom: 4,
    });
    expect(paddingBox($('a'))).toMatchObject({
      left: 15,
      top: 22,
      width: 92,
      height: 44,
    });
  });

  it('re-reads only the rect from known edges', () => {
    const $ = build('<div id="a"></div>');
    placeAt($('a'), 0, 0, 10, 10);
    const edges = { left: 1, top: 1, right: 1, bottom: 1 };
    expect(boxFromEdges($('a'), edges)).toEqual({
      left: 1,
      top: 1,
      width: 8,
      height: 8,
      edges,
    });
  });
});

describe('needsInFlowCanvas', () => {
  it('is false for a page-level element', () => {
    const $ = build('<main><div id="a"></div></main>');
    expect(needsInFlowCanvas($('a'))).toBe(false);
  });

  it('is true inside a scroll container', () => {
    const $ = build('<div style="overflow-y:auto"><div id="a"></div></div>');
    expect(needsInFlowCanvas($('a'))).toBe(true);
  });

  it('is true inside a dialog or a popover', () => {
    const $ = build(
      '<div role="dialog"><i id="a"></i></div><div popover><i id="b"></i></div>',
    );
    expect(needsInFlowCanvas($('a'))).toBe(true);
    expect(needsInFlowCanvas($('b'))).toBe(true);
  });
});

// @vitest-environment jsdom
import {
  measureView,
  rowPosition,
  rowScrollTop,
  scrollToRow,
  UNMEASURED_VIEW,
  VIRTUAL_OVERSCAN,
  virtualRange,
  virtualVars,
  type VirtualView,
  watchView,
} from '@arkhe/core';
import { afterEach, describe, expect, it, vi } from 'vitest';

const VIEW: VirtualView = { offset: 0, viewport: 100, inset: 4, pitch: 20 };

function box(height: number, scrollTop = 0): HTMLElement {
  const element = document.createElement('div');
  element.style.paddingTop = '4px';
  Object.defineProperty(element, 'clientHeight', { value: height });
  Object.defineProperty(element, 'scrollTop', {
    value: scrollTop,
    writable: true,
  });
  document.body.append(element);
  return element;
}

afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

describe('virtualRange', () => {
  it('draws the overscan alone before the box is measured', () => {
    expect(virtualRange(100, UNMEASURED_VIEW)).toEqual({
      start: 0,
      end: VIRTUAL_OVERSCAN,
    });
    expect(virtualRange(3, UNMEASURED_VIEW)).toEqual({ start: 0, end: 3 });
  });

  it('draws the rows in view plus the overscan on each side', () => {
    expect(virtualRange(100, VIEW, 2)).toEqual({ start: 0, end: 7 });
    expect(virtualRange(100, { ...VIEW, offset: 404 }, 2)).toEqual({
      start: 18,
      end: 27,
    });
  });

  it('stops at the ends of the set', () => {
    expect(virtualRange(10, { ...VIEW, offset: 1000 }, 2)).toEqual({
      start: 10,
      end: 10,
    });
    expect(virtualRange(0, VIEW)).toEqual({ start: 0, end: 0 });
  });
});

describe('rowScrollTop', () => {
  it('leaves a row already in view', () => {
    expect(rowScrollTop(2, VIEW)).toBeNull();
  });

  it('scrolls down to show a row below the view at the bottom', () => {
    expect(rowScrollTop(10, VIEW)).toBe(124);
  });

  it('puts the row at the top of a box with no height yet', () => {
    expect(rowScrollTop(0, UNMEASURED_VIEW)).toBeNull();
    expect(rowScrollTop(5, { ...VIEW, viewport: 0 })).toBe(100);
  });

  it('scrolls up to show a row above the view at the top', () => {
    expect(rowScrollTop(3, { ...VIEW, offset: 300 })).toBe(64);
    expect(rowScrollTop(0, { ...VIEW, offset: 300 })).toBe(0);
  });
});

describe('virtualVars and rowPosition', () => {
  it('sizes the spacers in rem from the drawn range', () => {
    expect(virtualVars({ start: 4, end: 10 }, 20, 2.25)).toEqual({
      '--row-pitch': '2.25rem',
      '--virtual-before': '9rem',
      '--virtual-after': '22.5rem',
    });
  });

  it('places a row in the whole set', () => {
    expect(rowPosition(0, 500)).toEqual({
      'aria-posinset': 1,
      'aria-setsize': 500,
    });
  });
});

describe('measureView', () => {
  it('reads offset, height, padding and pitch from the root font size', () => {
    expect(measureView(box(100, 30), 2)).toEqual({
      offset: 30,
      viewport: 100,
      inset: 4,
      pitch: 32,
    });
  });
});

describe('watchView', () => {
  it('reports now, on a scroll that moves the view, and stops', () => {
    const element = box(100);
    const report = vi.fn();
    const stop = watchView(element, 2, report);
    expect(report).toHaveBeenCalledOnce();
    element.dispatchEvent(new Event('scroll'));
    expect(report).toHaveBeenCalledOnce();
    element.scrollTop = 50;
    element.dispatchEvent(new Event('scroll'));
    expect(report).toHaveBeenLastCalledWith(
      expect.objectContaining({ offset: 50 }),
    );
    stop();
    element.scrollTop = 90;
    element.dispatchEvent(new Event('scroll'));
    expect(report).toHaveBeenCalledTimes(2);
  });

  it('watches resizes where the window has a ResizeObserver', () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = observe;
        disconnect = disconnect;
      },
    );
    const element = box(100);
    watchView(element, 2, () => undefined)();
    expect(observe).toHaveBeenCalledWith(element);
    expect(disconnect).toHaveBeenCalledOnce();
  });
});

describe('scrollToRow', () => {
  it('scrolls only when the row is out of view and returns the new view', () => {
    const element = box(100);
    expect(scrollToRow(element, 1, 2)).toBeNull();
    expect(element.scrollTop).toBe(0);
    expect(scrollToRow(element, 9, 2)).toEqual({
      offset: 224,
      viewport: 100,
      inset: 4,
      pitch: 32,
    });
    expect(element.scrollTop).toBe(224);
    expect(scrollToRow(element, -1, 2)).toBeNull();
    expect(element.scrollTop).toBe(224);
  });
});

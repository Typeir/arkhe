import {
  clampPoint,
  CORNER_GAP,
  cornerPoint,
  isCorner,
  moveMenu,
  resolveLabels,
} from '@arkhe/core';
import { describe, expect, it } from 'vitest';

const VIEW = { width: 1000, height: 800 };
const CARD = { width: 200, height: 100 };

describe('clampPoint', () => {
  it('keeps a card whole inside the view', () => {
    expect(clampPoint({ x: -50, y: 900 }, CARD, VIEW)).toEqual({
      x: 0,
      y: 700,
    });
    expect(clampPoint({ x: 300, y: 200 }, CARD, VIEW)).toEqual({
      x: 300,
      y: 200,
    });
  });

  it('pins a card larger than the view to its top left', () => {
    expect(
      clampPoint({ x: 40, y: 40 }, { width: 2000, height: 900 }, VIEW),
    ).toEqual({ x: 0, y: 0 });
  });
});

describe('cornerPoint', () => {
  it('sends a card to each corner, a gap from the edges', () => {
    expect(cornerPoint('top-left', CARD, VIEW)).toEqual({
      x: CORNER_GAP,
      y: CORNER_GAP,
    });
    expect(cornerPoint('bottom-right', CARD, VIEW)).toEqual({
      x: 1000 - 200 - CORNER_GAP,
      y: 800 - 100 - CORNER_GAP,
    });
  });
});

describe('moveMenu', () => {
  const labels = resolveLabels();

  it('lists the four corners, adding back only once detached', () => {
    expect(
      moveMenu(labels, false).map((entry) => 'label' in entry && entry.label),
    ).toEqual(['Top left', 'Top right', 'Bottom left', 'Bottom right']);
    const detached = moveMenu(labels, true);
    expect(detached).toHaveLength(6);
    expect(detached.at(-1)).toEqual({ value: 'back', label: labels.moveBack });
  });

  it('tells corners from other values', () => {
    expect(isCorner('top-right')).toBe(true);
    expect(isCorner('back')).toBe(false);
  });
});

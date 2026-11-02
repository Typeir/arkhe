import { DEFAULT_LABELS, progressState, progressValueText } from '@arkhe/core';
import { describe, expect, it } from 'vitest';

describe('progressState', () => {
  it('reports the filled ratio', () => {
    expect(progressState(3, 12)).toMatchObject({
      ratio: 0.25,
      over: false,
      overBy: 0,
    });
  });

  it('clamps past max and reports the overflow', () => {
    expect(progressState(14, 10)).toMatchObject({
      ratio: 1,
      over: true,
      overBy: 4,
    });
  });

  it('clamps below zero', () => {
    expect(progressState(-2, 10).ratio).toBe(0);
  });

  it('treats a non-finite value as zero', () => {
    expect(progressState(Number.NaN, 10)).toMatchObject({
      ratio: 0,
      over: false,
    });
  });

  it('places markers inside the rail and flags the reached ones', () => {
    expect(progressState(5, 10, [0, 2, 5, 8, 10, Number.NaN]).markers).toEqual([
      { at: 0.2, reached: true },
      { at: 0.5, reached: true },
      { at: 0.8, reached: false },
    ]);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects max %s',
    (max) => {
      expect(() => progressState(1, max)).toThrow(RangeError);
    },
  );
});

describe('progressValueText', () => {
  it('reads value of max', () => {
    expect(progressValueText(6, 10, DEFAULT_LABELS)).toBe('6 of 10');
  });

  it('reads the overflow', () => {
    expect(progressValueText(13, 10, DEFAULT_LABELS)).toBe('13 of 10, 3 over');
  });

  it('reads the overflow without float noise', () => {
    expect(progressValueText(10.2, 10, DEFAULT_LABELS)).toBe(
      '10.2 of 10, 0.2 over',
    );
  });

  it('reads a non-finite value as the bar draws it', () => {
    expect(progressValueText(Number.NaN, 10, DEFAULT_LABELS)).toBe('0 of 10');
  });
});

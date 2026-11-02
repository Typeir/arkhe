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

  it('drops repeated markers', () => {
    expect(progressState(5, 10, [2, 2, 8]).markers).toEqual([
      { at: 0.2, reached: true },
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

function text(value: number): string {
  return progressValueText(progressState(value, 10), 10, DEFAULT_LABELS);
}

describe('progressValueText', () => {
  it('reads value of max', () => {
    expect(text(6)).toBe('6 of 10');
  });

  it('reads the overflow', () => {
    expect(text(13)).toBe('13 of 10, 3 over');
  });

  it('reads the overflow without float noise', () => {
    expect(text(10.2)).toBe('10.2 of 10, 0.2 over');
  });

  it('reads a non-finite value as the bar draws it', () => {
    expect(text(Number.NaN)).toBe('0 of 10');
  });
});

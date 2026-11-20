import { ARKHE_CLASS, flag, partAttrs } from '@arkhe/core';
import { describe, expect, it } from 'vitest';

describe('partAttrs', () => {
  it('names the scope and part', () => {
    expect(partAttrs('chip', 'remove')).toEqual({
      'data-scope': 'chip',
      'data-part': 'remove',
    });
  });

  it('keeps the arkhe scope class', () => {
    expect(ARKHE_CLASS).toBe('arkhe');
  });
});

describe('flag', () => {
  it.each([
    [true, ''],
    [false, undefined],
    [undefined, undefined],
  ])('maps %s to %o', (on, expected) => {
    expect(flag(on)).toBe(expected);
  });
});

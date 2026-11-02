import { definedOnly, uniqueByValue } from '@arkhe/core';
import { describe, expect, it } from 'vitest';

describe('definedOnly', () => {
  it('drops undefined keys and keeps falsy values', () => {
    expect(
      definedOnly({ a: undefined, b: 0, c: '', d: null, e: false }),
    ).toEqual({ b: 0, c: '', d: null, e: false });
  });
});

describe('uniqueByValue', () => {
  it('keeps the first item per value, in order', () => {
    const items = [
      { value: 'a', n: 1 },
      { value: 'b', n: 2 },
      { value: 'a', n: 3 },
    ];
    expect(uniqueByValue(items)).toEqual([items[0], items[1]]);
  });
});

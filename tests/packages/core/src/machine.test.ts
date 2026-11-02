import { definedOnly } from '@arkhe/core';
import { describe, expect, it } from 'vitest';

describe('definedOnly', () => {
  it('drops undefined keys and keeps falsy values', () => {
    expect(
      definedOnly({ a: undefined, b: 0, c: '', d: null, e: false }),
    ).toEqual({ b: 0, c: '', d: null, e: false });
  });
});

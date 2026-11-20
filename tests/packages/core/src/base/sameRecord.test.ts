import { sameRecord } from '@arkhe/core';
import { describe, expect, it } from 'vitest';

describe('sameRecord', () => {
  it('matches records with the same entries', () => {
    const glyph = () => null;
    expect(sameRecord({ a: 'x', b: glyph }, { b: glyph, a: 'x' })).toBe(true);
    expect(sameRecord(undefined, undefined)).toBe(true);
  });

  it('looks one level into plain values, such as plural sets', () => {
    expect(
      sameRecord(
        { results: { one: '{count}', other: '{count}s' } },
        { results: { one: '{count}', other: '{count}s' } },
      ),
    ).toBe(true);
    expect(
      sameRecord({ deep: { a: { b: 1 } } }, { deep: { a: { b: 1 } } }),
    ).toBe(false);
  });

  it('tells apart changed, added, missing and unlike values', () => {
    expect(sameRecord({ a: 'x' }, { a: 'y' })).toBe(false);
    expect(sameRecord({ a: 'x' }, { a: 'x', b: 'y' })).toBe(false);
    expect(sameRecord({ a: 'x', b: undefined }, { a: 'x', c: undefined })).toBe(
      false,
    );
    expect(sameRecord({ a: 'x' }, undefined)).toBe(false);
    expect(sameRecord([1], [1])).toBe(false);
    expect(sameRecord(new Map(), new Map())).toBe(false);
  });
});

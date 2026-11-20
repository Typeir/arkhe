import {
  EMPTY_VALUE,
  fromEmptyValue,
  toEmptyValue,
  withEmptyOption,
} from '@arkhe/core';
import { describe, expect, it } from 'vitest';

const ITEMS = [
  { value: '', label: 'Host blank' },
  { value: 'a', label: 'A' },
];

describe('withEmptyOption', () => {
  it('puts the labelled empty option first and drops a colliding one', () => {
    expect(withEmptyOption(ITEMS, 'All')).toEqual([
      { value: EMPTY_VALUE, label: 'All' },
      { value: 'a', label: 'A' },
    ]);
  });

  it('leaves the options alone without a label', () => {
    expect(withEmptyOption(ITEMS)).toBe(ITEMS);
  });
});

describe('empty value mapping', () => {
  it('maps no choice to the empty option and back', () => {
    expect(toEmptyValue(null, 'All')).toBe(EMPTY_VALUE);
    expect(toEmptyValue(null)).toBeNull();
    expect(toEmptyValue(undefined, 'All')).toBeUndefined();
    expect(toEmptyValue('a', 'All')).toBe('a');
    expect(fromEmptyValue(EMPTY_VALUE)).toBeNull();
    expect(fromEmptyValue('a')).toBe('a');
    expect(fromEmptyValue(null)).toBeNull();
  });
});

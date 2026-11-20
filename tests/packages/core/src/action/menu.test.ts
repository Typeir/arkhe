import { entryKey, isSeparator } from '@arkhe/core';
import { describe, expect, it } from 'vitest';

describe('menu entries', () => {
  it('tells separators from actions', () => {
    expect(isSeparator({ separator: true })).toBe(true);
    expect(isSeparator({ value: 'copy', label: 'Copy' })).toBe(false);
  });

  it('keys actions by value and separators by position', () => {
    expect(entryKey({ value: 'copy', label: 'Copy' }, 0)).toBe('item:copy');
    expect(entryKey({ separator: true }, 3)).toBe('separator:3');
    expect(entryKey({ value: 'separator:3', label: 'S' }, 0)).not.toBe(
      entryKey({ separator: true }, 3),
    );
  });
});

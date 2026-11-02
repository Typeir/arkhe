import { ARKHE_ICON_NAMES, resolveIcon } from '@arkhe/core';
import { describe, expect, it } from 'vitest';

describe('resolveIcon', () => {
  it('prefers the first set that has the name', () => {
    expect(resolveIcon([{ x: 'app' }, { x: 'lucide' }], 'x')).toBe('app');
  });

  it('falls through to later sets', () => {
    expect(resolveIcon([{}, { check: 'lucide' }], 'check')).toBe('lucide');
  });

  it('returns undefined for an unknown name', () => {
    expect(resolveIcon([{ x: 'lucide' }], 'not-an-icon')).toBeUndefined();
  });

  it('ignores inherited object members', () => {
    expect(resolveIcon([{ x: 'lucide' }], 'constructor')).toBeUndefined();
  });
});

describe('ARKHE_ICON_NAMES', () => {
  it('uses kebab-case Lucide names', () => {
    for (const name of ARKHE_ICON_NAMES)
      expect(name).toMatch(/^[a-z]+(-[a-z]+)*$/);
  });
});

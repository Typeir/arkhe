import { DEFAULT_LABELS, formatLabel, resolveLabels } from '@arkhe/core';
import { describe, expect, it } from 'vitest';

describe('resolveLabels', () => {
  it('returns the defaults without overrides', () => {
    expect(resolveLabels()).toEqual(DEFAULT_LABELS);
  });

  it('lets overrides win key by key', () => {
    const labels = resolveLabels({ loading: 'Ladataan' });
    expect(labels.loading).toBe('Ladataan');
    expect(labels.statusEmpty).toBe(DEFAULT_LABELS.statusEmpty);
  });

  it('keeps the default when an override is undefined', () => {
    expect(resolveLabels({ loading: undefined }).loading).toBe(
      DEFAULT_LABELS.loading,
    );
  });
});

describe('formatLabel', () => {
  it('fills named placeholders', () => {
    expect(formatLabel('{value} of {max}', { value: 3, max: 7 })).toBe(
      '3 of 7',
    );
  });

  it('leaves unknown placeholders untouched', () => {
    expect(formatLabel('Remove {label}', {})).toBe('Remove {label}');
  });

  it('ignores inherited object members', () => {
    expect(formatLabel('{constructor}', {})).toBe('{constructor}');
  });

  it('fills a placeholder used twice', () => {
    expect(formatLabel('{a}-{a}', { a: 'x' })).toBe('x-x');
  });
});

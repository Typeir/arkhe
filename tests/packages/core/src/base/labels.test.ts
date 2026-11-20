import {
  DEFAULT_LABELS,
  formatLabel,
  formatPlural,
  resolveLabels,
  type ArkheLabels,
} from '@arkhe/core';
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

  it('replaces a plural set whole, never mixing forms', () => {
    const results = { one: '{count} tulos', other: '{count} tulosta' };
    expect(resolveLabels({ results }).results).toEqual(results);
    expect(
      resolveLabels({ results: { other: '{count} wyników' } }).results,
    ).toEqual({ other: '{count} wyników' });
  });

  it('ignores an override of the wrong shape', () => {
    const wrong = {
      results: 'many results',
      loading: { other: 'x' },
    } as unknown as Partial<ArkheLabels>;
    expect(resolveLabels(wrong)).toEqual(DEFAULT_LABELS);
    const noOther = {
      results: { one: 'x' },
    } as unknown as Partial<ArkheLabels>;
    expect(resolveLabels(noOther).results).toEqual(DEFAULT_LABELS.results);
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

  it('formats numbers in a locale when given one, text never', () => {
    expect(
      formatLabel('{value} / {max}', { value: 1234.5, max: 2000 }, 'fi'),
    ).toBe('1 234,5 / 2 000');
    expect(formatLabel('{label}', { label: '1234' }, 'fi')).toBe('1234');
    expect(formatLabel('{value}', { value: 1234.5 })).toBe('1234.5');
  });
});

describe('formatPlural', () => {
  const polish = {
    one: '{count} wynik',
    few: '{count} wyniki',
    many: '{count} wyników',
    other: '{count} wyniku',
  };

  it('picks the form for the count in the locale', () => {
    expect(formatPlural(DEFAULT_LABELS.results, 1, 'en')).toBe('1 result');
    expect(formatPlural(DEFAULT_LABELS.results, 1200, 'en')).toBe(
      '1,200 results',
    );
    expect(formatPlural(polish, 2, 'pl')).toBe('2 wyniki');
    expect(formatPlural(polish, 5, 'pl')).toBe('5 wyników');
    expect(formatPlural(polish, 1.5, 'pl')).toBe('1,5 wyniku');
  });

  it('falls back to other when the language form is missing', () => {
    expect(formatPlural({ other: '{count} hits' }, 1, 'en')).toBe('1 hits');
  });

  it('fills other placeholders too', () => {
    expect(
      formatPlural({ other: '{count} in {label}' }, 3, 'en', {
        label: 'Spells',
      }),
    ).toBe('3 in Spells');
  });
});

import {
  DEFAULT_LOCALE,
  NUMERIC_FORMAT,
  formatNumber,
  pluralCategory,
} from '@arkhe/core';
import { describe, expect, it } from 'vitest';

describe('formatNumber', () => {
  it('formats in the locale, grouped, keeping every fraction digit', () => {
    expect(formatNumber(1234.5, 'fi')).toBe('1 234,5');
    expect(formatNumber(1234.5, 'en')).toBe('1,234.5');
    expect(formatNumber(1234.5, 'es')).toBe('1234,5');
    expect(formatNumber(0.123456, 'en')).toBe('0.123456');
  });

  it('takes other options', () => {
    expect(formatNumber(0.5, 'en', { style: 'percent' })).toBe('50%');
  });

  it('defaults to English and to the number-field format', () => {
    expect(DEFAULT_LOCALE).toBe('en');
    expect(NUMERIC_FORMAT.maximumFractionDigits).toBe(20);
  });
});

describe('pluralCategory', () => {
  it.each([
    ['en', 1, 'one'],
    ['en', 2, 'other'],
    ['fi', 1, 'one'],
    ['fi', 5, 'other'],
    ['pl', 2, 'few'],
    ['pl', 5, 'many'],
  ] as const)('%s %d → %s', (locale, count, category) => {
    expect(pluralCategory(count, locale)).toBe(category);
  });
});

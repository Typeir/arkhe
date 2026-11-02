import { fieldControlAttrs, fieldIds } from '@arkhe/core';
import { describe, expect, it } from 'vitest';

describe('fieldIds', () => {
  it('derives one id per part', () => {
    expect(fieldIds('name')).toEqual({
      control: 'name-control',
      label: 'name-label',
      hint: 'name-hint',
      error: 'name-error',
    });
  });

  it('replaces characters unsafe in selectors', () => {
    expect(fieldIds(':r1:').control).toBe('-r1--control');
  });
});

describe('fieldControlAttrs', () => {
  const ids = fieldIds('f');

  it('describes nothing without hint or error', () => {
    expect(fieldControlAttrs(ids, false, false)).toEqual({
      id: 'f-control',
      'aria-describedby': undefined,
      'aria-invalid': undefined,
    });
  });

  it('points at the hint', () => {
    expect(fieldControlAttrs(ids, true, false)['aria-describedby']).toBe(
      'f-hint',
    );
  });

  it('points at the error and marks invalid', () => {
    const attrs = fieldControlAttrs(ids, false, true);
    expect(attrs['aria-describedby']).toBe('f-error');
    expect(attrs['aria-invalid']).toBe(true);
  });

  it('lists hint before error when both show', () => {
    expect(fieldControlAttrs(ids, true, true)['aria-describedby']).toBe(
      'f-hint f-error',
    );
  });
});

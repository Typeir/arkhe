import {
  DEFAULT_LABELS,
  clampToBounds,
  formatDraft,
  numericMachineProps,
  toNumericValue,
} from '@arkhe/core';
import { describe, expect, it } from 'vitest';

describe('value mapping', () => {
  it('maps NaN to null and back to an empty draft', () => {
    expect(toNumericValue(Number.NaN)).toBeNull();
    expect(toNumericValue(-0)).toBe(-0);
    expect(formatDraft(null)).toBe('');
    expect(formatDraft(undefined)).toBe('');
    expect(formatDraft(1.5)).toBe('1.5');
  });

  it('clamps into the given bounds', () => {
    expect(clampToBounds(710, { max: 10 })).toBe(10);
    expect(clampToBounds(-3, { min: 0 })).toBe(0);
    expect(clampToBounds(5, {})).toBe(5);
    expect(clampToBounds(1e20, {})).toBe(Number.MAX_SAFE_INTEGER);
    expect(clampToBounds(5, { min: Number.NaN })).toBe(5);
    expect(clampToBounds(null, { min: 0 })).toBeNull();
  });
});

describe('numericMachineProps', () => {
  const base = {
    id: 'n',
    label: 'Speed',
    labels: DEFAULT_LABELS,
    getRootNode: () => ({}) as Document,
  };

  it('seeds the draft from value before defaultValue', () => {
    expect(
      numericMachineProps({ ...base, value: 3, defaultValue: 9 }).defaultValue,
    ).toBe('3');
    expect(numericMachineProps({ ...base, defaultValue: 9 }).defaultValue).toBe(
      '9',
    );
    expect(numericMachineProps({ ...base, value: null }).defaultValue).toBe('');
  });

  it('leaves missing bounds to Zag', () => {
    const props = numericMachineProps({ ...base, min: 0 });
    expect(props.min).toBe(0);
    expect(props).not.toHaveProperty('max');
    expect(props).not.toHaveProperty('step');
  });

  it('names the step buttons from Arkhé labels', () => {
    expect(numericMachineProps(base).translations).toEqual({
      incrementLabel: 'Increase Speed',
      decrementLabel: 'Decrease Speed',
    });
  });
});
